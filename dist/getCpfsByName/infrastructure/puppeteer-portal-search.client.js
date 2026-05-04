"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PuppeteerPortalSearchClient = void 0;
const constants_1 = require("../../getCpfsByName/domain/constants");
const puppeteer_1 = __importDefault(require("puppeteer"));
class PuppeteerPortalSearchClient {
    constructor() {
        this.browser = null;
        this.page = null;
        this.pendingResponses = new Map();
    }
    async openSearch(searchName) {
        this.browser = await puppeteer_1.default.launch(constants_1.PUPPETEER_LAUNCH_OPTIONS);
        this.page = await this.browser.newPage();
        await this.page.setUserAgent(constants_1.USER_AGENT);
        this.pendingResponses.set(constants_1.FIRST_PAGE_NUMBER, this.waitForPageResponse(constants_1.FIRST_PAGE_NUMBER));
        await this.page.goto(this.buildSearchUrl(searchName), {
            waitUntil: 'domcontentloaded',
            timeout: constants_1.PAGE_NAVIGATION_TIMEOUT_MS,
        });
        await this.page.waitForSelector(constants_1.DEFAULT_PAGE_SELECTOR, { timeout: constants_1.PAGE_SELECTOR_TIMEOUT_MS });
    }
    async collectPage(pageNumber) {
        this.ensurePage();
        if (pageNumber > constants_1.FIRST_PAGE_NUMBER) {
            this.pendingResponses.set(pageNumber, this.waitForPageResponse(pageNumber));
            await this.page.evaluate((currentPageNumber) => {
                const link = document.querySelector(`#paginacao li[data-lp="${currentPageNumber}"] a`);
                if (!link) {
                    throw new Error(`Page link ${currentPageNumber} was not found.`);
                }
                link.click();
            }, pageNumber);
        }
        const responsePromise = this.pendingResponses.get(pageNumber);
        if (!responsePromise) {
            throw new Error(`No response promise found for page ${pageNumber}.`);
        }
        const pageResponse = await responsePromise;
        this.pendingResponses.delete(pageNumber);
        return pageResponse;
    }
    async close() {
        this.pendingResponses.clear();
        if (this.browser) {
            await this.browser.close();
        }
        this.page = null;
        this.browser = null;
    }
    buildSearchUrl(searchName) {
        const encodedSearchName = encodeURIComponent(searchName);
        return `${constants_1.SEARCH_PAGE_URL}?termo=${encodedSearchName}&tamanhoPagina=${constants_1.RESULTS_PER_PAGE}`;
    }
    waitForPageResponse(pageNumber) {
        this.ensurePage();
        return this.page
            .waitForResponse((response) => this.matchesPageResponse(response, pageNumber), {
            timeout: constants_1.PAGE_RESPONSE_TIMEOUT_MS,
        })
            .then((response) => response.json());
    }
    matchesPageResponse(response, pageNumber) {
        try {
            const url = new URL(response.url());
            return url.hostname === constants_1.SEARCH_API_HOSTNAME
                && url.pathname === constants_1.SEARCH_API_PATHNAME
                && url.searchParams.get('pagina') === String(pageNumber)
                && response.status() === 200;
        }
        catch {
            return false;
        }
    }
    ensurePage() {
        if (!this.page) {
            throw new Error('Browser page has not been initialized.');
        }
    }
}
exports.PuppeteerPortalSearchClient = PuppeteerPortalSearchClient;
