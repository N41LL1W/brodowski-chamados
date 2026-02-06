"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { UserPlus, Trash2, Shield } from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
}

export default function UsersListPage() {
    const [users, setUsers] = useState<User[]>([]);
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

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Tem certeza que deseja remover o acesso de ${name}?`)) return;

        try {
            const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(users.filter(user => user.id !== id));
            } else {
                const msg = await res.text();
                alert(`Erro: ${msg}`);
            }
        } catch (error) {
            alert("Erro ao tentar excluir usuário.");
        }
    };

    const getRoleStyle = (role: string) => {
        switch (role) {
            case 'MASTER': return 'bg-red-100 text-red-700 border-red-200';
            case 'CONTROLADOR': return 'bg-purple-100 text-purple-700 border-purple-200';
            case 'TECNICO': return 'bg-blue-100 text-blue-700 border-blue-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-64 text-gray-500 animate-pulse font-medium">
            Carregando equipe de Brodowski...
        </div>
    );

    return (
        <div className="p-8 max-w-5xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <Shield className="text-blue-600" /> Equipe Cadastrada
                    </h1>
                    <p className="text-gray-500 text-sm">Gerencie os níveis de acesso dos funcionários do sistema.</p>
                </div>
                <Link 
                    href="/controlador/users/add" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-all shadow-md flex items-center gap-2"
                >
                    <UserPlus size={18} /> Novo Usuário
                </Link>
            </header>

            <div className="grid gap-4">
                {users.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <p className="text-gray-400">Nenhum usuário encontrado no sistema.</p>
                    </div>
                ) : (
                    users.map((user) => (
                        <Card key={user.id} className="p-5 flex justify-between items-center hover:shadow-md transition-all border border-gray-100 bg-white">
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-lg">{user.name}</span>
                                <span className="text-sm text-gray-500">{user.email}</span>
                            </div>
                            
                            <div className="flex items-center gap-6">
                                <span className={`text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full border ${getRoleStyle(user.role)}`}>
                                    {user.role}
                                </span>
                                
                                <button 
                                    onClick={() => handleDelete(user.id, user.name)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors group"
                                    title="Excluir Usuário"
                                >
                                    <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}