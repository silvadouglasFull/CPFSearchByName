import { getToken } from 'next-auth/jwt';
import { NextResponse, type NextRequest } from 'next/server';

const PUBLIC_ROUTES = new Set(['/', '/privacy-policy', '/terms-of-use', '/contact']);

function isNextStaticPath(pathname: string): boolean {
    return pathname.startsWith('/_next') || pathname === '/favicon.ico' || /\.[a-zA-Z0-9]+$/.test(pathname);
}

function isPublicRoute(pathname: string): boolean {
    if (PUBLIC_ROUTES.has(pathname)) {
        return true;
    }

    return pathname.startsWith('/api/auth');
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (isNextStaticPath(pathname) || isPublicRoute(pathname)) {
        return NextResponse.next();
    }

    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (token) {
        return NextResponse.next();
    }

    if (pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const signInUrl = new URL('/api/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.nextUrl.href);
    return NextResponse.redirect(signInUrl);
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|.*\\..*).*)'],
};
