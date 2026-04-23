export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import DashboardTabs from "@/components/controlador/DashboardTabs";
import ExportarRelatorio from "@/components/controlador/ExportarRelatorio";

export default async function ControladorDashboard() {
    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 min-h-screen">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 bg-primary rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">Monitoramento de Sistema</span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tighter uppercase leading-none text-foreground">
                        Painel de <span className="text-primary italic">Gestão</span>
                    </h1>
                </div>
                <Link 
                    href="/controlador/chamados" 
                    className="bg-foreground text-background px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl"
                >
                    Ver todos os tickets
                </Link>
                <div className="flex items-center gap-3">
                    <ExportarRelatorio />
                    <Link href="/controlador/chamados" className="bg-foreground text-background px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 transition-all shadow-xl">
                        Ver todos os tickets
                    </Link>
                </div>
            </header>

            <DashboardTabs />
        </div>
    );
}