export const dynamic = "force-dynamic";

import TicketCard from "@/components/TicketCard";
import prisma from "@/lib/prisma";

export default async function MeusChamadosPage() {
  const tickets = await prisma.ticket.findMany({ 
    orderBy: { createdAt: "desc" },
    include: { user: true } // Inclui o usuário para não dar erro no TicketCard
  });

  const serialized = tickets.map(t => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return (
    <div className="container mx-auto mt-8 px-4">
      <h1 className="text-2xl font-bold mb-4">Meus Chamados</h1>
      {serialized.length === 0 ? (
        <p className="text-gray-500">Nenhum chamado encontrado.</p>
      ) : (
        <div className="grid gap-4">
          {serialized.map((t: any) => (
            <TicketCard key={t.id} ticket={t} />
          ))}
        </div>
      )}
    </div>
  );
}