"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UNKNOWN_ERROR_MESSAGE = exports.PAGE_ERROR_PREFIX = exports.SEARCH_ERROR_PREFIX = exports.FILE_SAVED_PREFIX = exports.SEARCH_SUCCESS_PREFIX = exports.SEARCH_START_MESSAGE = exports.CLI_USAGE_MESSAGE = exports.PUPPETEER_LAUNCH_OPTIONS = exports.USER_AGENT = exports.DEFAULT_PAGE_SELECTOR = exports.SEARCH_API_PATHNAME = exports.SEARCH_API_HOSTNAME = exports.DETAILS_PAGE_URL = exports.SEARCH_PAGE_URL = exports.FIRST_PAGE_NUMBER = exports.CLI_FIRST_USER_ARG_INDEX = exports.FILE_ENCODING_UTF8 = exports.JSON_OUTPUT_INDENT_SPACES = exports.PAGE_THROTTLE_DELAY_MS = exports.PAGE_SELECTOR_TIMEOUT_MS = exports.PAGE_NAVIGATION_TIMEOUT_MS = exports.PAGE_RESPONSE_TIMEOUT_MS = exports.TOTAL_PAGES = exports.RESULTS_PER_PAGE = exports.DEFAULT_RESULTS_FILE_NAME = void 0;
exports.DEFAULT_RESULTS_FILE_NAME = 'resultados_portal.json';
exports.RESULTS_PER_PAGE = 10;
exports.TOTAL_PAGES = 6;
exports.PAGE_RESPONSE_TIMEOUT_MS = 30000;
exports.PAGE_NAVIGATION_TIMEOUT_MS = 60000;
exports.PAGE_SELECTOR_TIMEOUT_MS = 15000;
exports.PAGE_THROTTLE_DELAY_MS = 1000;
exports.JSON_OUTPUT_INDENT_SPACES = 2;
exports.FILE_ENCODING_UTF8 = 'utf-8';
exports.CLI_FIRST_USER_ARG_INDEX = 2;
exports.FIRST_PAGE_NUMBER = 1;
exports.SEARCH_PAGE_URL = 'https://portaldatransparencia.gov.br/pessoa-fisica/busca/lista';
exports.DETAILS_PAGE_URL = 'https://portaldatransparencia.gov.br/busca/pessoa-fisica';
exports.SEARCH_API_HOSTNAME = 'busca.portaldatransparencia.gov.br';
exports.SEARCH_API_PATHNAME = '/busca/pessoa-fisica';
exports.DEFAULT_PAGE_SELECTOR = '#paginacao li[data-lp="1"] a';
exports.USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
exports.PUPPETEER_LAUNCH_OPTIONS = {
    headless: false,
    args: ['--no-sandbox'],
};
exports.CLI_USAGE_MESSAGE = 'Usage: node getCpfsByName.js "Person Name"';
exports.SEARCH_START_MESSAGE = 'Starting extraction with Puppeteer...';
exports.SEARCH_SUCCESS_PREFIX = 'Success! Total collected records:';
exports.FILE_SAVED_PREFIX = 'Results file saved at:';
exports.SEARCH_ERROR_PREFIX = 'Portal collection failed:';
exports.PAGE_ERROR_PREFIX = 'Page collection failed:';
exports.UNKNOWN_ERROR_MESSAGE = 'Unknown error.';
