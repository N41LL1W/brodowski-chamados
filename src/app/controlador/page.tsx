import prisma from "@/lib/prisma";
import TicketCard from "@/components/TicketCard";
import Link from "next/link";
import Card from "@/components/ui/Card";

export default async function ControladorPage() {
  const totalTickets = await prisma.ticket.count();
  const openTickets = await prisma.ticket.count({ where: { status: "open" } });

  const tickets = await prisma.ticket.findMany({ orderBy: { createdAt: "desc" }, take: 5 });

  // Preparação dos dados para o client component
  const serialized = tickets.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="container py-10 space-y-8">
      <h1 className="text-3xl font-bold ">📊 Painel de Controle Geral</h1>
      <p className="opacity-80">Visão estratégica e de desempenho da equipe de TI.</p>

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
          <p className="text-sm opacity-70">SLA em Dia (Exemplo)</p>
          <p className="text-4xl font-extrabold mt-1 text-blue-600 dark:text-blue-400">95%</p>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Últimos 5 Chamados</h2>
        <div className="grid gap-4">
          {serialized.map((t: any) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
        <Link href="/tecnico" className="mt-4 inline-block text-blue-600 hover:underline">
            Ver Todos os Chamados
        </Link>
      </div>
    </div>
  );
}