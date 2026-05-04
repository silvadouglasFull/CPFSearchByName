/**
 * API Route: GET /api/hubdo-cpf-lookup
 * Performs HubDo CPF lookup for official Receita Federal validation
 */

import { createHubdoCpfLookupService } from '@/hubdoCpf';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const { searchParams } = new URL(request.url);
        const cpf = (searchParams.get('cpf') || '').trim();
        const birthDate = (searchParams.get('birthDate') || '').trim();
        const mode = (searchParams.get('mode') || 'normal').trim();

        // Validate CPF parameter
        if (!cpf) {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'MISSING_CPF',
                    message: 'CPF parameter is required',
                    creditosConsumidos: 0,
                },
                { status: 400 },
            );
        }

        // Validate mode parameter
        if (mode !== 'normal' && mode !== 'turbo') {
            return NextResponse.json(
                {
                    status: 'error',
                    errorCode: 'INVALID_MODE',
                    message: 'Mode must be "normal" or "turbo"',
                    creditosConsumidos: 0,
                },
                { status: 400 },
            );
        }

        // Create service and perform lookup
        const service = createHubdoCpfLookupService();
        const response = await service.lookup({
            cpf,
            birthDate: birthDate || undefined,
            mode: mode as 'normal' | 'turbo',
        });

        // Return response with appropriate status code
        const statusCode = response.status === 'success' ? 200 : 400;
        return NextResponse.json(response, { status: statusCode });
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return NextResponse.json(
            {
                status: 'error',
                errorCode: 'SERVER_ERROR',
                message: `HubDo lookup failed: ${message}`,
                creditosConsumidos: 0,
            },
            { status: 500 },
        );
    }
}
