import TicketForm from "@/components/TicketForm";

export default function CreateTicketPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Criar Novo Chamado</h1>
      <TicketForm />
    </div>
  );
}
