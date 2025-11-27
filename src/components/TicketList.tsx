"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Ticket } from "../types/ticket";
import TicketCard from "./TicketCard";

export default function TicketList() {
  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Adicionamos um estado de carregamento para uma melhor UX
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await axios.get("/api/tickets");
      setTickets(res.data);
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // Exibição de carregamento
  if (loading) {
    return (
      <p className="text-(--muted) animate-pulse">
        Carregando chamados...
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {tickets.length === 0 && (
        // Aplicando a variável de texto secundário (--muted)
        <p className="text-(--muted)">
          Nenhum chamado aberto.
        </p>
      )}

      {tickets.map((t) => (
        <TicketCard key={t.id} ticket={t} />
      ))}
    </div>
  );
}