export interface Logger {
    info(message: string, metadata?: unknown): void;
    warn(message: string, metadata?: unknown): void;
    error(message: string, metadata?: unknown): void;
    output(message: string, metadata?: unknown): void;
    getLogFilePath(): string;
}
