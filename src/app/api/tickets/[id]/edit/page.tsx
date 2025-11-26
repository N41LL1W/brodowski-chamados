import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditTicketPage({ params }: any) {
  const { id } = await params;
  const ticketId = Number(id);

  if (isNaN(ticketId)) return notFound();

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) return notFound();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Editar Ticket</h1>

      <form
        action={`/api/tickets/${ticket.id}`}
        method="POST"
        className="space-y-4"
      >
        <input type="hidden" name="_method" value="PUT" />

        <input
          name="title"
          defaultValue={ticket.title}
          className="border p-2 w-full"
        />

        <textarea
          name="description"
          defaultValue={ticket.description}
          className="border p-2 w-full h-32"
        />

        <input
          name="requester"
          defaultValue={ticket.requester}
          className="border p-2 w-full"
        />

        <select
          name="status"
          defaultValue={ticket.status}
          className="border p-2 w-full"
        >
          <option value="open">Aberto</option>
          <option value="in_progress">Em andamento</option>
          <option value="closed">Fechado</option>
        </select>

        <select
          name="priority"
          defaultValue={ticket.priority}
          className="border p-2 w-full"
        >
          <option value="low">Baixa</option>
          <option value="normal">Normal</option>
          <option value="high">Alta</option>
        </select>

        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Salvar
        </button>
      </form>
    </div>
  );
}
