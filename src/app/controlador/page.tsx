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
  TrendingUp
} from "lucide-react";

export default async function ControladorDashboard() {
    const stats = await prisma.ticket.groupBy({
        by: ['status'],
        _count: { id: true }
    });

    const getCount = (status: string) => stats.find(s => s.status === status)?._count.id || 0;
    
    const abertos = getCount('Aberto');
    const emAtendimento = getCount('Em Atendimento');
    const concluidos = getCount('Concluído');
    const totalChamados = abertos + emAtendimento + concluidos;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-10 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                <div>
                    <h1 className="text-4xl font-black italic tracking-tighter uppercase">
                        Painel de <span className="text-blue-600">Gestão</span>
                    </h1>
                    <p className="text-muted-foreground font-medium">Acompanhamento em tempo real do fluxo de TI.</p>
                </div>
                <Link href="/novo-chamado" className="bg-foreground text-background px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl active:scale-95 text-center">
                    Abrir Chamado
                </Link>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <MetricCard title="Pendentes" value={abertos} icon={<AlertCircle />} color="text-amber-500" bgColor="bg-amber-500/5" borderColor="border-amber-500/20" />
                <MetricCard title="Em Curso" value={emAtendimento} icon={<Clock />} color="text-blue-500" bgColor="bg-blue-500/5" borderColor="border-blue-500/20" />
                <MetricCard title="Finalizados" value={concluidos} icon={<CheckCircle2 />} color="text-emerald-500" bgColor="bg-emerald-500/5" borderColor="border-emerald-500/20" />
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 p-8 border-none bg-card shadow-2xl rounded-[2.5rem] group relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp size={120} />
                    </div>
                    
                    <div className="relative z-10">
                        <div className="flex items-start justify-between mb-8">
                            <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                                <TicketIcon className="w-8 h-8" />
                            </div>
                            <span className="text-[10px] font-black text-blue-600 bg-blue-600/10 px-4 py-1.5 rounded-full uppercase tracking-widest">Performance</span>
                        </div>
                        
                        <h2 className="text-3xl font-black mb-4 text-foreground uppercase tracking-tight">Central de Tickets</h2>
                        <p className="text-muted-foreground mb-8 text-lg max-w-xl leading-relaxed">
                            Existem atualmente <strong className="text-foreground">{totalChamados} chamados</strong> registrados. Gerencie atribuições, escale prioridades e monitore o SLA da equipe.
                        </p>
                        
                        <Link href="/controlador/chamados" className="inline-flex items-center gap-3 bg-secondary text-foreground px-6 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-600 hover:text-white transition-all group/btn">
                            Acessar Central <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform"/>
                        </Link>
                    </div>
                </Card>

                <div className="space-y-8">
                    <Card className="p-8 border-none bg-secondary/50 rounded-4xl">
                        <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-4">Total Acumulado</h3>
                        <p className="text-5xl font-black text-foreground">{totalChamados}</p>
                        <div className="mt-4 h-2 w-full bg-border rounded-full overflow-hidden">
                            <div className="h-full bg-blue-600 w-full opacity-50"></div>
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
}

function MetricCard({ title, value, icon, color, bgColor, borderColor }: any) {
    return (
        <div className={`${bgColor} ${borderColor} border-2 p-8 rounded-4xl transition-all hover:shadow-2xl hover:-translate-y-1 group`}>
            <div className="flex items-center justify-between mb-4">
                <span className={`font-black text-[10px] uppercase tracking-[0.2em] ${color} opacity-80`}>{title}</span>
                <div className={`${color} group-hover:scale-125 transition-transform duration-300`}>{icon}</div>
            </div>
            <p className="text-5xl font-black text-foreground tracking-tighter">{value}</p>
        </div>
    );
}