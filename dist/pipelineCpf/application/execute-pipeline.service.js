"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExecutePipelineService = void 0;
const constants_1 = require("../../pipelineCpf/domain/constants");
const file_logger_service_1 = require("../../shared/logging/file-logger.service");
class ExecutePipelineService {
    constructor(promptClient, dependencies, stateRegionDigitResolver, logger = new file_logger_service_1.FileLogger('pipeline-cpf')) {
        this.promptClient = promptClient;
        this.dependencies = dependencies;
        this.stateRegionDigitResolver = stateRegionDigitResolver;
        this.logger = logger;
    }
    async execute() {
        const searchName = await this.promptClient.ask(constants_1.SEARCH_NAME_PROMPT);
        if (!searchName) {
            throw new Error(constants_1.EMPTY_SEARCH_NAME_MESSAGE);
        }
        this.logger.output('');
        this.logger.info(constants_1.STEP_1_MESSAGE);
        await this.dependencies.collectPortalData(searchName);
        const partialCpf = await this.promptClient.ask(`\n${constants_1.PARTIAL_CPF_PROMPT}`);
        if (!partialCpf) {
            throw new Error(constants_1.EMPTY_PARTIAL_CPF_MESSAGE);
        }
        this.logger.output('');
        this.logger.info(constants_1.STEP_2_MESSAGE);
        const foundRecords = this.dependencies.filterByPartialCpf(partialCpf);
        if (foundRecords.length === 0) {
            this.logger.info(constants_1.NO_CPF_MATCH_MESSAGE);
            return;
        }
        this.logger.info(`${constants_1.FOUND_RECORDS_PREFIX} ${foundRecords.length} ${constants_1.FOUND_RECORDS_SUFFIX}`);
        this.logger.output(JSON.stringify(foundRecords, null, constants_1.JSON_OUTPUT_INDENT_SPACES));
        const stateCode = await this.promptClient.ask(`\n${constants_1.STATE_CODE_PROMPT}`);
        const regionDigit = this.stateRegionDigitResolver.resolveByState(stateCode);
        this.logger.info(`${constants_1.REGION_DIGIT_PREFIX} ${stateCode.toUpperCase()} ${constants_1.REGION_DIGIT_MIDDLE} ${regionDigit}.`);
        this.logger.output('');
        this.logger.info(constants_1.STEP_3_MESSAGE);
        const generatedRecords = this.dependencies.generateCpfCandidates(partialCpf, regionDigit);
        if (generatedRecords.length === 0) {
            this.logger.info(constants_1.NO_GENERATED_CPF_MESSAGE);
            return;
        }
        generatedRecords.forEach((record) => {
            this.logger.output(record.formattedCpf);
        });
        this.logger.info(`Total CPF candidates generated: ${generatedRecords.length}`);
    }
}
exports.ExecutePipelineService = ExecutePipelineService;
