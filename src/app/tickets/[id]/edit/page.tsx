import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTicket({ params }: Props) {
  // Next 16: params é Promise → precisa resolver
  const resolved = await params;

  const rawId = Array.isArray(resolved.id) ? resolved.id[0] : resolved.id;

  const id = Number(rawId);
  if (isNaN(id)) return notFound();

  const ticket = await prisma.ticket.findUnique({
    where: { id },
  });

  if (!ticket) return notFound();

  return (
    <div className="container mx-auto p-6 max-w-xl">
      <h1 className="text-2xl font-bold mb-6">Editar Chamado</h1>

      <form
        action={`/api/tickets/${id}/edit`}
        method="POST"
        className="space-y-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md"
      >
        <div>
          <label className="block font-semibold mb-1">Título</label>
          <input
            name="title"
            defaultValue={ticket.title}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Descrição</label>
          <textarea
            name="description"
            defaultValue={ticket.description}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Solicitante</label>
          <input
            name="requester"
            defaultValue={ticket.requester}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700"
          />
        </div>

        <div>
          <label className="block font-semibold mb-1">Prioridade</label>
          <select
            name="priority"
            defaultValue={ticket.priority}
            className="w-full px-3 py-2 border rounded dark:bg-gray-700"
          >
            <option value="normal">Normal</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}
