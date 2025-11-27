// src/app/api/tickets/route.ts

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// --- LISTAR TODOS ---
export async function GET() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { id: "desc" }
  });

  return NextResponse.json(tickets);
}

// --- CRIAR NOVO CHAMADO ---
export async function POST(req: Request) {
  const formData = await req.formData();

  const title = String(formData.get("title") || "");
  const description = String(formData.get("description") || "");
  const requester = String(formData.get("requester") || "");
  const status = String(formData.get("status") || "open");
  const priority = String(formData.get("priority") || "normal");

  const created = await prisma.ticket.create({
    data: {
      title,
      description,
      requester,
      status,
      priority
    }
  });

  return NextResponse.json(created);
}
