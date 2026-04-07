"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { UserPlus, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email || !password) {
            setError("Preencha todos os campos para continuar.");
            return;
        }

        setError(null);
        setIsLoading(true);
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role: "FUNCIONARIO" }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erro ao criar conta.');
            } else {
                setSuccess('Conta criada com sucesso! Redirecionando...');
                setTimeout(() => router.push('/login'), 2000);
            }
        } catch (err) {
            setError('Falha na conexão com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-transparent">
            <Card className="w-full max-w-md p-10 bg-white dark:bg-slate-900 shadow-2xl dark:shadow-none rounded-[3rem] border-none">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200 dark:shadow-none">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-slate-900 dark:text-white">Criar Conta</h1>
                    <p className="font-medium mt-2 text-slate-500 dark:text-slate-400">Inicie seu acesso ao sistema.</p>
                </div>

                {success && <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 text-sm font-bold rounded-2xl border border-emerald-100 dark:border-emerald-800 animate-pulse">{success}</div>}
                {error && <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-sm font-bold rounded-2xl border border-red-100 dark:border-red-800">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-slate-400 dark:text-slate-500">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl transition-all outline-none font-bold text-slate-700 dark:text-slate-200 focus:border-blue-500"
                            placeholder="Ex: João Silva"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-slate-400 dark:text-slate-500">E-mail Corporativo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl transition-all outline-none font-bold text-slate-700 dark:text-slate-200 focus:border-blue-500"
                            placeholder="email@empresa.com"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase tracking-widest ml-4 text-slate-400 dark:text-slate-500">Senha de Acesso</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl transition-all outline-none font-bold text-slate-700 dark:text-slate-200 focus:border-blue-500"
                            placeholder="••••••••"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button type="submit" 
                        className="w-full p-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        disabled={isLoading}>
                        {isLoading ? 'Processando...' : <>{'Cadastrar Sistema'} <ArrowRight size={20}/></>}
                    </button>
                </form>

                <div className="text-center mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                    <Link href="/login" className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">
                        Já possui uma credencial? <span className="underline italic">Fazer Login</span>
                    </Link>
                </div>
            </Card>
        </div>
    );
}