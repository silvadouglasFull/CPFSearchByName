"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidStateCodeError = void 0;
class InvalidStateCodeError extends Error {
    constructor(message) {
        super(message);
        this.name = 'InvalidStateCodeError';
    }
}
exports.InvalidStateCodeError = InvalidStateCodeError;
