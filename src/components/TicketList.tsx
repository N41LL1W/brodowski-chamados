"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Ticket } from "../types/ticket";
import TicketCard from "./TicketCard";

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  async function load() {
    const res = await axios.get("/api/tickets");
    setTickets(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-3">
      {tickets.length === 0 && (
        <p className="text-gray-500">Nenhum chamado aberto.</p>
      )}

      {tickets.map((t) => (
        <TicketCard key={t.id} ticket={t} />
      ))}
    </div>
  );
}
