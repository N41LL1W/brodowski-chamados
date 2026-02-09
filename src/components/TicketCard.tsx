"use client";

import Link from "next/link";
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Clock, User, MessageCircle, CheckCheck, MapPin, Wrench } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function TicketCard({ ticket, onAction, actionLabel, isMine, isDisabled }: any) {
    const pathname = usePathname();
    const isTecnicoPath = pathname?.includes('/tecnico');
    const detailHref = isTecnicoPath 
        ? `/tecnico/chamado/${ticket.id}` 
        : `/meus-chamados/${ticket.id}`;

    return (
        <Card className={`group p-6 transition-all hover:scale-[1.01] border-l-[6px] ${isMine ? 'border-l-blue-600 bg-blue-50/30 dark:bg-blue-900/10' : (isDisabled ? 'border-l-slate-300 grayscale opacity-80' : 'border-l-amber-500 bg-white dark:bg-slate-900')}`}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black px-2 py-1 bg-slate-900 text-white rounded">{ticket.protocol}</span>
                        <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                        {isDisabled && (
                            <span className="text-[10px] font-black text-emerald-600 uppercase flex items-center gap-1">
                                <CheckCheck size={14}/> Finalizado
                            </span>
                        )}
                    </div>
                    
                    <h3 className="font-black text-slate-800 dark:text-white text-xl tracking-tighter group-hover:text-blue-600 transition-colors">
                        {ticket.subject}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px]">
                        <span className="flex items-center gap-1.5 font-bold text-slate-600 dark:text-slate-400">
                            <User size={14}/> {ticket.requester?.name}
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                            <MapPin size={14}/> {ticket.location || "Sem local"}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Link 
                        href={detailHref} 
                        className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-[10px] uppercase transition-all border-2 ${isMine ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-600'}`}
                    >
                        {isMine ? <Wrench size={16}/> : <MessageCircle size={16}/>}
                        {isMine ? "Trabalhar" : "Detalhes"}
                    </Link>

                    {!isDisabled && !isMine && onAction && (
                        <button 
                            onClick={() => onAction(ticket.id)} 
                            className="flex-1 md:flex-none px-6 py-3 rounded-2xl font-black text-[10px] uppercase text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 dark:shadow-none"
                        >
                            {actionLabel}
                        </button>
                    )}
                </div>
            </div>
        </Card>
    );
}