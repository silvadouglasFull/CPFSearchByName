import {
    CPF_BASE_LENGTH,
    CPF_FORMAT_SEGMENT_LENGTH,
    CPF_FORMAT_SUFFIX_LENGTH,
    PARTIAL_CPF_MIN_LENGTH,
    REGION_DIGIT_INDEX,
} from '@/generatorCpf/domain/constants';
import { InvalidPartialCpfError, InvalidRegionDigitError } from '@/generatorCpf/domain/errors';
import { CPF_NORMALIZE_REGEX } from '@/generatorCpf/domain/internal-constants';

export function normalizePartialCpf(value: unknown): string {
    return String(value ?? '').replace(CPF_NORMALIZE_REGEX, '');
}

export function normalizeRegionDigit(value: unknown): string | null {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const normalizedValue = String(value).replace(CPF_NORMALIZE_REGEX, '');

    if (normalizedValue.length !== 1) {
        throw new InvalidRegionDigitError();
    }

    return normalizedValue;
}

export function validatePartialCpf(partialCpf: string): void {
    if (partialCpf.length < PARTIAL_CPF_MIN_LENGTH || partialCpf.length > CPF_BASE_LENGTH) {
        throw new InvalidPartialCpfError();
    }
}

export function shouldUseBaseNineDigits(baseNineDigits: string, regionDigit: string | null): boolean {
    if (regionDigit === null) {
        return true;
    }

    return baseNineDigits[REGION_DIGIT_INDEX] === regionDigit;
}

export function formatCpf(cpf: string): string {
    const firstSegment = cpf.substring(0, CPF_FORMAT_SEGMENT_LENGTH);
    const secondSegment = cpf.substring(CPF_FORMAT_SEGMENT_LENGTH, CPF_FORMAT_SEGMENT_LENGTH * 2);
    const thirdSegment = cpf.substring(CPF_FORMAT_SEGMENT_LENGTH * 2, CPF_BASE_LENGTH);
    const suffix = cpf.substring(CPF_BASE_LENGTH, CPF_BASE_LENGTH + CPF_FORMAT_SUFFIX_LENGTH);

    return `${firstSegment}.${secondSegment}.${thirdSegment}-${suffix}`;
}
