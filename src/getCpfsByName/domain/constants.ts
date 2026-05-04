export const DEFAULT_RESULTS_FILE_NAME = 'resultados_portal.json';
export const RESULTS_PER_PAGE = 10;
export const TOTAL_PAGES = 6;
export const PAGE_RESPONSE_TIMEOUT_MS = 30000;
export const PAGE_NAVIGATION_TIMEOUT_MS = 60000;
export const PAGE_SELECTOR_TIMEOUT_MS = 15000;
export const PAGE_THROTTLE_DELAY_MS = 1000;
export const JSON_OUTPUT_INDENT_SPACES = 2;
export const FILE_ENCODING_UTF8: BufferEncoding = 'utf-8';
export const CLI_FIRST_USER_ARG_INDEX = 2;
export const FIRST_PAGE_NUMBER = 1;
export const SEARCH_PAGE_URL = 'https://portaldatransparencia.gov.br/pessoa-fisica/busca/lista';
export const DETAILS_PAGE_URL = 'https://portaldatransparencia.gov.br/busca/pessoa-fisica';
export const SEARCH_API_HOSTNAME = 'busca.portaldatransparencia.gov.br';
export const SEARCH_API_PATHNAME = '/busca/pessoa-fisica';
export const DEFAULT_PAGE_SELECTOR = '#paginacao li[data-lp="1"] a';
export const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
export const PUPPETEER_LAUNCH_OPTIONS = {
    headless: false,
    args: ['--no-sandbox'],
};
export const CLI_USAGE_MESSAGE = 'Usage: node getCpfsByName.js "Person Name"';
export const SEARCH_START_MESSAGE = 'Starting extraction with Puppeteer...';
export const SEARCH_SUCCESS_PREFIX = 'Success! Total collected records:';
export const FILE_SAVED_PREFIX = 'Results file saved at:';
export const SEARCH_ERROR_PREFIX = 'Portal collection failed:';
export const PAGE_ERROR_PREFIX = 'Page collection failed:';
export const UNKNOWN_ERROR_MESSAGE = 'Unknown error.';
