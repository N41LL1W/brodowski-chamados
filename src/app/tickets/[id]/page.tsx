import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function TicketDetailPage(props: Props) {
  // 🟡 1) Destravar params (obrigatório no Next 16)
  const { id } = await props.params;

  // 🟡 2) Converter id para número
  const ticketId = Number(id);
  if (!ticketId) return notFound();

  // 🟡 3) Buscar ticket SEM updatedAt (não existe no seu schema)
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) return notFound();

  // 🟡 4) Exibir detalhes do ticket
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="p-6 rounded-xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">{ticket.title}</h1>

        <p className="mb-3">
          <strong>Descrição:</strong> {ticket.description}
        </p>

        <p className="mb-3">
          <strong>Solicitante:</strong> {ticket.requester}
        </p>

        <p className="mb-3">
          <strong>Status:</strong> {ticket.status}
        </p>

        <p className="mb-3">
          <strong>Prioridade:</strong> {ticket.priority}
        </p>

        <p className="mb-3">
          <strong>Criado em:</strong>{" "}
          {new Date(ticket.createdAt).toLocaleDateString()}
        </p>

        <div className="mt-6 flex justify-end">
          <Link
            href={`/tickets/${ticket.id}/edit`}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition"
          >
            Editar Chamado
          </Link>

        {/* Voltar */}
        <Link
          href="/tickets"
          className="px-4 py-2 rounded-lg bg-gray-300 dark:bg-neutral-700 dark:text-neutral-200 hover:bg-gray-400"
        >
          Voltar
        </Link>
        </div>
      </div>
    </div>
  );
}
