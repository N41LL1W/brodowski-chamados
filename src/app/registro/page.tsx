// src/app/registro/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button'; // Assumindo que você tem Button
import Card from '@/components/ui/Card'; // Assumindo que você tem Card
import Link from 'next/link';

// Usaremos esta página para criar os usuários iniciais
// O campo 'role' será fixo como 'FUNCIONARIO' por padrão, mas pode ser ajustado manualmente no banco se necessário.

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
        setError(null);
        setSuccess(null);
        setIsLoading(true);

        // Por enquanto, todos os usuários registrados por esta página serão FUNCIONARIOs
        const role = "FUNCIONARIO"; 
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Se o status for 409 (Conflito), usuário já existe
                const errorMessage = data.message || data || 'Erro ao registrar usuário.';
                setError(errorMessage);
            } else {
                setSuccess('Usuário registrado com sucesso! Redirecionando para o login...');
                
                // Limpa o formulário e redireciona para o login após 2 segundos
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (err) {
            setError('Erro de conexão com o servidor.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center h-full">
            <Card className="w-full max-w-md p-6 shadow-xl">
                <h1 className="text-3xl font-bold mb-6 text-center">Registrar Usuário</h1>
                
                {/* Mensagens de Feedback */}
                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                        {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-2 font-medium">Nome</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-medium">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Registrando...' : 'Registrar'}
                    </Button>
                </form>

                <div className="text-center mt-4">
                    <Link href="/login" className="text-sm text-blue-600 hover:underline">
                        Já tem uma conta? Faça Login
                    </Link>
                </div>
            </Card>
        </div>
    );
}