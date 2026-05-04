import {
    DEFAULT_PAGE_SELECTOR,
    FIRST_PAGE_NUMBER,
    PAGE_NAVIGATION_TIMEOUT_MS,
    PAGE_RESPONSE_TIMEOUT_MS,
    PAGE_SELECTOR_TIMEOUT_MS,
    PUPPETEER_LAUNCH_OPTIONS,
    RESULTS_PER_PAGE,
    SEARCH_API_HOSTNAME,
    SEARCH_API_PATHNAME,
    SEARCH_PAGE_URL,
    USER_AGENT,
} from '@/getCpfsByName/domain/constants';
import { PortalSearchClient, RawPortalPageResponse } from '@/getCpfsByName/domain/types';
import puppeteer, { Browser, HTTPResponse, Page } from 'puppeteer';

interface PuppeteerPortalSearchSettings {
    defaultPageSelector: string;
    firstPageNumber: number;
    pageNavigationTimeoutMs: number;
    pageResponseTimeoutMs: number;
    pageSelectorTimeoutMs: number;
    resultsPerPage: number;
    searchApiHostname: string;
    searchApiPathname: string;
    searchPageUrl: string;
}

const DEFAULT_SETTINGS: PuppeteerPortalSearchSettings = {
    defaultPageSelector: DEFAULT_PAGE_SELECTOR,
    firstPageNumber: FIRST_PAGE_NUMBER,
    pageNavigationTimeoutMs: PAGE_NAVIGATION_TIMEOUT_MS,
    pageResponseTimeoutMs: PAGE_RESPONSE_TIMEOUT_MS,
    pageSelectorTimeoutMs: PAGE_SELECTOR_TIMEOUT_MS,
    resultsPerPage: RESULTS_PER_PAGE,
    searchApiHostname: SEARCH_API_HOSTNAME,
    searchApiPathname: SEARCH_API_PATHNAME,
    searchPageUrl: SEARCH_PAGE_URL,
};

export class PuppeteerPortalSearchClient implements PortalSearchClient {
    private browser: Browser | null = null;
    private page: Page | null = null;
    private readonly pendingResponses = new Map<number, Promise<RawPortalPageResponse>>();

    constructor(private readonly settings: PuppeteerPortalSearchSettings = DEFAULT_SETTINGS) { }

    async openSearch(searchName: string): Promise<void> {
        this.browser = await puppeteer.launch(PUPPETEER_LAUNCH_OPTIONS);
        this.page = await this.browser.newPage();
        await this.page.setUserAgent(USER_AGENT);

        this.pendingResponses.set(this.settings.firstPageNumber, this.waitForPageResponse(this.settings.firstPageNumber));

        await this.page.goto(this.buildSearchUrl(searchName), {
            waitUntil: 'domcontentloaded',
            timeout: this.settings.pageNavigationTimeoutMs,
        });

        await this.page.waitForSelector(this.settings.defaultPageSelector, { timeout: this.settings.pageSelectorTimeoutMs });
    }

    async collectPage(pageNumber: number): Promise<RawPortalPageResponse> {
        this.ensurePage();

        if (pageNumber > this.settings.firstPageNumber) {
            this.pendingResponses.set(pageNumber, this.waitForPageResponse(pageNumber));
            await this.page!.evaluate((currentPageNumber) => {
                const link = document.querySelector(`#paginacao li[data-lp="${currentPageNumber}"] a`) as HTMLAnchorElement | null;

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

    async close(): Promise<void> {
        this.pendingResponses.clear();

        if (this.browser) {
            await this.browser.close();
        }

        this.page = null;
        this.browser = null;
    }

    private buildSearchUrl(searchName: string): string {
        const encodedSearchName = encodeURIComponent(searchName);
        return `${this.settings.searchPageUrl}?termo=${encodedSearchName}&tamanhoPagina=${this.settings.resultsPerPage}`;
    }

    private waitForPageResponse(pageNumber: number): Promise<RawPortalPageResponse> {
        this.ensurePage();

        return this.page!
            .waitForResponse((response) => this.matchesPageResponse(response, pageNumber), {
                timeout: this.settings.pageResponseTimeoutMs,
            })
            .then((response) => response.json() as Promise<RawPortalPageResponse>);
    }

    private matchesPageResponse(response: HTTPResponse, pageNumber: number): boolean {
        try {
            const url = new URL(response.url());
            return url.hostname === this.settings.searchApiHostname
                && url.pathname === this.settings.searchApiPathname
                && url.searchParams.get('pagina') === String(pageNumber)
                && response.status() === 200;
        } catch {
            return false;
        }
    }

    private ensurePage(): void {
        if (!this.page) {
            throw new Error('Browser page has not been initialized.');
        }
    }
}
