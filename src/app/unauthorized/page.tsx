//src\app\unauthorized\page.tsx

import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-center p-6">
            <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-[2.5rem] mb-8">
                <ShieldAlert size={80} className="text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter uppercase">
                Acesso Negado
            </h1>
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-lg font-medium italic">
                Você não possui o nível de permissão necessário para acessar esta página restrita.
            </p>
            <div className="flex flex-col md:flex-row gap-4">
                <Link href="/" className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95">
                    Página Inicial
                </Link>
                <Link href="/login" className="px-10 py-4 bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-slate-200 dark:border-slate-700 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all active:scale-95">
                    Tentar Login
                </Link>
            </div>
        </div>
    );
}