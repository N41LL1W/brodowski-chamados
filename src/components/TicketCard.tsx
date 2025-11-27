// src/components/TicketCard.tsx
"use client";
import Link from "next/link";
import { Ticket } from "@/types/ticket";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <article className="p-4 bg-white rounded shadow border">
      <div className="flex justify-between items-start">
        <Link href={`/tickets/${ticket.id}`} className="font-bold text-lg hover:underline">
          {ticket.title}
        </Link>
        <div className="text-xs text-gray-500">{new Date(ticket.createdAt).toLocaleString()}</div>
      </div>

      <p className="text-gray-700 mt-2 line-clamp-3">{ticket.description}</p>

      <div className="mt-3 flex items-center gap-3 text-sm text-gray-600">
        <span className={`px-2 py-1 rounded-full ${ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{ticket.status}</span>
        <span>Prioridade: {ticket.priority}</span>
        <span>Solicitante: {ticket.requester}</span>
      </div>
    </article>
  );
}
