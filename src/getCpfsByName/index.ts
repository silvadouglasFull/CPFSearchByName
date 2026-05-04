import { CollectPortalDataService } from '@/getCpfsByName/application/collect-portal-data.service';
import { PortalRecordMapper } from '@/getCpfsByName/application/portal-record-mapper';
import { runFromCli } from '@/getCpfsByName/cli/get-cpfs-by-name.cli';
import { PortalRecord, RawPortalRecord } from '@/getCpfsByName/domain/types';
import { JsonPortalResultsWriter } from '@/getCpfsByName/infrastructure/json-portal-results.writer';
import { PuppeteerPortalSearchClient } from '@/getCpfsByName/infrastructure/puppeteer-portal-search.client';

export async function collectPortalData(searchName: string): Promise<PortalRecord[]> {
    const searchClient = new PuppeteerPortalSearchClient();
    const resultsWriter = new JsonPortalResultsWriter();
    const service = new CollectPortalDataService(searchClient, resultsWriter);
    return service.collect(searchName);
}

export function mapPortalRecords(records: RawPortalRecord[], sourcePage: number): PortalRecord[] {
    return new PortalRecordMapper().mapRecords(records, sourcePage);
}

export { runFromCli };
