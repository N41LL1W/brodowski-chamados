import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: { id: string } | Promise<{ id: string }>;
}

export default async function EditTicketPage(props: Props) {
  const { id } = (await props.params) as { id: string };
  const ticketId = Number(id);

  if (Number.isNaN(ticketId)) return notFound();

  const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!ticket) return notFound();

  async function updateTicket(formData: FormData) {
    "use server";

    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        requester: formData.get("requester") as string,
        status: formData.get("status") as string,
        priority: formData.get("priority") as string,
      },
    });

    redirect(`/meus-chamados/${ticketId}`);
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-6">
      <div className="shadow-lg rounded-xl p-8 border">
        <h1 className="text-3xl font-bold mb-6">Editar Ticket</h1>

        <form action={updateTicket} className="space-y-6">
          <div>
            <label className="font-semibold block mb-1">Título</label>
            <input
              name="title"
              defaultValue={ticket.title}
              className="w-full p-3 border rounded-lg focus:ring-2 focus: outline-none"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Descrição</label>
            <textarea
              name="description"
              defaultValue={ticket.description}
              className="w-full p-3 border rounded-lg h-32 resize-none focus:ring-2 focus: outline-none"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Solicitante</label>
            <input
              name="requester"
              defaultValue={ticket.requester}
              className="w-full p-3 border rounded-lg focus:ring-2 focus: outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="font-semibold block mb-1">Status</label>
              <select
                name="status"
                defaultValue={ticket.status}
                className="w-full p-3 border rounded-lg focus:ring-2 focus: outline-none"
              >
                <option value="Aberto">Aberto</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluído">Concluído</option>
              </select>
            </div>

            <div>
              <label className="font-semibold block mb-1">Prioridade</label>
              <select
                name="priority"
                defaultValue={ticket.priority}
                className="w-full p-3 border rounded-lg  focus:ring-2 focus: outline-none"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button
              type="submit"
              className="px-5 py-2 rounded-lg hover: transition"
            >
              Salvar
            </button>

            <a
              href={`/meus-chamados/${ticket.id}`}
              className="px-5 py-2 rounded-lg hover: transition"
            >
              Cancelar
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
