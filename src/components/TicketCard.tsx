"use client";

import Link from "next/link";
import { Ticket } from "@/types/ticket";

export default function TicketCard({ ticket }: { ticket: Ticket }) {
  return (
    <Link href={`/tickets/${ticket.id}`}>
      <div className="p-4 bg-white rounded shadow border hover:bg-gray-50 cursor-pointer transition">
        <h3 className="font-bold text-lg">{ticket.title}</h3>

        <p className="text-gray-700 mt-2 whitespace-pre-line">
          {ticket.description}
        </p>

        <span className="text-xs text-gray-500 block mt-3">
          Criado em: {new Date(ticket.createdAt).toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
