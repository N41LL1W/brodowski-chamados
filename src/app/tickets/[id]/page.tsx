import { Ticket } from "@/types/ticket";

async function getTicket(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/tickets/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Erro ao buscar ticket");

  return res.json();
}

export default async function TicketDetails({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const ticket = await getTicket(id);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">{ticket.title}</h1>
      <p>{ticket.description}</p>

      <span className="text-xs text-gray-500 block mt-3">
        Criado em: {new Date(ticket.createdAt).toLocaleString()}
      </span>
    </div>
  );
}
