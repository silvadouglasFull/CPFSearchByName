"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePartialCpf = normalizePartialCpf;
exports.normalizeRegionDigit = normalizeRegionDigit;
exports.validatePartialCpf = validatePartialCpf;
exports.shouldUseBaseNineDigits = shouldUseBaseNineDigits;
exports.formatCpf = formatCpf;
const constants_1 = require("../../generatorCpf/domain/constants");
const errors_1 = require("../../generatorCpf/domain/errors");
const internal_constants_1 = require("../../generatorCpf/domain/internal-constants");
function normalizePartialCpf(value) {
    return String(value ?? '').replace(internal_constants_1.CPF_NORMALIZE_REGEX, '');
}
function normalizeRegionDigit(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }
    const normalizedValue = String(value).replace(internal_constants_1.CPF_NORMALIZE_REGEX, '');
    if (normalizedValue.length !== 1) {
        throw new errors_1.InvalidRegionDigitError();
    }
    return normalizedValue;
}
function validatePartialCpf(partialCpf) {
    if (partialCpf.length < constants_1.PARTIAL_CPF_MIN_LENGTH || partialCpf.length > constants_1.CPF_BASE_LENGTH) {
        throw new errors_1.InvalidPartialCpfError();
    }
}
function shouldUseBaseNineDigits(baseNineDigits, regionDigit) {
    if (regionDigit === null) {
        return true;
    }
    return baseNineDigits[constants_1.REGION_DIGIT_INDEX] === regionDigit;
}
function formatCpf(cpf) {
    const firstSegment = cpf.substring(0, constants_1.CPF_FORMAT_SEGMENT_LENGTH);
    const secondSegment = cpf.substring(constants_1.CPF_FORMAT_SEGMENT_LENGTH, constants_1.CPF_FORMAT_SEGMENT_LENGTH * 2);
    const thirdSegment = cpf.substring(constants_1.CPF_FORMAT_SEGMENT_LENGTH * 2, constants_1.CPF_BASE_LENGTH);
    const suffix = cpf.substring(constants_1.CPF_BASE_LENGTH, constants_1.CPF_BASE_LENGTH + constants_1.CPF_FORMAT_SUFFIX_LENGTH);
    return `${firstSegment}.${secondSegment}.${thirdSegment}-${suffix}`;
}
