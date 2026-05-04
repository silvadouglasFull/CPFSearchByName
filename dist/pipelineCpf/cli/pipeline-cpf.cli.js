"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PipelineCpfCliRunner = void 0;
exports.runFromCli = runFromCli;
const filterByCpf_1 = require("../../filterByCpf");
const generatorCpf_1 = require("../../generatorCpf");
const getCpfsByName_1 = require("../../getCpfsByName");
const execute_pipeline_service_1 = require("../../pipelineCpf/application/execute-pipeline.service");
const state_region_digit_resolver_1 = require("../../pipelineCpf/application/state-region-digit.resolver");
const constants_1 = require("../../pipelineCpf/domain/constants");
const pipe_aware_prompt_client_1 = require("../../pipelineCpf/infrastructure/pipe-aware-prompt.client");
const state_region_map_provider_1 = require("../../pipelineCpf/infrastructure/state-region-map.provider");
const file_logger_service_1 = require("../../shared/logging/file-logger.service");
class PipelineCpfCliRunner {
    async run() {
        const logger = new file_logger_service_1.FileLogger('pipeline-cpf');
        const promptClient = new pipe_aware_prompt_client_1.PipeAwarePromptClient();
        const stateRegionDigitResolver = new state_region_digit_resolver_1.StateRegionDigitResolver((0, state_region_map_provider_1.loadStateRegionMap)());
        const service = new execute_pipeline_service_1.ExecutePipelineService(promptClient, {
            collectPortalData: getCpfsByName_1.collectPortalData,
            filterByPartialCpf: filterByCpf_1.filterByPartialCpf,
            generateCpfCandidates: generatorCpf_1.generateCpfCandidates,
        }, stateRegionDigitResolver, logger);
        try {
            await service.execute();
        }
        catch (error) {
            const message = error instanceof Error ? error.message : constants_1.UNKNOWN_ERROR_MESSAGE;
            logger.error(`${constants_1.PIPELINE_FAILURE_PREFIX} ${message}`);
            process.exit(1);
        }
    }
}
exports.PipelineCpfCliRunner = PipelineCpfCliRunner;
async function runFromCli() {
    await new PipelineCpfCliRunner().run();
}
