"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StateRegionDigitResolver = void 0;
const constants_1 = require("../../pipelineCpf/domain/constants");
const errors_1 = require("../../pipelineCpf/domain/errors");
class StateRegionDigitResolver {
    constructor(stateRegionMap) {
        this.stateRegionMap = stateRegionMap;
    }
    resolveByState(stateCodeInput) {
        const stateCode = String(stateCodeInput).trim().toUpperCase();
        if (!/^[A-Z]{2}$/.test(stateCode)) {
            throw new errors_1.InvalidStateCodeError(constants_1.INVALID_STATE_CODE_MESSAGE);
        }
        for (const [regionDigit, stateCodes] of Object.entries(this.stateRegionMap)) {
            if (stateCodes.includes(stateCode)) {
                return regionDigit;
            }
        }
        throw new errors_1.InvalidStateCodeError(`${constants_1.STATE_NOT_FOUND_PREFIX} ${stateCode}`);
    }
}
exports.StateRegionDigitResolver = StateRegionDigitResolver;
