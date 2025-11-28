"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function TicketForm({ initial }: any) {
  const router = useRouter();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [requester, setRequester] = useState(initial?.requester ?? "");
  const [priority, setPriority] = useState(initial?.priority ?? "normal");
  const [status, setStatus] = useState(initial?.status ?? "open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await axios.post("/api/tickets", {
        title, description, requester, priority, status
      });

      router.push(`/tickets/${res.data.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Erro ao salvar");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full border p-2 rounded bg-[var(--surface)] text-[var(--text)] " +
    "border-gray-300 dark:border-gray-700 transition-colors";

  return (
    <form
      onSubmit={handleCreate}
      className="p-4 rounded shadow border 
                 bg-var(--surface) text-var(--text)
                 border-gray-300 dark:border-gray-700
                 space-y-3 transition-colors"
    >
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título" className={inputClass} />

      <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Descrição" className={`${inputClass} min-h-[100px]`} />

      <input value={requester} onChange={(e)=>setRequester(e.target.value)} placeholder="Solicitante" className={inputClass} />

      <div className="flex gap-2">
        <select value={priority} onChange={e=>setPriority(e.target.value)} className={inputClass}>
          <option value="low">Baixa</option>
          <option value="normal">Normal</option>
          <option value="high">Alta</option>
        </select>

        <select value={status} onChange={e=>setStatus(e.target.value)} className={inputClass}>
          <option value="open">Aberto</option>
          <option value="in_progress">Em andamento</option>
          <option value="closed">Fechado</option>
        </select>
      </div>

      {error && <div className="text-red-500">{error}</div>}

      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        {loading ? "Salvando..." : "Salvar"}
      </button>
    </form>
  );
}
