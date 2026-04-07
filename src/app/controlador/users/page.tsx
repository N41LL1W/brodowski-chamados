"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { UserPlus, Trash2, Shield, Mail, ArrowRight } from 'lucide-react';

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
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Revogar acesso de ${name.toUpperCase()}?`)) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) setUsers(prev => prev.filter(u => u.id !== id));
      else alert("Erro ao excluir usuário.");
    } catch {
      alert("Falha de comunicação.");
    }
  };

  const getRoleStyle = (role: string) => {
    const roles: Record<string, string> = {
      MASTER: 'bg-rose-50 text-rose-600 border-rose-100',
      CONTROLADOR: 'bg-indigo-50 text-indigo-600 border-indigo-100',
      TECNICO: 'bg-sky-50 text-sky-600 border-sky-100',
    };
    return roles[role] || 'bg-slate-50 text-slate-600 border-slate-100';
  };

  if (loading) return (
    <div className="flex flex-col justify-center items-center h-[70vh] gap-4">
      <div className="w-12 h-1 bg-slate-200 overflow-hidden rounded-full">
        <div className="w-1/2 h-full bg-blue-600 animate-infinite-scroll"></div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sincronizando Equipe...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-slate-900 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="text-blue-600" size={20} />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Security & Access</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase leading-[0.8]">Equipe<br/>Cadastrada</h1>
        </div>
        <Link 
          href="/controlador/users/add" 
          className="bg-blue-600 hover:bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl hover:-translate-y-1 flex items-center gap-3 text-xs"
        >
          <UserPlus size={18} /> Novo Usuário
        </Link>
      </header>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-6 flex flex-col sm:flex-row justify-between items-center hover:border-blue-200 transition-all border-2 border-slate-100 bg-white group">
            <div className="flex items-center gap-5 w-full">
              <div className="h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 text-lg uppercase tracking-tight">{user.name}</span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-tighter italic">
                  <Mail size={12} /> {user.email}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between w-full sm:w-auto gap-8 mt-4 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-slate-50">
              <span className={`text-[9px] uppercase tracking-[0.2em] font-black px-4 py-1.5 rounded-full border-2 ${getRoleStyle(user.role)}`}>
                {user.role}
              </span>
              
              <button 
                onClick={() => handleDelete(user.id, user.name)}
                className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}