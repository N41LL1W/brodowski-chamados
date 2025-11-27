// src/app/api/tickets/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const tickets = await prisma.ticket.findMany({ orderBy: { createdAt: "desc" }});
  return NextResponse.json(tickets);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.title || !body.description || !body.requester) {
      return NextResponse.json({ error: "Campos obrigatórios" }, { status: 400 });
    }
    const created = await prisma.ticket.create({
      data: {
        title: body.title,
        description: body.description,
        requester: body.requester,
        status: body.status ?? "open",
        priority: body.priority ?? "normal",
      },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("API POST /api/tickets error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
