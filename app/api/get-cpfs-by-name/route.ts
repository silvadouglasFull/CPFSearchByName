import { PortalRecordMapper } from '@/getCpfsByName/application/portal-record-mapper';
import {
    FIRST_PAGE_NUMBER,
    PAGE_THROTTLE_DELAY_MS,
    TOTAL_PAGES,
} from '@/getCpfsByName/domain/constants';
import { InvalidSearchNameError } from '@/getCpfsByName/domain/errors';
import { validateSearchName } from '@/getCpfsByName/domain/search-name.utils';
import { PortalRecord } from '@/getCpfsByName/domain/types';
import { JsonPortalResultsWriter } from '@/getCpfsByName/infrastructure/json-portal-results.writer';
import { PuppeteerPortalSearchClient } from '@/getCpfsByName/infrastructure/puppeteer-portal-search.client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function sseEvent(data: object): Uint8Array {
    return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: Request): Promise<Response> {
    const { searchParams } = new URL(request.url);
    const searchName = String(searchParams.get('searchName') ?? '').trim();

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

            const searchClient = new PuppeteerPortalSearchClient();
            const resultsWriter = new JsonPortalResultsWriter();
            const mapper = new PortalRecordMapper();
            const allRecords: PortalRecord[] = [];

            try {
                await searchClient.openSearch(searchName);

                for (let pageNumber = FIRST_PAGE_NUMBER; pageNumber <= TOTAL_PAGES; pageNumber += 1) {
                    controller.enqueue(sseEvent({ type: 'progress', currentPage: pageNumber, totalPages: TOTAL_PAGES }));

                    try {
                        const pageResponse = await searchClient.collectPage(pageNumber);
                        const records = mapper.mapRecords(pageResponse.registros, pageNumber);
                        allRecords.push(...records);
                        controller.enqueue(sseEvent({ type: 'page', currentPage: pageNumber, totalPages: TOTAL_PAGES, records }));
                    } catch (error) {
                        const message = error instanceof Error ? error.message : 'Unknown error.';
                        controller.enqueue(sseEvent({ type: 'page_error', currentPage: pageNumber, totalPages: TOTAL_PAGES, message }));
                    }

                    if (pageNumber < TOTAL_PAGES) {
                        await new Promise((resolve) => setTimeout(resolve, PAGE_THROTTLE_DELAY_MS));
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
