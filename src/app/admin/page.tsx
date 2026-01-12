export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import Link from "next/link";
import { ShieldCheck, Database, Settings } from "lucide-react";

export default async function AdminPage() {
    const stats = await prisma.$queryRaw`SELECT 1`; // Teste simples de conexão

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <ShieldCheck className="text-red-600" /> Painel Administrativo MASTER
            </h1>
            <p className="text-gray-600 mb-8">Configurações críticas do sistema Brodowski Chamados.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 border rounded-xl shadow-sm space-y-4">
                    <Database className="w-8 h-8 text-blue-600" />
                    <h3 className="font-bold text-lg">Banco de Dados</h3>
                    <p className="text-sm text-gray-500">Status: Conectado ao Neon PostgreSQL</p>
                    <button className="w-full py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200">
                        Ver Logs do Sistema
                    </button>
                </div>

                <div className="p-6 border rounded-xl shadow-sm space-y-4">
                    <Settings className="w-8 h-8 text-gray-600" />
                    <h3 className="font-bold text-lg">Configurações Gerais</h3>
                    <p className="text-sm text-gray-500">Ajuste de categorias e níveis de prioridade.</p>
                    <Link href="/admin/config" className="block w-full text-center py-2 bg-gray-100 rounded-lg text-sm font-semibold hover:bg-gray-200">
                        Acessar Ajustes
                    </Link>
                </div>
            </div>
        </div>
    );
}