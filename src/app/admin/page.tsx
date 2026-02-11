export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, Database, Settings, Users, Building2, LayoutGrid } from "lucide-react";
import Card from "@/components/ui/Card";

export default async function AdminPage() {
    // Verificações rápidas de contagem para o dashboard
    const [userCount, deptCount, ticketCount] = await Promise.all([
        prisma.user.count(),
        prisma.department.count(),
        prisma.ticket.count()
    ]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black flex items-center gap-3 tracking-tighter">
                        <ShieldCheck className="text-red-600 w-10 h-10" /> 
                        <span className="text-slate-900 dark:text-white uppercase">SISTEMA <span className="text-red-600">MASTER</span></span>
                    </h1>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.2em] mt-1">Gestão de Infraestrutura e Governança</p>
                </div>
                <div className="flex gap-2">
                     <div className="bg-slate-100 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <p className="text-[10px] font-black text-slate-400 uppercase">Database</p>
                        <p className="text-xs font-bold text-emerald-500 flex items-center gap-1">● Online</p>
                     </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<Users size={20}/>} label="Usuários" value={userCount} color="text-blue-600" />
                <StatCard icon={<Building2 size={20}/>} label="Secretarias" value={deptCount} color="text-emerald-600" />
                <StatCard icon={<LayoutGrid size={20}/>} label="Total Chamados" value={ticketCount} color="text-purple-600" />
                <Link href="/admin/config" className="group">
                    <Card className="h-full p-6 bg-slate-900 text-white flex flex-col justify-between border-none hover:bg-slate-800 transition-all cursor-pointer">
                        <Settings className="group-hover:rotate-90 transition-transform duration-500" />
                        <div>
                            <p className="font-black uppercase text-sm italic">Configurações</p>
                            <p className="text-[10px] opacity-60 uppercase font-bold tracking-widest">Acessar Painel de Controle</p>
                        </div>
                    </Card>
                </Link>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color }: any) {
    return (
        <Card className="p-6 border-none ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm">
            <div className={`${color} mb-4`}>{icon}</div>
            <p className="text-3xl font-black tracking-tighter">{value}</p>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
        </Card>
    );
}