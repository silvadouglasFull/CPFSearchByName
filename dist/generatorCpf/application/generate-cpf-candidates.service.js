"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GenerateCpfCandidatesService = void 0;
const constants_1 = require("../../generatorCpf/domain/constants");
const cpf_check_digit_calculator_1 = require("../../generatorCpf/domain/cpf-check-digit.calculator");
const cpf_format_utils_1 = require("../../generatorCpf/domain/cpf-format.utils");
const cpf_cnpj_validator_1 = require("cpf-cnpj-validator");
class GenerateCpfCandidatesService {
    generate(partialCpfInput, regionDigitInput) {
        const partialCpf = (0, cpf_format_utils_1.normalizePartialCpf)(partialCpfInput);
        (0, cpf_format_utils_1.validatePartialCpf)(partialCpf);
        const regionDigit = (0, cpf_format_utils_1.normalizeRegionDigit)(regionDigitInput);
        const prefixLength = constants_1.CPF_BASE_LENGTH - partialCpf.length;
        const prefixLimit = 10 ** prefixLength;
        const generatedRecords = [];
        for (let prefixNumber = 0; prefixNumber < prefixLimit; prefixNumber += 1) {
            const prefix = String(prefixNumber).padStart(prefixLength, '0');
            const baseNineDigits = (0, cpf_check_digit_calculator_1.createBaseNineDigits)(prefix, partialCpf);
            if (!(0, cpf_format_utils_1.shouldUseBaseNineDigits)(baseNineDigits, regionDigit)) {
                continue;
            }
            const generatedCpf = (0, cpf_check_digit_calculator_1.generateCompleteCpf)(baseNineDigits);
            if (cpf_cnpj_validator_1.cpf.isValid(generatedCpf)) {
                generatedRecords.push({
                    cpf: generatedCpf,
                    formattedCpf: (0, cpf_format_utils_1.formatCpf)(generatedCpf),
                    baseNineDigits,
                });
            }
        }
        return generatedRecords;
    }
}
exports.GenerateCpfCandidatesService = GenerateCpfCandidatesService;
