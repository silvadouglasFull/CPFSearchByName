import { StateRegionMap } from '@/pipelineCpf/domain/types';
import fs from 'fs';
import path from 'path';

export function loadStateRegionMap(): StateRegionMap {
    const filePath = path.join(process.cwd(), 'identifyByState.json');
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as StateRegionMap;
}
