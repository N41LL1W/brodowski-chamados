export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, Users, Building2, LayoutGrid, Settings, FileText } from "lucide-react";
import Card from "@/components/ui/Card";

export default async function AdminPage() {
    const [userCount, deptCount, ticketCount, categoryCount] = await Promise.all([
        prisma.user.count(),
        prisma.department.count(),
        prisma.ticket.count(),
        prisma.category.count(),
    ]);

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-10">

            {/* HEADER */}
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 bg-red-600 rounded-2xl text-white shadow-lg shadow-red-500/20">
                            <ShieldCheck size={22}/>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted">
                            Acesso restrito
                        </span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">
                        Sistema <span className="text-red-600">Master</span>
                    </h1>
                    <p className="text-muted text-sm font-medium mt-1">
                        Gestão de infraestrutura e governança
                    </p>
                </div>
                <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-2xl">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>
                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">Database Online</span>
                </div>
            </header>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon={<Users size={18}/>}      label="Usuários"    value={userCount}    color="text-blue-600"   bg="bg-blue-500/10"/>
                <StatCard icon={<Building2 size={18}/>}  label="Secretarias" value={deptCount}    color="text-emerald-600" bg="bg-emerald-500/10"/>
                <StatCard icon={<LayoutGrid size={18}/>} label="Chamados"    value={ticketCount}  color="text-purple-600"  bg="bg-purple-500/10"/>
                <StatCard icon={<FileText size={18}/>}   label="Categorias"  value={categoryCount} color="text-amber-600"  bg="bg-amber-500/10"/>
            </div>

            {/* MENU DE ACESSO */}
            <div className="grid md:grid-cols-2 gap-5">
                <MenuCard
                    href="/admin/config"
                    icon={<Settings size={28}/>}
                    title="Configurações"
                    description="SLA, personalização, categorias, secretarias, permissões e controle de registro"
                    color="bg-slate-900 text-white hover:bg-slate-800"
                />
                <MenuCard
                    href="/controlador"
                    icon={<LayoutGrid size={28}/>}
                    title="Dashboard"
                    description="Visualize métricas, logs e o desempenho geral do sistema de chamados"
                    color="bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20"
                />
                <MenuCard
                    href="/meus-chamados"
                    icon={<FileText size={28}/>}
                    title="Meus Chamados"
                    description="Veja e gerencie os chamados abertos pela sua conta"
                    color="bg-card border border-border text-foreground hover:bg-background"
                />
                <MenuCard
                    href="/chamados/novo"
                    icon={<ShieldCheck size={28}/>}
                    title="Abrir Chamado"
                    description="Crie um novo chamado de suporte diretamente pelo painel master"
                    color="bg-card border border-border text-foreground hover:bg-background"
                />
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, color, bg }: any) {
    return (
        <Card className="p-5 border border-border bg-card shadow-sm">
            <div className={`${bg} ${color} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <p className="text-3xl font-black tracking-tighter text-foreground">{value}</p>
            <p className="text-[10px] font-black uppercase text-muted tracking-widest">{label}</p>
        </Card>
    );
}

function MenuCard({ href, icon, title, description, color }: any) {
    return (
        <Link href={href}>
            <div className={`p-6 rounded-3xl transition-all cursor-pointer group ${color}`}>
                <div className="mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                    {icon}
                </div>
                <h3 className="font-black uppercase text-sm tracking-tight mb-1">{title}</h3>
                <p className="text-[11px] opacity-70 font-medium leading-relaxed">{description}</p>
            </div>
        </Link>
    );
}