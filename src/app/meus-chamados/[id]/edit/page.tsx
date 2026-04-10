//src\app\meus-chamados\[id]\edit\page.tsx

import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Save, X } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditTicketPage({ params }: Props) {
  const { id } = await params;
  const ticket = await prisma.ticket.findUnique({ where: { id } });

  if (!ticket) return notFound();

  async function updateTicket(formData: FormData) {
    "use server";
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const priority = formData.get("priority") as string;

    await prisma.ticket.update({
      where: { id },
      data: { subject, description, status, priority },
    });

    redirect(`/meus-chamados/${id}`);
  }

  return (
    <div className="max-w-4xl mx-auto py-16 px-6">
      <div className="bg-card dark:bg-slate-900 shadow-2xl rounded-[3rem] border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="bg-slate-900 dark:bg-slate-950 p-10 text-white">
          <h1 className="text-3xl font-black tracking-tighter uppercase">Editar Chamado</h1>
          <p className="text-blue-400 font-mono text-sm mt-2">{ticket.protocol}</p>
        </div>

        <form action={updateTicket} className="p-10 space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-muted tracking-[0.2em] ml-2">Título do Problema</label>
            <input
              name="subject"
              defaultValue={ticket.subject}
              className="w-full p-5 bg-background dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl focus:border-blue-500 focus:bg-card dark:focus:bg-slate-950 outline-none transition-all font-bold text-slate-700 dark:text-slate-200"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-400 dark:text-muted tracking-[0.2em] ml-2">Descrição Completa</label>
            <textarea
              name="description"
              defaultValue={ticket.description}
              className="w-full p-6 bg-background dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-4xl h-48 resize-none focus:border-blue-500 focus:bg-card dark:focus:bg-slate-950 outline-none transition-all font-medium text-slate-600 dark:text-slate-300"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-muted tracking-[0.2em] ml-2">Status Atual</label>
              <select
                name="status"
                defaultValue={ticket.status}
                className="w-full p-5 bg-background dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none transition-all font-black text-slate-700 dark:text-slate-200"
              >
                <option value="ABERTO">🟢 ABERTO</option>
                <option value="EM_ANDAMENTO">🟡 EM ANDAMENTO</option>
                <option value="CONCLUIDO">🔵 CONCLUÍDO</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 dark:text-muted tracking-[0.2em] ml-2">Prioridade</label>
              <select
                name="priority"
                defaultValue={ticket.priority}
                className="w-full p-5 bg-background dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl focus:border-blue-500 outline-none transition-all font-black text-slate-700 dark:text-slate-200"
              >
                <option value="BAIXA">BAIXA</option>
                <option value="NORMAL">NORMAL</option>
                <option value="ALTA">ALTA</option>
                <option value="URGENTE">URGENTE</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-end gap-4 pt-10 border-t border-slate-100 dark:border-slate-800">
            <Link href={`/meus-chamados/${ticket.id}`} className="flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-bold text-muted dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <X size={20} /> Cancelar
            </Link>
            <button type="submit" className="flex items-center justify-center gap-2 px-10 py-5 bg-slate-900 dark:bg-blue-600 text-white rounded-3xl font-black hover:bg-blue-600 dark:hover:bg-blue-700 transition-all shadow-xl active:scale-95">
              <Save size={20} /> Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}