import prisma from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Link from "next/link";
import { 
  Users, 
  TicketIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight
} from "lucide-react"; // Caso não tenha lucide-react, pode remover os ícones ou instalar com 'npm i lucide-react'

export default async function ControladorDashboard() {
    // 1. Busca as contagens reais no banco de dados em paralelo para melhor performance
    const [totalUsers, stats] = await Promise.all([
        prisma.user.count(),
        prisma.ticket.groupBy({
            by: ['status'],
            _count: { id: true }
        })
    ]);

    // 2. Mapeia os status vindos do banco
    const getCount = (status: string) => stats.find(s => s.status === status)?._count.id || 0;
    
    const abertos = getCount('Aberto');
    const emAtendimento = getCount('Em Atendimento');
    const concluidos = getCount('Concluído');
    const totalChamados = abertos + emAtendimento + concluidos;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            {/* Header com Boas-vindas */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Painel de Controle</h1>
                    <p className="">Gestão de produtividade e equipe técnica de Brodowski.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/controlador/users/add" className="border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:transition shadow-sm">
                        Adicionar Usuário
                    </Link>
                    <Link href="/novo-chamado" className="text-white px-4 py-2 rounded-lg text-sm font-semibold hover:transition shadow-sm">
                        Abrir Novo Chamado
                    </Link>
                </div>
            </header>

            {/* Grid de Métricas Principais */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    title="Abertos" 
                    value={abertos} 
                    icon={<AlertCircle className="w-5 h-5" />} 
                    color="text-yellow-600" 
                    bgColor="bg-yellow-50"
                    borderColor="border-yellow-200"
                />
                <MetricCard 
                    title="Em Atendimento" 
                    value={emAtendimento} 
                    icon={<Clock className="w-5 h-5" />} 
                    color="text-blue-600" 
                    bgColor="bg-blue-50"
                    borderColor="border-blue-200"
                />
                <MetricCard 
                    title="Concluídos" 
                    value={concluidos} 
                    icon={<CheckCircle2 className="w-5 h-5" />} 
                    color="text-green-600" 
                    bgColor="bg-green-50" 
                    borderColor="border-green-200"
                />
                <MetricCard 
                    title="Total Equipe" 
                    value={totalUsers} 
                    icon={<Users className="w-5 h-5" />} 
                    color="text-purple-600" 
                    bgColor="bg-purple-50"
                    borderColor="border-purple-200"
                />
            </section>

            {/* Ações de Gerenciamento */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6 border border-gray-100 hover:border-blue-200 transition-all shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">Gestão</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Controle de Usuários</h2>
                    <p className="text-sm mb-6">
                        Gerencie técnicos, controladores e administradores. Altere permissões ou remova acessos.
                    </p>
                    <Link href="/controlador/users" className="flex items-center text-blue-600 font-semibold hover:gap-2 transition-all">
                        Gerenciar equipe <ChevronRight className="w-4 h-4" />
                    </Link>
                </Card>

                <Card className="p-6 border border-gray-100 hover:border-orange-200 transition-all shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-orange-100 rounded-lg text-orange-600">
                            <TicketIcon className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded">Chamados</span>
                    </div>
                    <h2 className="text-xl font-bold mb-2">Visão Geral de Chamados</h2>
                    <p className="text-sm mb-6">
                        Visualize todos os {totalChamados} chamados do sistema, atribua técnicos e acompanhe prazos.
                    </p>
                    <Link href="/controlador/chamados" className="flex items-center text-orange-600 font-semibold hover:gap-2 transition-all">
                        Ver todos os chamados <ChevronRight className="w-4 h-4" />
                    </Link>
                </Card>
            </section>
        </div>
    );
}

// Sub-componente para os cards de métricas
function MetricCard({ title, value, icon, color, bgColor, borderColor }: any) {
    return (
        <div className={`${bgColor} ${borderColor} border p-5 rounded-2xl transition-transform hover:scale-[1.02]`}>
            <div className="flex items-center justify-between mb-2">
                <span className={`font-bold text-xs uppercase tracking-wider ${color}`}>{title}</span>
                <div className={color}>{icon}</div>
            </div>
            <p className="text-3xl font-black text-gray-900">{value}</p>
        </div>
    );
}