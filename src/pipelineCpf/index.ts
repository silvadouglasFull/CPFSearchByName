import { filterByPartialCpf } from '@/filterByCpf';
import { generateCpfCandidates } from '@/generatorCpf';
import { collectPortalData } from '@/getCpfsByName';
import { ExecutePipelineService } from '@/pipelineCpf/application/execute-pipeline.service';
import { StateRegionDigitResolver } from '@/pipelineCpf/application/state-region-digit.resolver';
import { runFromCli } from '@/pipelineCpf/cli/pipeline-cpf.cli';
import { PromptClient } from '@/pipelineCpf/domain/types';
import { loadStateRegionMap } from '@/pipelineCpf/infrastructure/state-region-map.provider';

export async function executePipeline(promptClient: PromptClient): Promise<void> {
    const resolver = new StateRegionDigitResolver(loadStateRegionMap());
    const service = new ExecutePipelineService(
        promptClient,
        {
            collectPortalData,
            filterByPartialCpf,
            generateCpfCandidates,
        },
        resolver,
    );

    await service.execute();
}

export function resolveRegionDigitByState(stateCode: string): string {
    return new StateRegionDigitResolver(loadStateRegionMap()).resolveByState(stateCode);
}

export { runFromCli };
