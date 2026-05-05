import { cpf as cpfValidator } from 'cpf-cnpj-validator';
import {
    createCipheriv,
    createDecipheriv,
    createHmac,
    randomBytes,
    timingSafeEqual,
} from 'node:crypto';

const CPF_NORMALIZE_REGEX = /\D/g;
const CPF_ENCRYPTION_VERSION = 'v1';
const CPF_ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const CPF_ENCRYPTION_KEY_BYTES = 32;
const CPF_ENCRYPTION_IV_BYTES = 12;

export const CPF_PROTECTION_CONFIGURATION_ERROR_CODE = 'CPF_PROTECTION_CONFIGURATION_ERROR';

export class CpfProtectionConfigurationError extends Error {
    readonly code = CPF_PROTECTION_CONFIGURATION_ERROR_CODE;

    constructor(message: string) {
        super(message);
        this.name = 'CpfProtectionConfigurationError';
        Object.setPrototypeOf(this, CpfProtectionConfigurationError.prototype);
    }
}

export function isCpfProtectionConfigurationError(error: unknown): error is CpfProtectionConfigurationError {
    return error instanceof CpfProtectionConfigurationError;
}

function ensureServerSide(): void {
    if (typeof window !== 'undefined') {
        throw new Error('CPF protection utilities are only available on the server side.');
    }
}

function getRequiredEnvironmentVariable(name: string): string {
    const value = process.env[name]?.trim();

    if (!value) {
        throw new CpfProtectionConfigurationError(`Missing required environment variable: ${name}`);
    }

    return value;
}

function decodeKey(value: string, expectedBytes: number): Buffer {
    const normalizedValue = value.trim();

    if (/^[0-9a-fA-F]+$/.test(normalizedValue) && normalizedValue.length === expectedBytes * 2) {
        return Buffer.from(normalizedValue, 'hex');
    }

    const decoded = Buffer.from(normalizedValue, 'base64');
    if (decoded.length === expectedBytes) {
        return decoded;
    }

    throw new CpfProtectionConfigurationError(
        `Invalid key length. Expected ${expectedBytes} bytes encoded as hex or base64.`,
    );
}

function getEncryptionKey(): Buffer {
    ensureServerSide();
    return decodeKey(getRequiredEnvironmentVariable('CPF_ENCRYPTION_KEY'), CPF_ENCRYPTION_KEY_BYTES);
}

function getHashKey(): Buffer {
    ensureServerSide();

    const value = getRequiredEnvironmentVariable('CPF_HASH_KEY');

    if (/^[0-9a-fA-F]+$/.test(value) && value.length % 2 === 0) {
        return Buffer.from(value, 'hex');
    }

    try {
        const decoded = Buffer.from(value, 'base64');
        if (decoded.length > 0) {
            return decoded;
        }
    } catch {
        // Fall back to UTF-8 below.
    }

    return Buffer.from(value, 'utf8');
}

export function assertCpfProtectionRuntimeConfiguration(): void {
    // Explicitly validate both keys so callers can fail fast with a clear API error.
    void getEncryptionKey();
    void getHashKey();
}

export function normalizeCpf(value: unknown): string {
    return String(value ?? '').replace(CPF_NORMALIZE_REGEX, '');
}

export function isValidCpf(value: unknown): boolean {
    const normalizedCpf = normalizeCpf(value);
    return cpfValidator.isValid(normalizedCpf);
}

export function assertValidCpf(value: unknown): string {
    const normalizedCpf = normalizeCpf(value);

    if (!cpfValidator.isValid(normalizedCpf)) {
        throw new Error('Invalid CPF value.');
    }

    return normalizedCpf;
}

export function formatCpf(value: unknown): string {
    return cpfValidator.format(assertValidCpf(value));
}

export function maskCpf(value: unknown): string {
    const normalizedCpf = assertValidCpf(value);
    return `${normalizedCpf.slice(0, 3)}.***.***-${normalizedCpf.slice(-2)}`;
}

export function hashCpf(value: unknown): string {
    const normalizedCpf = assertValidCpf(value);

    return createHmac('sha256', getHashKey())
        .update(normalizedCpf, 'utf8')
        .digest('hex');
}

export function matchesCpfHash(cpfValue: unknown, expectedHash: string): boolean {
    const calculatedHash = Buffer.from(hashCpf(cpfValue), 'hex');
    const candidateHash = Buffer.from(String(expectedHash ?? ''), 'hex');

    if (calculatedHash.length !== candidateHash.length) {
        return false;
    }

    return timingSafeEqual(calculatedHash, candidateHash);
}

export function encryptCpf(value: unknown): string {
    const normalizedCpf = assertValidCpf(value);
    const iv = randomBytes(CPF_ENCRYPTION_IV_BYTES);
    const cipher = createCipheriv(CPF_ENCRYPTION_ALGORITHM, getEncryptionKey(), iv);
    const encrypted = Buffer.concat([cipher.update(normalizedCpf, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [
        CPF_ENCRYPTION_VERSION,
        iv.toString('hex'),
        authTag.toString('hex'),
        encrypted.toString('hex'),
    ].join(':');
}

export function decryptCpf(payload: string): string {
    ensureServerSide();

    const [version, ivHex, authTagHex, encryptedHex] = String(payload ?? '').split(':');

    if (version !== CPF_ENCRYPTION_VERSION || !ivHex || !authTagHex || !encryptedHex) {
        throw new Error('Invalid encrypted CPF payload.');
    }

    const decipher = createDecipheriv(
        CPF_ENCRYPTION_ALGORITHM,
        getEncryptionKey(),
        Buffer.from(ivHex, 'hex'),
    );

    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));

    const decrypted = Buffer.concat([
        decipher.update(Buffer.from(encryptedHex, 'hex')),
        decipher.final(),
    ]).toString('utf8');

    return assertValidCpf(decrypted);
}