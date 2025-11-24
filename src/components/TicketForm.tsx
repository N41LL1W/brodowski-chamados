"use client";

import { useState } from "react";
import axios from "axios";
import { Ticket } from "../types/ticket";

export default function TicketForm({ onCreated }: { onCreated?: (t: Ticket) => void }) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [requester, setRequester] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await axios.post("/api/tickets", {
        title,
        message,
        requester,
      });

      if (res.status === 201 && onCreated) onCreated(res.data);

      setTitle("");
      setMessage("");
      setRequester("");
    } catch (err: any) {
      console.error("Failed to create ticket:", err?.response?.data ?? err.message ?? err);
      alert("Erro ao criar chamado: " + (err?.response?.data?.error ?? err.message ?? "Servidor retornou erro."));
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-black rounded shadow space-y-3">
      <h2 className="text-lg font-semibold">Abrir Chamado</h2>

      <input
        className="w-full border p-2 rounded"
        placeholder="Título do chamado"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        className="w-full border p-2 rounded"
        placeholder="Descrição do problema"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        required
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Identificação do solicitante"
        value={requester}
        onChange={(e) => setRequester(e.target.value)}
        required
      />

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Enviar
      </button>
    </form>
  );
}
