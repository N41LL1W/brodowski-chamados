// src/app/controlador/page.tsx

import prisma from "@/lib/prisma";
import TicketCard from "@/components/TicketCard";
import Link from "next/link";
import Card from "@/components/ui/Card";
import { SerializedTicket } from "@/types/ticket"; // Importando o tipo que criamos acima

// Componente de métricas para deixar o código limpo
async function MetricsSection() {
    const totalTickets = await prisma.ticket.count();
    const openTickets = await prisma.ticket.count({ where: { status: "open" } });

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
                <p className="text-sm opacity-70">Total de Chamados</p>
                <p className="text-4xl font-extrabold mt-1">{totalTickets}</p>
            </Card>
            <Card>
                <p className="text-sm opacity-70">Chamados Abertos</p>
                <p className="text-4xl font-extrabold mt-1 text-green-600 dark:text-green-400">{openTickets}</p>
            </Card>
            <Card>
                <p className="text-sm opacity-70">Administração</p>
                <Link 
                    href="/controlador/users/add" 
                    className="text-lg font-semibold mt-2 text-blue-600 hover:underline block"
                >
                    + Criar Novo Usuário
                </Link>
            </Card>
        </div>
    );
}

export default async function ControladorPage() {
    // Busca os últimos 5 tickets
    const tickets = await prisma.ticket.findMany({ 
        orderBy: { createdAt: "desc" }, 
        take: 5 
    });

    // Converte a data de 'Date' para 'string' para o TicketCard não reclamar
    const serializedTickets: SerializedTicket[] = tickets.map(t => ({
        ...t,
        createdAt: t.createdAt.toISOString(),
    })) as SerializedTicket[];

    return (
        <div className="container py-10 space-y-10">
            <header>
                <h1 className="text-4xl font-extrabold">📊 Painel de Controle</h1>
                <p className="opacity-80">Gestão de equipe e indicadores de TI.</p>
            </header>

            <MetricsSection />

            <div>
                <h2 className="text-2xl font-bold mb-4">Chamados Recentes</h2>
                <div className="grid gap-4">
                    {serializedTickets.length > 0 ? (
                        serializedTickets.map((t) => (
                            <TicketCard key={t.id} ticket={t} />
                        ))
                    ) : (
                        <p className="opacity-70 text-center py-10 border rounded-lg">
                            Nenhum chamado encontrado.
                        </p>
                    )}
                </div>
                
                <div className="mt-8 flex gap-4">
                    <Link href="/tecnico" className="text-blue-600 hover:underline font-medium">
                        Ver todos os chamados →
                    </Link>
                </div>
            </div>
        </div>
    );
}