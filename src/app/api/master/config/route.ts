import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return null;
    if ((session.user as any).role !== 'MASTER') return null;
    return session.user;
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse('Não autorizado', { status: 401 });

    const [slaConfigs, systemConfigs] = await Promise.all([
        prisma.sLAConfig.findMany({ orderBy: { id: 'asc' } }),
        prisma.systemConfig.findMany(),
    ]);

    const system: Record<string, string> = {};
    systemConfigs.forEach(c => { system[c.key] = c.value; });

    return NextResponse.json({ sla: slaConfigs, system });
}

export async function POST(req: Request) {
    const user = await checkMaster();
    if (!user) return new NextResponse('Apenas Master', { status: 403 });

    const { type, data } = await req.json();

    if (type === 'sla') {
        const { priority, maxHours, label, color } = data;
        const result = await prisma.sLAConfig.upsert({
            where: { priority },
            update: { maxHours: Number(maxHours), label, color },
            create: { priority, maxHours: Number(maxHours), label, color }
        });
        return NextResponse.json(result);
    }

    if (type === 'system') {
        const { key, value } = data;
        const result = await prisma.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
}