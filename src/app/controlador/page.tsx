//src\app\controlador\page.tsx

export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  History
} from "lucide-react";
import SLAAnalytics from "@/components/controlador/SLAAnalytics";
import AuditLog from "@/components/controlador/AudiLog";

export default async function ControladorDashboard() {
    const stats = await prisma.ticket.groupBy({
        by: ['status'],
        _count: { id: true }
    });

    const recentes = await prisma.ticket.findMany({
        take: 6,
        orderBy: { updatedAt: 'desc' },
        include: { 
            requester: true,
            assignedTo: true 
        }
    });

    const getCount = (status: string) => stats.find(s => s.status === status)?._count.id || 0;
    
    const abertos = getCount('ABERTO');
    const emAtendimento = getCount('EM_ANDAMENTO');
    const concluidos = getCount('CONCLUIDO');
    const totalChamados = abertos + emAtendimento + concluidos;

    const auditData = recentes.map(t => ({
        id: t.id,
        action: t.status,
        userName: t.requester?.name || "Usuário Externo",
        ticketProtocol: t.protocol,
        timestamp: t.updatedAt.toISOString(),
        details: t.assignedTo 
            ? `Técnico ${t.assignedTo.name} atualizou este chamado.` 
            : `Chamado aguardando atribuição técnica.`
    }));

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-12 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Monitoramento de Sistema</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-foreground">
                        Painel de <span className="text-primary italic">Gestão</span>
                    </h1>
                </div>
                
                <Link href="/controlador/chamados" className="bg-foreground text-background px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">
                    Visualizar Todos os Tickets
                </Link>
            </header>

            <SLAAnalytics total={totalChamados} />

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-10 border-none bg-primary text-white rounded-[3rem] relative overflow-hidden shadow-2xl shadow-primary/20 group">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-3">Auditoria de Fluxo</h2>
                            <p className="text-blue-100 text-sm font-medium max-w-md mb-8 leading-relaxed">
                                Você está visualizando o fluxo de trabalho em tempo real. Verifique protocolos, prazos e a qualidade.
                            </p>
                            <div className="flex gap-4">
                                <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                                    <p className="text-[10px] font-bold uppercase opacity-70">Total Hoje</p>
                                    <p className="text-2xl font-black">{totalChamados}</p>
                                </div>
                                <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/10">
                                    <p className="text-[10px] font-bold uppercase opacity-70">SLA Global</p>
                                    <p className="text-2xl font-black">98%</p>
                                </div>
                            </div>
                        </div>
                        <ShieldCheck className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-4">
                            <div className="flex items-center gap-2">
                                <History size={18} className="text-primary" />
                                <h3 className="font-black uppercase text-xs tracking-widest text-foreground">Logs de Atividade</h3>
                            </div>
                            <span className="text-[10px] font-black text-muted uppercase">Últimas 24 horas</span>
                        </div>
                        <AuditLog logs={auditData} />
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="font-black uppercase text-xs tracking-widest px-4 text-muted">Fila de Trabalho</h3>
                    
                    <MetricMiniCard 
                        title="Pendentes" 
                        value={abertos} 
                        icon={<AlertCircle size={24}/>} 
                        color="text-amber-500" 
                        bgColor="bg-amber-500/10"
                    />
                    <MetricMiniCard 
                        title="Em Andamento" 
                        value={emAtendimento} 
                        icon={<Clock size={24}/>} 
                        color="text-primary" 
                        bgColor="bg-primary/10"
                    />
                    <MetricMiniCard 
                        title="Concluídos" 
                        value={concluidos} 
                        icon={<CheckCircle2 size={24}/>} 
                        color="text-emerald-500" 
                        bgColor="bg-emerald-500/10"
                    />

                    <Card className="p-8 border-none bg-foreground text-background rounded-[2.5rem]">
                        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4 opacity-60">Dica do Sistema</h4>
                        <p className="text-xs font-bold leading-relaxed">
                            Chamados com prioridade <span className="text-primary underline">ALTA</span> geram alertas críticos após 4 horas de inatividade.
                        </p>
                    </Card>
                </div>
            </section>
        </div>
    );
}

function MetricMiniCard({ title, value, icon, color, bgColor }: any) {
    return (
        <div className="bg-card p-6 rounded-[2.5rem] border border-border flex items-center justify-between group hover:shadow-xl transition-all cursor-default">
            <div className="flex items-center gap-5">
                <div className={`${bgColor} ${color} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">{title}</p>
                    <p className="text-3xl font-black tracking-tighter text-foreground">{value}</p>
                </div>
            </div>
            <div className="h-10 w-10 rounded-full bg-background flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border border-border text-muted">
                <ChevronRight size={18} />
            </div>
        </div>
    );
}