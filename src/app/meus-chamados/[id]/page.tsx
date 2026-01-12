import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props { params: { id: string } | Promise<{ id: string }> }

export default async function TicketDetailPage(props: Props) {
  const { id } = (await props.params) as { id: string };
  const ticketId = Number(id);
  if (Number.isNaN(ticketId)) return notFound();

  // MUDANÇA: Incluindo a relação 'user' para pegar o nome do solicitante
  const ticket = await prisma.ticket.findUnique({ 
    where: { id: ticketId },
    include: { user: true } 
  });
  
  if (!ticket) return notFound();

  return (
    <div className="max-w-3xl mx-auto mt-10 px-6">
      <div className="shadow-lg rounded-xl p-8 border">
        <h1 className="text-3xl font-bold mb-6 ">{ticket.title}</h1>

        <div className="space-y-3">
          <p><span className="font-semibold">Descrição:</span> {ticket.description}</p>
          
          {/* MUDANÇA: Exibindo o nome do usuário da relação */}
          <p>
            <span className="font-semibold">Solicitante:</span> {ticket.user?.name || "Não informado"}
          </p>
          
          <p><span className="font-semibold">Status:</span> {ticket.status}</p>
          <p><span className="font-semibold">Prioridade:</span> {ticket.priority}</p>
          <p>
            <span className="font-semibold">Criado em:</span>{" "}
            {new Date(ticket.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Link
            href={`/meus-chamados/${ticket.id}/edit`}
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Editar
          </Link>

          <Link
            href="/meus-chamados"
            className="px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}