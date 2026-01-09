"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import { Send, AlertCircle } from "lucide-react";

export default function NovoChamadoPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState('normal');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, description, priority }),
            });

            if (res.ok) {
                // Redireciona para onde o usuário vê os chamados dele
                router.push('/'); 
                router.refresh();
            } else {
                alert("Erro ao criar chamado. Verifique se você está logado.");
            }
        } catch (error) {
            console.error(error);
            alert("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Abrir Chamado</h1>
                <p className="text-gray-500">Descreva o problema e nossa equipe técnica irá ajudar.</p>
            </header>

            <Card className="p-6 shadow-md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Título do Problema</label>
                        <input 
                            type="text" 
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Ex: Impressora não liga"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Descrição Detalhada</label>
                        <textarea 
                            className="w-full p-3 border rounded-lg h-32 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            placeholder="Descreva o que está acontecendo..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Prioridade</label>
                        <select 
                            className="w-full p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <option value="low">Baixa</option>
                            <option value="normal">Normal</option>
                            <option value="high">Alta</option>
                            <option value="urgent">Urgente</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className={`w-full flex items-center justify-center gap-2 p-4 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <Send className="w-5 h-5" />
                        {loading ? 'Enviando...' : 'Enviar Chamado'}
                    </button>
                </form>
            </Card>
        </div>
    );
}