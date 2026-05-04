"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCompleteCpf = generateCompleteCpf;
exports.createBaseNineDigits = createBaseNineDigits;
const constants_1 = require("../../generatorCpf/domain/constants");
const FIRST_CHECK_DIGIT_WEIGHTS = [10, 9, 8, 7, 6, 5, 4, 3, 2];
const SECOND_CHECK_DIGIT_WEIGHTS = [11, 10, 9, 8, 7, 6, 5, 4, 3, 2];
const INVALID_REMAINDER_VALUES = new Set([10, 11]);
function calculateCheckDigit(digits, weights) {
    const sum = weights.reduce((total, weight, index) => {
        return total + Number(digits[index]) * weight;
    }, 0);
    const remainder = (sum * 10) % 11;
    return INVALID_REMAINDER_VALUES.has(remainder) ? 0 : remainder;
}
function generateCompleteCpf(baseNineDigits) {
    const firstCheckDigit = calculateCheckDigit(baseNineDigits, FIRST_CHECK_DIGIT_WEIGHTS);
    const firstTenDigits = `${baseNineDigits}${firstCheckDigit}`;
    const secondCheckDigit = calculateCheckDigit(firstTenDigits, SECOND_CHECK_DIGIT_WEIGHTS);
    return `${baseNineDigits}${firstCheckDigit}${secondCheckDigit}`;
}
function createBaseNineDigits(prefix, partialCpf) {
    const baseNineDigits = `${prefix}${partialCpf}`;
    if (baseNineDigits.length !== constants_1.CPF_BASE_LENGTH) {
        throw new Error('Base nine digits must contain exactly 9 digits.');
    }
    return baseNineDigits;
}
