//src\app\meus-chamados\page.tsx

"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Tag, MapPin, Plus, ChevronRight, Search } from 'lucide-react';

interface Ticket {
  id: string;
  protocol: string;
  subject: string;
  status: string;
  createdAt: string;
  category: { name: string };
  department: { name: string };
}

export default function MeusChamadosPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/tickets')
      .then(res => res.json())
      .then(data => setTickets(Array.isArray(data) ? data : []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  const getStatusColor = (status: string) => {
    const s = status?.toUpperCase() || '';
    if (s === 'ABERTO') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    if (s.includes('ATENDIMENTO')) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-slate-50 text-slate-500 border-slate-100';
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[70vh] gap-6">
      <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p className="font-black text-slate-300 uppercase tracking-[0.3em] text-[10px]">Lendo Arquivos...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-12">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">Meus<br/>Chamados</h1>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest pl-1 italic">Rastreamento de Protocolos em tempo real</p>
        </div>
        <Link 
          href="/meus-chamados/create" 
          className="group bg-slate-900 text-white px-10 py-5 rounded-4xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 shadow-2xl active:scale-95 text-[11px]"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform"/> Novo Protocolo
        </Link>
      </header>
      
      {tickets.length === 0 ? (
        <div className="p-24 text-center border-4 border-dashed border-slate-100 rounded-[3rem] space-y-4">
          <Search size={48} className="mx-auto text-slate-100" />
          <p className="font-black uppercase tracking-widest text-slate-300 text-xs italic">Nenhum registro encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {tickets.map((ticket) => (
            <Link href={`/meus-chamados/${ticket.id}`} key={ticket.id}>
              <div className="p-8 bg-white border-2 border-slate-50 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group relative overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.15em] border-2 ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-[9px] font-black px-4 py-1.5 rounded-full bg-slate-900 text-white uppercase tracking-widest shadow-md">
                        # {ticket.protocol}
                      </span>
                    </div>
                    
                    <h3 className="font-black text-2xl text-slate-800 group-hover:text-blue-600 transition-colors leading-tight uppercase tracking-tight">
                      {ticket.subject}
                    </h3>

                    <div className="flex flex-wrap gap-6">
                      <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <Tag size={14} className="text-blue-500" /> {ticket.category?.name}
                      </span>
                      <span className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <MapPin size={14} className="text-blue-500" /> {ticket.department?.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-0 pt-4 md:pt-0 border-slate-50">
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      <Clock size={14} /> {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="hidden md:flex mt-6 h-12 w-12 bg-slate-50 rounded-full items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-2">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}