export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  User, 
  Tag, 
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import Card from "@/components/ui/Card";
import EvidenceGallery from "@/components/controlador/EvidenceGallery";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DetalheChamadoControlador({ params }: PageProps) {
  const { id } = await params;

  // Busca o chamado com todos os detalhes
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      requester: true,
      assignedTo: true,
      department: true,
      category: true,
      comments: {
        include: { user: true },
        orderBy: { createdAt: 'asc' }
      }
    }
  });

  if (!ticket) {
    notFound(); // Redireciona para página 404 padrão se o ID não existir
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 min-h-screen">
      {/* Ações Superiores */}
      <nav className="flex items-center justify-between">
        <Link 
          href="/controlador/chamados" 
          className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para o Repositório
        </Link>
        <div className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-full">
          PROTOCOLO: {ticket.protocol}
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Coluna Principal (Esquerda) */}
        <div className="lg:col-span-2 space-y-8">
          <header className="space-y-4">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                ticket.status === 'ABERTO' ? 'bg-amber-100 text-amber-600' :
                ticket.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest bg-slate-100 dark:bg-slate-800 text-slate-500">
                Prioridade {ticket.priority}
              </span>
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-tight">
              {ticket.subject}
            </h1>
          </header>

          <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-xl rounded-[2.5rem]">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4">Descrição do Incidente</h3>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              {ticket.description}
            </p>
          </Card>

          {/* Galeria de Evidências (Se houver foto de conclusão) */}
          <EvidenceGallery proofImage={ticket.proofImage} protocol={ticket.protocol} />
        </div>

        {/* Coluna de Detalhes (Direita) */}
        <div className="space-y-6">
          <Card className="p-8 border-none bg-slate-100 dark:bg-slate-900 rounded-[2.5rem] space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Informações</h3>
            
            <DetailItem icon={<User size={16}/>} label="Solicitante" value={ticket.requester.name || "N/A"} />
            <DetailItem icon={<MapPin size={16}/>} label="Localização" value={ticket.location || "Não informada"} />
            <DetailItem icon={<Tag size={16}/>} label="Categoria" value={ticket.category.name} />
            <DetailItem icon={<Calendar size={16}/>} label="Abertura" value={new Date(ticket.createdAt).toLocaleString('pt-BR')} />
            
            <hr className="border-slate-200 dark:border-slate-800" />
            
            <div>
              <p className="text-[9px] font-black text-slate-400 uppercase mb-2">Técnico Responsável</p>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-2xl">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-xs">
                  {ticket.assignedTo?.name?.charAt(0) || "?"}
                </div>
                <span className="text-sm font-bold truncate">
                  {ticket.assignedTo?.name || "Aguardando..."}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-blue-600 mt-1">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{value}</p>
      </div>
    </div>
  );
}