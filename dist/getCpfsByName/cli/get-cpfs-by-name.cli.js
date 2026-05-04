"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetCpfsByNameCliRunner = void 0;
exports.runFromCli = runFromCli;
const collect_portal_data_service_1 = require("../../getCpfsByName/application/collect-portal-data.service");
const constants_1 = require("../../getCpfsByName/domain/constants");
const json_portal_results_writer_1 = require("../../getCpfsByName/infrastructure/json-portal-results.writer");
const puppeteer_portal_search_client_1 = require("../../getCpfsByName/infrastructure/puppeteer-portal-search.client");
const file_logger_service_1 = require("../../shared/logging/file-logger.service");
class GetCpfsByNameCliRunner {
    constructor(searchClient = new puppeteer_portal_search_client_1.PuppeteerPortalSearchClient(), resultsWriter = new json_portal_results_writer_1.JsonPortalResultsWriter(), logger = new file_logger_service_1.FileLogger('get-cpfs-by-name')) {
        this.searchClient = searchClient;
        this.resultsWriter = resultsWriter;
        this.logger = logger;
    }
    async run() {
        const searchName = process.argv.slice(constants_1.CLI_FIRST_USER_ARG_INDEX).join(' ').trim();
        if (!searchName) {
            this.logger.error(constants_1.CLI_USAGE_MESSAGE);
            process.exit(1);
        }
        this.logger.info(constants_1.SEARCH_START_MESSAGE);
        try {
            const service = new collect_portal_data_service_1.CollectPortalDataService(this.searchClient, this.resultsWriter, undefined, this.logger);
            const records = await service.collect(searchName);
            this.logger.info(`${constants_1.SEARCH_SUCCESS_PREFIX} ${records.length}`);
            this.logger.info(`${constants_1.FILE_SAVED_PREFIX} ${this.resultsWriter.save(records)}`);
        }
        catch (error) {
            const message = error instanceof Error ? error.message : constants_1.UNKNOWN_ERROR_MESSAGE;
            this.logger.error(`${constants_1.SEARCH_ERROR_PREFIX} ${message}`);
            process.exit(1);
        }
    }
}
exports.GetCpfsByNameCliRunner = GetCpfsByNameCliRunner;
async function runFromCli() {
    await new GetCpfsByNameCliRunner().run();
}
