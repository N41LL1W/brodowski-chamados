"use client";

import { useState } from "react";
import axios from "axios";

export default function TicketForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requester, setRequester] = useState("");
  const [priority, setPriority] = useState("normal");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    await axios.post("/api/tickets", {
      title,
      description,
      requester,
      priority,
    });

    setTitle("");
    setDescription("");
    setRequester("");
    setPriority("normal");

    window.location.reload();
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white rounded shadow space-y-3">
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
        placeholder="Descrição"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <input
        className="w-full border p-2 rounded"
        placeholder="Solicitante"
        value={requester}
        onChange={(e) => setRequester(e.target.value)}
        required
      />

      <select
        className="w-full border p-2 rounded"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="low">Baixa</option>
        <option value="normal">Normal</option>
        <option value="high">Alta</option>
      </select>

      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Enviar
      </button>
    </form>
  );
}
