import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const protocolo = searchParams.get('protocolo');

    if (!protocolo) {
        return NextResponse.json({ message: 'Protocolo obrigatório.' }, { status: 400 });
    }

    const ticket = await prisma.ticket.findUnique({
        where: { protocol: protocolo.toUpperCase() },
        select: {
            id: true,
            protocol: true,
            subject: true,
            status: true,
            priority: true,
            location: true,
            createdAt: true,
            visitDate: true,
            visitNote: true,
            category:   { select: { name: true } },
            department: { select: { name: true } },
            assignedTo: { select: { name: true } },
        }
    });

    if (!ticket) {
        return NextResponse.json({ message: 'Não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(ticket);
}