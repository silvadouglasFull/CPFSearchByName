/**
 * HubDo CPF Lookup Domain Types
 */

// Request and Response DTOs
export interface HubdoCpfLookupRequest {
    cpf: string;
    birthDate?: string; // DD/MM/YYYY
    mode?: 'normal' | 'turbo';
}

export interface HubdoCpfLookupResponse {
    status: 'success' | 'error';
    cpf: string;
    nome?: string;
    dataNascimento?: string;
    situacaoCadastral?: string;
    dataInscricao?: string;
    digitoVerificador?: string;
    comprovante?: string;
    dataComprovante?: string;
    creditosConsumidos: number;
    origem?: 'database' | 'receita_federal' | 'turbo';
    errorCode?: string;
    message?: string;
}

// Database record
export interface HubdoCpfLookupRecord {
    id: string;
    cpf: string;
    birthDate?: string;
    queryMode: 'normal' | 'turbo';
    requestStatus: 'OK' | 'NOK';
    errorCode?: string;
    errorMessage?: string;
    responseName?: string;
    responseBirthDate?: string;
    responseCadastralStatus?: string;
    responseInscriptionDate?: string;
    responseCheckDigit?: string;
    responseProof?: string;
    responseProofDate?: string;
    creditosConsumidos: number;
    origem: string;
    fullResponse?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateHubdoCpfLookupInput {
    cpf: string;
    birthDate?: string;
    queryMode: 'normal' | 'turbo';
    requestStatus: 'OK' | 'NOK';
    errorCode?: string;
    errorMessage?: string;
    responseName?: string;
    responseBirthDate?: string;
    responseCadastralStatus?: string;
    responseInscriptionDate?: string;
    responseCheckDigit?: string;
    responseProof?: string;
    responseProofDate?: string;
    creditosConsumidos: number;
    origem: string;
    fullResponse?: Record<string, any>;
}

// HubDo API Response (raw)
export interface HubdoRawResponse {
    status: boolean;
    return: 'OK' | 'NOK';
    consumed: number;
    result?: {
        numero_de_cpf: string;
        nome_da_pf: string;
        data_nascimento: string;
        situacao_cadastral: string;
        data_inscricao: string;
        digito_verificador: string;
        comprovante_emitido: string;
        comprovante_emitido_data: string;
    };
    message?: string;
}

// Repository interface
export interface HubdoCpfLookupRepository {
    save(lookup: CreateHubdoCpfLookupInput): Promise<HubdoCpfLookupRecord>;
    getById(id: string): Promise<HubdoCpfLookupRecord | null>;
    listByCpf(cpf: string): Promise<HubdoCpfLookupRecord[]>;
    getLatestByCpf(cpf: string): Promise<HubdoCpfLookupRecord | null>;
}

// Error classes
export class HubdoCpfError extends Error {
    constructor(
        public code: string,
        message: string,
        public creditosConsumidos: number = 0,
    ) {
        super(message);
        this.name = 'HubdoCpfError';
        Object.setPrototypeOf(this, HubdoCpfError.prototype);
    }
}

export class HubdoCpfValidationError extends HubdoCpfError {
    constructor(message: string) {
        super('VALIDATION_ERROR', message, 0);
        Object.setPrototypeOf(this, HubdoCpfValidationError.prototype);
    }
}

export class HubdoCpfNotFoundError extends HubdoCpfError {
    constructor(cpf: string) {
        super('CPF_NOT_FOUND', `CPF not found in Receita Federal: ${cpf}`, 5);
        Object.setPrototypeOf(this, HubdoCpfNotFoundError.prototype);
    }
}

export class HubdoCpfTokenError extends HubdoCpfError {
    constructor(message: string = 'Invalid or expired token') {
        super('INVALID_TOKEN', message, 0);
        Object.setPrototypeOf(this, HubdoCpfTokenError.prototype);
    }
}

export class HubdoCpfInsufficientCreditsError extends HubdoCpfError {
    constructor() {
        super('INSUFFICIENT_CREDITS', 'Insufficient credits to perform lookup', 0);
        Object.setPrototypeOf(this, HubdoCpfInsufficientCreditsError.prototype);
    }
}

export class HubdoCpfTimeoutError extends HubdoCpfError {
    constructor() {
        super('TIMEOUT', 'HubDo service request timeout', 0);
        Object.setPrototypeOf(this, HubdoCpfTimeoutError.prototype);
    }
}

export class HubdoCpfServiceError extends HubdoCpfError {
    constructor(message: string = 'HubDo service unavailable') {
        super('SERVICE_UNAVAILABLE', message, 0);
        Object.setPrototypeOf(this, HubdoCpfServiceError.prototype);
    }
}

export class HubdoCpfIpError extends HubdoCpfError {
    constructor() {
        super('IP_NOT_AUTHORIZED', 'IP address not authorized for HubDo API', 0);
        Object.setPrototypeOf(this, HubdoCpfIpError.prototype);
    }
}
