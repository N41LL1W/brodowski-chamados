// src/app/api/tickets/[id]/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  const ticket = await prisma.ticket.findUnique({ where: { id }});
  if (!ticket) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(ticket);
}

// Use POST to update (form friendly)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 });

  // support JSON or form-data
  const contentType = req.headers.get("content-type") || "";
  let data: any = {};
  if (contentType.includes("application/json")) {
    data = await req.json();
  } else {
    const form = await req.formData();
    data = Object.fromEntries(form.entries());
  }

  try {
    const updated = await prisma.ticket.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        requester: data.requester,
        status: data.status,
        priority: data.priority,
      },
    });
    return NextResponse.json(updated);
  } catch (err) {
    console.error("API POST /api/tickets/[id] error:", err);
    return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
  }
}
