"use client";

import Link from "next/link";
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, User, MessageCircle, CheckCheck, MapPin, Wrench } from 'lucide-react';
import { usePathname } from 'next/navigation';

function getRelativeTime(date: string) {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 60000);
    if (diff < 1) return "Agora";
    if (diff < 60) return `Há ${diff}m`;
    if (diff < 1440) return `Há ${Math.floor(diff/60)}h`;
    return new Date(date).toLocaleDateString();
}

export default function TicketCard({ ticket, onAction, actionLabel, isMine, isDisabled }: any) {
    const pathname = usePathname();
    const isTecnicoPath = pathname?.includes('/tecnico');
    const detailHref = isTecnicoPath 
        ? `/tecnico/chamado/${ticket.id}` 
        : `/meus-chamados/${ticket.id}`;

    const isLate = !isDisabled && !isMine && (new Date().getTime() - new Date(ticket.createdAt).getTime() > 120 * 60000);

    return (
        <Card className={`p-5 transition-all hover:shadow-xl border-l-[6px] ${isMine ? 'border-l-blue-500 bg-blue-50/20' : (isDisabled ? 'border-l-slate-300 grayscale-[0.4]' : 'border-l-amber-500')}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-1 bg-slate-900 text-white rounded shadow-sm">{ticket.protocol}</span>
                        <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                        
                        {!isDisabled && (
                            <span className={`text-[10px] font-black px-2 py-1 rounded uppercase flex items-center gap-1 border ${isLate ? 'bg-red-50 text-red-600 border-red-100 animate-pulse' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                                <Clock size={12}/> {getRelativeTime(ticket.createdAt)}
                            </span>
                        )}

                        {isDisabled && (
                            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded uppercase flex items-center gap-1 border border-emerald-100">
                                <CheckCheck size={14}/> Finalizado
                            </span>
                        )}
                    </div>
                    
                    <h3 className="font-extrabold text-slate-800 text-xl tracking-tight">
                        {ticket.subject || ticket.title}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-slate-500">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                            <User size={16} className="text-slate-400"/> {ticket.requester?.name || "Usuário"}
                        </span>
                        {ticket.location && (
                            <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full font-black text-[10px] uppercase border border-blue-100">
                                <MapPin size={12}/> {ticket.location}
                            </span>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    {/* Botão de Detalhes (Sempre visível ou transformado em botão de trabalho) */}
                    <Link 
                        href={detailHref} 
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-black text-xs uppercase transition-all border-2 ${isMine ? 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700 shadow-lg' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-800'}`}
                    >
                        {isMine ? <Wrench size={18}/> : <MessageCircle size={18}/>}
                        {isMine ? "Trabalhar no Chamado" : "Ver Detalhes"}
                    </Link>

                    {/* Botão de Ação (Apenas para chamados NÃO assumidos) */}
                    {!isDisabled && !isMine && (
                        <button 
                            onClick={() => onAction(ticket.id)} 
                            className="flex-1 md:flex-none px-8 py-3 rounded-2xl font-black text-xs uppercase text-white transition-all shadow-lg active:scale-95 bg-blue-600 hover:bg-blue-700"
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
}