import { CPF_BASE_LENGTH } from '@/generatorCpf/domain/constants';
import { createBaseNineDigits, generateCompleteCpf } from '@/generatorCpf/domain/cpf-check-digit.calculator';
import {
    formatCpf,
    normalizePartialCpf,
    normalizeRegionDigit,
    shouldUseBaseNineDigits,
    validatePartialCpf,
} from '@/generatorCpf/domain/cpf-format.utils';
import { GeneratedCpfRecord } from '@/generatorCpf/domain/types';
import { cpf } from 'cpf-cnpj-validator';

export class GenerateCpfCandidatesService {
    generate(partialCpfInput: string, regionDigitInput?: string | null): GeneratedCpfRecord[] {
        const partialCpf = normalizePartialCpf(partialCpfInput);
        validatePartialCpf(partialCpf);

        const regionDigit = normalizeRegionDigit(regionDigitInput);
        const prefixLength = CPF_BASE_LENGTH - partialCpf.length;
        const prefixLimit = 10 ** prefixLength;
        const generatedRecords: GeneratedCpfRecord[] = [];

        for (let prefixNumber = 0; prefixNumber < prefixLimit; prefixNumber += 1) {
            const prefix = String(prefixNumber).padStart(prefixLength, '0');
            const baseNineDigits = createBaseNineDigits(prefix, partialCpf);

            if (!shouldUseBaseNineDigits(baseNineDigits, regionDigit)) {
                continue;
            }

            const generatedCpf = generateCompleteCpf(baseNineDigits);

            if (cpf.isValid(generatedCpf)) {
                generatedRecords.push({
                    cpf: generatedCpf,
                    formattedCpf: formatCpf(generatedCpf),
                    baseNineDigits,
                    regionDigit: regionDigitInput,
                });
            }
        }

        return generatedRecords;
    }
}
