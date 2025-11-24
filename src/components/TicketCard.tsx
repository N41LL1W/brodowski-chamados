import { Ticket } from "../types/ticket";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <div className="p-4 border rounded shadow-sm bg-black">
      <div className="flex justify-between">
        <h3 className="font-semibold">{ticket.title}</h3>
        <span className="text-xs text-gray-500">
          {new Date(ticket.createdAt ?? "").toLocaleString()}
        </span>
      </div>

      <p className="text-sm mt-1">{ticket.description}</p>

      <div className="text-xs text-gray-600 mt-2 space-x-2">
        <span>Status: {ticket.status}</span>
        <span>Prioridade: {ticket.priority}</span>
        <span>Solicitante: {ticket.requester}</span>
      </div>
    </div>
  );
}
