"use client";

import { useEffect, useState } from 'react';
import { Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SLABadgeProps {
    ticketId: string;
    compact?: boolean;
}

export default function SLABadge({ ticketId, compact = false }: SLABadgeProps) {
    const [slaData, setSlaData] = useState<any>(null);

    useEffect(() => {
        fetch('/api/master/sla-status')
            .then(r => r.json())
            .then((data: any[]) => {
                const found = data.find(d => d.id === ticketId);
                if (found) setSlaData(found);
            });
    }, [ticketId]);

    if (!slaData || slaData.slaStatus === 'sem_config') return null;

    const configs = {
        ok:      { icon: <CheckCircle2 size={12}/>, text: 'No prazo',  class: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200' },
        alerta:  { icon: <Clock size={12}/>,        text: 'Atenção',   class: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-200' },
        atrasado:{ icon: <AlertTriangle size={12}/>,text: 'Atrasado',  class: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200' },
    };

    const cfg = configs[slaData.slaStatus as keyof typeof configs];

    if (compact) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase border ${cfg.class}`}>
                {cfg.icon} {cfg.text}
            </span>
        );
    }

    return (
        <div className={`flex items-center gap-3 p-3 rounded-2xl border ${cfg.class}`}>
            {cfg.icon}
            <div>
                <p className="text-[10px] font-black uppercase">{cfg.text}</p>
                <p className="text-[9px] opacity-80">
                    {slaData.horasRestantes >= 0
                        ? `${slaData.horasRestantes}h restantes de ${slaData.maxHours}h`
                        : `${Math.abs(slaData.horasRestantes)}h em atraso`
                    }
                </p>
            </div>
            <div className="ml-auto w-16 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div
                    className="h-full rounded-full transition-all"
                    style={{
                        width: `${slaData.percentual}%`,
                        backgroundColor: slaData.slaStatus === 'atrasado' ? '#ef4444' :
                                         slaData.slaStatus === 'alerta'   ? '#f59e0b' : '#10b981'
                    }}
                />
            </div>
        </div>
    );
}