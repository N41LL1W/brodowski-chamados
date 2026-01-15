"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Plus, Users, Settings2, Shield } from 'lucide-react';

export default function ConfigPage() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [levels, setLevels] = useState([]);
    const [newOption, setNewOption] = useState({ name: '', type: 'role', rank: 1 });

    const loadData = async () => {
        const [uRes, oRes] = await Promise.all([
            fetch('/api/users'),
            fetch('/api/config/options')
        ]);
        setUsers(await uRes.json());
        const options = await oRes.json();
        setRoles(options.roles);
        setLevels(options.levels);
    };

    useEffect(() => { loadData(); }, []);

    const addOption = async () => {
        await fetch('/api/config/options', {
            method: 'POST',
            body: JSON.stringify(newOption)
        });
        setNewOption({ ...newOption, name: '' });
        loadData();
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            <h1 className="text-3xl font-black border-b pb-4">Painel de Controle Master</h1>

            {/* SEÇÃO 1: GERENCIAR ROLES E NÍVEIS */}
            <section className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield size={20}/> Adicionar Role/Nível</h2>
                    <div className="space-y-4">
                        <input 
                            className="w-full p-2 border rounded" 
                            placeholder="Nome (ex: Estagiário)" 
                            value={newOption.name}
                            onChange={e => setNewOption({...newOption, name: e.target.value})}
                        />
                        <select 
                            className="w-full p-2 border rounded"
                            value={newOption.type}
                            onChange={e => setNewOption({...newOption, type: e.target.value})}
                        >
                            <option value="role">Role (Cargo)</option>
                            <option value="level">Level (Técnico)</option>
                        </select>
                        <button onClick={addOption} className="w-full bg-blue-600 text-white p-2 rounded font-bold flex items-center justify-center gap-2">
                            <Plus size={18}/> Salvar Opção
                        </button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Settings2 size={20}/> Opções Ativas</h2>
                    <div className="flex flex-wrap gap-2">
                        {roles.map((r: any) => <Badge key={r.id} variant="status" value="aberto">{r.name}</Badge>)}
                        {levels.map((l: any) => <Badge key={l.id} variant="priority" value="normal">{l.name}</Badge>)}
                    </div>
                </Card>
            </section>

            {/* SEÇÃO 2: GERENCIAR USUÁRIOS */}
            <section>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Users size={20}/> Usuários do Sistema</h2>
                <div className="grid gap-3">
                    {users.map((user: any) => (
                        <Card key={user.id} className="p-4 flex justify-between items-center bg-white shadow-sm">
                            <div>
                                <p className="font-bold">{user.name}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                            <div className="flex gap-2">
                                <select className="text-sm p-1 border rounded" value={user.roleId}>
                                    {roles.map((r: any) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                </select>
                                <button className="text-red-500 p-2"><Trash2 size={16}/></button>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}