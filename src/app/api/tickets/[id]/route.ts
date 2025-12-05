import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { type NextRequest } from "next/server"; // Importe NextRequest

// Defina a interface MÍNIMA para o objeto context que o Next.js injeta
interface RouteContext {
    params: {
        id: string; 
    }
}

// Para a função PUT (e todas as Route Handlers), use a tipagem mais precisa.
// NOTA: Em muitos casos, o Next.js permite que você omita a tipagem complexa do contexto 
// se usar apenas o `Request` ou `NextRequest` e confiar na inferência.
export async function PUT(
  req: Request, 
  context: any // Ignora a tipagem complexa do Next.js
) {
  try {
  const id = Number(context.params.id);
  if (isNaN(id)) {
  return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const data = await req.json();

  const updated = await prisma.ticket.update({
  where: { id },
  data,
  });

  return NextResponse.json(updated);
  } catch (err) {
   console.error(err);
   return NextResponse.json({ error: "Erro ao atualizar" }, { status: 500 });
 }
}
