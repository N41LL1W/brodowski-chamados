import TicketCard from "@/components/TicketCard";

async function getTickets() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets`, {
    cache: "no-store",
  });
  return res.json();
}

export default async function TicketsPage() {
  const tickets = await getTickets();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Chamados</h1>

      <div className="grid gap-4">
        {tickets.map((t: any) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  );
}
