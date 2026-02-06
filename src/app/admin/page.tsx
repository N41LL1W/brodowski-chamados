export const dynamic = "force-dynamic";
import prisma from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, Database, Settings } from "lucide-react";

export default async function AdminPage() {
    // Teste de conexão
    await prisma.$executeRaw`SELECT 1`;

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <header>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                    <ShieldCheck className="text-red-600 w-8 h-8" /> 
                    <span className="text-foreground">Painel Administrativo MASTER</span>
                </h1>
                <p className="text-text-secondary mt-2">Gerenciamento crítico do sistema Brodowski.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Usando a classe centralizada card-base */}
                <div className="card-base space-y-4">
                    <Database className="w-8 h-8 text-blue-600" />
                    <div>
                        <h3 className="font-bold text-lg text-primary">Banco de Dados</h3>
                        <p className="text-sm text-text-secondary">Conectado ao Neon PostgreSQL</p>
                    </div>
                    <button className="w-full py-2 bg-secondary text-primary rounded-lg text-sm font-semibold hover:brightness-95">
                        Ver Logs
                    </button>
                </div>

                <div className="card-base space-y-4">
                    <Settings className="w-8 h-8 text-text-secondary" />
                    <div>
                        <h3 className="font-bold text-lg">Configurações</h3>
                        <p className="text-sm text-text-secondary">Categorias, Departamentos e SLA.</p>
                    </div>
                    <Link href="/admin/config" className="block w-full text-center py-2 bg-primary text-white rounded-lg text-sm font-semibold">
                        Acessar Ajustes
                    </Link>
                </div>
            </div>
        </div>
    );
}