"use client";

import { useEffect, useState } from 'react';
import {
    Settings2, Shield, Clock, Palette, Save,
    CheckCircle2, AlertCircle, Building2, Phone,
    Mail, Type, Plus, Trash2, GripVertical,
    Users, Eye, EyeOff, Key, UserCheck,
    Monitor, Wifi, Printer, ShieldAlert, FileText,
    Wrench, Laptop, Server, HardDrive, Database,
    Globe, Lock, Unlock, Bell, Tag, LayoutGrid,
    Edit3, X, Check, RefreshCw, UserX, UserPlus,
    AlertTriangle, Download, Upload, History
} from 'lucide-react';

const AVAILABLE_ICONS: Record<string, any> = {
    Monitor, Wifi, Printer, ShieldAlert, FileText,
    Wrench, Laptop, Server, HardDrive, Database,
    Globe, Lock, Bell, Tag, LayoutGrid, Settings2,
    Shield, Clock, Building2, Phone, Mail, Key,
    Eye, Edit3, RefreshCw, UserCheck, Users
};
const ICON_NAMES = Object.keys(AVAILABLE_ICONS);

const FIXED_ROLES = ['FUNCIONARIO', 'TECNICO', 'CONTROLADOR', 'MASTER'];
const ROLE_LABELS: Record<string, string> = {
    FUNCIONARIO: 'Funcionário', TECNICO: 'Técnico',
    CONTROLADOR: 'Controlador', MASTER: 'Master',
};
const ROLE_COLORS: Record<string, string> = {
    FUNCIONARIO: 'border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    TECNICO:     'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    CONTROLADOR: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    MASTER:      'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
};

const SECTIONS = [
    { key: 'abrir_chamado',  label: 'Abrir chamado',        desc: 'Criar novos chamados' },
    { key: 'meus_chamados',  label: 'Meus chamados',        desc: 'Ver chamados próprios' },
    { key: 'painel_tecnico', label: 'Painel técnico',       desc: 'Fila e atendimento' },
    { key: 'agenda',         label: 'Agenda de visitas',    desc: 'Agendamentos técnicos' },
    { key: 'controlador',    label: 'Painel controlador',   desc: 'Dashboard e logs' },
    { key: 'admin',          label: 'Painel admin/master',  desc: 'Configurações do sistema' },
    { key: 'acompanhar',     label: 'Acompanhamento público', desc: 'Sem login necessário' },
];

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
    FUNCIONARIO: { abrir_chamado: true,  meus_chamados: true,  painel_tecnico: false, agenda: false, controlador: false, admin: false, acompanhar: true },
    TECNICO:     { abrir_chamado: true,  meus_chamados: true,  painel_tecnico: true,  agenda: true,  controlador: false, admin: false, acompanhar: true },
    CONTROLADOR: { abrir_chamado: true,  meus_chamados: true,  painel_tecnico: false, agenda: false, controlador: true,  admin: false, acompanhar: true },
    MASTER:      { abrir_chamado: true,  meus_chamados: true,  painel_tecnico: false, agenda: false, controlador: true,  admin: true,  acompanhar: true },
};

const COLOR_OPTIONS = [
    { value: 'red', bg: 'bg-red-500' }, { value: 'amber', bg: 'bg-amber-500' },
    { value: 'blue', bg: 'bg-blue-500' }, { value: 'green', bg: 'bg-green-500' },
    { value: 'purple', bg: 'bg-purple-500' }, { value: 'gray', bg: 'bg-gray-500' },
];

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function MasterConfigPage() {
    const [activeTab, setActiveTab] = useState<string>('categorias');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const showFeedback = (type: 'success' | 'error', msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3500);
    };

    const TABS = [
        { id: 'categorias',  label: 'Categorias',  icon: LayoutGrid },
        { id: 'secretarias', label: 'Secretarias', icon: Building2 },
        { id: 'sla',         label: 'SLA',         icon: Clock },
        { id: 'sistema',     label: 'Sistema',     icon: Palette },
        { id: 'perfis',      label: 'Perfis',      icon: Shield },
        { id: 'usuarios',    label: 'Usuários',    icon: Users },
        { id: 'auditoria',   label: 'Auditoria',   icon: History },
    ];

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
            <header>
                <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">
                    Configurações <span className="text-primary italic">Master</span>
                </h1>
                <p className="text-muted text-sm font-medium mt-1">Controle total do sistema</p>
            </header>

            {feedback && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold border animate-in fade-in duration-200 ${
                    feedback.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'
                }`}>
                    {feedback.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                    {feedback.msg}
                </div>
            )}

            <div className="flex gap-1.5 flex-wrap bg-card border border-border p-1.5 rounded-2xl">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'
                            }`}>
                            <Icon size={13}/>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {activeTab === 'categorias'  && <TabCategorias  showFeedback={showFeedback}/>}
            {activeTab === 'secretarias' && <TabSecretarias showFeedback={showFeedback}/>}
            {activeTab === 'sla'         && <TabSLA         showFeedback={showFeedback}/>}
            {activeTab === 'sistema'     && <TabSistema     showFeedback={showFeedback}/>}
            {activeTab === 'perfis'      && <TabPerfis      showFeedback={showFeedback}/>}
            {activeTab === 'usuarios'    && <TabUsuarios    showFeedback={showFeedback}/>}
            {activeTab === 'auditoria'   && <TabAuditoria/>}
        </div>
    );
}

