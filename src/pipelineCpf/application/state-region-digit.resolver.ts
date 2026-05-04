import {
    INVALID_STATE_CODE_MESSAGE,
    STATE_NOT_FOUND_PREFIX,
} from '@/pipelineCpf/domain/constants';
import { InvalidStateCodeError } from '@/pipelineCpf/domain/errors';
import { StateRegionMap } from '@/pipelineCpf/domain/types';

export class StateRegionDigitResolver {
    constructor(private readonly stateRegionMap: StateRegionMap) { }

    resolveByState(stateCodeInput: string): string {
        const stateCode = String(stateCodeInput).trim().toUpperCase();

        if (!/^[A-Z]{2}$/.test(stateCode)) {
            throw new InvalidStateCodeError(INVALID_STATE_CODE_MESSAGE);
        }

        for (const [regionDigit, stateCodes] of Object.entries(this.stateRegionMap)) {
            if (stateCodes.includes(stateCode)) {
                return regionDigit;
            }
        }

        throw new InvalidStateCodeError(`${STATE_NOT_FOUND_PREFIX} ${stateCode}`);
    }
}
