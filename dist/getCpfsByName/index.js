"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFromCli = void 0;
exports.collectPortalData = collectPortalData;
exports.mapPortalRecords = mapPortalRecords;
const collect_portal_data_service_1 = require("../getCpfsByName/application/collect-portal-data.service");
const portal_record_mapper_1 = require("../getCpfsByName/application/portal-record-mapper");
const get_cpfs_by_name_cli_1 = require("../getCpfsByName/cli/get-cpfs-by-name.cli");
Object.defineProperty(exports, "runFromCli", { enumerable: true, get: function () { return get_cpfs_by_name_cli_1.runFromCli; } });
const json_portal_results_writer_1 = require("../getCpfsByName/infrastructure/json-portal-results.writer");
const puppeteer_portal_search_client_1 = require("../getCpfsByName/infrastructure/puppeteer-portal-search.client");
async function collectPortalData(searchName) {
    const searchClient = new puppeteer_portal_search_client_1.PuppeteerPortalSearchClient();
    const resultsWriter = new json_portal_results_writer_1.JsonPortalResultsWriter();
    const service = new collect_portal_data_service_1.CollectPortalDataService(searchClient, resultsWriter);
    return service.collect(searchName);
}
function mapPortalRecords(records, sourcePage) {
    return new portal_record_mapper_1.PortalRecordMapper().mapRecords(records, sourcePage);
}
