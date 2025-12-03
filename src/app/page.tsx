import TicketForm from "../components/TicketForm";
import TicketListRealtime from "../components/TicketListRealtime";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold text-center">Sistema de Chamados - TI Brodowski</h1>

      <TicketForm />

    </main>
  );
}
