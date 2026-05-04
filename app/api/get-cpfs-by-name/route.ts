import { PortalRecordMapper } from '@/getCpfsByName/application/portal-record-mapper';
import {
    DEFAULT_RESULTS_FILE_NAME,
    FIRST_PAGE_NUMBER,
    PAGE_THROTTLE_DELAY_MS,
    TOTAL_PAGES,
} from '@/getCpfsByName/domain/constants';
import { InvalidSearchNameError } from '@/getCpfsByName/domain/errors';
import { validateSearchName } from '@/getCpfsByName/domain/search-name.utils';
import { PortalRecord } from '@/getCpfsByName/domain/types';
import { JsonPortalResultsWriter } from '@/getCpfsByName/infrastructure/json-portal-results.writer';
import { PuppeteerPortalSearchClient } from '@/getCpfsByName/infrastructure/puppeteer-portal-search.client';
import { DEFAULT_APP_SETTINGS, createAppSettingsService } from '@/appSettings';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sseEvent(data: object): Uint8Array {
    return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const searchName = String(searchParams.get('searchName') ?? '').trim();

    let settings = DEFAULT_APP_SETTINGS;

    try {
        settings = await createAppSettingsService().getSettings();
    } catch {
        settings = {
            ...DEFAULT_APP_SETTINGS,
            totalPages: TOTAL_PAGES,
            pageThrottleDelayMs: PAGE_THROTTLE_DELAY_MS,
            firstPageNumber: FIRST_PAGE_NUMBER,
        };
    }

    const stream = new ReadableStream({
        async start(controller) {
            try {
                validateSearchName(searchName);
            } catch (error) {
                const message = error instanceof InvalidSearchNameError ? error.message : 'Invalid search name.';
                controller.enqueue(sseEvent({ type: 'error', message }));
                controller.close();
                return;
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
            const resultsWriter = new JsonPortalResultsWriter(
                DEFAULT_RESULTS_FILE_NAME,
                settings.jsonOutputIndentSpaces,
                settings.fileEncodingUtf8 as BufferEncoding,
            );
            const mapper = new PortalRecordMapper(settings.detailsPageUrl);
            const allRecords: PortalRecord[] = [];

            try {
                await searchClient.openSearch(searchName);

                for (let pageNumber = settings.firstPageNumber; pageNumber <= settings.totalPages; pageNumber += 1) {
                    controller.enqueue(sseEvent({ type: 'progress', currentPage: pageNumber, totalPages: settings.totalPages }));

                    try {
                        const pageResponse = await searchClient.collectPage(pageNumber);
                        const records = mapper.mapRecords(pageResponse.registros, pageNumber);
                        allRecords.push(...records);
                        controller.enqueue(sseEvent({ type: 'page', currentPage: pageNumber, totalPages: settings.totalPages, records }));
                    } catch (error) {
                        const message = error instanceof Error ? error.message : 'Unknown error.';
                        controller.enqueue(sseEvent({ type: 'page_error', currentPage: pageNumber, totalPages: settings.totalPages, message }));
                    }

                    if (pageNumber < settings.totalPages) {
                        await new Promise((resolve) => setTimeout(resolve, settings.pageThrottleDelayMs));
                    }
                }

                resultsWriter.save(allRecords);
                controller.enqueue(sseEvent({ type: 'done', totalRecords: allRecords.length }));
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Unknown error.';
                controller.enqueue(sseEvent({ type: 'error', message }));
            } finally {
                await searchClient.close();
                controller.close();
            }
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
