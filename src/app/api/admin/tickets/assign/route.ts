import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    const { id } = await params;

    if (!session || !['MASTER', 'CONTROLADOR'].includes(userRole)) {
        return new NextResponse('Não autorizado', { status: 403 });
    }

    try {
        const body = await request.json();
        const { technicianId } = body;

        const updatedTicket = await prisma.ticket.update({
            where: { id: Number(id) }, // Note que no seu schema o ID é Int
            data: {
                assignedToId: technicianId,
                status: technicianId ? "Em Atendimento" : "Aberto"
            }
        });

        return NextResponse.json(updatedTicket);
    } catch (error) {
        console.error(error);
        return new NextResponse('Erro ao atribuir técnico', { status: 500 });
    }
}