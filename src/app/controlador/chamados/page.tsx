export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Card from "@/components/ui/Card";
import { 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Calendar, 
  ChevronRight,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

export default async function ListaChamadosControlador() {
  // Busca todos os chamados com os relacionamentos corretos do seu Schema
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      requester: true,   // Nome correto no seu schema
      assignedTo: true,  // Técnico
      department: true,  // Secretaria/Departamento
      category: true     // Tipo de problema
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      {/* Cabeçalho de Navegação */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">
            Repositório de <span className="text-blue-600">Tickets</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm">Visualização completa da base de dados de TI.</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Buscar protocolo..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-900 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
          </div>
          <button className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl hover:bg-slate-200 transition-colors">
            <Filter size={20} className="text-slate-600" />
          </button>
        </div>
      </header>

      {/* Tabela/Lista de Chamados */}
      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Link key={ticket.id} href={`/controlador/chamados/${ticket.id}`}>
            <Card className="p-0 overflow-hidden border-none bg-white dark:bg-slate-900 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-4xl group">
              <div className="flex flex-col md:flex-row items-center p-6 gap-6">
                
                {/* Status & Protocolo */}
                <div className="flex md:flex-col items-center md:items-start gap-2 min-w-[140px]">
                  <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                    ticket.status === 'ABERTO' ? 'bg-amber-100 text-amber-600' :
                    ticket.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-blue-100 text-blue-600'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    {ticket.protocol}
                  </span>
                </div>

                {/* Conteúdo Principal */}
                <div className="flex-1 space-y-1 text-center md:text-left">
                  <h3 className="text-lg font-black text-slate-800 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1 uppercase tracking-tight">
                    {ticket.subject}
                  </h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    <span className="flex items-center gap-1"><MapPin size={12} className="text-blue-500"/> {ticket.department.name}</span>
                    <span className="flex items-center gap-1"><User size={12} className="text-blue-500"/> {ticket.requester.name}</span>
                    <span className="flex items-center gap-1"><Calendar size={12} className="text-blue-500"/> {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Técnico Atribuído */}
                <div className="hidden lg:block min-w-[200px]">
                  <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Responsável</p>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600">
                      {ticket.assignedTo?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {ticket.assignedTo?.name || "Aguardando..."}
                    </span>
                  </div>
                </div>

                <div className="text-slate-300 group-hover:text-blue-600 transition-colors">
                  <ChevronRight size={24} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {tickets.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="inline-block p-6 bg-slate-100 dark:bg-slate-900 rounded-full text-slate-300">
            <Search size={48} />
          </div>
          <p className="text-slate-500 font-black uppercase tracking-widest text-sm">Nenhum registro encontrado</p>
        </div>
      )}
    </div>
  );
}