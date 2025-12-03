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

  // serializar createdAt
  const t = { ...ticket, createdAt: ticket.createdAt.toISOString() };

  return (
    <div className="container mt-8">
      <div className="card">
        <h1 className="text-2xl font-bold mb-4">{t.title}</h1>
        <p className="mb-2"><strong>Descrição:</strong> {t.description}</p>
        <p className="mb-2"><strong>Solicitante:</strong> {t.requester}</p>
        <p className="mb-2"><strong>Status:</strong> {t.status}</p>
        <p className="mb-2"><strong>Prioridade:</strong> {t.priority}</p>
        <p className="mb-3"><strong>Criado:</strong> {new Date(t.createdAt).toLocaleString()}</p>

        <div className="flex gap-2 justify-end">
          <Link href={`/tickets/${t.id}/edit`} className="btn">Editar</Link>
          <Link href="/tickets" className="btn btn-secondary">Voltar</Link>
        </div>
      </div>
    </div>
  );
}
