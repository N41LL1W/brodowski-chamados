import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";

interface EditTicketProps {
  params: Promise<{ id: string }>;
}

// 🔵 Server Action
async function updateTicket(formData: FormData) {
  "use server";

  const id = formData.get("id");
  if (!id) return;

  // Atenção: Aqui você está usando o fetch para a API. 
  // Se quiser otimizar, pode chamar o prisma.ticket.update() diretamente aqui.
  await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets/${id}`, {
    method: "POST",
    body: formData,
  });

  redirect(`/tickets/${id}`);
}

// Classes base para inputs (usando as variáveis do seu globals.css)
const inputBaseClass = "w-full border p-2 rounded bg-[var(--surface)] text-[var(--text)] border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors";
const labelSpanClass = "text-sm font-semibold text-[var(--text)]";


export default async function EditTicket({ params }: EditTicketProps) {
  const { id } = await params;
  const ticketId = parseInt(id);

  if (isNaN(ticketId)) return notFound();

  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });

  if (!ticket) return notFound();

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-var(--text)">Editar Chamado</h1>

      {/* A classe 'card' puxará var(--surface) e as bordas escuras */}
      <form action={updateTicket} className="card p-6 space-y-4">
        <input type="hidden" name="id" value={ticketId} />

        <label className="block">
          <span className={labelSpanClass}>Título</span>
          <input
            name="title"
            defaultValue={ticket.title}
            className={inputBaseClass}
            required
          />
        </label>

        <label className="block">
          <span className={labelSpanClass}>Descrição</span>
          <textarea
            name="description"
            defaultValue={ticket.description}
            className={`${inputBaseClass} min-h-[120px]`}
            required
          ></textarea>
        </label>

        <label className="block">
          <span className={labelSpanClass}>Solicitante</span>
          <input
            name="requester"
            defaultValue={ticket.requester}
            className={inputBaseClass}
            required
          />
        </label>

        <label className="block">
          <span className={labelSpanClass}>Status</span>
          <select
            name="status"
            defaultValue={ticket.status}
            className={inputBaseClass}
          >
            <option value="open">Aberto</option>
            <option value="in_progress">Em Andamento</option>
            <option value="closed">Fechado</option>
          </select>
        </label>

        <label className="block">
          <span className={labelSpanClass}>Prioridade</span>
          <select
            name="priority"
            defaultValue={ticket.priority}
            className={inputBaseClass}
          >
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
        </label>

        <button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-4 py-2 rounded font-bold transition-colors">
          Salvar Alterações
        </button>
      </form>
    </div>
  );
}