import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

interface RouteContext {
    params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;

        // Usamos (prisma as any) para garantir que ele aceite o assignedTo
        const ticket = await (prisma as any).ticket.findUnique({
            where: { id: id },
            include: {
                requester: { select: { name: true, email: true } },
                category: true,
                department: true,
                assignedTo: { select: { name: true } }, // Traz o nome do técnico
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: "Chamado não encontrado" }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (err: any) {
        console.error("Erro ao buscar ticket:", err);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

export async function PUT(req: Request, context: RouteContext) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return new NextResponse('Não autorizado', { status: 401 });

        const { id } = await context.params;
        const data = await req.json();

        const updated = await (prisma as any).ticket.update({
            where: { id: id },
            data: {
                subject: data.subject,
                description: data.description,
                status: data.status,
                priority: data.priority,
                location: data.location,
                assignedToId: data.assignedToId, // Permite atribuir técnico
            },
        });

        return NextResponse.json(updated);
    } catch (err: any) {
        return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
    }
}

export async function DELETE(req: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        await prisma.ticket.delete({ where: { id } });
        return NextResponse.json({ message: "Deletado" });
    } catch (err) {
        return NextResponse.json({ error: "Erro" }, { status: 500 });
    }
}