"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { 
    Trash2, Users, Shield, 
    XCircle, Key, Search, Building2, Tag, Layers
} from 'lucide-react';

export default function ConfigPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [newOption, setNewOption] = useState({ name: '', type: 'department' });

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
            setDepartments(options.departments || []);
            setCategories(options.categories || []);
        } catch (error) { 
            console.error("Erro ao carregar dados:", error); 
        }
    };

    useEffect(() => { loadData(); }, []);

    const handleCreateOption = async () => {
        if (!newOption.name) return;
        setLoading(true);
        try {
            const res = await fetch('/api/config/options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOption)
            });
            if (res.ok) {
                setNewOption({ ...newOption, name: '' });
                loadData();
            }
        } catch (e) { 
            console.error(e); 
        } finally { 
            setLoading(false); 
        }
    };

    const deleteOption = async (type: string, id: string) => {
        if(!confirm("Deseja realmente excluir este item?")) return;
        await fetch(`/api/config/options?type=${type}&id=${id}`, { method: 'DELETE' });
        loadData();
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10">
            <header className="border-b border-border pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-foreground uppercase tracking-tighter">
                        Configuração <span className="text-primary italic">Global</span>
                    </h1>
                    <p className="text-muted text-xs font-black uppercase tracking-[0.2em] mt-1">
                        Painel de Controle de Entidades
                    </p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* FORMULÁRIO DE ADIÇÃO RÁPIDA */}
                <Card className="p-8 border-none shadow-2xl bg-card rounded-[2.5rem] lg:col-span-1">
                    <h2 className="text-xl font-black mb-6 uppercase flex items-center gap-2 tracking-tighter text-foreground">
                        <Layers size={20} className="text-primary"/> Adicionar Entidade
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-muted ml-1">Tipo de Registro</label>
                            <select 
                                className="w-full p-4 mt-1 border-2 border-border rounded-2xl text-sm font-bold outline-none focus:border-primary bg-transparent text-foreground"
                                value={newOption.type}
                                onChange={e => setNewOption({...newOption, type: e.target.value})}
                            >
                                <option value="department" className="bg-card">Secretaria / Depto</option>
                                <option value="category" className="bg-card">Categoria de Chamado</option>
                                <option value="role" className="bg-card">Cargo / Role</option>
                                <option value="level" className="bg-card">Nível de Prioridade</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-muted ml-1">Nome do Item</label>
                            <input 
                                className="w-full p-4 mt-1 border-2 border-border rounded-2xl text-sm font-bold outline-none focus:border-primary bg-transparent text-foreground placeholder:text-muted/50"
                                placeholder="Ex: Infraestrutura, Elétrica..."
                                value={newOption.name}
                                onChange={e => setNewOption({...newOption, name: e.target.value})}
                            />
                        </div>
                        <button 
                            disabled={loading}
                            onClick={handleCreateOption}
                            className="w-full bg-primary text-white p-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Salvando...' : 'Salvar Registro'}
                        </button>
                    </div>
                </Card>

                {/* VISUALIZAÇÃO DE ITENS ATIVOS */}
                <div className="lg:col-span-2 space-y-6">
                    <EntitySection title="Secretarias" icon={<Building2 size={18}/>} items={departments} type="department" onDelete={deleteOption} color="text-emerald-500" />
                    <EntitySection title="Categorias" icon={<Tag size={18}/>} items={categories} type="category" onDelete={deleteOption} color="text-amber-500" />
                    <EntitySection title="Permissões" icon={<Shield size={18}/>} items={roles} type="role" onDelete={deleteOption} color="text-primary" />
                </div>
            </div>

            {/* GESTÃO DE USUÁRIOS */}
            <section className="bg-card/50 p-8 rounded-[3rem] border border-border">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                    <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3 text-foreground">
                        <Users size={32} className="text-primary"/> Equipe do Sistema
                    </h2>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-4 text-muted" size={20}/>
                        <input 
                            className="w-full pl-14 p-4 rounded-3xl bg-card border border-border shadow-sm text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground"
                            placeholder="Buscar por nome ou e-mail..."
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                        <Card key={user.id} className="p-6 border border-border bg-card flex items-center justify-between group hover:shadow-xl transition-all rounded-3xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-black uppercase text-sm tracking-tight text-foreground">{user.name}</h4>
                                    <p className="text-[10px] font-bold text-muted uppercase tracking-widest">{user.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg text-amber-600 transition-colors">
                                    <Key size={18}/>
                                </button>
                                <button 
                                    className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-red-600 transition-colors" 
                                    onClick={() => deleteOption('user', user.id)}
                                >
                                    <Trash2 size={18}/>
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}

function EntitySection({ title, icon, items, type, onDelete, color }: any) {
    return (
        <div className="space-y-3">
            <h3 className={`text-[10px] font-black uppercase tracking-[0.3em] ${color} flex items-center gap-2`}>
                {icon} {title}
            </h3>
            <div className="flex flex-wrap gap-2">
                {items.length === 0 && <p className="text-[10px] text-muted italic">Nenhum registro encontrado.</p>}
                {items.map((item: any) => (
                    <div key={item.id} className="bg-card px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-border shadow-sm flex items-center gap-3 text-foreground">
                        {item.name}
                        <button onClick={() => onDelete(type, item.id)} className="text-muted hover:text-red-500 transition-colors">
                            <XCircle size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}