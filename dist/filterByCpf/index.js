"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFromCli = exports.normalizeCpf = void 0;
exports.filterByPartialCpf = filterByPartialCpf;
const filter_by_cpf_service_1 = require("../filterByCpf/application/filter-by-cpf.service");
const filter_by_cpf_cli_1 = require("../filterByCpf/cli/filter-by-cpf.cli");
Object.defineProperty(exports, "runFromCli", { enumerable: true, get: function () { return filter_by_cpf_cli_1.runFromCli; } });
const constants_1 = require("../filterByCpf/domain/constants");
const cpf_utils_1 = require("../filterByCpf/domain/cpf-utils");
Object.defineProperty(exports, "normalizeCpf", { enumerable: true, get: function () { return cpf_utils_1.normalizeCpf; } });
const json_results_repository_1 = require("../filterByCpf/infrastructure/json-results.repository");
const path_1 = __importDefault(require("path"));
const DEFAULT_RESULT_FILE_PATH = path_1.default.join(process.cwd(), constants_1.DEFAULT_RESULTS_FILE_NAME);
function filterByPartialCpf(partialCpf, resultFilePath = DEFAULT_RESULT_FILE_PATH) {
    const repository = new json_results_repository_1.JsonResultsRepository(resultFilePath);
    const service = new filter_by_cpf_service_1.FilterByCpfService(repository);
    return service.filterByPartialCpf(partialCpf);
}
