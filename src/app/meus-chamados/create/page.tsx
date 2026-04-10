//src\app\meus-chamados\create\page.tsx

import TicketForm from "@/components/TicketForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CreateTicketPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-foreground dark:text-white tracking-tighter uppercase">
            Novo Chamado
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Preencha os detalhes para abrir uma solicitação.
          </p>
        </div>
        <Link 
          href="/meus-chamados" 
          className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
        >
          <ArrowLeft size={24} />
        </Link>
      </div>

      <div className="bg-card dark:bg-slate-900 rounded-[2.5rem] shadow-2xl shadow-slate-200/60 dark:shadow-none border border-slate-100 dark:border-slate-800 p-2">
        <TicketForm />
      </div>
    </div>
  );
}