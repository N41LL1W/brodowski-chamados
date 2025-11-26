"use client";

import { useState } from "react";
import axios from "axios";
import { Ticket } from "@/types/ticket";

export default function TicketForm({ onCreated }: { onCreated?: (t: Ticket) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requester, setRequester] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post("/api/tickets", { title, description, requester, priority });
      if (res.status === 201 && onCreated) onCreated(res.data);
      setTitle(""); setDescription(""); setRequester(""); setPriority("normal");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar chamado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-4 space-y-3">
      <h2 className="text-lg font-semibold text-slate-900">Abrir Chamado</h2>

      <label className="block">
        <span className="text-sm text-slate-700">Título</span>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="mt-1 w-full border border-gray-200 rounded p-2 bg-white text-slate-900"
          placeholder="Resumo do problema"
        />
      </label>

      <label className="block">
        <span className="text-sm text-slate-700">Descrição</span>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          className="mt-1 w-full border border-gray-200 rounded p-2 bg-white text-slate-900 placeholder:text-slate-400 min-h-[100px]"
          placeholder="Descreva o problema em detalhes"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="block md:col-span-1">
          <span className="text-sm text-slate-700">Solicitante</span>
          <input value={requester} onChange={e => setRequester(e.target.value)} className="mt-1 w-full border border-gray-200 rounded p-2 bg-white text-slate-900" placeholder="Nome" />
        </label>

        <label className="block md:col-span-1">
          <span className="text-sm text-slate-700">Prioridade</span>
          <select value={priority} onChange={e => setPriority(e.target.value as any)} className="mt-1 w-full border border-gray-200 rounded p-2 bg-white text-slate-900">
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
        </label>

        <div className="flex items-end md:col-span-1">
          <button type="submit" disabled={loading} className="w-full bg-teal-500 hover:bg-teal-600 text-white font-medium rounded p-2">
            {loading ? "Enviando..." : "Abrir Chamado"}
          </button>
        </div>
      </div>
    </form>
  );
}
