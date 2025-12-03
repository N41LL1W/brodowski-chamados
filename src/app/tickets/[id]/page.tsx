import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

interface Props { params: { id: string } | Promise<{ id: string }> }

export default async function TicketDetailPage(props: Props) {
  const { id } = (await props.params) as { id: string };
  const ticketId = Number(id);
  if (Number.isNaN(ticketId)) return notFound();

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return notFound();

  const t = { ...ticket, createdAt: ticket.createdAt.toISOString() };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-6">
      <div className="shadow-lg rounded-xl p-8 border">
        <h1 className="text-3xl font-bold mb-6 ">{t.title}</h1>

        <div className="space-y-3">
          <p><span className="font-semibold">Descrição:</span> {t.description}</p>
          <p><span className="font-semibold">Solicitante:</span> {t.requester}</p>
          <p><span className="font-semibold">Status:</span> {t.status}</p>
          <p><span className="font-semibold">Prioridade:</span> {t.priority}</p>
          <p>
            <span className="font-semibold">Criado em:</span>{" "}
            {new Date(t.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Link
            href={`/tickets/${ticket.id}/edit`}
            className="px-4 py-2 rounded-lg hover: transition"
          >
            Editar
          </Link>

          <Link
            href="/tickets"
            className="px-4 py-2 rounded-lg hover: transition"
          >
            Voltar
          </Link>
        </div>
      </div>
    </div>
  );
}