// ============================================================
// ABA CATEGORIAS
// ============================================================
function TabCategorias({ showFeedback }: any) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/master/categorias').then(r => r.json()).then(data => {
            setItems(data.length > 0 ? data : [
                { id: 'new_1', name: 'Hardware', icon: 'Monitor', order: 0, active: true },
                { id: 'new_2', name: 'Rede', icon: 'Wifi', order: 1, active: true },
            ]);
        }).finally(() => setLoading(false));
    }, []);

    const addItem = () => setItems(p => [...p, { id: `new_${Date.now()}`, name: '', icon: 'Monitor', order: p.length, active: true }]);
    const removeItem = (idx: number) => setItems(p => p.filter((_, i) => i !== idx));
    const updateItem = (idx: number, field: string, value: any) => setItems(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    const moveItem = (idx: number, dir: 'up' | 'down') => {
        const arr = [...items];
        const target = dir === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= arr.length) return;
        [arr[idx], arr[target]] = [arr[target], arr[idx]];
        setItems(arr.map((item, i) => ({ ...item, order: i })));
    };

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/master/categorias', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(items.map((item, i) => ({ ...item, order: i })))
            });
            if (res.ok) showFeedback('success', 'Categorias salvas!');
            else showFeedback('error', 'Erro ao salvar.');
        } finally { setSaving(false); }
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-6">
            <SectionBox title="Preview — Passo 1 do novo chamado" icon={<Eye size={12}/>}>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                    {items.filter(i => i.active && i.name).map((item, idx) => {
                        const Icon = AVAILABLE_ICONS[item.icon] || Monitor;
                        return (
                            <div key={idx} className="p-4 bg-background border-2 border-border rounded-2xl flex flex-col items-center gap-2">
                                <div className="p-3 bg-card rounded-xl text-foreground"><Icon size={22}/></div>
                                <span className="font-black text-foreground uppercase text-[9px] tracking-widest text-center line-clamp-1">{item.name}</span>
                            </div>
                        );
                    })}
                    {items.filter(i => i.active && i.name).length === 0 && (
                        <p className="col-span-5 text-center text-muted text-xs py-4">Adicione categorias abaixo.</p>
                    )}
                </div>
            </SectionBox>

            <div className="space-y-2">
                {items.map((item, idx) => {
                    const Icon = AVAILABLE_ICONS[item.icon] || Monitor;
                    return (
                        <div key={item.id || idx} className={`bg-card border border-border rounded-2xl p-4 transition-all ${!item.active ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="flex flex-col gap-0.5">
                                    <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="text-muted hover:text-foreground disabled:opacity-20 p-0.5"><GripVertical size={12}/></button>
                                    <button onClick={() => moveItem(idx, 'down')} disabled={idx === items.length - 1} className="text-muted hover:text-foreground disabled:opacity-20 p-0.5"><GripVertical size={12}/></button>
                                </div>

                                <div className="relative">
                                    <button onClick={() => setShowIconPicker(showIconPicker === idx ? null : idx)}
                                        className="w-12 h-12 rounded-xl bg-background border-2 border-border hover:border-primary flex items-center justify-center text-foreground transition-all">
                                        <Icon size={22}/>
                                    </button>
                                    {showIconPicker === idx && (
                                        <div className="absolute left-0 top-14 z-30 bg-card border border-border rounded-2xl p-3 shadow-2xl grid grid-cols-5 gap-1.5 w-52">
                                            {ICON_NAMES.map(iconName => {
                                                const IIcon = AVAILABLE_ICONS[iconName];
                                                return (
                                                    <button key={iconName} onClick={() => { updateItem(idx, 'icon', iconName); setShowIconPicker(null); }} title={iconName}
                                                        className={`p-2 rounded-xl hover:bg-primary hover:text-white transition-all ${item.icon === iconName ? 'bg-primary text-white' : 'bg-background text-foreground'}`}>
                                                        <IIcon size={16}/>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                <input value={item.name} onChange={e => updateItem(idx, 'name', e.target.value)}
                                    placeholder="Nome da categoria..."
                                    className="flex-1 p-3 bg-background border-2 border-border rounded-xl outline-none focus:border-primary text-sm font-bold text-foreground placeholder:text-muted/50 transition-all"/>

                                <button onClick={() => updateItem(idx, 'active', !item.active)} title={item.active ? 'Ocultar' : 'Mostrar'}
                                    className={`p-2.5 rounded-xl transition-all ${item.active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-background text-muted'}`}>
                                    {item.active ? <Eye size={16}/> : <EyeOff size={16}/>}
                                </button>
                                <button onClick={() => removeItem(idx)}
                                    className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <button onClick={addItem}
                    className="flex items-center gap-2 px-5 py-3 bg-background border-2 border-dashed border-border rounded-2xl text-[11px] font-black uppercase text-muted hover:border-primary hover:text-primary transition-all">
                    <Plus size={15}/> Adicionar
                </button>
                <button onClick={save} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                    <Save size={15}/> {saving ? 'Salvando...' : 'Salvar categorias'}
                </button>
            </div>
        </div>
    );
}

// ============================================================
// ABA SECRETARIAS
// ============================================================
function TabSecretarias({ showFeedback }: any) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);

    const load = () => {
        fetch('/api/config/options').then(r => r.json()).then(d => setItems(d.departments || [])).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const add = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/config/options', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'department', name: newName.trim() })
            });
            if (res.ok) { setNewName(''); load(); showFeedback('success', 'Secretaria adicionada!'); }
        } finally { setSaving(false); }
    };

    const remove = async (id: string) => {
        if (!confirm('Excluir esta secretaria? Chamados vinculados serão afetados.')) return;
        const res = await fetch(`/api/config/options?type=department&id=${id}`, { method: 'DELETE' });
        if (res.ok) { load(); showFeedback('success', 'Removida.'); }
        else showFeedback('error', 'Erro: secretaria em uso.');
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-5">
            <div className="flex gap-3">
                <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
                    placeholder="Ex: Secretaria de Saúde..."
                    className="flex-1 p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary text-sm font-bold text-foreground placeholder:text-muted/50 transition-all"/>
                <button onClick={add} disabled={saving || !newName.trim()}
                    className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                    <Plus size={15}/> Adicionar
                </button>
            </div>
            <div className="space-y-2">
                {items.length === 0 && <EmptyState text="Nenhuma secretaria cadastrada."/>}
                {items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl group">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><Building2 size={14} className="text-primary"/></div>
                            <span className="font-bold text-foreground text-sm">{item.name}</span>
                        </div>
                        <button onClick={() => remove(item.id)}
                            className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 size={15}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// ABA SLA — com criar e excluir
// ============================================================
function TabSLA({ showFeedback }: any) {
    const [slaList, setSlaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newSLA, setNewSLA] = useState({ priority: '', maxHours: 24, label: '', color: 'blue' });
    const [showAdd, setShowAdd] = useState(false);

    const load = () => {
        fetch('/api/master/config').then(r => r.json()).then(data => {
            if (data.sla?.length) setSlaList(data.sla);
            else setSlaList([
                { priority: 'URGENTE', maxHours: 2,  label: 'Urgente', color: 'red' },
                { priority: 'ALTA',    maxHours: 4,  label: 'Alta',    color: 'amber' },
                { priority: 'NORMAL',  maxHours: 24, label: 'Normal',  color: 'blue' },
                { priority: 'BAIXA',   maxHours: 72, label: 'Baixa',   color: 'gray' },
            ]);
        }).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const updateSLA = (idx: number, field: string, value: any) => {
        setSlaList(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const saveAll = async () => {
        setSaving(true);
        try {
            await Promise.all(slaList.map(s =>
                fetch('/api/master/config', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'sla', data: s })
                })
            ));
            showFeedback('success', 'SLA salvo!');
        } finally { setSaving(false); }
    };

    const addSLA = async () => {
        if (!newSLA.priority.trim() || !newSLA.label.trim()) {
            showFeedback('error', 'Preencha prioridade e nome.'); return;
        }
        const res = await fetch('/api/master/config', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'sla', data: { ...newSLA, priority: newSLA.priority.toUpperCase() } })
        });
        if (res.ok) { setShowAdd(false); setNewSLA({ priority: '', maxHours: 24, label: '', color: 'blue' }); load(); showFeedback('success', 'SLA adicionado!'); }
    };

    const deleteSLA = async (priority: string) => {
        if (!confirm(`Excluir SLA "${priority}"?`)) return;
        const res = await fetch('/api/master/config', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'sla_delete', data: { priority } })
        });
        if (res.ok) { load(); showFeedback('success', 'SLA removido.'); }
        else showFeedback('error', 'Erro ao remover.');
    };

    if (loading) return <Spinner/>;

    const colorBadge = (color: string) => {
        const map: Record<string, string> = {
            red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
            blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400',
        };
        return map[color] || map.blue;
    };

    return (
        <div className="space-y-5">
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="bg-background/50 px-6 py-4 border-b border-border flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <Clock size={12}/> Prazos por prioridade
                    </p>
                    <button onClick={() => setShowAdd(!showAdd)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${showAdd ? 'bg-border text-foreground' : 'bg-primary text-white hover:opacity-90'}`}>
                        {showAdd ? <X size={12}/> : <Plus size={12}/>} {showAdd ? 'Cancelar' : 'Novo'}
                    </button>
                </div>

                {showAdd && (
                    <div className="p-5 border-b border-border bg-background/30 space-y-3 animate-in fade-in duration-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Nova prioridade</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <input value={newSLA.priority} onChange={e => setNewSLA(p => ({...p, priority: e.target.value.toUpperCase()}))}
                                placeholder="Ex: CRITICO" className={inputCls}/>
                            <input value={newSLA.label} onChange={e => setNewSLA(p => ({...p, label: e.target.value}))}
                                placeholder="Rótulo: Ex: Crítico" className={inputCls}/>
                            <input type="number" min={1} value={newSLA.maxHours} onChange={e => setNewSLA(p => ({...p, maxHours: Number(e.target.value)}))}
                                placeholder="Horas" className={inputCls}/>
                            <div className="flex gap-1.5 items-center">
                                {COLOR_OPTIONS.map(c => (
                                    <button key={c.value} onClick={() => setNewSLA(p => ({...p, color: c.value}))}
                                        className={`w-7 h-7 rounded-full ${c.bg} transition-all ${newSLA.color === c.value ? 'ring-2 ring-offset-1 ring-foreground scale-110' : 'opacity-60 hover:opacity-100'}`}/>
                                ))}
                            </div>
                        </div>
                        <button onClick={addSLA} className="w-full p-3 bg-primary text-white rounded-xl font-black uppercase text-[10px] hover:opacity-90 transition-all">
                            Adicionar SLA
                        </button>
                    </div>
                )}

                <div className="divide-y divide-border">
                    {slaList.map((s, idx) => (
                        <div key={s.priority} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center group">
                            <div className="flex items-center gap-3">
                                <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${colorBadge(s.color)}`}>{s.label}</span>
                            </div>
                            <div>
                                <label className="text-[9px] font-black text-muted uppercase">Prazo (h)</label>
                                <input type="number" min={1} value={s.maxHours} onChange={e => updateSLA(idx, 'maxHours', Number(e.target.value))}
                                    className="w-full p-2.5 mt-1 bg-background border-2 border-border rounded-xl outline-none focus:border-primary font-black text-foreground text-sm"/>
                            </div>
                            <div className="flex gap-1.5 items-end pb-0.5">
                                {COLOR_OPTIONS.map(c => (
                                    <button key={c.value} onClick={() => updateSLA(idx, 'color', c.value)}
                                        className={`w-6 h-6 rounded-full ${c.bg} transition-all ${s.color === c.value ? 'ring-2 ring-offset-1 ring-foreground scale-110' : 'opacity-50 hover:opacity-100'}`}/>
                                ))}
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => deleteSLA(s.priority)}
                                    className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                                    <Trash2 size={15}/>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={saveAll} disabled={saving}
                className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : 'Salvar todos os SLAs'}
            </button>
        </div>
    );
}

