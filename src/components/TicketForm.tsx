// src/components/TicketForm.tsx
"use client";
import { useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function TicketForm({ initial }: { initial?: { title?: string; description?: string; requester?: string; priority?: string; status?: string } }) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [requester, setRequester] = useState(initial?.requester ?? "");
  const [priority, setPriority] = useState(initial?.priority ?? "normal");
  const [status, setStatus] = useState(initial?.status ?? "open");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string| null>(null);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post("/api/tickets", { title, description, requester, priority, status });
      if (res.status === 201) {
        // redirect to ticket page
        router.push(`/tickets/${res.data.id}`);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error ?? "Erro ao criar");
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={handleCreate} className="bg-white p-4 rounded shadow space-y-3">
      <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Título" className="w-full border p-2 rounded" required />
      <textarea value={description} onChange={(e)=>setDescription(e.target.value)} placeholder="Descrição" className="w-full border p-2 rounded" required />
      <input value={requester} onChange={(e)=>setRequester(e.target.value)} placeholder="Solicitante" className="w-full border p-2 rounded" required />
      <div className="flex gap-2">
        <select value={priority} onChange={e=>setPriority(e.target.value)} className="border p-2 rounded">
          <option value="low">Baixa</option>
          <option value="normal">Normal</option>
          <option value="high">Alta</option>
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value)} className="border p-2 rounded">
          <option value="open">Aberto</option>
          <option value="in_progress">Em andamento</option>
          <option value="closed">Fechado</option>
        </select>
      </div>

      {error && <div className="text-red-600">{error}</div>}

      <div className="flex gap-2">
        <button type="submit" disabled={loading} className="bg-blue-600 text-white px-4 py-2 rounded">
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </form>
  );
}
