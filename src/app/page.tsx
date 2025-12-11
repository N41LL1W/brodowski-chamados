// src/app/page.tsx

import Link from "next/link";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto w-full py-10 px-6 space-y-8"> 
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold ">
          Bem-vindo ao Sistema de Chamados de TI
        </h1>
        <p className="text-xl opacity-70">
          Centralize suas solicitações e acompanhe o trabalho da equipe de TI
          da Prefeitura de Brodowski.
        </p>
        <div className="pt-4">
          <Link href="/novo-chamado">
            <Button className="text-lg px-8 py-3">
              Abrir um Chamado Agora
            </Button>
          </Link>
        </div>
      </section>

      <hr className="border-t border-gray-300 dark:border-gray-700"/>

      <section className="grid md:grid-cols-3 gap-6">
        <Card>
          <h2 className="text-xl font-bold mb-3">Funcionários 🧑‍💻</h2>
          <p className="opacity-80 mb-4">
            Abra novos chamados de forma rápida e visualize o status de todas as suas solicitações.
          </p>
          <Link href="/meus-chamados">
            <Button className="w-full">Ver Meus Chamados</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-3">Técnicos 🔧</h2>
          <p className="opacity-80 mb-4">
            Visualize todos os chamados, gerencie prioridades, atualize status e responda aos solicitantes.
          </p>
          <Link href="/tecnico">
            <Button className="w-full">Painel do Técnico</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-bold mb-3">Controladoria 📊</h2>
          <p className="opacity-80 mb-4">
            Tenha uma visão estratégica, acompanhe KPIs e garanta o SLA de atendimento da TI.
          </p>
          <Link href="/controlador">
            <Button className="w-full">Painel de Controle</Button>
          </Link>
        </Card>
      </section>

    </div>
  );
}