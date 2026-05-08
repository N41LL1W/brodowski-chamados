export const dynamic = "force-dynamic";
import Link from "next/link";
import DashboardBI from "@/components/controlador/DashboardBI";
import ExportarRelatorio from "@/components/controlador/ExportarRelatorio";

export default function ControladorPage() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-[1600px] mx-auto p-4 md:p-6 space-y-6">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted">
                                Monitoramento em tempo real
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-foreground leading-none">
                            Painel de <span className="text-primary italic">Gestão</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <ExportarRelatorio/>
                        <Link
                            href="/controlador/chamados"
                            className="flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-2xl text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all"
                        >
                            Ver todos os tickets
                        </Link>
                    </div>
                </header>
                <DashboardBI/>
            </div>
        </div>
    );
}