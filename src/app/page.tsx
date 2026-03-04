import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { PlusCircle, ListChecks, LayoutDashboard } from "lucide-react";

export default async function Home() {
    const session = await getServerSession(authOptions);

    return (
        <main className="max-w-7xl mx-auto py-20 px-6 text-center">
            <h1 className="text-6xl font-black tracking-tighter mb-4">
                SUPORTE <span className="text-blue-600">TI BRODOWSKI</span>
            </h1>
            <p className="text-slate-500 mb-12 text-xl font-medium italic">
                Olá {session?.user?.name}, como podemos ajudar hoje?
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                <Link href="/chamados/novo" 
                    className="p-10 bg-blue-600 text-white rounded-[3rem] font-bold hover:scale-105 transition-all shadow-2xl shadow-blue-200 flex flex-col items-center gap-4">
                    <PlusCircle size={40} />
                    ABRIR NOVO CHAMADO
                </Link>
                <Link href="/meus-chamados" 
                    className="p-10 bg-white border-2 border-slate-100 rounded-[3rem] font-bold hover:bg-slate-50 transition-all shadow-xl flex flex-col items-center gap-4 text-slate-800">
                    <ListChecks size={40} className="text-blue-600" />
                    MEUS CHAMADOS
                </Link>

                {(session?.user as any).role !== "USER" && (
                    <Link href="/painel-tecnico" 
                        className="md:col-span-2 p-6 bg-slate-900 text-white rounded-4xl hover:bg-slate-800 transition-all flex items-center justify-center gap-3 font-bold">
                        <LayoutDashboard size={20} />
                        PAINEL TÉCNICO DE GESTÃO
                    </Link>
                )}
            </div>
        </main>
    );
}