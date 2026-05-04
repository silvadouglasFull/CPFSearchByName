import { PortalRecordMapper } from '@/getCpfsByName/application/portal-record-mapper';
import {
    FIRST_PAGE_NUMBER,
    PAGE_ERROR_PREFIX,
    PAGE_THROTTLE_DELAY_MS,
    TOTAL_PAGES,
} from '@/getCpfsByName/domain/constants';
import { validateSearchName } from '@/getCpfsByName/domain/search-name.utils';
import { PortalRecord, PortalResultsWriter, PortalSearchClient } from '@/getCpfsByName/domain/types';
import { FileLogger } from '@/shared/logging/file-logger.service';

interface CollectPortalDataSettings {
    firstPageNumber: number;
    totalPages: number;
    pageThrottleDelayMs: number;
}

const DEFAULT_SETTINGS: CollectPortalDataSettings = {
    firstPageNumber: FIRST_PAGE_NUMBER,
    totalPages: TOTAL_PAGES,
    pageThrottleDelayMs: PAGE_THROTTLE_DELAY_MS,
};

export class CollectPortalDataService {
    constructor(
        private readonly searchClient: PortalSearchClient,
        private readonly resultsWriter: PortalResultsWriter,
        private readonly recordMapper: PortalRecordMapper = new PortalRecordMapper(),
        private readonly logger = new FileLogger('get-cpfs-by-name'),
        private readonly settings: CollectPortalDataSettings = DEFAULT_SETTINGS,
    ) { }

    async collect(searchName: string): Promise<PortalRecord[]> {
        validateSearchName(searchName);

        const allRecords: PortalRecord[] = [];

        await this.searchClient.openSearch(searchName);

        try {
            for (let pageNumber = this.settings.firstPageNumber; pageNumber <= this.settings.totalPages; pageNumber += 1) {
                this.logger.info(`Collecting page ${pageNumber} of ${this.settings.totalPages}...`);

                try {
                    const pageResponse = await this.searchClient.collectPage(pageNumber);
                    const mappedRecords = this.recordMapper.mapRecords(pageResponse.registros, pageNumber);
                    allRecords.push(...mappedRecords);

                    if (pageNumber < this.settings.totalPages) {
                        await new Promise((resolve) => setTimeout(resolve, this.settings.pageThrottleDelayMs));
                    }
                } catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    this.logger.error(`${PAGE_ERROR_PREFIX} ${pageNumber}: ${message}`);
                }
            }

            this.resultsWriter.save(allRecords);
            return allRecords;
        } finally {
            await this.searchClient.close();
        }
    }
}
