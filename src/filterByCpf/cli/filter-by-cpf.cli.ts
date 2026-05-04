import { FilterByCpfService } from '@/filterByCpf/application/filter-by-cpf.service';
import {
    CLI_PARTIAL_CPF_ARG_INDEX,
    DEFAULT_RESULTS_FILE_NAME,
    JSON_OUTPUT_INDENT_SPACES,
} from '@/filterByCpf/domain/constants';
import { JsonResultsRepository } from '@/filterByCpf/infrastructure/json-results.repository';
import { FileLogger } from '@/shared/logging/file-logger.service';
import path from 'path';

const CLI_USAGE_MESSAGE = 'Usage: node filterByCpf.js <partial-cpf>';
const UNKNOWN_ERROR_MESSAGE = 'Unknown error.';
const FILTER_ERROR_PREFIX = 'Failed to filter results:';

export class FilterByCpfCliRunner {
    private readonly logger = new FileLogger('filter-by-cpf');

    run(): void {
        const partialCpf = process.argv[CLI_PARTIAL_CPF_ARG_INDEX];

        if (!partialCpf) {
            this.logger.error(CLI_USAGE_MESSAGE);
            process.exit(1);
        }

        const resultFilePath = path.join(process.cwd(), DEFAULT_RESULTS_FILE_NAME);
        const repository = new JsonResultsRepository(resultFilePath);
        const service = new FilterByCpfService(repository);

        try {
            const filtered = service.filterByPartialCpf(partialCpf);
            this.logger.output(JSON.stringify(filtered, null, JSON_OUTPUT_INDENT_SPACES));
        } catch (error) {
            const message = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
            this.logger.error(`${FILTER_ERROR_PREFIX} ${message}`);
            process.exit(1);
        }
    }
}

export function runFromCli(): void {
    new FilterByCpfCliRunner().run();
}
