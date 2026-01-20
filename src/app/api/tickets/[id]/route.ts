import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Definindo a interface correta para o Next.js 15+
interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function PUT(req: Request, context: RouteContext) {
    try {
        // No Next.js 15, o params é uma Promise
        const { id } = await context.params;

        // REMOVIDO: Number(id) e isNaN(id)
        // Como o ID agora é um CUID (string), não precisamos converter para número
        if (!id) {
            return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
        }

        const data = await req.json();

        const updated = await prisma.ticket.update({
            where: { id: id }, // Agora passa a string direta
            data: {
                subject: data.subject,
                description: data.description,
                status: data.status,
                priority: data.priority,
                // Adicione outros campos que deseja permitir a edição aqui
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

// Aproveite e já deixe o DELETE pronto se tiver um
export async function DELETE(req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        await prisma.ticket.delete({ where: { id } });
        return NextResponse.json({ message: "Deletado com sucesso" });
    } catch (err) {
        return NextResponse.json({ error: "Erro ao deletar" }, { status: 500 });
    }
}