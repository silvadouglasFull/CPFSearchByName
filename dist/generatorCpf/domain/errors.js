"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidRegionDigitError = exports.InvalidPartialCpfError = void 0;
class InvalidPartialCpfError extends Error {
    constructor(message = 'Provide a partial CPF with 1 to 9 digits.') {
        super(message);
        this.name = 'InvalidPartialCpfError';
    }
}
exports.InvalidPartialCpfError = InvalidPartialCpfError;
class InvalidRegionDigitError extends Error {
    constructor(message = 'Provide a region digit between 0 and 9.') {
        super(message);
        this.name = 'InvalidRegionDigitError';
    }
}
exports.InvalidRegionDigitError = InvalidRegionDigitError;
