export interface GeneratedCpfRecord {
    cpf: string;
    formattedCpf: string;
    baseNineDigits: string;
    regionDigit?: string | null | undefined
}

export interface GeneratedCpfWriter {
    save(records: GeneratedCpfRecord[]): string;
}
