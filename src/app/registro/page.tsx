// src/app/registro/page.tsx

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card'; // Componente Card
import Link from 'next/link';
// Nota: O Button foi substituído por uma tag <button> nativa para evitar bugs de UI.

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
        console.log("-> Tentativa de Registro Iniciada."); 
        
        // Verifica se os inputs estão preenchidos antes de tentar o fetch
        if (!name || !email || !password) {
            setError("Por favor, preencha todos os campos obrigatórios.");
            return;
        }

        setError(null);
        setSuccess(null);
        setIsLoading(true);

        const role = "FUNCIONARIO"; 
        
        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, password, role }),
            });

            // CORREÇÃO ESSENCIAL: Tenta ler a resposta JSON.
            // Se a API retornar um erro não-JSON (como no 400), o catch será acionado.
            const contentType = response.headers.get("content-type");
            const isJson = contentType && contentType.includes("application/json");
            const data = isJson ? await response.json() : await response.text();

            if (!response.ok) {
                // Trata erro de API (409, 500, etc.)
                const errorMessage = (isJson && data.message) || data || 'Erro desconhecido ao registrar usuário.';
                setError(String(errorMessage));
            } else {
                setSuccess('Usuário registrado com sucesso! Redirecionando para o login...');
                
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (err) {
            console.error('Erro de conexão ou JSON inválido:', err);
            setError('Erro de conexão com o servidor ou resposta inválida. Tente novamente.');
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
                    
                    {/* INPUT NOME */}
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
                    
                    {/* INPUT EMAIL */}
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
                    
                    {/* INPUT SENHA */}
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
                    
                    {/* BOTÃO NATIVO (PARA EVITAR BUGS DE COMPONENTE) */}
                    <button type="submit" 
                        className="w-full bg-blue-600 text-white p-3 rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
                        disabled={isLoading}>
                        {isLoading ? 'Registrando...' : 'Registrar'}
                    </button>
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