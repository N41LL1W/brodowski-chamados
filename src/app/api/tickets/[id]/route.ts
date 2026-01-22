import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

// GET: Busca detalhes de um chamado específico
export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = params.id;
        
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse('Não autorizado', { status: 401 });
        
        const user = session.user as any;

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

        // SEGURANÇA: Se for funcionário comum, só vê se for o dono do chamado
        if ((user.role === 'USER' || user.role === 'FUNCIONARIO') && ticket.requesterId !== user.id) {
            return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
        }

        return NextResponse.json(ticket);
    } catch (err) {
        console.error("Erro ao buscar ticket:", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

// PUT: Atualiza status ou técnico do chamado
export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = params.id;
        const data = await req.json();
        
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
        console.error("Erro ao atualizar ticket:", err);
        return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
    }
}

// DELETE: Remove o chamado
export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
    try {
        const params = await props.params;
        const id = params.id;
        await (prisma as any).ticket.delete({ where: { id } });
        return NextResponse.json({ message: "Removido" });
    } catch (err) {
        return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
    }
}