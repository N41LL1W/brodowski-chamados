'use client';

import useSWR from 'swr';
import axios from 'axios';
import TicketCard from './TicketCard';
import type { Ticket } from '../types/ticket';

const fetcher = (url: string) => axios.get(url).then(r => r.data);

export default function TicketListRealtime() {
  // revalidate a cada 3000ms (3s). Ajuste conforme desejar.
  const { data, error, isLoading, mutate } = useSWR<Ticket[]>('/api/tickets', fetcher, { refreshInterval: 3000 });

  if (error) return <div className="text-red-600">Erro ao carregar chamados</div>;
  if (isLoading) return <div>Carregando...</div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button className="px-3 py-1 border rounded" onClick={() => mutate()}>
          Atualizar
        </button>
      </div>

      {data && data.length === 0 && <p className="text-gray-500">Nenhum chamado.</p>}

      {data?.map(t => (
        <TicketCard key={t.id} ticket={t} />
      ))}
    </div>
  );
}
