export interface GeneratedCpfRecord {
    cpf: string;
    formattedCpf: string;
    baseNineDigits: string;
}

export interface GeneratedCpfWriter {
    save(records: GeneratedCpfRecord[]): string;
}
