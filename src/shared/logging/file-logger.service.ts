import { Logger } from '@/shared/logging/logger.interface';
import fs from 'fs';
import path from 'path';

const DEFAULT_LOGS_DIRECTORY_NAME = 'logs';
const FILE_EXTENSION = '.log';
const DATE_SEPARATOR = 'T';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'OUTPUT';

export class FileLogger implements Logger {
    private readonly logDirectoryPath: string;
    private readonly logFilePath: string;

    constructor(
        private readonly scope: string,
        baseDirectoryPath = process.cwd(),
    ) {
        this.logDirectoryPath = path.join(baseDirectoryPath, DEFAULT_LOGS_DIRECTORY_NAME);
        this.logFilePath = path.join(this.logDirectoryPath, `${this.scope}${FILE_EXTENSION}`);
        fs.mkdirSync(this.logDirectoryPath, { recursive: true });
    }

    info(message: string, metadata?: unknown): void {
        this.write('INFO', message, metadata, false);
    }

    warn(message: string, metadata?: unknown): void {
        this.write('WARN', message, metadata, false);
    }

    error(message: string, metadata?: unknown): void {
        this.write('ERROR', message, metadata, true);
    }

    output(message: string, metadata?: unknown): void {
        this.write('OUTPUT', message, metadata, false);
    }

    getLogFilePath(): string {
        return this.logFilePath;
    }

    private write(level: LogLevel, message: string, metadata: unknown, writeToStderr: boolean): void {
        const line = this.formatLine(level, message, metadata);

        if (writeToStderr) {
            process.stderr.write(`${message}\n`);
        } else {
            process.stdout.write(`${message}\n`);
        }

        fs.appendFileSync(this.logFilePath, `${line}\n`, 'utf-8');
    }

    private formatLine(level: LogLevel, message: string, metadata: unknown): string {
        const timestamp = new Date().toISOString().replace(DATE_SEPARATOR, ' ');
        const serializedMetadata = this.serializeMetadata(metadata);

        return serializedMetadata
            ? `[${timestamp}] [${level}] [${this.scope}] ${message} ${serializedMetadata}`
            : `[${timestamp}] [${level}] [${this.scope}] ${message}`;
    }

    private serializeMetadata(metadata: unknown): string {
        if (metadata === undefined) {
            return '';
        }

        if (metadata instanceof Error) {
            return JSON.stringify({
                name: metadata.name,
                message: metadata.message,
                stack: metadata.stack,
            });
        }

        if (typeof metadata === 'string') {
            return metadata;
        }

        try {
            return JSON.stringify(metadata);
        } catch {
            return String(metadata);
        }
    }
}
