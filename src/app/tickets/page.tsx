import TicketCard from "@/components/TicketCard";
import prisma from "@/lib/prisma";

export default async function TicketsPage() {
  const tickets = await prisma.ticket.findMany({ orderBy: { createdAt: "desc" } });

  // converter createdAt para string para components client
  const serialized = tickets.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="container mt-8">
      <h1 className="text-2xl font-bold mb-4">Chamados</h1>
      <div className="grid gap-4">
        {serialized.map((t: any) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  );
}
