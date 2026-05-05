import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

export async function GET() {
    const configs = await prisma.systemConfig.findMany({
        where: { key: { startsWith: 'local_' } }
    });
    const locais = configs.map(c => c.value).filter(Boolean);
    return NextResponse.json(locais);
}

export async function POST(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const { locais } = await req.json();

    // Remove locais antigos
    await prisma.systemConfig.deleteMany({
        where: { key: { startsWith: 'local_' } }
    });

    // Salva novos
    if (locais.length > 0) {
        await prisma.systemConfig.createMany({
            data: locais.map((l: string, i: number) => ({
                key: `local_${i}`,
                value: l
            }))
        });
    }

    return NextResponse.json({ success: true });
}