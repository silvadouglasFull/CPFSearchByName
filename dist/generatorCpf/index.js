"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFromCli = exports.normalizeRegionDigit = exports.normalizePartialCpf = exports.generateCompleteCpf = exports.formatCpf = void 0;
exports.generateCpfCandidates = generateCpfCandidates;
exports.saveGeneratedCpfs = saveGeneratedCpfs;
const generate_cpf_candidates_service_1 = require("../generatorCpf/application/generate-cpf-candidates.service");
const generator_cpf_cli_1 = require("../generatorCpf/cli/generator-cpf.cli");
Object.defineProperty(exports, "runFromCli", { enumerable: true, get: function () { return generator_cpf_cli_1.runFromCli; } });
const cpf_check_digit_calculator_1 = require("../generatorCpf/domain/cpf-check-digit.calculator");
Object.defineProperty(exports, "generateCompleteCpf", { enumerable: true, get: function () { return cpf_check_digit_calculator_1.generateCompleteCpf; } });
const cpf_format_utils_1 = require("../generatorCpf/domain/cpf-format.utils");
Object.defineProperty(exports, "formatCpf", { enumerable: true, get: function () { return cpf_format_utils_1.formatCpf; } });
Object.defineProperty(exports, "normalizePartialCpf", { enumerable: true, get: function () { return cpf_format_utils_1.normalizePartialCpf; } });
Object.defineProperty(exports, "normalizeRegionDigit", { enumerable: true, get: function () { return cpf_format_utils_1.normalizeRegionDigit; } });
const json_generated_cpf_writer_1 = require("../generatorCpf/infrastructure/json-generated-cpf.writer");
function generateCpfCandidates(partialCpf, regionDigit) {
    const service = new generate_cpf_candidates_service_1.GenerateCpfCandidatesService();
    return service.generate(partialCpf, regionDigit);
}
function saveGeneratedCpfs(records) {
    const writer = new json_generated_cpf_writer_1.JsonGeneratedCpfWriter();
    return writer.save(records);
}
