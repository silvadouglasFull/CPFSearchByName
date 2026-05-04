import { normalizeCpf, validatePartialCpf } from '@/filterByCpf/domain/cpf-utils';
import { PortalResultRecord, ResultsRepository } from '@/filterByCpf/domain/types';

export class FilterByCpfService {
    constructor(private readonly repository: ResultsRepository) { }

    filterByPartialCpf(partialCpf: string): PortalResultRecord[] {
        const normalizedTerm = normalizeCpf(partialCpf);
        validatePartialCpf(normalizedTerm);

        const records = this.repository.getAll();
        return records.filter((item) => normalizeCpf(item.cpf).includes(normalizedTerm));
    }
}
