import { CollectPortalDataService } from '@/getCpfsByName/application/collect-portal-data.service';
import {
    CLI_FIRST_USER_ARG_INDEX,
    CLI_USAGE_MESSAGE,
    FILE_SAVED_PREFIX,
    SEARCH_ERROR_PREFIX,
    SEARCH_START_MESSAGE,
    SEARCH_SUCCESS_PREFIX,
    UNKNOWN_ERROR_MESSAGE,
} from '@/getCpfsByName/domain/constants';
import { JsonPortalResultsWriter } from '@/getCpfsByName/infrastructure/json-portal-results.writer';
import { PuppeteerPortalSearchClient } from '@/getCpfsByName/infrastructure/puppeteer-portal-search.client';
import { FileLogger } from '@/shared/logging/file-logger.service';

export class GetCpfsByNameCliRunner {
    constructor(
        private readonly searchClient = new PuppeteerPortalSearchClient(),
        private readonly resultsWriter = new JsonPortalResultsWriter(),
        private readonly logger = new FileLogger('get-cpfs-by-name'),
    ) { }

    async run(): Promise<void> {
        const searchName = process.argv.slice(CLI_FIRST_USER_ARG_INDEX).join(' ').trim();

        if (!searchName) {
            this.logger.error(CLI_USAGE_MESSAGE);
            process.exit(1);
        }

        this.logger.info(SEARCH_START_MESSAGE);

        try {
            const service = new CollectPortalDataService(this.searchClient, this.resultsWriter, undefined, this.logger);
            const records = await service.collect(searchName);
            this.logger.info(`${SEARCH_SUCCESS_PREFIX} ${records.length}`);
            this.logger.info(`${FILE_SAVED_PREFIX} ${this.resultsWriter.save(records)}`);
        } catch (error) {
            const message = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
            this.logger.error(`${SEARCH_ERROR_PREFIX} ${message}`);
            process.exit(1);
        }
    }
}

export async function runFromCli(): Promise<void> {
    await new GetCpfsByNameCliRunner().run();
}
