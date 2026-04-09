//src\app\controlador\chamados\page.tsx

export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Card from "@/components/ui/Card";
import { 
  Search, 
  Filter, 
  MapPin, 
  User, 
  Calendar, 
  ChevronRight
} from "lucide-react";
import Link from "next/link";

export default async function ListaChamadosControlador() {
  const tickets = await prisma.ticket.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      requester: true,
      assignedTo: true,
      department: true,
      category: true 
    }
  });

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">
            Repositório de <span className="text-primary italic">Tickets</span>
          </h1>
          <p className="text-muted font-bold text-sm uppercase tracking-widest">Base de dados unificada de TI</p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por protocolo..." 
              className="w-full pl-12 pr-4 py-4 bg-card border-2 border-border rounded-2xl text-xs font-black outline-none focus:border-primary transition-all text-foreground"
            />
          </div>
          <button className="p-4 bg-card border-2 border-border rounded-2xl hover:border-primary transition-colors text-muted">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="grid gap-4">
        {tickets.map((ticket) => (
          <Link key={ticket.id} href={`/controlador/chamados/${ticket.id}`}>
            <Card className="p-0 overflow-hidden border-none bg-card hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 rounded-[2.5rem] group border border-border/50">
              <div className="flex flex-col md:flex-row items-center p-6 gap-8">
                
                {/* Status & Protocolo */}
                <div className="flex md:flex-col items-center md:items-start gap-2 min-w-[150px]">
                  <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest ${
                    ticket.status === 'ABERTO' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' :
                    ticket.status === 'CONCLUIDO' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' :
                    'bg-primary/10 text-primary'
                  }`}>
                    {ticket.status.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-muted tracking-widest uppercase">
                    #{ticket.protocol}
                  </span>
                </div>

                {/* Conteúdo Principal */}
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">
                    {ticket.subject}
                  </h3>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-[10px] font-black text-muted uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><MapPin size={12} className="text-primary"/> {ticket.department.name}</span>
                    <span className="flex items-center gap-1.5"><User size={12} className="text-primary"/> {ticket.requester.name}</span>
                    <span className="flex items-center gap-1.5"><Calendar size={12} className="text-primary"/> {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                {/* Técnico Atribuído */}
                <div className="hidden lg:block min-w-[200px] border-l border-border pl-8">
                  <p className="text-[9px] font-black text-muted uppercase mb-2 tracking-widest">Responsável</p>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-black text-primary border border-primary/20 uppercase">
                      {ticket.assignedTo?.name?.charAt(0) || '?'}
                    </div>
                    <span className="text-xs font-black text-foreground uppercase">
                      {ticket.assignedTo?.name || "Aguardando..."}
                    </span>
                  </div>
                </div>

                <div className="text-muted group-hover:text-primary transition-colors pr-2">
                  <ChevronRight size={28} />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {tickets.length === 0 && (
        <div className="py-24 text-center space-y-6">
          <div className="inline-block p-10 bg-card rounded-full text-muted border-2 border-dashed border-border">
            <Search size={64} />
          </div>
          <p className="text-muted font-black uppercase tracking-[0.3em] text-sm italic">Nenhum registro na base de dados</p>
        </div>
      )}
    </div>
  );
}