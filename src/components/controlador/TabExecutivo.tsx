"use client";

import { CheckCircle2, Clock, AlertCircle, Activity, Tag, Building2 } from 'lucide-react';

export default function TabExecutivo({ data }: any) {
    const getCount = (statuses: string[]) =>
        data.totalPorStatus
            .filter((s: any) => statuses.includes(s.status))
            .reduce((acc: number, s: any) => acc + s._count.id, 0);

    const abertos     = getCount(['ABERTO', 'OPEN']);
    const emAndamento = getCount(['EM_ANDAMENTO', 'IN_PROGRESS']);
    const pausados    = getCount(['EM_PAUSA']);
    const concluidos  = getCount(['CONCLUIDO', 'CONCLUDED']);
    const total       = abertos + emAndamento + pausados + concluidos;

    const maxSerie = Math.max(...data.serie14Dias.map((d: any) => d.total), 1);

    return (
        <div className="space-y-8">

            {/* CARDS DE STATUS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Abertos"
                    value={abertos}
                    icon={<AlertCircle size={22}/>}
                    color="text-amber-500"
                    bg="bg-amber-500/10"
                />
                <StatCard
                    label="Em andamento"
                    value={emAndamento}
                    icon={<Activity size={22}/>}
                    color="text-blue-500"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    label="Pausados"
                    value={pausados}
                    icon={<Clock size={22}/>}
                    color="text-purple-500"
                    bg="bg-purple-500/10"
                />
                <StatCard
                    label="Concluídos"
                    value={concluidos}
                    icon={<CheckCircle2 size={22}/>}
                    color="text-emerald-500"
                    bg="bg-emerald-500/10"
                />
            </div>

            {/* GRÁFICO DE BARRAS — ÚLTIMOS 14 DIAS */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                    <Activity size={14} className="text-primary" /> Chamados nos últimos 14 dias
                </h3>
                <div className="flex items-end gap-1.5 h-40">
                    {data.serie14Dias.map((d: any, i: number) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-[8px] font-bold text-muted">{d.total > 0 ? d.total : ''}</span>
                            <div
                                className="w-full bg-primary/80 rounded-t-md transition-all hover:bg-primary"
                                style={{ height: `${Math.max((d.total / maxSerie) * 120, d.total > 0 ? 4 : 0)}px` }}
                            />
                            <span className="text-[7px] font-bold text-muted rotate-0 whitespace-nowrap">{d.dia}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* POR CATEGORIA E SECRETARIA */}
            <div className="grid md:grid-cols-2 gap-6">
                <BarList
                    title="Por categoria"
                    icon={<Tag size={14}/>}
                    items={data.porCategoria}
                />
                <BarList
                    title="Por secretaria"
                    icon={<Building2 size={14}/>}
                    items={data.porSecretaria}
                />
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color, bg }: any) {
    return (
        <div className="bg-card border border-border rounded-3xl p-6 flex items-center gap-4">
            <div className={`${bg} ${color} p-3 rounded-2xl`}>{icon}</div>
            <div>
                <p className="text-3xl font-black text-foreground tracking-tighter">{value}</p>
                <p className="text-[10px] font-black text-muted uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
}

function BarList({ title, icon, items }: any) {
    const max = Math.max(...items.map((i: any) => i.total), 1);
    return (
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                {icon} {title}
            </h3>
            <div className="space-y-3">
                {items.map((item: any, i: number) => (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-foreground truncate max-w-[70%]">{item.nome}</span>
                            <span className="text-xs font-black text-primary">{item.total}</span>
                        </div>
                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(item.total / max) * 100}%` }}
                            />
                        </div>
                    </div>
                ))}
                {items.length === 0 && (
                    <p className="text-[10px] text-muted italic">Nenhum dado.</p>
                )}
            </div>
        </div>
    );
}