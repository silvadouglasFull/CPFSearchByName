"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneratorCpfCliRunner = void 0;
exports.runFromCli = runFromCli;
const generate_cpf_candidates_service_1 = require("../../generatorCpf/application/generate-cpf-candidates.service");
const constants_1 = require("../../generatorCpf/domain/constants");
const json_generated_cpf_writer_1 = require("../../generatorCpf/infrastructure/json-generated-cpf.writer");
const file_logger_service_1 = require("../../shared/logging/file-logger.service");
class GeneratorCpfCliRunner {
    constructor(generatorService = new generate_cpf_candidates_service_1.GenerateCpfCandidatesService(), writer = new json_generated_cpf_writer_1.JsonGeneratedCpfWriter(), logger = new file_logger_service_1.FileLogger('generator-cpf')) {
        this.generatorService = generatorService;
        this.writer = writer;
        this.logger = logger;
    }
    run() {
        const partialCpf = process.argv[constants_1.CLI_PARTIAL_CPF_ARG_INDEX];
        const regionDigit = process.argv[constants_1.CLI_REGION_DIGIT_ARG_INDEX];
        if (!partialCpf) {
            this.logger.error(constants_1.CLI_USAGE_MESSAGE);
            process.exit(1);
        }
        this.logger.info(constants_1.GENERATION_START_MESSAGE);
        this.logger.info(constants_1.SEPARATOR_LINE);
        try {
            const generatedRecords = this.generatorService.generate(partialCpf, regionDigit);
            const outputFilePath = this.writer.save(generatedRecords);
            generatedRecords.forEach((record) => {
                this.logger.output(`${constants_1.CPF_FOUND_MESSAGE_PREFIX} ${record.formattedCpf}`);
            });
            this.logger.info(constants_1.SEPARATOR_LINE);
            this.logger.info(`${constants_1.TOTAL_FOUND_MESSAGE_PREFIX} ${generatedRecords.length}`);
            this.logger.info(`${constants_1.OUTPUT_FILE_MESSAGE_PREFIX} ${outputFilePath}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : constants_1.UNKNOWN_ERROR_MESSAGE;
            this.logger.error(`${constants_1.GENERATION_ERROR_PREFIX} ${message}`);
            process.exit(1);
        }
    }
}
exports.GeneratorCpfCliRunner = GeneratorCpfCliRunner;
function runFromCli() {
    new GeneratorCpfCliRunner().run();
}
