"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Plus, Users, Settings2, Shield } from 'lucide-react';

// Definição de interface para evitar o erro de "type never"
interface Option {
    id: number | string;
    name: string;
    rank?: number;
}

export default function ConfigPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<Option[]>([]);
    const [levels, setLevels] = useState<Option[]>([]);
    const [newOption, setNewOption] = useState({ name: '', type: 'role', rank: 1 });
    const [loading, setLoading] = useState(false);

    const loadData = async () => {
        try {
            const [uRes, oRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/config/options')
            ]);
            setUsers(await uRes.json());
            const options = await oRes.json();
            setRoles(options.roles || []);
            setLevels(options.levels || []);
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
        }
    };

    useEffect(() => { loadData(); }, []);

    const addOption = async () => {
        if (!newOption.name) return alert("Digite um nome");
        await fetch('/api/config/options', {
            method: 'POST',
            body: JSON.stringify(newOption)
        });
        setNewOption({ ...newOption, name: '' });
        loadData();
    };

    const updateUser = async (userId: string, data: any) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                loadData();
            } else {
                alert("Erro ao salvar alteração");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            <h1 className="text-3xl font-black border-b pb-4">Painel de Controle Master</h1>

            <section className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield size={20}/> Adicionar Role/Nível</h2>
                    <div className="space-y-4">
                        <input 
                            className="w-full p-2 border rounded text-black" 
                            placeholder="Nome (ex: Estagiário)" 
                            value={newOption.name}
                            onChange={e => setNewOption({...newOption, name: e.target.value})}
                        />
                        <select 
                            className="w-full p-2 border rounded text-black"
                            value={newOption.type}
                            onChange={e => setNewOption({...newOption, type: e.target.value})}
                        >
                            <option value="role">Role (Cargo)</option>
                            <option value="level">Level (Técnico)</option>
                        </select>
                        <button onClick={addOption} className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded font-bold flex items-center justify-center gap-2 transition-colors">
                            <Plus size={18}/> Salvar Opção
                        </button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings2 size={20}/> Opções Ativas</h2>
                    <div className="flex flex-wrap gap-2">
                        {roles.map((r) => <Badge key={r.id} variant="status" value="aberto">{r.name}</Badge>)}
                        {levels.map((l) => <Badge key={l.id} variant="priority" value="normal">{l.name}</Badge>)}
                    </div>
                </Card>
            </section>

            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users size={20}/> Usuários do Sistema</h2>
                <div className="grid gap-3">
                    {users.map((user: any) => (
                        <Card key={user.id} className="p-4 flex flex-wrap justify-between items-center bg-white shadow-sm border-l-4 border-blue-500">
                            <div className="min-w-[200px]">
                                <p className="font-bold text-gray-800">{user.name || 'Sem nome'}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                                <p className="text-[10px] uppercase font-bold text-blue-600 mt-1">Atual: {user.role}</p>
                            </div>
                            
                            <div className="flex flex-wrap gap-3 items-center mt-2 md:mt-0">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Cargo</span>
                                    <select 
                                        className="text-sm p-1 border rounded bg-gray-50 text-black" 
                                        value={user.roleId || ""}
                                        onChange={(e) => {
                                            const rId = e.target.value;
                                            const rName = roles.find(r => String(r.id) === String(rId))?.name;
                                            updateUser(user.id, { roleId: rId, roleName: rName });
                                        }}
                                    >
                                        <option value="">Selecione...</option>
                                        {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-500 uppercase font-bold">Nível Técnico</span>
                                    <select 
                                        className="text-sm p-1 border rounded bg-gray-50 text-black" 
                                        value={user.levelId || ""}
                                        onChange={(e) => updateUser(user.id, { levelId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>

                                <button className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors" title="Excluir Usuário">
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
            {loading && (
                <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-full text-sm animate-pulse">
                    Salvando alterações...
                </div>
            )}
        </div>
    );
}