"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeCpf = normalizeCpf;
exports.validatePartialCpf = validatePartialCpf;
const constants_1 = require("../../filterByCpf/domain/constants");
const errors_1 = require("../../filterByCpf/domain/errors");
function normalizeCpf(value) {
    return String(value ?? '').replace(constants_1.CPF_NORMALIZE_REGEX, '');
}
function validatePartialCpf(partialCpf) {
    if (partialCpf.length < constants_1.CPF_PARTIAL_MIN_DIGITS) {
        throw new errors_1.InvalidCpfPartialError();
    }
}
