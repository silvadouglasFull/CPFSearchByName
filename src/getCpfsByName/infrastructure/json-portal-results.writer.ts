import {
    DEFAULT_RESULTS_FILE_NAME,
    FILE_ENCODING_UTF8,
    JSON_OUTPUT_INDENT_SPACES,
} from '@/getCpfsByName/domain/constants';
import { PortalRecord, PortalResultsWriter } from '@/getCpfsByName/domain/types';
import fs from 'fs';
import path from 'path';

export class JsonPortalResultsWriter implements PortalResultsWriter {
    constructor(
        private readonly outputFilePath = path.join(/*turbopackIgnore: true*/ process.cwd(), DEFAULT_RESULTS_FILE_NAME),
        private readonly jsonIndentSpaces = JSON_OUTPUT_INDENT_SPACES,
        private readonly fileEncoding: BufferEncoding = FILE_ENCODING_UTF8,
    ) { }

    save(records: PortalRecord[]): string {
        fs.writeFileSync(
            this.outputFilePath,
            JSON.stringify(records, null, this.jsonIndentSpaces),
            this.fileEncoding,
        );

        return this.outputFilePath;
    }
}
