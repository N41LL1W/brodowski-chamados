export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { 
  TicketIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight
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
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold italic">Painel de Gestão</h1>
                    <p className="text-gray-500">Acompanhamento de produtividade e fluxo de chamados.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/novo-chamado" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition shadow-lg">
                        Abrir Novo Chamado
                    </Link>
                </div>
            </header>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <MetricCard title="Abertos" value={abertos} icon={<AlertCircle />} color="text-yellow-600" bgColor="bg-yellow-50" borderColor="border-yellow-200" />
                <MetricCard title="Em Atendimento" value={emAtendimento} icon={<Clock />} color="text-blue-600" bgColor="bg-blue-50" borderColor="border-blue-200" />
                <MetricCard title="Concluídos" value={concluidos} icon={<CheckCircle2 />} color="text-green-600" bgColor="bg-green-50" borderColor="border-green-200" />
            </section>

            <section className="grid grid-cols-1 gap-6">
                <Card className="p-8 border border-gray-100 hover:border-orange-200 transition-all shadow-sm group">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-4 bg-orange-100 rounded-2xl text-orange-600 group-hover:scale-110 transition-transform">
                            <TicketIcon className="w-8 h-8" />
                        </div>
                        <span className="text-xs font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-full uppercase">Relatórios</span>
                    </div>
                    <h2 className="text-2xl font-black mb-2">Visão Geral de Chamados</h2>
                    <p className="text-gray-600 mb-6">
                        Visualize e gerencie todos os **{totalChamados} chamados** do sistema. Atribua técnicos, altere prioridades e encerre tickets.
                    </p>
                    <Link href="/controlador/chamados" className="inline-flex items-center text-orange-600 font-bold hover:gap-3 transition-all">
                        Acessar Central de Chamados <ChevronRight className="w-5 h-5 ml-2" />
                    </Link>
                </Card>
            </section>
        </div>
    );
}

function MetricCard({ title, value, icon, color, bgColor, borderColor }: any) {
    return (
        <div className={`${bgColor} ${borderColor} border-2 p-6 rounded-3xl transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`font-black text-xs uppercase tracking-tighter ${color}`}>{title}</span>
                <div className={color}>{icon}</div>
            </div>
            <p className="text-4xl font-black text-gray-900">{value}</p>
        </div>
    );
}