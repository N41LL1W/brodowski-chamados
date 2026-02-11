"use client";

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
    Trash2, Users, Shield, 
    XCircle, UserPlus, Key, Search, Building2, Tag, Layers
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
    const [showAddForm, setShowAddForm] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', roleId: '', departmentId: '' });

    const loadData = async () => {
        try {
            const [uRes, oRes] = await Promise.all([
                fetch('/api/users'),
                fetch('/api/config/options') // Crie uma rota que retorne { roles, levels, departments, categories }
            ]);
            setUsers(await uRes.json());
            const options = await oRes.json();
            setRoles(options.roles || []);
            setLevels(options.levels || []);
            setDepartments(options.departments || []);
            setCategories(options.categories || []);
        } catch (error) { console.error(error); }
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
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const deleteOption = async (type: string, id: string) => {
        if(!confirm("Excluir este item?")) return;
        await fetch(`/api/config/options?type=${type}&id=${id}`, { method: 'DELETE' });
        loadData();
    };

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-10">
            <header className="border-b pb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Configuração <span className="text-blue-600 italic">Global</span></h1>
                    <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em]">Painel de Controle de Entidades</p>
                </div>
            </header>

            {/* GRID DE GESTÃO DE ENTIDADES (DEPT, CAT, ROLE) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* FORMULÁRIO DE ADIÇÃO RÁPIDA */}
                <Card className="p-8 border-none shadow-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] lg:col-span-1">
                    <h2 className="text-xl font-black mb-6 uppercase flex items-center gap-2 tracking-tighter">
                        <Layers size={20} className="text-blue-600"/> Adicionar Entidade
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Tipo de Registro</label>
                            <select 
                                className="w-full p-4 mt-1 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 bg-transparent"
                                value={newOption.type}
                                onChange={e => setNewOption({...newOption, type: e.target.value})}
                            >
                                <option value="department">Secretaria / Depto</option>
                                <option value="category">Categoria de Chamado</option>
                                <option value="role">Cargo / Role</option>
                                <option value="level">Nível de Prioridade</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nome do Item</label>
                            <input 
                                className="w-full p-4 mt-1 border-2 border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 bg-transparent"
                                placeholder="Ex: Infraestrutura, Elétrica..."
                                value={newOption.name}
                                onChange={e => setNewOption({...newOption, name: e.target.value})}
                            />
                        </div>
                        <button 
                            onClick={handleCreateOption}
                            className="w-full bg-blue-600 text-white p-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all"
                        >
                            Salvar Registro
                        </button>
                    </div>
                </Card>

                {/* VISUALIZAÇÃO DE ITENS ATIVOS */}
                <div className="lg:col-span-2 space-y-6">
                    <EntitySection title="Secretarias" icon={<Building2 size={18}/>} items={departments} type="department" onDelete={deleteOption} color="text-emerald-500" />
                    <EntitySection title="Categorias" icon={<Tag size={18}/>} items={categories} type="category" onDelete={deleteOption} color="text-amber-500" />
                    <EntitySection title="Permissões" icon={<Shield size={18}/>} items={roles} type="role" onDelete={deleteOption} color="text-blue-500" />
                </div>
            </div>

            {/* GESTÃO DE USUÁRIOS (Sua seção de equipe aprimorada) */}
            <section className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10">
                    <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-3">
                        <Users size={32} className="text-blue-600"/> Equipe do Sistema
                    </h2>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-4 text-slate-400" size={20}/>
                        <input 
                            className="w-full pl-14 p-4 rounded-3xl bg-white dark:bg-slate-900 border-none shadow-sm text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Buscar por nome ou e-mail..."
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(user => (
                        <Card key={user.id} className="p-6 border-none shadow-sm flex items-center justify-between group hover:shadow-xl transition-all rounded-4x1">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-black text-blue-600">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="font-black uppercase text-sm tracking-tight">{user.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-2 hover:bg-amber-100 rounded-lg text-amber-600"><Key size={18}/></button>
                                <button className="p-2 hover:bg-red-100 rounded-lg text-red-600" onClick={() => deleteOption('user', user.id)}><Trash2 size={18}/></button>
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
                {items.map((item: any) => (
                    <div key={item.id} className="bg-white dark:bg-slate-800 px-4 py-2 rounded-xl text-[10px] font-black uppercase border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                        {item.name}
                        <button onClick={() => onDelete(type, item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                            <XCircle size={14} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}