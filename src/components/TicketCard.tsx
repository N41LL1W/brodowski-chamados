"use client";

import { Ticket } from "@/types/ticket";
import Link from "next/link";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  // Função auxiliar para cores do status (suporta dark mode)
  const getStatusColor = (status: string) => {
    switch (status) {
      case "closed":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      default: // open
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
    }
  };

  return (
    <Link href={`/tickets/${ticket.id}`} className="block group">
      {/* A classe 'card' já puxa o fundo correto (var(--surface)) do seu CSS */}
      <article className="card p-4 hover:shadow-lg transition-all duration-200 border border-transparent hover:border-blue-500/30">
        <div className="flex items-start justify-between gap-4">
          
          {/* Título usando a variável de texto principal */}
          <h3 className="font-semibold text-lg text-var(--text) group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {ticket.title}
          </h3>

          <div className="text-right shrink-0">
            {/* Data usando a variável muted */}
            <div className="text-xs text-var(--muted)">
              {new Date(ticket.createdAt).toLocaleString("pt-BR")}
            </div>
            
            <div className="mt-2 flex gap-2 items-center justify-end">
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
           <p className="text-var(--muted) text-sm leading-relaxed line-clamp-2 flex-1 mr-4">
            {ticket.description}
          </p>
           <span className="text-xs text-var(--muted) whitespace-nowrap">
             Prioridade: <strong className="text-var(--text) ml-1">{ticket.priority}</strong>
           </span>
        </div>
      </article>
    </Link>
  );
}