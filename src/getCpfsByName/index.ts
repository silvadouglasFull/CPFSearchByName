import { DEFAULT_APP_SETTINGS, createAppSettingsService } from '@/appSettings';
import { CollectPortalDataService } from '@/getCpfsByName/application/collect-portal-data.service';
import { PortalRecordMapper } from '@/getCpfsByName/application/portal-record-mapper';
import { runFromCli } from '@/getCpfsByName/cli/get-cpfs-by-name.cli';
import { PortalRecord, RawPortalRecord } from '@/getCpfsByName/domain/types';
import { PuppeteerPortalSearchClient } from '@/getCpfsByName/infrastructure/puppeteer-portal-search.client';

export async function collectPortalData(searchName: string): Promise<PortalRecord[]> {
    let settings = DEFAULT_APP_SETTINGS;

    try {
        settings = await createAppSettingsService().getSettings();
    } catch {
        settings = DEFAULT_APP_SETTINGS;
    }

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
    const service = new CollectPortalDataService(searchClient, mapper, undefined, {
        firstPageNumber: settings.firstPageNumber,
        totalPages: settings.totalPages,
        pageThrottleDelayMs: settings.pageThrottleDelayMs,
    });
    return service.collect(searchName);
}

export function mapPortalRecords(records: RawPortalRecord[], sourcePage: number): PortalRecord[] {
    return new PortalRecordMapper().mapRecords(records, sourcePage);
}

export { runFromCli };
