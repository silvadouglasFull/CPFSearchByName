import { filterByPartialCpf } from '@/filterByCpf';
import { generateCpfCandidates } from '@/generatorCpf';
import { collectPortalData } from '@/getCpfsByName';
import { ExecutePipelineService } from '@/pipelineCpf/application/execute-pipeline.service';
import { StateRegionDigitResolver } from '@/pipelineCpf/application/state-region-digit.resolver';
import { PIPELINE_FAILURE_PREFIX, UNKNOWN_ERROR_MESSAGE } from '@/pipelineCpf/domain/constants';
import { PipeAwarePromptClient } from '@/pipelineCpf/infrastructure/pipe-aware-prompt.client';
import { loadStateRegionMap } from '@/pipelineCpf/infrastructure/state-region-map.provider';
import { FileLogger } from '@/shared/logging/file-logger.service';

export class PipelineCpfCliRunner {
    async run(): Promise<void> {
        const logger = new FileLogger('pipeline-cpf');
        const promptClient = new PipeAwarePromptClient();
        const stateRegionDigitResolver = new StateRegionDigitResolver(loadStateRegionMap());
        const service = new ExecutePipelineService(
            promptClient,
            {
                collectPortalData,
                filterByPartialCpf,
                generateCpfCandidates,
            },
            stateRegionDigitResolver,
            logger,
        );

        try {
            await service.execute();
        } catch (error) {
            const message = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
            logger.error(`${PIPELINE_FAILURE_PREFIX} ${message}`);
            process.exit(1);
        }
    }
}

export async function runFromCli(): Promise<void> {
    await new PipelineCpfCliRunner().run();
}
