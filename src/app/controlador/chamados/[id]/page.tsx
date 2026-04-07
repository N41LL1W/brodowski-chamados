export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, Calendar, MapPin, User, Tag, ShieldCheck, Clock
} from "lucide-react";
import Card from "@/components/ui/Card";
import EvidenceGallery from "@/components/controlador/EvidenceGallery";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalheChamadoControlador({ params }: PageProps) {
  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      requester: true,
      assignedTo: true,
      department: true,
      category: true,
    }
  });

  if (!ticket) notFound();

  const statusStyles = {
    ABERTO: 'bg-amber-100 text-amber-600',
    CONCLUIDO: 'bg-emerald-100 text-emerald-600',
    EM_ATENDIMENTO: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 min-h-screen">
      <nav className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Link 
          href="/controlador/chamados" 
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-all"
        >
          <ArrowLeft size={16} /> Voltar ao Painel
        </Link>
        <div className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-5 py-2.5 rounded-full border border-slate-200 dark:border-slate-700">
          PROTOCOLO: {ticket.protocol}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <header className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border border-current/10 ${statusStyles[ticket.status as keyof typeof statusStyles] || 'bg-slate-100'}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-slate-800 text-white shadow-lg">
                Prioridade {ticket.priority}
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.9]">
              {ticket.subject}
            </h1>
          </header>

          <Card className="p-10 border-none bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 rounded-[3rem]">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 mb-6">Descrição Técnica</h3>
            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed font-medium">
              {ticket.description}
            </p>
          </Card>

          <EvidenceGallery proofImage={ticket.proofImage} protocol={ticket.protocol} />
        </div>

        <aside className="space-y-6">
          <Card className="p-8 border-none bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] space-y-8 border border-white dark:border-slate-800 shadow-inner">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Metadados do Chamado</h3>
            
            <div className="space-y-5">
              <DetailItem icon={<User size={18}/>} label="Solicitante" value={ticket.requester.name || "N/A"} />
              <DetailItem icon={<MapPin size={18}/>} label="Localização" value={ticket.location || "Não informada"} />
              <DetailItem icon={<Tag size={18}/>} label="Categoria" value={ticket.category.name} />
              <DetailItem icon={<Calendar size={18}/>} label="Data de Abertura" value={new Date(ticket.createdAt).toLocaleString('pt-BR')} />
            </div>
            
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
              <p className="text-[9px] font-black text-slate-400 uppercase mb-4 tracking-widest">Responsável Técnico</p>
              <div className="flex items-center gap-4 bg-white dark:bg-slate-800 p-4 rounded-4xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="h-10 w-10 bg-linear-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center text-white font-black shadow-inner">
                  {ticket.assignedTo?.name?.charAt(0) || <ShieldCheck size={18} />}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-slate-800 dark:text-slate-100 truncate">
                    {ticket.assignedTo?.name || "Pendente"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Status: Designado</span>
                </div>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="flex items-start gap-4 group">
      <div className="text-blue-600 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}