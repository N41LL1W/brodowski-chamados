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
      if ((res.status === 201 || res.status === 200) && onCreated) onCreated(res.data);
      setTitle(""); setDescription(""); setRequester(""); setPriority("normal");
    } catch (err) {
      console.error(err);
      alert("Erro ao criar chamado");
    } finally {
      setLoading(false);
    }
  }

  // Classes comuns para inputs para evitar repetição
  const inputClass = "mt-1 w-full border border-gray-300 dark:border-gray-700 rounded p-2 bg-[var(--bg)] text-[var(--text)] focus:ring-2 focus:ring-teal-500 focus:outline-none transition-colors";

  return (
    <form onSubmit={handleSubmit} className="card p-6 space-y-4">
      <h2 className="text-xl font-bold text-[var(--text)]">Abrir Chamado</h2>

      <label className="block">
        <span className="text-sm font-medium text-[var(--muted)]">Título</span>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className={inputClass}
          placeholder="Resumo do problema"
        />
      </label>

      <label className="block">
        <span className="text-sm font-medium text-[var(--muted)]">Descrição</span>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          required
          className={`${inputClass} min-h-[100px]`}
          placeholder="Descreva o problema em detalhes"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="block md:col-span-1">
          <span className="text-sm font-medium text-[var(--muted)]">Solicitante</span>
          <input 
            value={requester} 
            onChange={e => setRequester(e.target.value)} 
            className={inputClass} 
            placeholder="Nome" 
            required
          />
        </label>

        <label className="block md:col-span-1">
          <span className="text-sm font-medium text-[var(--muted)]">Prioridade</span>
          <select 
            value={priority} 
            onChange={e => setPriority(e.target.value as any)} 
            className={inputClass}
          >
            <option value="low">Baixa</option>
            <option value="normal">Normal</option>
            <option value="high">Alta</option>
          </select>
        </label>

        <div className="flex items-end md:col-span-1">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white font-bold rounded py-2 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Enviando..." : "Abrir Chamado"}
          </button>
        </div>
      </div>
    </form>
  );
}