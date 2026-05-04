import { CPF_NORMALIZE_REGEX, CPF_PARTIAL_MIN_DIGITS } from '@/filterByCpf/domain/constants';
import { InvalidCpfPartialError } from '@/filterByCpf/domain/errors';

export function normalizeCpf(value: unknown): string {
    return String(value ?? '').replace(CPF_NORMALIZE_REGEX, '');
}

export function validatePartialCpf(partialCpf: string): void {
    if (partialCpf.length < CPF_PARTIAL_MIN_DIGITS) {
        throw new InvalidCpfPartialError();
    }
}
