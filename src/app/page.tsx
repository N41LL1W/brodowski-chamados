//src/app/page.tsx

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { PlusCircle, ListChecks } from "lucide-react";

export default async function Home() {
    const session = await getServerSession(authOptions);

    return (
        <main className="max-w-7xl mx-auto py-20 px-6 text-center">
            <h1 className="text-6xl font-black tracking-tighter mb-4">
                SUPORTE <span className="text-primary">TI BRODOWSKI</span>
            </h1>
            <p className="text-muted mb-12 text-xl font-medium italic">
                Olá {session?.user?.name}, como podemos ajudar hoje?
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <Link href="/chamados/novo" 
                    className="p-10 bg-primary text-white rounded-[3rem] font-bold hover:scale-105 transition-all shadow-2xl shadow-blue-500/20 flex flex-col items-center gap-4">
                    <PlusCircle size={40} />
                    ABRIR NOVO CHAMADO
                </Link>
                
                <Link href="/meus-chamados" 
                    className="p-10 bg-card border-2 border-border rounded-[3rem] font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-xl flex flex-col items-center gap-4 text-foreground">
                    <ListChecks size={40} className="text-primary" />
                    MEUS CHAMADOS
                </Link>
            </div>
        </main>
    );
}