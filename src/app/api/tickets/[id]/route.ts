import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        const user = session?.user as any;

        const ticket = await (prisma as any).ticket.findUnique({
            where: { id },
            include: {
                requester: { select: { name: true, email: true } },
                category: true,
                department: true,
                assignedTo: { select: { name: true } },
            }
        });

        if (!ticket) return NextResponse.json({ error: "Não encontrado" }, { status: 404 });

        // SEGURANÇA: Se não for técnico/admin e tentar ver chamado de outro, bloqueia
        if ((user.role === 'USER' || user.role === 'FUNCIONARIO') && ticket.requesterId !== user.id) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        return NextResponse.json(ticket);
    } catch (err) {
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const data = await req.json();
        
        // Atualiza status e técnico (assignedToId)
        const updated = await (prisma as any).ticket.update({
            where: { id },
            data: {
                status: data.status,
                assignedToId: data.assignedToId,
                priority: data.priority,
            },
        });

        return NextResponse.json(updated);
    } catch (err) {
        return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    await (prisma as any).ticket.delete({ where: { id } });
    return NextResponse.json({ message: "Removido" });
}