"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CollectPortalDataService = void 0;
const portal_record_mapper_1 = require("../../getCpfsByName/application/portal-record-mapper");
const constants_1 = require("../../getCpfsByName/domain/constants");
const search_name_utils_1 = require("../../getCpfsByName/domain/search-name.utils");
const file_logger_service_1 = require("../../shared/logging/file-logger.service");
class CollectPortalDataService {
    constructor(searchClient, resultsWriter, recordMapper = new portal_record_mapper_1.PortalRecordMapper(), logger = new file_logger_service_1.FileLogger('get-cpfs-by-name')) {
        this.searchClient = searchClient;
        this.resultsWriter = resultsWriter;
        this.recordMapper = recordMapper;
        this.logger = logger;
    }
    async collect(searchName) {
        (0, search_name_utils_1.validateSearchName)(searchName);
        const allRecords = [];
        await this.searchClient.openSearch(searchName);
        try {
            for (let pageNumber = constants_1.FIRST_PAGE_NUMBER; pageNumber <= constants_1.TOTAL_PAGES; pageNumber += 1) {
                this.logger.info(`Collecting page ${pageNumber} of ${constants_1.TOTAL_PAGES}...`);
                try {
                    const pageResponse = await this.searchClient.collectPage(pageNumber);
                    const mappedRecords = this.recordMapper.mapRecords(pageResponse.registros, pageNumber);
                    allRecords.push(...mappedRecords);
                    if (pageNumber < constants_1.TOTAL_PAGES) {
                        await new Promise((resolve) => setTimeout(resolve, constants_1.PAGE_THROTTLE_DELAY_MS));
                    }
                }
                catch (error) {
                    const message = error instanceof Error ? error.message : String(error);
                    this.logger.error(`${constants_1.PAGE_ERROR_PREFIX} ${pageNumber}: ${message}`);
                }
            }
            this.resultsWriter.save(allRecords);
            return allRecords;
        }
        finally {
            await this.searchClient.close();
        }
    }
}
exports.CollectPortalDataService = CollectPortalDataService;
