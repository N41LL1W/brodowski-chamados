import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function checkMaster() {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.role === 'MASTER' ? session!.user : null;
}

const DAYS = [
    { day: 0, label: 'Domingo',        open: false, startTime: '08:00', endTime: '17:00' },
    { day: 1, label: 'Segunda-feira',  open: true,  startTime: '08:00', endTime: '17:00' },
    { day: 2, label: 'Terça-feira',    open: true,  startTime: '08:00', endTime: '17:00' },
    { day: 3, label: 'Quarta-feira',   open: true,  startTime: '08:00', endTime: '17:00' },
    { day: 4, label: 'Quinta-feira',   open: true,  startTime: '08:00', endTime: '17:00' },
    { day: 5, label: 'Sexta-feira',    open: true,  startTime: '08:00', endTime: '17:00' },
    { day: 6, label: 'Sábado',         open: false, startTime: '08:00', endTime: '12:00' },
];

export async function GET() {
    const saved = await (prisma as any).businessHours.findMany();
    const savedMap: Record<number, any> = {};
    saved.forEach((s: any) => { savedMap[s.dayOfWeek] = s; });

    const result = DAYS.map(d => ({
        ...d,
        open: savedMap[d.day]?.open ?? d.open,
        startTime: savedMap[d.day]?.startTime ?? d.startTime,
        endTime: savedMap[d.day]?.endTime ?? d.endTime,
    }));

    return NextResponse.json(result);
}

export async function POST(req: Request) {
    if (!await checkMaster()) return new NextResponse('Não autorizado', { status: 403 });
    const days = await req.json();
    await Promise.all(
        days.map((d: any) =>
            (prisma as any).businessHours.upsert({
                where: { dayOfWeek: d.day },
                update: { open: d.open, startTime: d.startTime, endTime: d.endTime },
                create: { dayOfWeek: d.day, open: d.open, startTime: d.startTime, endTime: d.endTime }
            })
        )
    );
    return NextResponse.json({ success: true });
}