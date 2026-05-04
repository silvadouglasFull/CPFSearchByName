"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterByCpfCliRunner = void 0;
exports.runFromCli = runFromCli;
const filter_by_cpf_service_1 = require("../../filterByCpf/application/filter-by-cpf.service");
const constants_1 = require("../../filterByCpf/domain/constants");
const json_results_repository_1 = require("../../filterByCpf/infrastructure/json-results.repository");
const file_logger_service_1 = require("../../shared/logging/file-logger.service");
const path_1 = __importDefault(require("path"));
const CLI_USAGE_MESSAGE = 'Usage: node filterByCpf.js <partial-cpf>';
const UNKNOWN_ERROR_MESSAGE = 'Unknown error.';
const FILTER_ERROR_PREFIX = 'Failed to filter results:';
class FilterByCpfCliRunner {
    constructor() {
        this.logger = new file_logger_service_1.FileLogger('filter-by-cpf');
    }
    run() {
        const partialCpf = process.argv[constants_1.CLI_PARTIAL_CPF_ARG_INDEX];
        if (!partialCpf) {
            this.logger.error(CLI_USAGE_MESSAGE);
            process.exit(1);
        }
        const resultFilePath = path_1.default.join(process.cwd(), constants_1.DEFAULT_RESULTS_FILE_NAME);
        const repository = new json_results_repository_1.JsonResultsRepository(resultFilePath);
        const service = new filter_by_cpf_service_1.FilterByCpfService(repository);
        try {
            const filtered = service.filterByPartialCpf(partialCpf);
            this.logger.output(JSON.stringify(filtered, null, constants_1.JSON_OUTPUT_INDENT_SPACES));
        }
        catch (error) {
            const message = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
            this.logger.error(`${FILTER_ERROR_PREFIX} ${message}`);
            process.exit(1);
        }
    }
}
exports.FilterByCpfCliRunner = FilterByCpfCliRunner;
function runFromCli() {
    new FilterByCpfCliRunner().run();
}
