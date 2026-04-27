import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function getMaster() {
    const session = await getServerSession(authOptions);
    if ((session?.user as any)?.role !== 'MASTER') return null;
    return session!.user;
}

async function audit(userId: string, userName: string, action: string, details: string) {
    await prisma.auditLog.create({ data: { userId, userName, action, details } });
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
    const master = await getMaster();
    if (!master) return new NextResponse('Apenas Master', { status: 403 });

    const { type, data } = await req.json();
    const user = master as any;

    if (type === 'sla') {
        const { priority, maxHours, label, color } = data;
        const result = await prisma.sLAConfig.upsert({
            where: { priority },
            update: { maxHours: Number(maxHours), label, color },
            create: { priority, maxHours: Number(maxHours), label, color }
        });
        await audit(user.id, user.name || 'Master', 'SLA_UPDATE', `SLA ${priority} → ${maxHours}h`);
        return NextResponse.json(result);
    }

    if (type === 'sla_delete') {
        const { priority } = data;
        await prisma.sLAConfig.delete({ where: { priority } });
        await audit(user.id, user.name || 'Master', 'SLA_DELETE', `SLA ${priority} removido`);
        return NextResponse.json({ success: true });
    }

    if (type === 'system') {
        const { key, value } = data;
        const result = await prisma.systemConfig.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        await audit(user.id, user.name || 'Master', 'SYSTEM_CONFIG', `${key} → ${value}`);
        return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 });
}