"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidSearchNameError = void 0;
class InvalidSearchNameError extends Error {
    constructor(message = 'Provide a search name.') {
        super(message);
        this.name = 'InvalidSearchNameError';
    }
}
exports.InvalidSearchNameError = InvalidSearchNameError;
