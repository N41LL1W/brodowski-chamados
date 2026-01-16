"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Plus, Users, Settings2, Shield, XCircle, UserPlus } from 'lucide-react';

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

    const deleteOption = async (id: number | string, type: 'role' | 'level') => {
        if (!confirm(`Excluir este ${type}? Isso pode afetar usuários vinculados.`)) return;
        try {
            const res = await fetch(`/api/config/options?id=${id}&type=${type}`, { method: 'DELETE' });
            if (res.ok) loadData();
            else alert("Erro ao excluir. Verifique se há usuários usando esta opção.");
        } catch (error) { alert("Erro de conexão"); }
    };

    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`CUIDADO: Deseja excluir permanentemente o usuário ${name}?`)) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) loadData();
            else {
                const err = await res.json();
                alert(err.message || "Erro ao excluir usuário");
            }
        } catch (error) { alert("Erro de rede"); }
        finally { setLoading(false); }
    };

    const updateUser = async (userId: string, data: any) => {
        setLoading(true);
        try {
            const response = await fetch(`/api/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            if (response.ok) loadData();
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-3xl font-black italic text-blue-600">Configurações do Sistema</h1>
                    <p className="text-gray-500 text-sm">Controle total de acessos, cargos e níveis técnicos.</p>
                </div>
            </div>

            <section className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Shield size={20}/> Adicionar Role/Nível</h2>
                    <div className="space-y-4">
                        <input className="w-full p-2 border rounded text-black bg-white" placeholder="Nome (ex: Estagiário)" value={newOption.name} onChange={e => setNewOption({...newOption, name: e.target.value})} />
                        <select className="w-full p-2 border rounded text-black bg-white" value={newOption.type} onChange={e => setNewOption({...newOption, type: e.target.value})}>
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
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {roles.map((r) => (
                                <div key={r.id} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200">
                                    <span className="text-xs font-bold uppercase">{r.name}</span>
                                    <button onClick={() => deleteOption(r.id, 'role')} className="hover:text-red-500 transition-colors"><XCircle size={14}/></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 border-t pt-4">
                            {levels.map((l) => (
                                <div key={l.id} className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-200">
                                    <span className="text-xs font-bold uppercase">{l.name}</span>
                                    <button onClick={() => deleteOption(l.id, 'level')} className="hover:text-red-500 transition-colors"><XCircle size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </section>

            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold flex items-center gap-2"><Users size={24}/> Gestão de Equipe</h2>
                </div>
                
                <div className="grid gap-3">
                    {users.map((user: any) => (
                        <Card key={user.id} className="p-4 flex flex-wrap justify-between items-center shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                            <div className="min-w-[250px]">
                                <p className="font-bold text-gray-900 text-lg">{user.name || 'Sem nome'}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                                <div className="flex gap-2 mt-2">
                                    {/* Removido o className para evitar erro de TS */}
                                    <Badge variant="status" value="aberto">
                                        {user.roleRelation?.name || user.role || 'Sem Cargo'}
                                    </Badge>
                                    
                                    {user.levelRelation && (
                                        <Badge variant="priority" value="normal">
                                            {user.levelRelation.name}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 items-center mt-4 md:mt-0 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-gray-400 uppercase font-black mb-1">Alterar Cargo</span>
                                    <select 
                                        className="text-sm p-1.5 border rounded text-black min-w-[140px] shadow-sm" 
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

                                <div className="flex flex-col border-l pl-4">
                                    <span className="text-[10px] text-gray-400 uppercase font-black mb-1">Nível Técnico</span>
                                    <select 
                                        className="text-sm p-1.5 border rounded text-black min-w-[140px] shadow-sm" 
                                        value={user.levelId || ""}
                                        onChange={(e) => updateUser(user.id, { levelId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>

                                <button 
                                    onClick={() => deleteUser(user.id, user.name)}
                                    className="ml-2 text-red-500 hover:bg-red-100 p-2 rounded-full transition-all" 
                                    title="Remover Usuário"
                                >
                                    <Trash2 size={20}/>
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {loading && (
                <div className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl animate-bounce flex items-center gap-2">
                    <Settings2 className="animate-spin" size={20}/> Processando...
                </div>
            )}
        </div>
    );
}