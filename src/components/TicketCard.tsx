"use client";
import Link from "next/link";
import { Ticket } from "@/types/ticket";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <article className="p-4 rounded shadow border 
                       bg-var(--surface) text-var(--text)
                       border-gray-300 dark:border-gray-700 transition-colors">
      <div className="flex justify-between items-start">
        <Link
          href={`/tickets/${ticket.id}`}
          className="font-bold text-lg hover:underline"
        >
          {ticket.title}
        </Link>
        <div className="text-xs opacity-70">
          {new Date(ticket.createdAt).toLocaleString()}
        </div>
      </div>

      <p className="mt-2 opacity-80">{ticket.description}</p>

      <div className="mt-3 flex items-center gap-3 text-sm opacity-70">
        <span
          className={`px-2 py-1 rounded-full 
            ${ticket.status === "open"
              ? "bg-green-200 text-green-900 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-200 text-gray-900 dark:bg-gray-800 dark:text-gray-300"
            }`}
        >
          {ticket.status}
        </span>

        <span>Prioridade: {ticket.priority}</span>
        <span>Solicitante: {ticket.requester}</span>
      </div>
    </article>
  );
}
