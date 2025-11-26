"use client";

import { Ticket } from "@/types/ticket";
import Link from "next/link";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link href={`/tickets/${ticket.id}`} className="block">
      <article className="card p-4 hover:shadow-md transition-shadow duration-150">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-lg text-slate-900">{ticket.title}</h3>

          <div className="text-right">
            <div className="text-xs text-slate-500">{new Date(ticket.createdAt).toLocaleString()}</div>
            <div className="mt-2 flex gap-2 items-center">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                ticket.status === "closed" ? "bg-red-100 text-red-800" :
                ticket.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                "bg-green-100 text-green-800"
              }`}>
                {ticket.status}
              </span>

              <span className="text-xs text-slate-500">Prioridade: <strong className="text-slate-700 ml-1">{ticket.priority}</strong></span>
            </div>
          </div>
        </div>

        <p className="mt-3 text-slate-700 text-sm leading-relaxed line-clamp-3">
          {ticket.description}
        </p>
      </article>
    </Link>
  );
}
