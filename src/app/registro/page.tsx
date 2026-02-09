"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { UserPlus, ArrowRight, ShieldCheck } from 'lucide-react';

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
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <Card className="w-full max-w-md p-10 shadow-[0_32px_64px_-15px_rgba(0,0,0,0.1)] rounded-[3rem] border-none">
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200">
                        <UserPlus size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Criar Conta</h1>
                    <p className="text-slate-500 font-medium mt-2">Inicie seu acesso ao sistema de suporte.</p>
                </div>

                {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 text-sm font-bold rounded-2xl border border-emerald-100 animate-bounce">{success}</div>}
                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm font-bold rounded-2xl border border-red-100">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Nome Completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                            placeholder="Ex: João Silva"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">E-mail Corporativo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                            placeholder="email@empresa.com"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-4">Senha de Acesso</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-blue-500 focus:bg-white transition-all outline-none font-bold"
                            placeholder="••••••••"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <button type="submit" 
                        className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50"
                        disabled={isLoading}>
                        {isLoading ? 'Processando...' : (
                            <>Cadastrar Sistema <ArrowRight size={20}/></>
                        )}
                    </button>
                </form>

                <div className="text-center mt-8 pt-8 border-t border-slate-100">
                    <Link href="/login" className="text-sm font-bold text-slate-400 hover:text-blue-600 transition-colors">
                        Já possui uma credencial? <span className="text-blue-600 underline">Fazer Login</span>
                    </Link>
                </div>
            </Card>
        </div>
    );
}