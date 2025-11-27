// src/app/tickets/page.tsx
import TicketCard from "@/components/TicketCard";
import TicketForm from "@/components/TicketForm";

async function getTickets() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/tickets`, { cache: "no-store" });
  if (!res.ok) throw new Error("Erro ao buscar");
  return res.json();
}

export default async function TicketsPage() {
  const tickets = await getTickets();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Chamados</h1>

      {/* link to create page */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tickets.map((t: any) => (<TicketCard key={t.id} ticket={t} />))}
      </div>
    </div>
  );
}
