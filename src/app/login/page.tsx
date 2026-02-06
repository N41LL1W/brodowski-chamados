"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { LogIn } from 'lucide-react';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            window.location.href = "/";
        }
    }, [status]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            const result = await signIn('credentials', {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                setError('As credenciais informadas não coincidem com nossos registros.');
                setIsLoading(false);
            } else if (result?.ok) {
                window.location.href = "/";
            }
        } catch (err) {
            setError('Falha na comunicação com o servidor.');
            setIsLoading(false);
        }
    };

    if (status === "loading") return <div className="flex justify-center items-center min-h-screen font-bold text-slate-400">Verificando sessão...</div>;

    return (
        <div className="flex justify-center items-center min-h-[90vh] bg-gray-50 p-4">
            <Card className="w-full max-w-md p-10 shadow-2xl border-none bg-white rounded-3xl">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg mb-4">
                        <LogIn size={32} />
                    </div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">Brodowski</h1>
                    <p className="text-gray-400 font-medium text-sm">Sistema Central de Chamados</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-xl mb-6 text-xs font-bold italic">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">E-mail Corporativo</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                            placeholder="seu@email.com"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase mb-2 ml-1 tracking-widest">Senha de Acesso</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-4 border border-gray-100 rounded-2xl bg-gray-50 focus:ring-4 focus:ring-blue-100 outline-none transition-all font-medium"
                            placeholder="••••••••"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <Button 
                        type="submit" 
                        className="w-full py-7 text-sm font-black uppercase tracking-widest bg-slate-900 hover:bg-blue-600 shadow-xl"
                        disabled={isLoading}
                    >
                        {isLoading ? 'CARREGANDO...' : 'ACESSAR PAINEL'}
                    </Button>
                </form>

                <div className="text-center mt-10">
                    <Link href="/registro" className="text-xs text-blue-600 hover:underline font-bold uppercase tracking-widest">
                        Criar conta institucional
                    </Link>
                </div>
            </Card>
        </div>
    );
}