import Link from "next/link";
import Card from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Wrench, ShieldCheck, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto w-full py-12 px-6 space-y-16"> 
      <section className="text-center space-y-6">
        <div className="inline-block px-4 py-1.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Prefeitura de Brodowski</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-tight">
          Gestão Inteligente <br/>de <span>Suporte TI</span>
        </h1>
        <p className="text-lg md:text-xl max-w-2xl mx-auto font-medium">
          Centralize solicitações, acompanhe atendimentos em tempo real e garanta a eficiência tecnológica de cada secretaria.
        </p>
        <div className="pt-6 flex flex-wrap justify-center gap-4">
          <Link href="/chamados/novo">
            <Button className="text-sm font-black uppercase tracking-widest px-10 py-6 rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none hover:scale-105 transition-all">
              Abrir Chamado <ArrowRight className="ml-2" size={18} />
            </Button>
          </Link>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        <HomeCard 
          icon={<User className="text-blue-500" />}
          title="Servidores"
          desc="Abra chamados técnicos e acompanhe o progresso da sua solicitação com transparência total."
          link="/meus-chamados"
          label="Acessar Meus Chamados"
        />
        <HomeCard 
          icon={<Wrench className="text-amber-500" />}
          title="Técnicos"
          desc="Gerencie sua fila de trabalho, registre atividades e solucione incidentes com agilidade."
          link="/tecnico"
          label="Painel Operacional"
        />
        <HomeCard 
          icon={<ShieldCheck className="text-emerald-500" />}
          title="Controladoria"
          desc="Fiscalize o SLA, audite registros de logs e valide a produtividade da equipe técnica."
          link="/controlador"
          label="Auditoria e KPIs"
        />
      </div>
    </div>
  );
}

function HomeCard({ icon, title, desc, link, label }: any) {
  return (
    <Card className="p-8 border-none ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col justify-between hover:shadow-2xl transition-all group">
      <div>
        <div className="mb-4 p-3 w-fit rounded-2xl group-hover:scale-110 transition-transform">
          {icon}
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-3">{title}</h2>
        <p className="text-sm font-medium leading-relaxed mb-6">
          {desc}
        </p>
      </div>
      <Link href={link}>
        <Button variant="ghost" className="w-full justify-between font-black uppercase text-[10px] tracking-widest border-2 border-slate-100 dark:border-slate-800
        ">
          {label} <ArrowRight size={14}/>
        </Button>
      </Link>
    </Card>
  );
}