"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();
    const router = useRouter();

    // Se já estiver logado, redireciona automaticamente para a home
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
                redirect: false, // Mantemos false para tratar o erro aqui
                email,
                password,
            });

            if (result?.error) {
                setError('Email ou senha incorretos.');
                setIsLoading(false);
            } else if (result?.ok) {
                // Forçamos o reload completo para garantir que o Middleware reconheça a sessão
                window.location.href = "/";
            }
        } catch (err) {
            setError('Ocorreu um erro ao tentar entrar.');
            setIsLoading(false);
        }
    };

    if (status === "loading") return <div className="flex justify-center p-10">Carregando...</div>;

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <Card className="w-full max-w-md p-8 shadow-2xl border-t-4 border-blue-600">
                <h1 className="text-3xl font-bold mb-2 text-center text-gray-800">Brodowski Chamados</h1>
                <p className="text-center text-gray-500 mb-8">Entre com suas credenciais</p>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p className="font-bold">Erro</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="exemplo@brodowski.sp.gov.br"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="••••••••"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <Button type="submit" className="w-full py-6 text-lg font-bold" disabled={isLoading}>
                        {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
                    </Button>
                </form>

                <div className="text-center mt-6">
                    <Link href="/registro" className="text-blue-600 hover:text-blue-800 font-medium">
                        Criar nova conta institucional
                    </Link>
                </div>
            </Card>
        </div>
    );
}