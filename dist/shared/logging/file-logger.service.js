"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileLogger = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const DEFAULT_LOGS_DIRECTORY_NAME = 'logs';
const FILE_EXTENSION = '.log';
const DATE_SEPARATOR = 'T';
class FileLogger {
    constructor(scope, baseDirectoryPath = process.cwd()) {
        this.scope = scope;
        this.logDirectoryPath = path_1.default.join(baseDirectoryPath, DEFAULT_LOGS_DIRECTORY_NAME);
        this.logFilePath = path_1.default.join(this.logDirectoryPath, `${this.scope}${FILE_EXTENSION}`);
        fs_1.default.mkdirSync(this.logDirectoryPath, { recursive: true });
    }
    info(message, metadata) {
        this.write('INFO', message, metadata, false);
    }
    warn(message, metadata) {
        this.write('WARN', message, metadata, false);
    }
    error(message, metadata) {
        this.write('ERROR', message, metadata, true);
    }
    output(message, metadata) {
        this.write('OUTPUT', message, metadata, false);
    }
    getLogFilePath() {
        return this.logFilePath;
    }
    write(level, message, metadata, writeToStderr) {
        const line = this.formatLine(level, message, metadata);
        if (writeToStderr) {
            process.stderr.write(`${message}\n`);
        }
        else {
            process.stdout.write(`${message}\n`);
        }
        fs_1.default.appendFileSync(this.logFilePath, `${line}\n`, 'utf-8');
    }
    formatLine(level, message, metadata) {
        const timestamp = new Date().toISOString().replace(DATE_SEPARATOR, ' ');
        const serializedMetadata = this.serializeMetadata(metadata);
        return serializedMetadata
            ? `[${timestamp}] [${level}] [${this.scope}] ${message} ${serializedMetadata}`
            : `[${timestamp}] [${level}] [${this.scope}] ${message}`;
    }
    serializeMetadata(metadata) {
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
        }
        catch {
            return String(metadata);
        }
    }
}
exports.FileLogger = FileLogger;
