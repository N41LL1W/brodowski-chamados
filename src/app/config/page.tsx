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
        <div className="max-w-7xl mx-auto p-6 space-y-10 min-h-screen">
            <header className="flex justify-between items-end border-b border-border pb-6">
                <div>
                    <h1 className="text-4xl font-black text-primary uppercase tracking-tighter italic">Painel Master</h1>
                    <p className="text-muted text-sm font-medium uppercase tracking-widest">Gestão de infraestrutura humana</p>
                </div>
            </header>

            {/* SEÇÃO: CADASTRO MANUAL */}
            <section className="bg-card border-2 border-dashed border-border rounded-[3rem] p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="bg-primary p-4 rounded-2xl text-white shadow-lg shadow-primary/20"><UserPlus size={24}/></div>
                        <div>
                            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Cadastro Direto</h2>
                            <p className="text-[10px] text-muted font-black uppercase tracking-widest">Criação de contas técnicas</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${showAddForm ? 'bg-muted text-foreground' : 'bg-primary text-white shadow-xl shadow-primary/20 hover:scale-105'}`}
                    >
                        {showAddForm ? "Cancelar Operação" : "Novo Usuário"}
                    </button>
                </div>

                {showAddForm && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <input className="p-4 border-2 border-border rounded-2xl bg-transparent text-foreground text-sm font-bold outline-none focus:border-primary" placeholder="Nome Completo" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} />
                        <input className="p-4 border-2 border-border rounded-2xl bg-transparent text-foreground text-sm font-bold outline-none focus:border-primary" placeholder="E-mail" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} />
                        <input className="p-4 border-2 border-border rounded-2xl bg-transparent text-foreground text-sm font-bold outline-none focus:border-primary" type="password" placeholder="Senha Provisória" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} />
                        <select className="p-4 border-2 border-border rounded-2xl bg-card text-foreground text-sm font-bold outline-none focus:border-primary" value={newUser.roleId} onChange={e => setNewUser({...newUser, roleId: e.target.value})}>
                            <option value="">Cargo de Acesso...</option>
                            {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        <select className="p-4 border-2 border-border rounded-2xl bg-card text-foreground text-sm font-bold outline-none focus:border-primary" value={newUser.levelId} onChange={e => setNewUser({...newUser, levelId: e.target.value})}>
                            <option value="">Nível de Prioridade...</option>
                            {levels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                        <button onClick={handleCreateUser} className="bg-primary text-white font-black uppercase text-[10px] tracking-widest rounded-2xl hover:opacity-90 transition-all">Criar Acesso Agora</button>
                    </div>
                )}
            </section>

            <section className="grid md:grid-cols-2 gap-8">
                <Card className="p-8 border-none shadow-2xl bg-card rounded-[2.5rem]">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-foreground uppercase tracking-tight"><Shield size={20} className="text-primary"/> Estrutura</h2>
                    <div className="space-y-4">
                        <div className="flex gap-2">
                            <input className="flex-1 p-4 border-2 border-border rounded-2xl text-foreground bg-transparent font-bold outline-none focus:border-primary transition-all" placeholder="Nome" value={newOption.name} onChange={e => setNewOption({...newOption, name: e.target.value})} />
                            <select className="p-4 border-2 border-border rounded-2xl text-foreground bg-card font-bold outline-none" value={newOption.type} onChange={e => setNewOption({...newOption, type: e.target.value})}>
                                <option value="role">Cargo</option>
                                <option value="level">Nível</option>
                            </select>
                        </div>
                        <button className="w-full bg-foreground text-background p-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:opacity-90 transition-all">+ Adicionar Opção</button>
                    </div>
                </Card>

                <Card className="p-8 border-none shadow-2xl bg-card rounded-[2.5rem]">
                    <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-foreground uppercase tracking-tight"><Settings2 size={20} className="text-primary"/> Ativos</h2>
                    <div className="flex flex-wrap gap-2">
                        {roles.map((r) => (
                            <div key={r.id} className="flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-xl border border-primary/20 uppercase text-[10px] font-black">
                                {r.name} <button className="hover:text-red-500 transition-colors"><XCircle size={14}/></button>
                            </div>
                        ))}
                    </div>
                </Card>
            </section>

            {/* GESTÃO DE EQUIPE */}
            <section className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                    <h2 className="text-3xl font-black flex items-center gap-3 text-foreground tracking-tighter uppercase"><Users size={32} className="text-primary"/> Gestão de Equipe</h2>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-4 text-muted" size={20}/>
                        <input 
                            className="w-full pl-14 p-4 rounded-4xl bg-card border-2 border-border text-foreground text-sm font-bold focus:border-primary transition-all outline-none" 
                            placeholder="Pesquisar membros..." 
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                
                <div className="grid gap-4">
                    {filteredUsers.map((user: any) => (
                        <Card key={user.id} className="p-6 flex flex-wrap justify-between items-center bg-card border-none shadow-xl hover:translate-x-1 transition-all rounded-4xl">
                            <div className="min-w-[280px]">
                                <p className="font-black text-foreground text-xl uppercase leading-tight tracking-tight">{user.name}</p>
                                <p className="text-xs text-muted mb-4 font-bold lowercase italic">{user.email}</p>
                                <div className="flex gap-2">
                                    <Badge variant="status" value="aberto">{user.roleRelation?.name || user.role}</Badge>
                                    {user.levelRelation && <Badge variant="priority" value="normal">{user.levelRelation.name}</Badge>}
                                </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-4 items-center mt-4 md:mt-0 bg-background/50 p-4 rounded-3xl border border-border">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-muted uppercase font-black mb-1 ml-1 tracking-widest">Alterar Cargo</span>
                                    <select 
                                        className="text-xs p-2 border-2 border-border rounded-xl bg-card text-foreground min-w-40 font-bold outline-none focus:border-primary" 
                                        value={user.roleId || ""}
                                        onChange={(e) => updateUser(user.id, { roleId: e.target.value })}
                                    >
                                        <option value="">Selecionar...</option>
                                        {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex items-center gap-2 border-l border-border pl-4">
                                    <button className="text-amber-500 hover:bg-amber-500/10 p-3 rounded-xl transition-colors"><Key size={20}/></button>
                                    <button onClick={() => deleteUser(user.id, user.name)} className="text-red-500 hover:bg-red-500/10 p-3 rounded-xl transition-colors"><Trash2 size={20}/></button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}