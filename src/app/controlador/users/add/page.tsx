"use client";

import { useState } from 'react';
import Card from '@/components/ui/Card'; 
import { ArrowLeft, UserCheck } from 'lucide-react';
import Link from 'next/link';

const ROLES = ['FUNCIONARIO', 'TECNICO', 'CONTROLADOR', 'MASTER'];

export default function AddUserPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'FUNCIONARIO' });
    const [isLoading, setIsLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/admin/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Erro ao criar usuário');
            }

            setStatus({ type: 'success', msg: `Usuário ${formData.name} criado com sucesso!` });
            setFormData({ name: '', email: '', password: '', role: 'FUNCIONARIO' });
        } catch (err: any) {
            setStatus({ type: 'error', msg: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-lg mb-6 text-left">
                <Link href="/controlador/users" className="text-sm text-gray-500 hover:text-blue-600 flex items-center gap-1">
                    <ArrowLeft size={16} /> Voltar para lista
                </Link>
            </div>

            <Card className="w-full max-w-lg p-8 shadow-xl bg-white">
                <div className="flex justify-center mb-6">
                    <div className="bg-blue-100 p-3 rounded-full">
                        <UserCheck className="text-blue-600" size={32} />
                    </div>
                </div>
                
                <h1 className="text-2xl font-black text-center text-gray-800 mb-8 uppercase tracking-tight">Novo Acesso</h1>

                {status && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium border ${
                        status.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                        {status.msg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Nome Completo</label>
                        <input 
                            type="text" 
                            value={formData.name} 
                            onChange={(e) => setFormData({...formData, name: e.target.value})} 
                            required 
                            disabled={isLoading}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Email Institucional</label>
                        <input 
                            type="email" 
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})} 
                            required 
                            disabled={isLoading}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Senha Provisória</label>
                        <input 
                            type="password" 
                            value={formData.password} 
                            onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            required 
                            disabled={isLoading}
                            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-1 ml-1">Nível de Permissão</label>
                        <select 
                            value={formData.role} 
                            onChange={(e) => setFormData({...formData, role: e.target.value})} 
                            disabled={isLoading}
                            className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer font-bold text-gray-700"
                        >
                            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-slate-900 text-white p-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95 disabled:opacity-50 mt-4"
                    >
                        {isLoading ? 'PROCESSANDO...' : 'CRIAR ACESSO'}
                    </button>
                </form>
            </Card>
        </div>
    );
}