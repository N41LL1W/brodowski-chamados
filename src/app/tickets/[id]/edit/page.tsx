import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

interface EditTicketProps {
  params: Promise<{ id: string }>;
}

export default async function EditTicket({ params }: EditTicketProps) {
  const { id } = await params;
  const ticketId = parseInt(id);

  if (isNaN(ticketId)) return notFound();

  // Buscar ticket atual
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) return notFound();

  // --- RENDERIZA ---
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Editar Chamado</h1>

      <form
        action={`/api/tickets/${ticketId}`}
        method="POST"
        className="space-y-4 bg-white p-6 border rounded"
      >
        <label className="block">
          <span className="text-sm font-semibold">Título</span>
          <input
            name="title"
            defaultValue={ticket.title}
            className="w-full border p-2 rounded"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Descrição</span>
          <textarea
            name="description"
            defaultValue={ticket.description}
            className="w-full border p-2 rounded"
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Solicitante</span>
          <input
            name="requester"
            defaultValue={ticket.requester}
            className="w-full border p-2 rounded"
            required
          />
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Status</span>
          <select
            name="status"
            defaultValue={ticket.status}
            className="w-full border p-2 rounded"
          >
            <option value="open">Aberto</option>
            <option value="in_progress">Em Andamento</option>
            <option value="closed">Fechado</option>
          </select>
        </label>

        <label className="block">
          <span className="text-sm font-semibold">Prioridade</span>
          <select
            name="priority"
            defaultValue={ticket.priority}
            className="w-full border p-2 rounded"
          >
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
        </label>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