// ============================================================
// ABA SISTEMA
// ============================================================
function TabSistema({ showFeedback }: any) {
    const [system, setSystem] = useState({
        systemName: 'TI BRODOWSKI', systemSubtitle: 'Central de Operações',
        cityName: 'Brodowski', supportPhone: '', supportEmail: '',
        primaryColor: '#2563eb', logoText: 'TI',
        allowedDomain: '', registrationOpen: 'true',
        maintenanceMode: 'false', maintenanceMessage: 'Sistema em manutenção. Voltamos em breve.',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/master/config').then(r => r.json()).then(data => {
            if (data.system) setSystem(p => ({ ...p, ...data.system }));
        }).finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await Promise.all(Object.entries(system).map(([key, value]) =>
                fetch('/api/master/config', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'system', data: { key, value } })
                })
            ));
            showFeedback('success', 'Configurações salvas! Recarregue a página para ver as mudanças.');
        } finally { setSaving(false); }
    };

    const exportConfig = () => {
        const blob = new Blob([JSON.stringify(system, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `config-backup-${new Date().toISOString().slice(0,10)}.json`; a.click();
        URL.revokeObjectURL(url);
    };

    const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const data = JSON.parse(ev.target?.result as string);
                setSystem(p => ({ ...p, ...data }));
                showFeedback('success', 'Config importada! Clique em Salvar para aplicar.');
            } catch { showFeedback('error', 'Arquivo inválido.'); }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-5">
            {/* MODO MANUTENÇÃO */}
            <div className={`border-2 rounded-3xl p-5 space-y-4 transition-all ${system.maintenanceMode === 'true' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${system.maintenanceMode === 'true' ? 'bg-amber-500 text-white' : 'bg-background text-muted'}`}>
                            <AlertTriangle size={16}/>
                        </div>
                        <div>
                            <p className="font-black text-foreground text-sm">Modo manutenção</p>
                            <p className="text-[10px] text-muted">Bloqueia acesso ao sistema para todos (exceto Master)</p>
                        </div>
                    </div>
                    <button onClick={() => setSystem(p => ({...p, maintenanceMode: p.maintenanceMode === 'true' ? 'false' : 'true'}))}
                        className={`relative w-12 h-6 rounded-full transition-colors ${system.maintenanceMode === 'true' ? 'bg-amber-500' : 'bg-border'}`}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${system.maintenanceMode === 'true' ? 'left-7' : 'left-1'}`}/>
                    </button>
                </div>
                {system.maintenanceMode === 'true' && (
                    <textarea value={system.maintenanceMessage} onChange={e => setSystem(p => ({...p, maintenanceMessage: e.target.value}))}
                        className="w-full p-3 bg-white dark:bg-slate-900 border-2 border-amber-300 rounded-2xl outline-none focus:border-amber-500 text-sm font-medium text-foreground resize-none h-20"
                        placeholder="Mensagem para os usuários..."/>
                )}
            </div>

            {/* IDENTIDADE */}
            <SectionBox title="Identidade" icon={<Type size={12}/>}>
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Nome do sistema"><input value={system.systemName} onChange={e => setSystem(p => ({...p, systemName: e.target.value}))} className={inputCls} placeholder="TI BRODOWSKI"/></Field>
                    <Field label="Subtítulo"><input value={system.systemSubtitle} onChange={e => setSystem(p => ({...p, systemSubtitle: e.target.value}))} className={inputCls} placeholder="Central de Operações"/></Field>
                    <Field label="Cidade"><input value={system.cityName} onChange={e => setSystem(p => ({...p, cityName: e.target.value}))} className={inputCls} placeholder="Brodowski"/></Field>
                    <Field label="Sigla (máx 4)"><input value={system.logoText} onChange={e => setSystem(p => ({...p, logoText: e.target.value.slice(0,4)}))} className={inputCls} maxLength={4} placeholder="TI"/></Field>
                </div>
            </SectionBox>

            {/* SUPORTE */}
            <SectionBox title="Contato" icon={<Phone size={12}/>}>
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Telefone"><input value={system.supportPhone} onChange={e => setSystem(p => ({...p, supportPhone: e.target.value}))} className={inputCls} placeholder="(16) 3664-0000"/></Field>
                    <Field label="E-mail"><input value={system.supportEmail} onChange={e => setSystem(p => ({...p, supportEmail: e.target.value}))} className={inputCls} placeholder="ti@brodowski.sp.gov.br"/></Field>
                </div>
            </SectionBox>

            {/* COR */}
            <SectionBox title="Cor primária" icon={<Palette size={12}/>}>
                <div className="flex items-center gap-4">
                    <input type="color" value={system.primaryColor} onChange={e => setSystem(p => ({...p, primaryColor: e.target.value}))}
                        className="w-14 h-14 rounded-2xl border-2 border-border cursor-pointer bg-transparent"/>
                    <div><p className="font-black text-foreground">{system.primaryColor}</p><p className="text-[10px] text-muted">Afeta botões e destaques</p></div>
                    <div className="ml-auto px-5 py-2.5 rounded-2xl text-white text-xs font-black uppercase" style={{ backgroundColor: system.primaryColor }}>Preview</div>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                    {['#2563eb','#4f46e5','#7c3aed','#16a34a','#0d9488','#ea580c','#db2777','#475569'].map(hex => (
                        <button key={hex} onClick={() => setSystem(p => ({...p, primaryColor: hex}))}
                            className={`w-8 h-8 rounded-xl transition-all hover:scale-110 ${system.primaryColor === hex ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`}
                            style={{ backgroundColor: hex }}/>
                    ))}
                </div>
            </SectionBox>

            {/* REGISTRO */}
            <SectionBox title="Controle de acesso" icon={<Lock size={12}/>}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border">
                        <div>
                            <p className="text-sm font-black text-foreground">Permitir auto-registro</p>
                            <p className="text-[10px] text-muted">Usuários criam conta pela página de registro</p>
                        </div>
                        <button onClick={() => setSystem(p => ({...p, registrationOpen: p.registrationOpen === 'true' ? 'false' : 'true'}))}
                            className={`relative w-12 h-6 rounded-full transition-colors ${system.registrationOpen === 'true' ? 'bg-primary' : 'bg-border'}`}>
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${system.registrationOpen === 'true' ? 'left-7' : 'left-1'}`}/>
                        </button>
                    </div>
                    <Field label="Domínio obrigatório">
                        <div className="flex items-center gap-2 p-4 bg-background border-2 border-border rounded-2xl focus-within:border-primary transition-all">
                            <span className="text-muted font-bold text-sm">@</span>
                            <input value={system.allowedDomain} onChange={e => setSystem(p => ({...p, allowedDomain: e.target.value}))}
                                className="flex-1 bg-transparent outline-none font-bold text-foreground text-sm"
                                placeholder="brodowski.sp.gov.br"/>
                        </div>
                        <p className="text-[10px] text-muted mt-1 ml-1">Deixe vazio para aceitar qualquer e-mail.</p>
                    </Field>
                </div>
            </SectionBox>

            {/* BACKUP */}
            <SectionBox title="Backup de configurações" icon={<Download size={12}/>}>
                <div className="flex gap-3">
                    <button onClick={exportConfig}
                        className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 transition-all">
                        <Download size={15}/> Exportar JSON
                    </button>
                    <label className="flex-1 flex items-center justify-center gap-2 p-4 bg-background border-2 border-dashed border-border rounded-2xl font-black uppercase text-[11px] text-muted hover:border-primary hover:text-primary transition-all cursor-pointer">
                        <Upload size={15}/> Importar JSON
                        <input type="file" accept=".json" className="hidden" onChange={importConfig}/>
                    </label>
                </div>
            </SectionBox>

            <button onClick={save} disabled={saving}
                className="w-full flex items-center justify-center gap-2 p-5 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : 'Salvar configurações'}
            </button>
        </div>
    );
}

