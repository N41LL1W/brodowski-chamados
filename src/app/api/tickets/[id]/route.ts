import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteContext {
    params: Promise<{ id: string }>;
}

// 🟢 GET: Busca os detalhes de um chamado específico (ESSENCIAL PARA A PÁGINA DE DETALHES)
export async function GET(req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;

        const ticket = await prisma.ticket.findUnique({
            where: { id: id },
            include: {
                requester: { select: { name: true, email: true } },
                category: true,
                department: true,
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (err: any) {
        console.error("Erro ao buscar ticket:", err);
        return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
    }
}

// 🟡 PUT: Atualiza os dados do chamado
export async function PUT(req: Request, context: RouteContext) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse('Não autorizado', { status: 401 });

        const { id } = await context.params;
        const data = await req.json();

        // Usamos (prisma as any) para o TS ignorar que não conhece a coluna 'location'
        const updated = await (prisma as any).ticket.update({
            where: { id: id },
            data: {
                subject: data.subject,
                description: data.description,
                status: data.status,
                priority: data.priority,
                location: data.location, // Agora o erro sumirá aqui
            },
        });

        return NextResponse.json(updated);
    } catch (err: any) {
        console.error("Erro ao atualizar ticket:", err);
        return NextResponse.json(
            { error: "Erro ao atualizar", details: err.message }, 
            { status: 500 }
        );
    }
}

// 🔴 DELETE: Remove o chamado
export async function DELETE(req: Request, context: RouteContext) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse('Não autorizado', { status: 401 });

        const { id } = await context.params;
        await prisma.ticket.delete({ where: { id } });
        
        return NextResponse.json({ message: "Deletado com sucesso" });
    } catch (err) {
        return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
    }
}