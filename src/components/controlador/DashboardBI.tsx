"use client";

import { useEffect, useState, useCallback } from 'react';
import {
    AlertTriangle, CheckCircle2, Clock, Users,
    TrendingUp, TrendingDown, Minus, RefreshCw,
    BarChart3, Activity, Building2, Wrench,
    AlertCircle, Timer, Calendar, ChevronRight,
    UserX, Target, Award, ArrowUpRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardBI() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const load = useCallback(async () => {
        try {
            const res = await fetch('/api/controlador/dashboard');
            if (res.ok) {
                setData(await res.json());
                setLastUpdate(new Date());
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        load();
        const interval = setInterval(load, 60000);
        return () => clearInterval(interval);
    }, [load]);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin mx-auto"/>
                <p className="text-muted text-[10px] font-black uppercase tracking-widest">Carregando dados...</p>
            </div>
        </div>
    );

    if (!data) return (
        <div className="text-center text-muted py-20 font-bold">Erro ao carregar dashboard.</div>
    );

    const { kpis, serie14Dias, porCategoria, secretarias, tecnicos, atrasados, emAlerta, semTecnico, timelineHoje, slaResumo, chamadosRecentes } = data;
    const maxSerie = Math.max(...serie14Dias.map((d: any) => d.total), 1);

    return (
        <div className="space-y-4 md:space-y-5">

            {/* LINHA 1 — KPIs PRINCIPAIS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 md:gap-3">
                <KPICard label="Total"        value={kpis.total}       icon={<BarChart3 size={15}/>}     color="text-foreground"    bg="bg-border/50"/>
                <KPICard label="Hoje"         value={kpis.hoje}        icon={<Calendar size={15}/>}      color="text-blue-600"      bg="bg-blue-500/10"
                    sub={kpis.tendenciaSemana !== 0 ? `${kpis.tendenciaSemana > 0 ? '+' : ''}${kpis.tendenciaSemana}% sem.` : undefined}
                    trend={kpis.tendenciaSemana}/>
                <KPICard label="Abertos"      value={kpis.abertos}     icon={<AlertCircle size={15}/>}   color="text-amber-600"     bg="bg-amber-500/10"/>
                <KPICard label="Andamento"    value={kpis.emAndamento} icon={<Timer size={15}/>}         color="text-blue-600"      bg="bg-blue-500/10"/>
                <KPICard label="Concluídos"   value={kpis.concluidos}  icon={<CheckCircle2 size={15}/>}  color="text-emerald-600"   bg="bg-emerald-500/10"/>
                <KPICard label="Atrasados"    value={kpis.atrasados}   icon={<AlertTriangle size={15}/>} color={kpis.atrasados > 0 ? "text-red-600" : "text-muted"}    bg={kpis.atrasados > 0 ? "bg-red-500/10" : "bg-border/30"}    urgent={kpis.atrasados > 0}/>
                <KPICard label="Sem técnico"  value={kpis.semTecnico}  icon={<UserX size={15}/>}         color={kpis.semTecnico > 0 ? "text-orange-600" : "text-muted"} bg={kpis.semTecnico > 0 ? "bg-orange-500/10" : "bg-border/30"}/>
                <KPICard label="Resolução"    value={`${kpis.taxaResolucaoGeral}%`} icon={<Target size={15}/>} color="text-purple-600" bg="bg-purple-500/10"/>
            </div>

            {/* ALERTAS CRÍTICOS */}
            {(atrasados.length > 0 || semTecnico.length > 0) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {atrasados.length > 0 && (
                        <AlertPanel
                            title="Chamados atrasados"
                            subtitle="SLA violado — ação imediata necessária"
                            icon={<AlertTriangle size={15}/>}
                            color="red"
                            items={atrasados}
                            expanded={activeSection === 'atrasados'}
                            onToggle={() => setActiveSection(activeSection === 'atrasados' ? null : 'atrasados')}
                        />
                    )}
                    {semTecnico.length > 0 && (
                        <AlertPanel
                            title="Sem técnico atribuído"
                            subtitle="Aguardando designação"
                            icon={<UserX size={15}/>}
                            color="orange"
                            items={semTecnico}
                            expanded={activeSection === 'semTecnico'}
                            onToggle={() => setActiveSection(activeSection === 'semTecnico' ? null : 'semTecnico')}
                        />
                    )}
                </div>
            )}

            {/* LINHA 2 — GRÁFICO + SLA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                {/* GRÁFICO 14 DIAS */}
                <div className="md:col-span-2 bg-card border border-border rounded-3xl p-4 md:p-5 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                            <h3 className="text-sm font-black uppercase text-foreground">Volume — 14 dias</h3>
                            <p className="text-[10px] text-muted">{kpis.mes} chamados no último mês</p>
                        </div>
                        <div className="flex items-center gap-3 text-[9px] font-black uppercase text-muted">
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-sm bg-primary inline-block"/>Abertos
                            </span>
                            <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-sm bg-emerald-500 inline-block"/>Concluídos
                            </span>
                        </div>
                    </div>
                    <div className="flex items-end gap-0.5 md:gap-1" style={{ height: '96px' }}>
                        {serie14Dias.map((d: any, i: number) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-0.5 group relative">
                                <div className="w-full flex flex-col justify-end" style={{ height: '80px' }}>
                                    {d.total > 0 ? (
                                        <div className="relative w-full">
                                            <div
                                                className="w-full bg-primary/80 rounded-t-sm group-hover:bg-primary transition-colors"
                                                style={{ height: `${Math.max((d.total / maxSerie) * 76, 4)}px` }}
                                            />
                                            {d.concluidos > 0 && (
                                                <div
                                                    className="absolute bottom-0 w-full bg-emerald-500/70 rounded-t-sm"
                                                    style={{ height: `${Math.max((d.concluidos / maxSerie) * 76, 2)}px` }}
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <div className="w-full bg-border/30 rounded-t-sm" style={{ height: '3px' }}/>
                                    )}
                                </div>
                                <span className="text-[6px] md:text-[7px] font-bold text-muted leading-none">{d.dia}</span>
                                {/* TOOLTIP no hover */}
                                {d.total > 0 && (
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-foreground text-background text-[9px] font-black px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        {d.total}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* SLA STATUS */}
                <div className="bg-card border border-border rounded-3xl p-4 md:p-5 space-y-4">
                    <div>
                        <h3 className="text-sm font-black uppercase text-foreground">Status SLA</h3>
                        <p className="text-[10px] text-muted">Chamados ativos</p>
                    </div>

                    <div className="space-y-3">
                        <SlaRow label="No prazo"  value={slaResumo.ok}       total={kpis.abertos + kpis.emAndamento} color="bg-emerald-500" textColor="text-emerald-600"/>
                        <SlaRow label="Em alerta" value={slaResumo.alerta}   total={kpis.abertos + kpis.emAndamento} color="bg-amber-500"   textColor="text-amber-600"/>
                        <SlaRow label="Atrasados" value={slaResumo.atrasado} total={kpis.abertos + kpis.emAndamento} color="bg-red-500"     textColor="text-red-600"/>
                        {slaResumo.semConfig > 0 && (
                            <SlaRow label="Sem SLA" value={slaResumo.semConfig} total={kpis.abertos + kpis.emAndamento} color="bg-border" textColor="text-muted"/>
                        )}
                    </div>

                    <div className="pt-3 border-t border-border">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-black text-muted uppercase">Saúde geral</span>
                            <span className="text-sm font-black text-foreground">
                                {slaResumo.ok + slaResumo.alerta + slaResumo.atrasado > 0
                                    ? Math.round((slaResumo.ok / (slaResumo.ok + slaResumo.alerta + slaResumo.atrasado)) * 100)
                                    : 100}%
                            </span>
                        </div>
                        <div className="h-2 bg-border rounded-full overflow-hidden flex">
                            {slaResumo.ok > 0 && (
                                <div className="bg-emerald-500 transition-all"
                                    style={{ width: `${(slaResumo.ok / Math.max(slaResumo.ok + slaResumo.alerta + slaResumo.atrasado, 1)) * 100}%` }}/>
                            )}
                            {slaResumo.alerta > 0 && (
                                <div className="bg-amber-500 transition-all"
                                    style={{ width: `${(slaResumo.alerta / Math.max(slaResumo.ok + slaResumo.alerta + slaResumo.atrasado, 1)) * 100}%` }}/>
                            )}
                            {slaResumo.atrasado > 0 && (
                                <div className="bg-red-500 transition-all"
                                    style={{ width: `${(slaResumo.atrasado / Math.max(slaResumo.ok + slaResumo.alerta + slaResumo.atrasado, 1)) * 100}%` }}/>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* LINHA 3 — SECRETARIAS + CATEGORIAS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* MAPA DE CALOR — SECRETARIAS */}
                <div className="bg-card border border-border rounded-3xl p-4 md:p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Building2 size={15} className="text-primary shrink-0"/>
                        <div>
                            <h3 className="text-sm font-black uppercase text-foreground">Por secretaria</h3>
                            <p className="text-[10px] text-muted">Volume e atrasos</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {secretarias.length === 0 && <EmptyState text="Nenhum dado."/>}
                        {secretarias.slice(0, 7).map((s: any) => {
                            const maxTotal = Math.max(...secretarias.map((x: any) => x.total), 1);
                            return (
                                <div key={s.id} className="space-y-1">
                                    <div className="flex items-center justify-between gap-2">
                                        <span className="text-xs font-bold text-foreground truncate max-w-[60%]">{s.nome}</span>
                                        <div className="flex items-center gap-2 shrink-0">
                                            {s.atrasados > 0 && (
                                                <span className="text-[9px] font-black text-red-600 flex items-center gap-0.5">
                                                    <AlertTriangle size={9}/>{s.atrasados}
                                                </span>
                                            )}
                                            <span className="font-black text-foreground text-xs">{s.total}</span>
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all ${s.atrasados > 0 ? 'bg-red-400' : s.abertos > 0 ? 'bg-amber-400' : 'bg-primary'}`}
                                            style={{ width: `${(s.total / maxTotal) * 100}%` }}
                                        />
                                    </div>
                                    <div className="flex gap-3 text-[9px] text-muted">
                                        <span>{s.abertos} abertos</span>
                                        <span>{s.concluidos} concluídos</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* CATEGORIAS */}
                <div className="bg-card border border-border rounded-3xl p-4 md:p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={15} className="text-primary shrink-0"/>
                        <div>
                            <h3 className="text-sm font-black uppercase text-foreground">Por categoria</h3>
                            <p className="text-[10px] text-muted">Tipos mais comuns</p>
                        </div>
                    </div>
                    <div className="space-y-2.5">
                        {porCategoria.length === 0 && <EmptyState text="Nenhum dado."/>}
                        {porCategoria.slice(0, 7).map((c: any, i: number) => {
                            const maxCat = Math.max(...porCategoria.map((x: any) => x.total), 1);
                            return (
                                <div key={i} className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-muted w-4 shrink-0">{i + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-xs font-bold text-foreground truncate">{c.nome}</span>
                                            <span className="text-xs font-black text-primary shrink-0 ml-2">{c.total}</span>
                                        </div>
                                        <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                            <div className="h-full bg-primary rounded-full"
                                                style={{ width: `${(c.total / maxCat) * 100}%` }}/>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* LINHA 4 — TÉCNICOS */}
            <div className="bg-card border border-border rounded-3xl p-4 md:p-5 space-y-4">
                <div className="flex items-center gap-2">
                    <Wrench size={15} className="text-primary shrink-0"/>
                    <div>
                        <h3 className="text-sm font-black uppercase text-foreground">Desempenho dos técnicos</h3>
                        <p className="text-[10px] text-muted">Produtividade e tempo médio</p>
                    </div>
                </div>

                {tecnicos.length === 0 ? (
                    <EmptyState text="Nenhum técnico cadastrado."/>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {tecnicos.map((t: any, i: number) => (
                            <div key={t.id} className={`p-4 rounded-2xl border transition-all ${
                                i === 0
                                    ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10'
                                    : 'border-border bg-background'
                            }`}>
                                <div className="flex items-start gap-3 mb-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                                        i === 0 ? 'bg-amber-500 text-white' :
                                        i === 1 ? 'bg-slate-400 text-white' :
                                        i === 2 ? 'bg-orange-400 text-white' :
                                        'bg-primary/10 text-primary'
                                    }`}>
                                        {i < 3 ? <Award size={15}/> : t.name?.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-foreground text-sm truncate uppercase">{t.name}</p>
                                        <p className="text-[9px] text-muted">
                                            {t.ativos > 0 ? `${t.ativos} ativo${t.ativos > 1 ? 's' : ''}` : 'Sem atendimento ativo'}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-black px-2 py-1 rounded-full uppercase shrink-0 ${
                                        t.taxaResolucao >= 80 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                                        t.taxaResolucao >= 50 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                                        'bg-red-100 dark:bg-red-900/30 text-red-600'
                                    }`}>
                                        {t.taxaResolucao}%
                                    </span>
                                </div>

                                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                                    <div className="bg-card rounded-xl p-2">
                                        <p className="text-sm font-black text-foreground">{t.total}</p>
                                        <p className="text-[8px] text-muted uppercase font-bold">Total</p>
                                    </div>
                                    <div className="bg-card rounded-xl p-2">
                                        <p className="text-sm font-black text-emerald-600">{t.concluidos}</p>
                                        <p className="text-[8px] text-muted uppercase font-bold">Concluídos</p>
                                    </div>
                                    <div className="bg-card rounded-xl p-2">
                                        <p className="text-sm font-black text-blue-600">{t.tempoMedioHoras}h</p>
                                        <p className="text-[8px] text-muted uppercase font-bold">T. médio</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between text-[9px] text-muted mb-1">
                                        <span>Taxa de resolução</span>
                                        <span className="font-black">{t.taxaResolucao}%</span>
                                    </div>
                                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all ${
                                            t.taxaResolucao >= 80 ? 'bg-emerald-500' :
                                            t.taxaResolucao >= 50 ? 'bg-amber-500' : 'bg-red-500'
                                        }`} style={{ width: `${t.taxaResolucao}%` }}/>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* LINHA 5 — TIMELINE + LOG */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* TIMELINE DO DIA */}
                <div className="bg-card border border-border rounded-3xl p-4 md:p-5 space-y-4">
                    <div className="flex items-center gap-2">
                        <Activity size={15} className="text-primary shrink-0"/>
                        <div>
                            <h3 className="text-sm font-black uppercase text-foreground">Timeline de hoje</h3>
                            <p className="text-[10px] text-muted">{timelineHoje.length} eventos</p>
                        </div>
                    </div>

                    <div className="space-y-0 max-h-64 overflow-y-auto">
                        {timelineHoje.length === 0 && <EmptyState text="Nenhum evento hoje."/>}
                        {timelineHoje.map((ev: any, i: number) => {
                            const cfgMap: Record<string, { icon: any; dot: string; text: string }> = {
                                ABERTO:    { icon: <AlertCircle size={11}/>,  dot: 'bg-amber-500',   text: 'text-amber-600' },
                                ATRIBUIDO: { icon: <Wrench size={11}/>,       dot: 'bg-blue-500',    text: 'text-blue-600' },
                                PAUSADO:   { icon: <Timer size={11}/>,        dot: 'bg-purple-500',  text: 'text-purple-600' },
                                CONCLUIDO: { icon: <CheckCircle2 size={11}/>, dot: 'bg-emerald-500', text: 'text-emerald-600' },
                            };
                            const cfg = cfgMap[ev.tipo] || cfgMap['ABERTO'];
                            return (
                                <div key={i} className="flex items-start gap-3 relative">
                                    {i < timelineHoje.length - 1 && (
                                        <div className="absolute left-[13px] top-6 bottom-0 w-px bg-border"/>
                                    )}
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.text} bg-background border border-border z-10`}>
                                        {cfg.icon}
                                    </div>
                                    <div className="flex-1 min-w-0 py-1.5 border-b border-border/50 last:border-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="text-xs font-bold text-foreground truncate">{ev.subject}</p>
                                            <span className="text-[9px] text-muted font-bold shrink-0">{ev.hora}</span>
                                        </div>
                                        <p className="text-[9px] text-muted mt-0.5 truncate">
                                            {ev.departamento}{ev.tecnico && ` · ${ev.tecnico}`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* LOG OPERACIONAL */}
                <div className="bg-card border border-border rounded-3xl p-4 md:p-5 space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock size={15} className="text-primary shrink-0"/>
                            <div>
                                <h3 className="text-sm font-black uppercase text-foreground">Últimas atualizações</h3>
                                <p className="text-[10px] text-muted">Chamados recentes</p>
                            </div>
                        </div>
                        <Link href="/controlador/chamados"
                            className="text-[10px] font-black text-primary uppercase hover:underline flex items-center gap-1 shrink-0">
                            Ver todos <ArrowUpRight size={11}/>
                        </Link>
                    </div>

                    <div className="space-y-1 max-h-64 overflow-y-auto">
                        {chamadosRecentes.slice(0, 10).map((t: any) => {
                            const STATUS_STYLE: Record<string, string> = {
                                ABERTO:       'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                OPEN:         'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
                                EM_ANDAMENTO: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                IN_PROGRESS:  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                                EM_PAUSA:     'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                                CONCLUIDO:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                                CONCLUDED:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
                            };
                            return (
                                <Link key={t.id} href={`/controlador/chamados/${t.id}`}>
                                    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-background transition-all group">
                                        <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase shrink-0 ${STATUS_STYLE[t.status] || 'bg-border text-muted'}`}>
                                            {t.status.replace('_', ' ')}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">{t.subject}</p>
                                            <p className="text-[9px] text-muted truncate">#{t.protocol} · {t.department?.name}</p>
                                        </div>
                                        <span className="text-[9px] text-muted shrink-0">
                                            {new Date(t.updatedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* RODAPÉ */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[10px] text-muted pt-2 border-t border-border">
                <span>Atualizado às {lastUpdate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                <button onClick={load}
                    className="flex items-center gap-1.5 hover:text-foreground transition-colors font-bold uppercase">
                    <RefreshCw size={11}/> Atualizar agora
                </button>
            </div>
        </div>
    );
}

// =====================
// COMPONENTES
// =====================

function KPICard({ label, value, icon, color, bg, sub, trend, urgent }: any) {
    return (
        <div className={`bg-card border rounded-2xl p-3 md:p-4 transition-all ${urgent ? 'border-red-300 dark:border-red-800 animate-pulse' : 'border-border'}`}>
            <div className={`${bg} ${color} w-7 h-7 md:w-8 md:h-8 rounded-xl flex items-center justify-center mb-2`}>
                {icon}
            </div>
            <p className="text-xl md:text-2xl font-black text-foreground tracking-tighter leading-none">{value}</p>
            <p className="text-[9px] font-black uppercase text-muted tracking-widest mt-0.5 leading-tight">{label}</p>
            {sub && (
                <div className={`flex items-center gap-1 mt-1 text-[9px] font-bold ${
                    (trend ?? 0) > 0 ? 'text-red-500' :
                    (trend ?? 0) < 0 ? 'text-emerald-500' : 'text-muted'
                }`}>
                    {(trend ?? 0) > 0 ? <TrendingUp size={9}/> :
                     (trend ?? 0) < 0 ? <TrendingDown size={9}/> :
                     <Minus size={9}/>}
                    {sub}
                </div>
            )}
        </div>
    );
}

function SlaRow({ label, value, total, color, textColor }: any) {
    const pct = total > 0 ? Math.round((value / total) * 100) : 0;
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className={`font-bold ${textColor}`}>{label}</span>
                <span className="font-black text-foreground">
                    {value} <span className="text-[9px] text-muted font-medium">({pct}%)</span>
                </span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }}/>
            </div>
        </div>
    );
}

function AlertPanel({ title, subtitle, icon, color, items, expanded, onToggle }: any) {
    const colorMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
        red: {
            border: 'border-red-200 dark:border-red-800',
            bg:     'bg-red-50 dark:bg-red-900/10',
            text:   'text-red-700 dark:text-red-400',
            badge:  'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
        },
        orange: {
            border: 'border-orange-200 dark:border-orange-800',
            bg:     'bg-orange-50 dark:bg-orange-900/10',
            text:   'text-orange-700 dark:text-orange-400',
            badge:  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
        },
    };
    const c = colorMap[color] || colorMap.red;

    return (
        <div className={`border ${c.border} ${c.bg} rounded-3xl overflow-hidden`}>
            <button onClick={onToggle}
                className="w-full p-4 flex items-center gap-3 text-left hover:opacity-80 transition-opacity">
                <div className={c.text}>{icon}</div>
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-black uppercase ${c.text}`}>{title}</p>
                    <p className="text-[10px] text-muted">{subtitle}</p>
                </div>
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${c.badge}`}>
                    {items.length}
                </span>
                <ChevronRight size={16} className={`text-muted transition-transform shrink-0 ${expanded ? 'rotate-90' : ''}`}/>
            </button>

            {expanded && (
                <div className="border-t border-border/50 divide-y divide-border/30 max-h-48 overflow-y-auto animate-in fade-in duration-200">
                    {items.map((t: any) => (
                        <Link key={t.id} href={`/controlador/chamados/${t.id}`}>
                            <div className="px-4 py-3 hover:bg-background/50 transition-all group">
                                <div className="flex items-start justify-between gap-2">
                                    <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                                        {t.subject}
                                    </p>
                                    {t.horasDecorridas !== undefined && (
                                        <span className={`text-[9px] font-black shrink-0 ${c.text}`}>
                                            {t.horasDecorridas}h
                                        </span>
                                    )}
                                </div>
                                <p className="text-[9px] text-muted mt-0.5">
                                    #{t.protocol} · {t.department?.name}
                                    {t.assignedTo && ` · ${t.assignedTo.name}`}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function EmptyState({ text }: { text: string }) {
    return (
        <div className="text-center py-8 text-muted text-[10px] font-bold uppercase">{text}</div>
    );
}