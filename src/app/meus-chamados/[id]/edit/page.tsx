import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTicketPage({ params }: Props) {
  // 1. No Next.js 15, aguardamos o params e usamos o id como STRING
  const { id } = await params;

  // 2. Busca o ticket usando o ID (string) e os campos novos
  const ticket = await prisma.ticket.findUnique({ 
    where: { id } 
  });

  if (!ticket) return notFound();

  // 3. Server Action para atualizar os dados
  async function updateTicket(formData: FormData) {
    "use server";

    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const priority = formData.get("priority") as string;

    await prisma.ticket.update({
      where: { id }, // id já é string
      data: {
        subject,
        description,
        status,
        priority,
      },
    });

    // Redireciona de volta para a página de detalhes com a barra de progresso
    redirect(`/meus-chamados/${id}`);
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="bg-white shadow-2xl rounded-3xl p-8 border border-slate-100">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Editar Chamado</h1>
          <p className="text-slate-500 text-sm">Altere as informações do protocolo: <span className="font-mono font-bold text-blue-600">{ticket.protocol}</span></p>
        </div>

        <form action={updateTicket} className="space-y-6">
          {/* Assunto (antigo Title) */}
          <div>
            <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest">Assunto / Título</label>
            <input
              name="subject"
              defaultValue={ticket.subject}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              required
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest">Descrição detalhada</label>
            <textarea
              name="description"
              defaultValue={ticket.description}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-40 resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Status */}
            <div>
              <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest">Status</label>
              <select
                name="status"
                defaultValue={ticket.status}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
              >
                <option value="ABERTO">🟢 Aberto</option>
                <option value="ATENDIMENTO">🟡 Em Atendimento</option>
                <option value="CONCLUIDO">🔵 Concluído</option>
              </select>
            </div>

            {/* Prioridade */}
            <div>
              <label className="text-xs font-black uppercase text-slate-400 mb-2 block tracking-widest">Prioridade</label>
              <select
                name="priority"
                defaultValue={ticket.priority}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all font-bold text-slate-700"
              >
                <option value="BAIXA">Baixa</option>
                <option value="NORMAL">Normal</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-4 pt-8 border-t border-slate-100">
            <Link
              href={`/meus-chamados/${ticket.id}`}
              className="px-8 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-100 transition-all"
            >
              Cancelar
            </Link>

            <button
              type="submit"
              className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black hover:bg-blue-600 transition-all shadow-lg shadow-slate-200"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}