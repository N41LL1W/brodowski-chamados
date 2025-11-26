import  prisma  from "@/lib/prisma";
import { notFound } from "next/navigation";

interface TicketDetailsProps {
  params: Promise<{ id: string }>;
}

export default async function TicketDetails({ params }: TicketDetailsProps) {
  // 1. Aguardamos os parâmetros (Next.js 15+)
  const { id } = await params;

  // 2. Convertemos o ID da URL (string) para Número (Int)
  // O DB espera Int, mas a URL envia String
  const ticketId = parseInt(id, 10);

  // Se a conversão falhar (ex: usuario acessou /tickets/abc), retorna 404
  if (isNaN(ticketId)) {
    return notFound();
  }

  // 3. Chamada direta ao banco (sem fetch, sem api routes)
  const ticket = await prisma.ticket.findUnique({
    where: {
      id: ticketId,
    },
  });

  // 4. Se não existir ticket com esse ID, mostra página 404
  if (!ticket) {
    return notFound();
  }

  // 5. Renderização
  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h1 className="text-3xl font-bold text-gray-800">{ticket.title}</h1>
        <div className="flex gap-4 mt-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
                ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
                {ticket.status}
            </span>
            <span className="text-xs text-gray-500 flex items-center">
                Prioridade: {ticket.priority}
            </span>
        </div>
      </div>

      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <h2 className="text-sm font-semibold text-gray-500 mb-2">Descrição</h2>
        <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
            {ticket.description}
        </p>
      </div>

      <div className="text-xs text-gray-400 pt-4 border-t">
        <p>Solicitante: {ticket.requester}</p>
        <p>Criado em: {ticket.createdAt.toLocaleString('pt-BR')}</p>
      </div>
      <a
        href={`/tickets/${ticket.id}/edit`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded"
      >
        Editar Chamado
      </a>

    </div>
  );
}