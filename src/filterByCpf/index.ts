import { FilterByCpfService } from '@/filterByCpf/application/filter-by-cpf.service';
import { runFromCli } from '@/filterByCpf/cli/filter-by-cpf.cli';
import { DEFAULT_RESULTS_FILE_NAME } from '@/filterByCpf/domain/constants';
import { normalizeCpf } from '@/filterByCpf/domain/cpf-utils';
import { PortalResultRecord } from '@/filterByCpf/domain/types';
import { JsonResultsRepository } from '@/filterByCpf/infrastructure/json-results.repository';
import path from 'path';

const DEFAULT_RESULT_FILE_PATH = path.join(process.cwd(), DEFAULT_RESULTS_FILE_NAME);

export function filterByPartialCpf(
    partialCpf: string,
    resultFilePath = DEFAULT_RESULT_FILE_PATH,
): PortalResultRecord[] {
    const repository = new JsonResultsRepository(resultFilePath);
    const service = new FilterByCpfService(repository);
    return service.filterByPartialCpf(partialCpf);
}

export { normalizeCpf, runFromCli };

