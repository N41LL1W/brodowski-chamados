import prisma from "@/lib/prisma";
import Card from "@/components/ui/Card";
import Link from "next/link";

export default async function ControladorDashboard() {
    // Busca dados reais do banco
    const totalTickets = await prisma.ticket.count();
    const openTickets = await prisma.ticket.count({ where: { status: 'Aberto' } });
    const inProgressTickets = await prisma.ticket.count({ where: { status: 'Em Atendimento' } });
    const closedTickets = await prisma.ticket.count({ where: { status: 'Concluído' } });

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-8">Dashboard de Produtividade</h1>

            {/* Grid de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                <StatCard title="Total de Chamados" value={totalTickets} color="bg-gray-100" />
                <StatCard title="Abertos" value={openTickets} color="bg-yellow-100 text-yellow-700" />
                <StatCard title="Em Andamento" value={inProgressTickets} color="bg-blue-100 text-blue-700" />
                <StatCard title="Finalizados" value={closedTickets} color="bg-green-100 text-green-700" />
            </div>

            {/* Atalhos Rápidos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Gestão de Pessoas</h2>
                    <p className="mb-4 opacity-70">Adicione técnicos ou altere permissões da equipe.</p>
                    <Link href="/controlador/users" className="text-blue-600 font-bold hover:underline">
                        Acessar Lista de Usuários →
                    </Link>
                </Card>
                
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4">Relatórios Exportáveis</h2>
                    <p className="mb-4 opacity-70">Em breve: Gere relatórios em PDF dos atendimentos do mês.</p>
                    <button disabled className="text-gray-400 font-bold cursor-not-allowed">
                        Download Relatório (Em breve)
                    </button>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
    return (
        <div className={`p-6 rounded-xl shadow-sm border ${color}`}>
            <h3 className="text-sm font-bold uppercase opacity-80">{title}</h3>
            <p className="text-4xl font-black">{value}</p>
        </div>
    );
}