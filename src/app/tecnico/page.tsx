import TicketListRealtime from "@/components/TicketListRealtime";

export default function TecnicoPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">🛠️ Painel do Técnico (Todos os Chamados)</h1>
      <p className="mb-6 opacity-80">Aqui você gerencia e atualiza todos os chamados da prefeitura.</p>
      <TicketListRealtime />
    </div>
  );
}