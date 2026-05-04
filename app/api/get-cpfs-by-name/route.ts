import { CollectPortalDataService } from '@/getCpfsByName/application/collect-portal-data.service';
import { InvalidSearchNameError } from '@/getCpfsByName/domain/errors';
import { JsonPortalResultsWriter } from '@/getCpfsByName/infrastructure/json-portal-results.writer';
import { PuppeteerPortalSearchClient } from '@/getCpfsByName/infrastructure/puppeteer-portal-search.client';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
    const { searchParams } = new URL(request.url);
    const searchName = String(searchParams.get('searchName') ?? '').trim();

    try {
        const searchClient = new PuppeteerPortalSearchClient();
        const resultsWriter = new JsonPortalResultsWriter();
        const service = new CollectPortalDataService(searchClient, resultsWriter);
        const records = await service.collect(searchName);
        return NextResponse.json({ records }, { status: 200 });
    } catch (error) {
        if (error instanceof InvalidSearchNameError) {
            return NextResponse.json({ error: error.message }, { status: 400 });
        }

        const message = error instanceof Error ? error.message : 'Unknown error.';
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
