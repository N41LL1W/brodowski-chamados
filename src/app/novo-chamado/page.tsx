import TicketForm from "@/components/TicketForm";

export default function CreateTicketPage() {
  return (
    <div className="max-w-3xl mx-auto mt-4 py-10 px-6">
      <h1 className="text-3xl font-bold mb-6">📝 Abrir Novo Chamado</h1>
      <div className="p-4 border rounded-xl shadow-lg">
        <TicketForm />
      </div>
    </div>
  );
}