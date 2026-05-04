import { FILE_ENCODING_UTF8 } from '@/filterByCpf/domain/constants';
import { PortalResultRecord, ResultsRepository } from '@/filterByCpf/domain/types';
import fs from 'fs';

export class JsonResultsRepository implements ResultsRepository {
    constructor(private readonly filePath: string) { }

    getAll(): PortalResultRecord[] {
        const content = fs.readFileSync(this.filePath, FILE_ENCODING_UTF8);
        return JSON.parse(content) as PortalResultRecord[];
    }
}
