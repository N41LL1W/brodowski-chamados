import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const tickets = await prisma.ticket.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(tickets);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    const description = data.description ?? data.message ?? "";
    const requester = data.requester ?? "Anonymous";

    const created = await prisma.ticket.create({
      data: {
        title: data.title,
        description,
        requester,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message ?? error) }, { status: 500 });
  }
}
