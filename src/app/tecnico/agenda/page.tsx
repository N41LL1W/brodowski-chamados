"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarClock, MapPin, User, ChevronRight, Calendar, Clock } from 'lucide-react';

export default function AgendaPage() {
    const [visitas, setVisitas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/tecnico/agenda')
            .then(r => r.json())
            .then(setVisitas)
            .finally(() => setLoading(false));
    }, []);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const proximas = visitas.filter(v => new Date(v.visitDate) >= hoje);
    const passadas = visitas.filter(v => new Date(v.visitDate) < hoje);

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto p-6 md:p-10 space-y-10">
            <header>
                <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">
                    Minha <span className="text-primary italic">Agenda</span>
                </h1>
                <p className="text-muted text-sm font-medium mt-1">Visitas agendadas nos chamados</p>
            </header>

            <VisitaSection title="Próximas visitas" visitas={proximas} empty="Nenhuma visita agendada." />
            <VisitaSection title="Visitas realizadas" visitas={passadas} empty="Nenhuma visita anterior." muted />
        </div>
    );
}

function VisitaSection({ title, visitas, empty, muted }: any) {
    return (
        <section className="space-y-4">
            <h2 className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${muted ? 'text-muted' : 'text-primary'}`}>
                <CalendarClock size={14} /> {title}
            </h2>

            {visitas.length === 0 ? (
                <div className="py-10 text-center border-2 border-dashed border-border rounded-3xl">
                    <p className="text-muted text-xs font-bold uppercase tracking-widest">{empty}</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {visitas.map((v: any) => {
                        const data = new Date(v.visitDate);
                        return (
                            <Link href={`/tecnico/chamado/${v.id}`} key={v.id}>
                                <div className={`p-6 rounded-3xl border transition-all hover:shadow-lg flex items-center gap-6 group ${muted ? 'bg-card/50 border-border opacity-70' : 'bg-card border-border hover:border-blue-200'}`}>
                                    
                                    {/* Data */}
                                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center border border-blue-100 dark:border-blue-900/30">
                                        <span className="text-[10px] font-black text-blue-600 uppercase">
                                            {data.toLocaleString('pt-BR', { month: 'short' })}
                                        </span>
                                        <span className="text-2xl font-black text-blue-700 dark:text-blue-400 leading-none">
                                            {data.getDate()}
                                        </span>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <h3 className="font-black text-foreground uppercase text-sm truncate group-hover:text-blue-600 transition-colors">
                                            {v.subject}
                                        </h3>
                                        <div className="flex flex-wrap gap-3 text-[10px] font-bold text-muted uppercase">
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} />
                                                {data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <User size={10} />
                                                {v.requester?.name}
                                            </span>
                                            {v.location && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={10} />
                                                    {v.location}
                                                </span>
                                            )}
                                        </div>
                                        {v.visitNote && (
                                            <p className="text-[11px] text-muted italic truncate">{v.visitNote}</p>
                                        )}
                                    </div>

                                    <ChevronRight size={18} className="text-muted group-hover:text-blue-600 transition-colors shrink-0" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </section>
    );
}