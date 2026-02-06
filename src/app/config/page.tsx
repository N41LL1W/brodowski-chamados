"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
    Trash2, Plus, Users, Settings2, Shield, 
    XCircle, UserPlus, Key, Search 
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
    const [searchTerm, setSearchTerm] = useState('');
    
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
        } catch (error) { console.error(error); }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreateUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) return alert("Preencha os campos obrigatórios.");
        setLoading(true);
        const roleName = roles.find(r => String(r.id) === String(newUser.roleId))?.name;
        try {
            const res = await fetch('/api/users/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newUser, roleName })
            });
            if (res.ok) {
                setNewUser({ name: '', email: '', password: '', roleId: '', levelId: '' });
                setShowAddForm(false);
                loadData();
            }
        } catch (error) { console.error(error); }
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
        if (!confirm(`Excluir permanentemente ${name}?`)) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) loadData();
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };

    const filteredUsers = users.filter(u => 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="max-w-6xl mx-auto p-6 space-y-10 min-h-screen">
            <div className="flex justify-between items-end border-b border-border pb-6">
                <div>
                    <h1 className="text-4xl font-black italic text-blue-600 uppercase tracking-tighter">Painel Master</h1>
                    <p className="text-muted-foreground text-sm font-medium">Gestão de infraestrutura humana e permissões.</p>
                </div>
            </div>

            {/* SEÇÃO: CADASTRO MANUAL */}
            <section className="bg-secondary/50 border-2 border-dashed border-border rounded-4xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-500/20"><UserPlus size={24}/></div>
                        <div>
                            <h2 className="text-xl font-bold text-foreground">Cadastro Direto</h2>
                            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Contas manuais</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${showAddForm ? 'bg-muted text-muted-foreground' : 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:scale-105'}`}
                    >
                        {showAddForm ? "Cancelar" : "Novo Usuário"}
                    </button>
                </div>

                {showAddForm && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
                        <input className="p-3 border-2 border-border rounded-xl bg-background text-foreground text-sm outline-none focus:border-blue-500" placeholder="Nome Completo" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                        <input className="p-3 border-2 border-border rounded-xl bg-background text-foreground text-sm outline-none focus:border-blue-500" placeholder="E-mail" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                        <input className="p-3 border-2 border-border rounded-xl bg-background text-foreground text-sm outline-none focus:border-blue-500" type="password" placeholder="Senha Provisória" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        <select className="p-3 border-2 border-border rounded-xl bg-background text-foreground text-sm outline-none focus:border-blue-500" value={newUser.roleId} onChange={e => setNewUser({...newUser, roleId: e.target.value})}>
                            <option value="">Selecione Cargo...</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <select className="p-3 border-2 border-border rounded-xl bg-background text-foreground text-sm outline-none focus:border-blue-500" value={newUser.levelId} onChange={e => setNewUser({...newUser, levelId: e.target.value})}>
                            <option value="">Selecione Nível...</option>
                            {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <button onClick={handleCreateUser} className="bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/10">Criar Acesso</button>
                    </div>
                )}
            </section>

            <section className="grid md:grid-cols-2 gap-8">
                <Card className="p-6 border-none shadow-xl bg-card rounded-3xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground"><Shield size={20} className="text-blue-500"/> Estrutura de Cargos</h2>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input className="flex-1 p-3 border-2 border-border rounded-xl text-foreground bg-secondary outline-none focus:border-blue-500 transition-all" placeholder="Nome" value={newOption.name} onChange={e => setNewOption({...newOption, name: e.target.value})} />
                            <select className="p-3 border-2 border-border rounded-xl text-foreground bg-secondary outline-none" value={newOption.type} onChange={e => setNewOption({...newOption, type: e.target.value})}>
                                <option value="role">Cargo</option>
                                <option value="level">Nível</option>
                            </select>
                        </div>
                        <button onClick={() => {}} className="w-full bg-foreground text-background p-3 rounded-xl font-black uppercase text-xs tracking-widest hover:opacity-90 transition-all">+ Adicionar Opção</button>
                    </div>
                </Card>

                <Card className="p-6 border-none shadow-xl bg-card rounded-3xl">
                    <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-foreground"><Settings2 size={20} className="text-blue-500"/> Configurações Ativas</h2>
                    <div className="space-y-6">
                        <div className="flex flex-wrap gap-2">
                            {roles.map((r) => (
                                <div key={r.id} className="flex items-center gap-2 bg-blue-500/10 text-blue-600 px-4 py-1.5 rounded-full border border-blue-500/20 uppercase text-[10px] font-black">
                                    {r.name} <button className="hover:text-red-500 transition-colors"><XCircle size={14}/></button>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>
            </section>

            {/* SEÇÃO: GESTÃO DE EQUIPE */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-black flex items-center gap-3 text-foreground"><Users size={28} className="text-blue-600"/> Gestão de Equipe</h2>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-3 text-muted-foreground" size={18}/>
                        <input 
                            className="w-full pl-12 p-3 border-2 border-border rounded-2xl bg-secondary text-foreground text-sm focus:bg-card focus:border-blue-500 transition-all outline-none" 
                            placeholder="Buscar por nome ou email..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="grid gap-4">
                    {filteredUsers.map((user: any) => (
                        <Card key={user.id} className="p-6 flex flex-wrap justify-between items-center bg-card border-none shadow-lg border-l-4 border-l-blue-600 hover:translate-x-1 transition-all">
                            <div className="min-w-[280px]">
                                <p className="font-black text-foreground text-xl uppercase leading-tight">{user.name}</p>
                                <p className="text-sm text-muted-foreground mb-4 font-medium">{user.email}</p>
                                <div className="flex gap-2">
                                    <Badge variant="status" value="aberto">{user.roleRelation?.name || user.role}</Badge>
                                    {user.levelRelation && <Badge variant="priority" value="normal">{user.levelRelation.name}</Badge>}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 items-center mt-4 md:mt-0 bg-secondary/50 p-4 rounded-3xl border border-border">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted-foreground uppercase font-black mb-1 ml-1">Alterar Cargo</span>
                                    <select 
                                        className="text-sm p-2 border-2 border-border rounded-xl bg-background text-foreground min-w-[150px] outline-none focus:border-blue-500" 
                                        value={user.roleId || ""}
                                        onChange={(e) => updateUser(user.id, { roleId: e.target.value })}
                                    >
                                        <option value="">Selecionar...</option>
                                        {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 border-l border-border pl-4">
                                    <button onClick={() => {}} className="text-amber-500 hover:bg-amber-500/10 p-3 rounded-2xl transition-colors" title="Senha"><Key size={20}/></button>
                                    <button onClick={() => deleteUser(user.id, user.name)} className="text-red-500 hover:bg-red-500/10 p-3 rounded-2xl transition-colors" title="Excluir"><Trash2 size={20}/></button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}