import { DEFAULT_APP_SETTINGS, createAppSettingsService } from '@/appSettings';
import { CollectPortalDataService } from '@/getCpfsByName/application/collect-portal-data.service';
import { PortalRecordMapper } from '@/getCpfsByName/application/portal-record-mapper';
import {
    CLI_USAGE_MESSAGE,
    SEARCH_ERROR_PREFIX,
    SEARCH_START_MESSAGE,
    SEARCH_SUCCESS_PREFIX,
    UNKNOWN_ERROR_MESSAGE,
} from '@/getCpfsByName/domain/constants';
import { PuppeteerPortalSearchClient } from '@/getCpfsByName/infrastructure/puppeteer-portal-search.client';
import { FileLogger } from '@/shared/logging/file-logger.service';

export class GetCpfsByNameCliRunner {
    constructor(private readonly logger = new FileLogger('get-cpfs-by-name')) { }

    async run(): Promise<void> {
        let settings = DEFAULT_APP_SETTINGS;

        try {
            settings = await createAppSettingsService().getSettings();
        } catch {
            settings = DEFAULT_APP_SETTINGS;
        }

        const searchName = process.argv.slice(settings.cliFirstUserArgIndex).join(' ').trim();

        if (!searchName) {
            this.logger.error(CLI_USAGE_MESSAGE);
            process.exit(1);
        }

        this.logger.info(SEARCH_START_MESSAGE);

        try {
            const searchClient = new PuppeteerPortalSearchClient({
                defaultPageSelector: settings.defaultPageSelector,
                firstPageNumber: settings.firstPageNumber,
                pageNavigationTimeoutMs: settings.pageNavigationTimeoutMs,
                pageResponseTimeoutMs: settings.pageResponseTimeoutMs,
                pageSelectorTimeoutMs: settings.pageSelectorTimeoutMs,
                resultsPerPage: settings.resultsPerPage,
                searchApiHostname: settings.searchApiHostname,
                searchApiPathname: settings.searchApiPathname,
                searchPageUrl: settings.searchPageUrl,
            });
            const mapper = new PortalRecordMapper(settings.detailsPageUrl);
            const service = new CollectPortalDataService(searchClient, mapper, this.logger, {
                firstPageNumber: settings.firstPageNumber,
                totalPages: settings.totalPages,
                pageThrottleDelayMs: settings.pageThrottleDelayMs,
            });
            const records = await service.collect(searchName);
            this.logger.info(`${SEARCH_SUCCESS_PREFIX} ${records.length}`);
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
