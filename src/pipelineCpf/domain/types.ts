import { PortalResultRecord } from '@/filterByCpf/domain/types';
import { GeneratedCpfRecord } from '@/generatorCpf/domain/types';
import { PortalRecord } from '@/getCpfsByName/domain/types';

export type StateRegionMap = Record<string, string[]>;

export interface PromptClient {
    ask(question: string): Promise<string>;
}

export interface PipelineDependencies {
    collectPortalData(searchName: string): Promise<PortalRecord[]>;
    filterByPartialCpf(partialCpf: string): PortalResultRecord[];
    generateCpfCandidates(partialCpf: string, regionDigit: string): GeneratedCpfRecord[];
}