// ============================================================
// ABA PERFIS — com criar role customizada
// ============================================================
function TabPerfis({ showFeedback }: any) {
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(DEFAULT_PERMISSIONS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeRole, setActiveRole] = useState('FUNCIONARIO');
    const [allRoles, setAllRoles] = useState<string[]>([...FIXED_ROLES]);
    const [newRoleName, setNewRoleName] = useState('');
    const [showNewRole, setShowNewRole] = useState(false);

    useEffect(() => {
        fetch('/api/master/permissoes').then(r => r.json()).then(data => {
            if (Object.keys(data).length > 0) {
                setPermissions(prev => ({ ...prev, ...data }));
                const extra = Object.keys(data).filter(r => !FIXED_ROLES.includes(r));
                if (extra.length) setAllRoles([...FIXED_ROLES, ...extra]);
            }
        }).finally(() => setLoading(false));
    }, []);

    const toggle = (section: string) => {
        if (activeRole === 'MASTER') return;
        setPermissions(prev => ({
            ...prev,
            [activeRole]: { ...prev[activeRole], [section]: !prev[activeRole]?.[section] }
        }));
    };

    const save = async () => {
        setSaving(true);
        try {
            await Promise.all(allRoles.map(role =>
                fetch('/api/master/permissoes', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role, permissions: permissions[role] || {} })
                })
            ));
            showFeedback('success', 'Permissões salvas!');
        } finally { setSaving(false); }
    };

    const addRole = () => {
        const key = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
        if (!key || allRoles.includes(key)) { showFeedback('error', 'Nome inválido ou já existe.'); return; }
        setAllRoles(p => [...p, key]);
        setPermissions(p => ({ ...p, [key]: { abrir_chamado: false, meus_chamados: false, painel_tecnico: false, agenda: false, controlador: false, admin: false, acompanhar: true } }));
        setNewRoleName('');
        setShowNewRole(false);
        setActiveRole(key);
    };

    const deleteRole = async (role: string) => {
        if (FIXED_ROLES.includes(role)) { showFeedback('error', 'Não pode excluir roles fixas.'); return; }
        if (!confirm(`Excluir o perfil "${role}"?`)) return;
        const res = await fetch('/api/master/permissoes', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ role })
        });
        if (res.ok) {
            setAllRoles(p => p.filter(r => r !== role));
            setPermissions(p => { const n = {...p}; delete n[role]; return n; });
            setActiveRole('FUNCIONARIO');
            showFeedback('success', 'Perfil removido.');
        }
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-6">
            <div className="flex gap-2 flex-wrap items-center">
                {allRoles.map(role => (
                    <div key={role} className="relative group">
                        <button onClick={() => setActiveRole(role)}
                            className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase border-2 transition-all ${
                                activeRole === role
                                    ? (ROLE_COLORS[role] || 'border-primary bg-primary/10 text-primary')
                                    : 'border-border bg-card text-muted hover:text-foreground'
                            }`}>
                            {ROLE_LABELS[role] || role}
                        </button>
                        {!FIXED_ROLES.includes(role) && (
                            <button onClick={() => deleteRole(role)}
                                className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <X size={8}/>
                            </button>
                        )}
                    </div>
                ))}

                {showNewRole ? (
                    <div className="flex items-center gap-2">
                        <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRole()}
                            placeholder="Nome do perfil" autoFocus
                            className="p-2.5 bg-background border-2 border-primary rounded-xl outline-none text-sm font-bold text-foreground w-36"/>
                        <button onClick={addRole} className="p-2.5 bg-primary text-white rounded-xl"><Check size={14}/></button>
                        <button onClick={() => setShowNewRole(false)} className="p-2.5 bg-background border border-border rounded-xl text-muted"><X size={14}/></button>
                    </div>
                ) : (
                    <button onClick={() => setShowNewRole(true)}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-all">
                        <Plus size={13}/> Novo perfil
                    </button>
                )}
            </div>

            <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="bg-background/50 px-6 py-4 border-b border-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                        Permissões — {ROLE_LABELS[activeRole] || activeRole}
                        {activeRole === 'MASTER' && <span className="ml-2 text-red-500">(acesso total, não editável)</span>}
                    </p>
                </div>
                <div className="divide-y divide-border">
                    {SECTIONS.map(section => {
                        const enabled = activeRole === 'MASTER' ? true : !!permissions[activeRole]?.[section.key];
                        return (
                            <div key={section.key} className="flex items-center justify-between px-6 py-4 hover:bg-background/30 transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-foreground">{section.label}</p>
                                    <p className="text-[10px] text-muted">{section.desc}</p>
                                </div>
                                <button onClick={() => toggle(section.key)} disabled={activeRole === 'MASTER'}
                                    className={`relative w-12 h-6 rounded-full transition-colors disabled:cursor-not-allowed ${enabled ? 'bg-primary' : 'bg-border'}`}>
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${enabled ? 'left-7' : 'left-1'}`}/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button onClick={save} disabled={saving}
                className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : 'Salvar permissões'}
            </button>
        </div>
    );
}

