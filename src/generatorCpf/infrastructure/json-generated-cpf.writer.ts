import {
    DEFAULT_OUTPUT_FILE_NAME,
    FILE_ENCODING_UTF8,
    JSON_OUTPUT_INDENT_SPACES,
} from '@/generatorCpf/domain/constants';
import { GeneratedCpfRecord, GeneratedCpfWriter } from '@/generatorCpf/domain/types';
import fs from 'fs';
import path from 'path';

export class JsonGeneratedCpfWriter implements GeneratedCpfWriter {
    constructor(private readonly outputFilePath = path.join(process.cwd(), DEFAULT_OUTPUT_FILE_NAME)) { }

    save(records: GeneratedCpfRecord[]): string {
        fs.writeFileSync(
            this.outputFilePath,
            JSON.stringify(records, null, JSON_OUTPUT_INDENT_SPACES),
            FILE_ENCODING_UTF8,
        );

        return this.outputFilePath;
    }
}
