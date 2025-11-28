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
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-neutral-900 shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-100">
        Chamado #{ticket.id}
      </h1>

      <p className="mb-2">
        <strong>Título:</strong> {ticket.title}
      </p>

      <p className="mb-2">
        <strong>Descrição:</strong> {ticket.description}
      </p>

      <p className="mb-2">
        <strong>Solicitante:</strong> {ticket.requester}
      </p>

      <p className="mb-2">
        <strong>Status:</strong> {ticket.status}
      </p>

      <p className="mb-2">
        <strong>Prioridade:</strong> {ticket.priority}
      </p>

      <p className="mb-2">
        <strong>Criado em:</strong>{" "}
        {ticket.createdAt.toLocaleDateString()}
      </p>

      <div className="mt-6 flex gap-4">
        {/* Botão Editar */}
        <Link
          href={`/tickets/${ticket.id}/edit`}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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
  );
}
