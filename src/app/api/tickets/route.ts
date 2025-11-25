import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tickets);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    if (!data.title || !data.description || !data.requester) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos" },
        { status: 400 }
      );
    }

    const created = await prisma.ticket.create({
      data: {
        title: data.title,
        description: data.description,
        requester: data.requester,
        status: data.status ?? "open",
        priority: data.priority ?? "normal",
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("POST ERROR:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