// ============================================================
// ABA USUÁRIOS
// ============================================================
function TabUsuarios({ showFeedback }: any) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterRole, setFilterRole] = useState('TODOS');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    const [showCreate, setShowCreate] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'FUNCIONARIO' });
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = () => {
        fetch('/api/master/usuarios').then(r => r.json()).then(setUsers).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const startEdit = (user: any) => {
        setEditingId(user.id);
        setEditData({ name: user.name, email: user.email, role: user.role, active: user.active ?? true, newPassword: '' });
    };

    const saveEdit = async () => {
        setSaving(true);
        try {
            const body: any = { id: editingId, name: editData.name, email: editData.email, role: editData.role, active: editData.active };
            if (editData.newPassword?.trim()) body.newPassword = editData.newPassword;
            const res = await fetch('/api/master/usuarios', {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
            });
            if (res.ok) { setEditingId(null); load(); showFeedback('success', 'Usuário atualizado!'); }
            else showFeedback('error', 'Erro ao atualizar.');
        } finally { setSaving(false); }
    };

    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`Excluir permanentemente "${name}"? Esta ação não pode ser desfeita.`)) return;
        const res = await fetch('/api/master/usuarios', {
            method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id })
        });
        const data = await res.json();
        if (res.ok) { load(); showFeedback('success', 'Usuário removido.'); }
        else showFeedback('error', data.message || 'Erro ao remover.');
    };

    const toggleActive = async (user: any) => {
        await fetch('/api/master/usuarios', {
            method: 'PATCH', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, active: !user.active })
        });
        load();
        showFeedback('success', user.active ? 'Usuário desativado.' : 'Usuário ativado.');
    };

    const createUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) { showFeedback('error', 'Preencha todos os campos.'); return; }
        setCreating(true);
        try {
            const res = await fetch('/api/master/usuarios/criar', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser)
            });
            const data = await res.json();
            if (res.ok) { setShowCreate(false); setNewUser({ name: '', email: '', password: '', role: 'FUNCIONARIO' }); load(); showFeedback('success', 'Usuário criado!'); }
            else showFeedback('error', data.message || 'Erro ao criar.');
        } finally { setCreating(false); }
    };

    const filtered = users.filter(u => {
        const matchSearch = !search.trim() || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const matchRole = filterRole === 'TODOS' || u.role === filterRole;
        return matchSearch && matchRole;
    });

    const roleColors: Record<string, string> = {
        FUNCIONARIO: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        TECNICO:     'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
        CONTROLADOR: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        MASTER:      'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    };

    const counts = FIXED_ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {} as Record<string, number>);

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-5">
            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FIXED_ROLES.map(role => (
                    <button key={role} onClick={() => setFilterRole(filterRole === role ? 'TODOS' : role)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${filterRole === role ? (ROLE_COLORS[role] || 'border-primary bg-primary/10') : 'border-border bg-card'}`}>
                        <p className="text-2xl font-black text-foreground">{counts[role] || 0}</p>
                        <p className="text-[10px] font-black uppercase text-muted">{ROLE_LABELS[role]}</p>
                    </button>
                ))}
            </div>

            {/* BARRA DE AÇÕES */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"/>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou e-mail..."
                        className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl outline-none focus:border-primary text-sm font-bold text-foreground transition-all"/>
                </div>
                <button onClick={() => setShowCreate(!showCreate)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase text-[11px] transition-all ${showCreate ? 'bg-border text-foreground' : 'bg-primary text-white hover:opacity-90'}`}>
                    {showCreate ? <X size={15}/> : <UserPlus size={15}/>}
                    {showCreate ? 'Cancelar' : 'Novo'}
                </button>
            </div>

            {/* FORMULÁRIO CRIAR */}
            {showCreate && (
                <div className="bg-card border border-border rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Criar novo usuário</p>
                    <div className="grid md:grid-cols-2 gap-3">
                        <input value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} placeholder="Nome completo" className={inputCls}/>
                        <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))} placeholder="E-mail institucional" className={inputCls}/>
                        <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} placeholder="Senha provisória" className={inputCls}/>
                        <select value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value}))} className={inputCls}>
                            {FIXED_ROLES.map(r => <option key={r} value={r} className="bg-card">{ROLE_LABELS[r]}</option>)}
                        </select>
                    </div>
                    <button onClick={createUser} disabled={creating}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                        <UserCheck size={15}/> {creating ? 'Criando...' : 'Criar conta'}
                    </button>
                </div>
            )}

            {/* LISTA */}
            <div className="space-y-2">
                {filtered.length === 0 && <EmptyState text="Nenhum usuário encontrado."/>}
                {filtered.map(user => (
                    <div key={user.id} className={`bg-card border border-border rounded-2xl transition-all ${!user.active ? 'opacity-60' : ''}`}>
                        {editingId === user.id ? (
                            <div className="p-5 space-y-3 animate-in fade-in duration-200">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Editando: {user.name}</p>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input value={editData.name} onChange={e => setEditData((p: any) => ({...p, name: e.target.value}))} placeholder="Nome" className={inputCls}/>
                                    <input value={editData.email} onChange={e => setEditData((p: any) => ({...p, email: e.target.value}))} placeholder="E-mail" className={inputCls}/>
                                    <select value={editData.role} onChange={e => setEditData((p: any) => ({...p, role: e.target.value}))} className={inputCls}>
                                        {FIXED_ROLES.map(r => <option key={r} value={r} className="bg-card">{ROLE_LABELS[r]}</option>)}
                                    </select>
                                    <input type="password" value={editData.newPassword} onChange={e => setEditData((p: any) => ({...p, newPassword: e.target.value}))} placeholder="Nova senha (vazio = manter)" className={inputCls}/>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingId(null)} className="flex-1 p-3 rounded-xl bg-background border border-border text-muted font-black uppercase text-[10px] hover:bg-border transition-all">
                                        Cancelar
                                    </button>
                                    <button onClick={saveEdit} disabled={saving} className="flex-1 p-3 rounded-xl bg-primary text-white font-black uppercase text-[10px] hover:opacity-90 disabled:opacity-50 transition-all">
                                        {saving ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary shrink-0 text-sm">
                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-black text-foreground text-sm truncate">{user.name}</p>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${roleColors[user.role] || 'bg-card text-muted'}`}>
                                            {ROLE_LABELS[user.role] || user.role}
                                        </span>
                                        {!user.active && <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">Inativo</span>}
                                    </div>
                                    <p className="text-[10px] text-muted truncate">{user.email}</p>
                                    <p className="text-[9px] text-muted/60">
                                        {user._count?.tickets || 0} chamados · {user._count?.comments || 0} mensagens
                                    </p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => toggleActive(user)} title={user.active ? 'Desativar' : 'Ativar'}
                                        className={`p-2 rounded-xl transition-all ${user.active ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-muted hover:bg-background'}`}>
                                        {user.active ? <Unlock size={14}/> : <Lock size={14}/>}
                                    </button>
                                    <button onClick={() => startEdit(user)} className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-all">
                                        <Edit3 size={14}/>
                                    </button>
                                    <button onClick={() => deleteUser(user.id, user.name)} className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                        <UserX size={14}/>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// ABA AUDITORIA
// ============================================================
function TabAuditoria() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetch('/api/master/auditoria').then(r => r.json()).then(setLogs).finally(() => setLoading(false));
    }, []);

    const ACTION_STYLE: Record<string, string> = {
        SLA_UPDATE:    'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        SLA_DELETE:    'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        SYSTEM_CONFIG: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    };

    const filtered = logs.filter(l =>
        !search.trim() ||
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.userName.toLowerCase().includes(search.toLowerCase()) ||
        l.details.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar por ação, usuário ou detalhe..."
                    className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl outline-none focus:border-primary text-sm font-bold text-foreground transition-all"/>
            </div>

            {filtered.length === 0 && <EmptyState text="Nenhum registro de auditoria."/>}

            <div className="space-y-2">
                {filtered.map(log => (
                    <div key={log.id} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4">
                        <div className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase whitespace-nowrap shrink-0 ${ACTION_STYLE[log.action] || 'bg-card text-muted border border-border'}`}>
                            {log.action.replace('_', ' ')}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground truncate">{log.details}</p>
                            <p className="text-[10px] text-muted">{log.userName} · {new Date(log.createdAt).toLocaleString('pt-BR')}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// HELPERS
// ============================================================
const inputCls = "w-full p-3 bg-background border-2 border-border rounded-xl outline-none focus:border-primary font-bold text-foreground text-sm transition-all placeholder:text-muted/50";

function Spinner() {
    return <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"/></div>;
}
function EmptyState({ text }: { text: string }) {
    return <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl text-muted text-xs font-bold uppercase">{text}</div>;
}
function SectionBox({ title, icon, children }: any) {
    return (
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">{icon} {title}</p>
            {children}
        </div>
    );
}
function Field({ label, children }: any) {
    return <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-muted ml-1">{label}</label>{children}</div>;
}
function Search({ className, size }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
    );
}