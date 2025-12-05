"use client";
import Link from "next/link";
import { Ticket } from "@/types/ticket";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <article className="card">
      <div className="flex justify-between items-start">
        <Link href={`/meus-chamados/${ticket.id}`} className="font-bold text-lg hover:underline">
          {ticket.title}
        </Link>
        <div className="text-xs opacity-60">
          {new Date(ticket.createdAt).toLocaleString()}
        </div>
      </div>

      <p className="mt-2 opacity-80 line-clamp-3">{ticket.description}</p>

      <div className="mt-3 flex items-center gap-3 text-sm opacity-80">
        <span className={`px-2 py-1 rounded-full ${ticket.status === "open" ? "bg-green-200 text-green-900" : "bg-gray-200 text-gray-900"}`}>
          {ticket.status}
        </span>
        <span>Prioridade: {ticket.priority}</span>
        <span>Solicitante: {ticket.requester}</span>
      </div>
    </article>
  );
}
