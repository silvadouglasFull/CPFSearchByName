export interface GeneratedCpfRecord {
    cpf: string;
    formattedCpf: string;
    baseNineDigits: string;
}

export interface GeneratorCpfApiResponse {
    records: GeneratedCpfRecord[];
}

export interface GeneratorCpfApiError {
    error: string;
}
