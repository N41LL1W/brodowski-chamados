"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
    Trash2, Plus, Users, Settings2, Shield, 
    XCircle, UserPlus, Key, Mail, User as UserIcon 
} from 'lucide-react';

interface Option {
    id: number | string;
    name: string;
    rank?: number;
}

export default function ConfigPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<Option[]>([]);
    const [levels, setLevels] = useState<Option[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Estados para formulários
    const [newOption, setNewOption] = useState({ name: '', type: 'role', rank: 1 });
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', roleId: '', levelId: '' });

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

    // --- LÓGICA DE USUÁRIOS ---

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            return alert("Nome, Email e Senha são obrigatórios para cadastro manual.");
        }
        
        setLoading(true);
        const roleName = roles.find(r => String(r.id) === String(newUser.roleId))?.name;
        
        try {
            const res = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newUser, roleName })
            });

            if (res.ok) {
                alert("Usuário criado com sucesso!");
                setNewUser({ name: '', email: '', password: '', roleId: '', levelId: '' });
                setShowAddForm(false);
                loadData();
            } else {
                const err = await res.json();
                alert(err.message || "Erro ao criar usuário");
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

    // --- LÓGICA DE OPÇÕES (ROLES/LEVELS) ---

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
            else {
                const err = await res.json();
                alert(err.message || "Erro ao excluir.");
            }
        } catch (error) { alert("Erro de conexão"); }
    };

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10">
            <div className="flex justify-between items-end border-b pb-4">
                <div>
                    <h1 className="text-3xl font-black italic text-blue-600 uppercase">Painel Master</h1>
                    <p className="text-gray-500 text-sm font-medium">Configurações globais de equipe e permissões.</p>
                </div>
            </div>

            {/* SEÇÃO: CADASTRO MANUAL DE USUÁRIOS */}
            <section className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-600 p-2 rounded-lg text-white">
                            <UserPlus size={24}/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Cadastro Manual</h2>
                            <p className="text-xs text-slate-500 font-semibold">Crie contas para funcionários que não possuem acesso.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${showAddForm ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-md shadow-blue-200'}`}
                    >
                        {showAddForm ? "Fechar" : "Novo Usuário"}
                    </button>
                </div>

                {showAddForm && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-200">
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-slate-400" size={18}/>
                            <input className="w-full pl-10 p-2.5 border rounded-xl bg-white text-black text-sm" placeholder="Nome Completo" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                        </div>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 text-slate-400" size={18}/>
                            <input className="w-full pl-10 p-2.5 border rounded-xl bg-white text-black text-sm" placeholder="E-mail" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                        </div>
                        <div className="relative">
                            <Key className="absolute left-3 top-3 text-slate-400" size={18}/>
                            <input className="w-full pl-10 p-2.5 border rounded-xl bg-white text-black text-sm" type="password" placeholder="Senha de Acesso" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        </div>
                        
                        <select className="p-2.5 border rounded-xl bg-white text-black text-sm" value={newUser.roleId} onChange={e => setNewUser({...newUser, roleId: e.target.value})}>
                            <option value="">Selecionar Cargo (Role)</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>

                        <select className="p-2.5 border rounded-xl bg-white text-black text-sm" value={newUser.levelId} onChange={e => setNewUser({...newUser, levelId: e.target.value})}>
                            <option value="">Selecionar Nível Técnico</option>
                            {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>

                        <button onClick={handleCreateUser} className="bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                            Finalizar Cadastro
                        </button>
                    </div>
                )}
            </section>

            {/* SEÇÃO: ROLES E NÍVEIS */}
            <section className="grid md:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><Shield size={20}/> Estrutura da Equipe</h2>
                    <div className="space-y-4">
                        <input className="w-full p-2 border rounded-xl text-black bg-white" placeholder="Nome (ex: Gestor de Pátio)" value={newOption.name} onChange={e => setNewOption({...newOption, name: e.target.value})} />
                        <select className="w-full p-2 border rounded-xl text-black bg-white" value={newOption.type} onChange={e => setNewOption({...newOption, type: e.target.value})}>
                            <option value="role">Cargo (Ex: Técnico, Master)</option>
                            <option value="level">Nível (Ex: N1, Especialista)</option>
                        </select>
                        <button onClick={addOption} className="w-full bg-slate-800 hover:bg-black text-white p-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
                            <Plus size={18}/> Criar Nova Opção
                        </button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-800"><Settings2 size={20}/> Opções Ativas</h2>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {roles.map((r) => (
                                <div key={r.id} className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-100">
                                    <span className="text-[10px] font-black uppercase tracking-wider">{r.name}</span>
                                    <button onClick={() => deleteOption(r.id, 'role')} className="hover:text-red-500 transition-colors"><XCircle size={14}/></button>
                                </div>
                            ))}
                        </div>
                        <div className="flex flex-wrap gap-2 border-t pt-4">
                            {levels.map((l) => (
                                <div key={l.id} className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-100">
                                    <span className="text-[10px] font-black uppercase tracking-wider">{l.name}</span>
                                    <button onClick={() => deleteOption(l.id, 'level')} className="hover:text-red-500 transition-colors"><XCircle size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </section>

            {/* SEÇÃO: LISTAGEM E EDIÇÃO DE USUÁRIOS */}
            <section>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black flex items-center gap-2 text-slate-800"><Users size={28}/> Equipe Cadastrada</h2>
                    <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{users.length} usuários</span>
                </div>
                
                <div className="grid gap-4">
                    {users.map((user: any) => (
                        <Card key={user.id} className="p-5 flex flex-wrap justify-between items-center bg-white shadow-sm border-l-4 border-blue-500 hover:shadow-lg transition-all">
                            <div className="min-w-[280px]">
                                <p className="font-black text-slate-800 text-lg leading-tight uppercase">{user.name || 'Sem nome'}</p>
                                <p className="text-sm text-slate-500 font-medium mb-3">{user.email}</p>
                                <div className="flex gap-2">
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
                            
                            <div className="flex flex-wrap gap-6 items-center mt-6 md:mt-0 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-400 uppercase font-black mb-1.5 tracking-widest">Alterar Cargo</span>
                                    <select 
                                        className="text-sm p-2 border rounded-xl bg-white text-black min-w-[150px] font-medium shadow-sm" 
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

                                <div className="flex flex-col border-l border-slate-200 pl-6">
                                    <span className="text-[10px] text-slate-400 uppercase font-black mb-1.5 tracking-widest">Nível Técnico</span>
                                    <select 
                                        className="text-sm p-2 border rounded-xl bg-white text-black min-w-[150px] font-medium shadow-sm" 
                                        value={user.levelId || ""}
                                        onChange={(e) => updateUser(user.id, { levelId: e.target.value })}
                                    >
                                        <option value="">Selecione...</option>
                                        {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 border-l border-slate-200 pl-6">
                                    <button 
                                        onClick={() => deleteUser(user.id, user.name)}
                                        className="text-red-500 hover:bg-red-50 p-2.5 rounded-xl transition-all" 
                                        title="Remover Usuário"
                                    >
                                        <Trash2 size={22}/>
                                    </button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            {loading && (
                <div className="fixed bottom-10 right-10 bg-black text-white px-8 py-4 rounded-3xl font-bold shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-10">
                    <div className="w-5 h-5 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    Sincronizando Banco de Dados...
                </div>
            )}
        </div>
    );
}