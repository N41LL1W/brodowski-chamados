import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

async function getUser() {
    const session = await getServerSession(authOptions);
    return session?.user as any;
}

export async function GET() {
    const user = await getUser();
    if (!user) return new NextResponse('Não autorizado', { status: 401 });

    const items = await (prisma as any).agendaItem.findMany({
        where: { userId: user.id },
        orderBy: { date: 'asc' }
    });
    return NextResponse.json(items);
}

export async function POST(req: Request) {
    const user = await getUser();
    if (!user) return new NextResponse('Não autorizado', { status: 401 });

    const { title, description, date, time, type } = await req.json();
    if (!title || !date || !time) {
        return NextResponse.json({ message: 'Dados incompletos.' }, { status: 400 });
    }

    const item = await (prisma as any).agendaItem.create({
        data: { userId: user.id, title, description, date: new Date(date), time, type: type || 'pessoal' }
    });
    return NextResponse.json(item, { status: 201 });
}

export async function PATCH(req: Request) {
    const user = await getUser();
    if (!user) return new NextResponse('Não autorizado', { status: 401 });

    const { id, done, title, description, date, time } = await req.json();
    const item = await (prisma as any).agendaItem.update({
        where: { id },
        data: { done, title, description, date: date ? new Date(date) : undefined, time }
    });
    return NextResponse.json(item);
}

export async function DELETE(req: Request) {
    const user = await getUser();
    if (!user) return new NextResponse('Não autorizado', { status: 401 });

    const { id } = await req.json();
    await (prisma as any).agendaItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
}