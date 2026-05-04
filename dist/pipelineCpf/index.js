"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFromCli = void 0;
exports.executePipeline = executePipeline;
exports.resolveRegionDigitByState = resolveRegionDigitByState;
const filterByCpf_1 = require("../filterByCpf");
const generatorCpf_1 = require("../generatorCpf");
const getCpfsByName_1 = require("../getCpfsByName");
const execute_pipeline_service_1 = require("../pipelineCpf/application/execute-pipeline.service");
const state_region_digit_resolver_1 = require("../pipelineCpf/application/state-region-digit.resolver");
const pipeline_cpf_cli_1 = require("../pipelineCpf/cli/pipeline-cpf.cli");
Object.defineProperty(exports, "runFromCli", { enumerable: true, get: function () { return pipeline_cpf_cli_1.runFromCli; } });
const state_region_map_provider_1 = require("../pipelineCpf/infrastructure/state-region-map.provider");
async function executePipeline(promptClient) {
    const resolver = new state_region_digit_resolver_1.StateRegionDigitResolver((0, state_region_map_provider_1.loadStateRegionMap)());
    const service = new execute_pipeline_service_1.ExecutePipelineService(promptClient, {
        collectPortalData: getCpfsByName_1.collectPortalData,
        filterByPartialCpf: filterByCpf_1.filterByPartialCpf,
        generateCpfCandidates: generatorCpf_1.generateCpfCandidates,
    }, resolver);
    await service.execute();
}
function resolveRegionDigitByState(stateCode) {
    return new state_region_digit_resolver_1.StateRegionDigitResolver((0, state_region_map_provider_1.loadStateRegionMap)()).resolveByState(stateCode);
}
