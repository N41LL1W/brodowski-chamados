export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { 
  TicketIcon, 
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
    // 1. Busca estatísticas baseadas nos enums do seu Schema
    const stats = await prisma.ticket.groupBy({
        by: ['status'],
        _count: { id: true }
    });

    // 2. Busca os últimos chamados incluindo o RELACIONAMENTO CORRETO (requester)
    const recentes = await prisma.ticket.findMany({
        take: 6,
        orderBy: { updatedAt: 'desc' },
        include: { 
            requester: true, // Nome conforme seu schema
            assignedTo: true // Para saber qual técnico está atuando
        }
    });

    const getCount = (status: string) => stats.find(s => s.status === status)?._count.id || 0;
    
    // Ajustado para bater com os valores @default do seu Prisma
    const abertos = getCount('ABERTO');
    const emAtendimento = getCount('EM_ANDAMENTO');
    const concluidos = getCount('CONCLUIDO');
    const totalChamados = abertos + emAtendimento + concluidos;

    // 3. Mapeando dados para o componente AuditLog (Tratando os nomes corretamente)
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
            {/* Header com estilo Prefeitura de Brodowski */}
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Monitoramento de Sistema</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">
                        Painel de <span className="text-blue-600">Gestão</span>
                    </h1>
                </div>
                
                <Link href="/controlador/chamados" className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                    Visualizar Todos os Tickets
                </Link>
            </header>

            {/* KPIs de Performance */}
            <SLAAnalytics total={totalChamados} />

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Lado Esquerdo: Auditoria */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="p-8 border-none bg-blue-600 text-white rounded-[2.5rem] relative overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none group">
                        <div className="relative z-10">
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-3">Auditoria de Fluxo</h2>
                            <p className="text-blue-100 text-sm font-medium max-w-md mb-8 leading-relaxed">
                                Você está visualizando o fluxo de trabalho em tempo real. Verifique protocolos, prazos e a qualidade dos atendimentos realizados.
                            </p>
                            <div className="flex gap-4">
                                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                                    <p className="text-[10px] font-bold uppercase opacity-70">Total Hoje</p>
                                    <p className="text-xl font-black">{totalChamados}</p>
                                </div>
                                <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                                    <p className="text-[10px] font-bold uppercase opacity-70">SLA Global</p>
                                    <p className="text-xl font-black">98%</p>
                                </div>
                            </div>
                        </div>
                        <ShieldCheck className="absolute -right-12 -bottom-12 w-64 h-64 text-white/10 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </Card>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <History size={18} className="text-blue-600" />
                                <h3 className="font-black uppercase text-xs tracking-widest">Logs de Atividade</h3>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400">Últimas 24 horas</span>
                        </div>
                        <AuditLog logs={auditData} />
                    </div>
                </div>

                {/* Lado Direito: Cards Rápidos */}
                <div className="space-y-6">
                    <h3 className="font-black uppercase text-xs tracking-widest px-2 text-slate-400">Fila de Trabalho</h3>
                    
                    <MetricMiniCard 
                        title="Pendentes" 
                        value={abertos} 
                        icon={<AlertCircle size={20}/>} 
                        color="text-amber-600" 
                        bgColor="bg-amber-100/50 dark:bg-amber-900/20"
                    />
                    <MetricMiniCard 
                        title="Em Andamento" 
                        value={emAtendimento} 
                        icon={<Clock size={20}/>} 
                        color="text-blue-600" 
                        bgColor="bg-blue-100/50 dark:bg-blue-900/20"
                    />
                    <MetricMiniCard 
                        title="Concluídos" 
                        value={concluidos} 
                        icon={<CheckCircle2 size={20}/>} 
                        color="text-emerald-600" 
                        bgColor="bg-emerald-100/50 dark:bg-emerald-900/20"
                    />

                    <Card className="p-8 border-none bg-slate-900 text-white rounded-[2.5rem]">
                        <h4 className="font-black text-[10px] uppercase tracking-widest mb-4 text-slate-400">Dica do Sistema</h4>
                        <p className="text-xs font-medium leading-relaxed opacity-80">
                            Chamados com prioridade <span className="text-red-400 font-bold underline">ALTA</span> que ultrapassarem 4 horas sem atendimento geram alerta crítico no relatório de produtividade.
                        </p>
                    </Card>
                </div>

            </section>
        </div>
    );
}

function MetricMiniCard({ title, value, icon, color, bgColor }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-4xl border border-slate-100 dark:border-slate-800 flex items-center justify-between group hover:shadow-xl transition-all cursor-default">
            <div className="flex items-center gap-4">
                <div className={`${bgColor} ${color} p-4 rounded-2xl transition-transform group-hover:scale-110`}>
                    {icon}
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{title}</p>
                    <p className="text-3xl font-black tracking-tighter">{value}</p>
                </div>
            </div>
            <div className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight size={14} />
            </div>
        </div>
    );
}