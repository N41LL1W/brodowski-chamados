import TicketForm from "@/components/TicketForm";
import TicketCard from "@/components/TicketCard";

async function getTickets() {
  const res = await fetch("http://localhost:3000/api/tickets", {
    cache: "no-store",
  });
  return res.json();
}

export default async function TicketsPage() {
  const tickets = await getTickets();

  return (
    <div className="p-6 space-y-6">
      <TicketForm />

      <h2 className="text-xl font-bold">Chamados</h2>

      <div className="grid grid-cols-1 gap-4">
        {tickets.map((t: any) => (
          <TicketCard key={t.id} ticket={t} />
        ))}
      </div>
    </div>
  );
}
