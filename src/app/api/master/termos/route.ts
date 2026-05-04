import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

export async function GET() {
    const terms = await (prisma as any).termsOfUse.findFirst({
        orderBy: { updatedAt: 'desc' }
    });
    return NextResponse.json(terms || { content: '', version: '1.0' });
}

export async function POST(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { content, version } = await req.json();

    // Sempre cria nova versão
    const result = await (prisma as any).termsOfUse.create({
        data: { content, version }
    });
    return NextResponse.json(result);
}