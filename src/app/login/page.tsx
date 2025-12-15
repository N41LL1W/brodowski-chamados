// src/app/login/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/Button'; // Componente Button (Tailwind/shadcn)
import Card from '@/components/ui/Card';       // Componente Card
import Link from 'next/link';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Chamada ao endpoint Credentials Provider do NextAuth
        const result = await signIn('credentials', {
            redirect: false, // Não redireciona automaticamente
            email,
            password,
        });

        setIsLoading(false);

        if (result?.error) {
            // Se o resultado contiver um erro (Ex: Credenciais inválidas)
            console.error("Erro de Login:", result.error);
            setError('Credenciais inválidas. Verifique seu email e senha.');
        } else if (result?.ok) {
            // Se o login for bem-sucedido
            router.push('/'); // Redireciona para a página inicial
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-md p-6 shadow-xl">
                <h1 className="text-3xl font-bold mb-6 text-center">Acesso ao Sistema</h1>
                
                {/* Mensagem de Erro */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block mb-2 font-medium">Email Institucional</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 font-medium">Senha</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Verificando...' : 'Entrar'}
                    </Button>
                </form>

                {/* Link para a página de Registro */}
                <div className="text-center mt-4">
                    <Link href="/registro" className="text-sm text-blue-600 hover:underline">
                        Não tem uma conta? Registre-se
                    </Link>
                </div>
            </Card>
        </div>
    );
}