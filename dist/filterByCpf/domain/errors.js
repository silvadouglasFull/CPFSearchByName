"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCpfPartialError = void 0;
class InvalidCpfPartialError extends Error {
    constructor(message = 'Provide a partial CPF with at least one digit.') {
        super(message);
        this.name = 'InvalidCpfPartialError';
    }
}
exports.InvalidCpfPartialError = InvalidCpfPartialError;
