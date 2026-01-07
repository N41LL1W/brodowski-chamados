"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Link from 'next/link';

export default function UsersListPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUsers() {
            try {
                const res = await fetch('/api/admin/users');
                const data = await res.json();
                setUsers(data);
            } catch (err) {
                console.error("Erro ao carregar usuários", err);
            } finally {
                setLoading(false);
            }
        }
        loadUsers();
    }, []);

    // Função para excluir usuário
    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover o acesso de ${name}?`)) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            
            if (res.ok) {
                setUsers(users.filter(user => user.id !== id));
                alert("Usuário removido com sucesso!");
            } else {
                const msg = await res.text();
                alert(`Erro: ${msg}`);
            }
        } catch (error) {
            alert("Erro ao tentar excluir usuário.");
        }
    };

    // Função auxiliar para cores das badges de Role
    const getRoleStyle = (role: string) => {
        switch (role) {
            case 'MASTER': return 'bg-red-100 text-red-700 border-red-200';
            case 'CONTROLADOR': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'TECNICO': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64 text-gray-500 animate-pulse">
            Carregando lista de usuários...
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Equipe Cadastrada</h1>
                    <p className="text-gray-500 text-sm">Gerencie os níveis de acesso dos funcionários.</p>
                </div>
                <Link 
                    href="/controlador/users/add" 
                    className="hover: text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-md active:scale-95"
                >
                    + Novo Usuário
                </Link>
            </header>

            <div className="grid gap-4">
                {users.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed">
                        <p className="text-gray-400">Nenhum usuário encontrado.</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <Card key={user.id} className="p-5 flex justify-between items-center hover:shadow-lg transition-shadow border border-gray-100">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-lg">{user.name}</span>
                                <span className="text-sm text-gray-500">{user.email}</span>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <span className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border ${getRoleStyle(user.role)}`}>
                                    {user.role}
                                </span>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => handleDelete(user.id, user.name)}
                                        className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-md transition-colors"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}