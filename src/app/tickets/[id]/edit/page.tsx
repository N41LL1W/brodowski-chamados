import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface Props {
  params: { id: string };
}

async function updateTicket(formData: FormData) {
  "use server";

  const id = Number(formData.get("id"));

  await prisma.ticket.update({
    where: { id },
    data: {
      title: String(formData.get("title")),
      description: String(formData.get("description")),
      requester: String(formData.get("requester")),
      status: String(formData.get("status")),
      priority: String(formData.get("priority")),
    },
  });

  redirect(`/tickets/${id}`);
}

export default async function EditTicket({ params }: Props) {
  const id = Number(params.id);
  if (isNaN(id)) return notFound();

  const ticket = await prisma.ticket.findUnique({ where: { id } });
  if (!ticket) return notFound();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Editar Chamado</h1>

      <form action={updateTicket} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={id} />

        <label className="block">
          <span className="font-semibold text-sm">Título</span>
          <input
            className="input"
            name="title"
            defaultValue={ticket.title}
            required
          />
        </label>

        <label className="block">
          <span className="font-semibold text-sm">Descrição</span>
          <textarea
            className="input min-h-[120px]"
            name="description"
            defaultValue={ticket.description}
            required
          ></textarea>
        </label>

        <label className="block">
          <span className="font-semibold text-sm">Solicitante</span>
          <input
            className="input"
            name="requester"
            defaultValue={ticket.requester}
            required
          />
        </label>

        <label className="block">
          <span className="font-semibold text-sm">Status</span>
          <select className="input" name="status" defaultValue={ticket.status}>
            <option value="open">Aberto</option>
            <option value="in_progress">Em Andamento</option>
            <option value="closed">Fechado</option>
          </select>
        </label>

        <label className="block">
          <span className="font-semibold text-sm">Prioridade</span>
          <select className="input" name="priority" defaultValue={ticket.priority}>
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
        </label>

        <button className="btn-primary">Salvar Alterações</button>
      </form>
    </div>
  );
}
