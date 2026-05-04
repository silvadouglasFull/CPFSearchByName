import {
    DEFAULT_RESULTS_FILE_NAME,
    FILE_ENCODING_UTF8,
    JSON_OUTPUT_INDENT_SPACES,
} from '@/getCpfsByName/domain/constants';
import { PortalRecord, PortalResultsWriter } from '@/getCpfsByName/domain/types';
import fs from 'fs';
import path from 'path';

export class JsonPortalResultsWriter implements PortalResultsWriter {
    constructor(private readonly outputFilePath = path.join(process.cwd(), DEFAULT_RESULTS_FILE_NAME)) { }

    save(records: PortalRecord[]): string {
        fs.writeFileSync(
            this.outputFilePath,
            JSON.stringify(records, null, JSON_OUTPUT_INDENT_SPACES),
            FILE_ENCODING_UTF8,
        );

        return this.outputFilePath;
    }
}
