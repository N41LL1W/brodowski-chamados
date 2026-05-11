import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const token = req.nextUrl.searchParams.get('token');

    if (!token) {
        return NextResponse.redirect(new URL('/login?erro=token_invalido', req.url));
    }

    const verification = await (prisma as any).emailVerification.findUnique({
        where: { token }
    });

    if (!verification) {
        return NextResponse.redirect(new URL('/login?erro=token_invalido', req.url));
    }

    if (new Date() > new Date(verification.expiresAt)) {
        return NextResponse.redirect(new URL('/login?erro=token_expirado', req.url));
    }

    await prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: new Date() }
    });

    await (prisma as any).emailVerification.delete({ where: { token } });

    return NextResponse.redirect(new URL('/login?verificado=1', req.url));
}