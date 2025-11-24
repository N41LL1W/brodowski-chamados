import TicketForm from "../components/TicketForm";
import TicketList from "../components/TicketList";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto py-10 space-y-6">
      <h1 className="text-3xl font-bold text-center">Sistema de Chamados - TI Brodowski</h1>

      <TicketForm />

      <hr className="my-6" />

      <TicketList />
    </main>
  );
}
