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
    Edit3, X, Check, RefreshCw, UserX, UserPlus
} from 'lucide-react';

// =====================
// ÍCONES DISPONÍVEIS
// =====================
const AVAILABLE_ICONS: Record<string, any> = {
    Monitor, Wifi, Printer, ShieldAlert, FileText,
    Wrench, Laptop, Server, HardDrive, Database,
    Globe, Lock, Bell, Tag, LayoutGrid, Settings2,
    Shield, Clock, Building2, Phone, Mail, Key,
    Eye, Edit3, RefreshCw, UserCheck, Users
};

const ICON_NAMES = Object.keys(AVAILABLE_ICONS);

// =====================
// PERFIS E SEÇÕES
// =====================
const ROLES = ['FUNCIONARIO', 'TECNICO', 'CONTROLADOR', 'MASTER'];

const ROLE_LABELS: Record<string, string> = {
    FUNCIONARIO: 'Funcionário',
    TECNICO: 'Técnico',
    CONTROLADOR: 'Controlador',
    MASTER: 'Master',
};

const SECTIONS = [
    { key: 'abrir_chamado',    label: 'Abrir chamado' },
    { key: 'meus_chamados',    label: 'Ver meus chamados' },
    { key: 'painel_tecnico',   label: 'Painel técnico' },
    { key: 'agenda',           label: 'Agenda de visitas' },
    { key: 'controlador',      label: 'Painel controlador' },
    { key: 'admin',            label: 'Painel admin/master' },
    { key: 'acompanhar',       label: 'Acompanhamento público' },
];

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
    FUNCIONARIO: { abrir_chamado: true,  meus_chamados: true,  painel_tecnico: false, agenda: false, controlador: false, admin: false, acompanhar: true },
    TECNICO:     { abrir_chamado: true,  meus_chamados: true,  painel_tecnico: true,  agenda: true,  controlador: false, admin: false, acompanhar: true },
    CONTROLADOR: { abrir_chamado: true,  meus_chamados: true,  painel_tecnico: false, agenda: false, controlador: true,  admin: false, acompanhar: true },
    MASTER:      { abrir_chamado: true,  meus_chamados: true,  painel_tecnico: false, agenda: false, controlador: true,  admin: true,  acompanhar: true },
};

const PRIORIDADES = [
    { key: 'URGENTE', label: 'Urgente', defaultHours: 2,  color: 'red' },
    { key: 'ALTA',    label: 'Alta',    defaultHours: 4,  color: 'amber' },
    { key: 'NORMAL',  label: 'Normal',  defaultHours: 24, color: 'blue' },
    { key: 'BAIXA',   label: 'Baixa',   defaultHours: 72, color: 'gray' },
];

const COLOR_OPTIONS = [
    { value: 'red',    bg: 'bg-red-500' },
    { value: 'amber',  bg: 'bg-amber-500' },
    { value: 'blue',   bg: 'bg-blue-500' },
    { value: 'green',  bg: 'bg-green-500' },
    { value: 'purple', bg: 'bg-purple-500' },
    { value: 'gray',   bg: 'bg-gray-500' },
];

// =====================
// COMPONENTE PRINCIPAL
// =====================
export default function MasterConfigPage() {
    const [activeTab, setActiveTab] = useState<'categorias' | 'secretarias' | 'sla' | 'sistema' | 'perfis' | 'usuarios'>('categorias');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
    const [saving, setSaving] = useState(false);

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
    ];

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-10 space-y-8">
            <header>
                <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">
                    Configurações <span className="text-primary italic">Master</span>
                </h1>
                <p className="text-muted text-sm font-medium mt-1">Personalize e gerencie todo o sistema</p>
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

            {/* ABAS */}
            <div className="flex gap-1.5 flex-wrap bg-card border border-border p-1.5 rounded-2xl">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                                active ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'
                            }`}
                        >
                            <Icon size={13}/>
                            <span className="hidden sm:inline">{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* CONTEÚDO DAS ABAS */}
            {activeTab === 'categorias'  && <TabCategorias  showFeedback={showFeedback} />}
            {activeTab === 'secretarias' && <TabSecretarias showFeedback={showFeedback} />}
            {activeTab === 'sla'         && <TabSLA         showFeedback={showFeedback} />}
            {activeTab === 'sistema'     && <TabSistema     showFeedback={showFeedback} />}
            {activeTab === 'perfis'      && <TabPerfis      showFeedback={showFeedback} />}
            {activeTab === 'usuarios'    && <TabUsuarios    showFeedback={showFeedback} />}
        </div>
    );
}

// =====================
// ABA: CATEGORIAS
// =====================
function TabCategorias({ showFeedback }: any) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showIconPicker, setShowIconPicker] = useState<number | null>(null);

    useEffect(() => {
        fetch('/api/master/categorias')
            .then(r => r.json())
            .then(data => setItems(data.length > 0 ? data : [
                { id: 'new_1', name: 'Hardware', icon: 'Monitor', order: 0, active: true },
                { id: 'new_2', name: 'Rede', icon: 'Wifi', order: 1, active: true },
            ]))
            .finally(() => setLoading(false));
    }, []);

    const addItem = () => {
        setItems(prev => [...prev, {
            id: `new_${Date.now()}`,
            name: '',
            icon: 'Monitor',
            order: prev.length,
            active: true
        }]);
    };

    const removeItem = (idx: number) => {
        setItems(prev => prev.filter((_, i) => i !== idx));
    };

    const updateItem = (idx: number, field: string, value: any) => {
        setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const moveItem = (idx: number, dir: 'up' | 'down') => {
        const newItems = [...items];
        const target = dir === 'up' ? idx - 1 : idx + 1;
        if (target < 0 || target >= newItems.length) return;
        [newItems[idx], newItems[target]] = [newItems[target], newItems[idx]];
        setItems(newItems.map((item, i) => ({ ...item, order: i })));
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
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            {/* PREVIEW */}
            <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted">Preview — Passo 1 do novo chamado</p>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {items.filter(i => i.active && i.name).map((item, idx) => {
                        const Icon = AVAILABLE_ICONS[item.icon] || Monitor;
                        return (
                            <div key={idx} className="p-4 bg-background border-2 border-border rounded-2xl flex flex-col items-center gap-2">
                                <div className="p-3 bg-card rounded-xl text-foreground">
                                    <Icon size={24}/>
                                </div>
                                <span className="font-black text-foreground uppercase text-[9px] tracking-widest text-center line-clamp-1">{item.name}</span>
                            </div>
                        );
                    })}
                    {items.filter(i => i.active && i.name).length === 0 && (
                        <p className="col-span-4 text-center text-muted text-xs py-4">Adicione categorias abaixo para ver o preview.</p>
                    )}
                </div>
            </div>

            {/* LISTA DE ITENS */}
            <div className="space-y-3">
                {items.map((item, idx) => {
                    const Icon = AVAILABLE_ICONS[item.icon] || Monitor;
                    return (
                        <div key={item.id} className={`bg-card border border-border rounded-2xl p-4 transition-all ${!item.active ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-3">
                                {/* REORDENAR */}
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => moveItem(idx, 'up')} disabled={idx === 0} className="text-muted hover:text-foreground disabled:opacity-20 transition-colors">
                                        <GripVertical size={14}/>
                                    </button>
                                </div>

                                {/* ÍCONE SELETOR */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowIconPicker(showIconPicker === idx ? null : idx)}
                                        className="w-12 h-12 rounded-xl bg-background border-2 border-border hover:border-primary flex items-center justify-center text-foreground transition-all"
                                    >
                                        <Icon size={22}/>
                                    </button>
                                    {showIconPicker === idx && (
                                        <div className="absolute left-0 top-14 z-20 bg-card border border-border rounded-2xl p-3 shadow-2xl grid grid-cols-5 gap-2 w-56">
                                            {ICON_NAMES.map(iconName => {
                                                const IIcon = AVAILABLE_ICONS[iconName];
                                                return (
                                                    <button
                                                        key={iconName}
                                                        onClick={() => { updateItem(idx, 'icon', iconName); setShowIconPicker(null); }}
                                                        title={iconName}
                                                        className={`p-2 rounded-xl hover:bg-primary hover:text-white transition-all ${item.icon === iconName ? 'bg-primary text-white' : 'bg-background text-foreground'}`}
                                                    >
                                                        <IIcon size={16}/>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* NOME */}
                                <input
                                    value={item.name}
                                    onChange={e => updateItem(idx, 'name', e.target.value)}
                                    placeholder="Nome da categoria..."
                                    className="flex-1 p-3 bg-background border-2 border-border rounded-xl outline-none focus:border-primary text-sm font-bold text-foreground placeholder:text-muted/50 transition-all"
                                />

                                {/* ATIVO/INATIVO */}
                                <button
                                    onClick={() => updateItem(idx, 'active', !item.active)}
                                    title={item.active ? 'Desativar' : 'Ativar'}
                                    className={`p-2.5 rounded-xl transition-all ${item.active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-background text-muted'}`}
                                >
                                    {item.active ? <Eye size={16}/> : <EyeOff size={16}/>}
                                </button>

                                {/* REMOVER */}
                                <button
                                    onClick={() => removeItem(idx)}
                                    className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition-all"
                                >
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <button
                    onClick={addItem}
                    className="flex items-center gap-2 px-5 py-3 bg-background border-2 border-dashed border-border rounded-2xl text-[11px] font-black uppercase text-muted hover:border-primary hover:text-primary transition-all"
                >
                    <Plus size={16}/> Adicionar categoria
                </button>
                <button
                    onClick={save}
                    disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 transition-all disabled:opacity-50"
                >
                    <Save size={16}/> {saving ? 'Salvando...' : 'Salvar categorias'}
                </button>
            </div>
        </div>
    );
}

// =====================
// ABA: SECRETARIAS
// =====================
function TabSecretarias({ showFeedback }: any) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);

    const load = () => {
        fetch('/api/config/options')
            .then(r => r.json())
            .then(d => setItems(d.departments || []))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    const add = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/config/options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'department', name: newName.trim() })
            });
            if (res.ok) { setNewName(''); load(); showFeedback('success', 'Secretaria adicionada!'); }
        } finally { setSaving(false); }
    };

    const remove = async (id: string) => {
        if (!confirm('Excluir esta secretaria?')) return;
        const res = await fetch(`/api/config/options?type=department&id=${id}`, { method: 'DELETE' });
        if (res.ok) { load(); showFeedback('success', 'Secretaria removida.'); }
        else showFeedback('error', 'Erro: secretaria pode estar em uso.');
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex gap-3">
                <input
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && add()}
                    placeholder="Nome da secretaria ou departamento..."
                    className="flex-1 p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary text-sm font-bold text-foreground placeholder:text-muted/50 transition-all"
                />
                <button
                    onClick={add}
                    disabled={saving || !newName.trim()}
                    className="flex items-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 transition-all disabled:opacity-50"
                >
                    <Plus size={16}/> Adicionar
                </button>
            </div>

            <div className="space-y-2">
                {items.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl text-muted text-xs font-bold uppercase">
                        Nenhuma secretaria cadastrada.
                    </div>
                )}
                {items.map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                <Building2 size={14} className="text-primary"/>
                            </div>
                            <span className="font-bold text-foreground text-sm">{item.name}</span>
                        </div>
                        <button
                            onClick={() => remove(item.id)}
                            className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                        >
                            <Trash2 size={16}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// =====================
// ABA: SLA
// =====================
function TabSLA({ showFeedback }: any) {
    const [slaValues, setSlaValues] = useState<Record<string, any>>(
        Object.fromEntries(PRIORIDADES.map(p => [p.key, { maxHours: p.defaultHours, label: p.label, color: p.color }]))
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/master/config')
            .then(r => r.json())
            .then(data => {
                if (data.sla?.length) {
                    const map: any = {};
                    data.sla.forEach((s: any) => { map[s.priority] = { maxHours: s.maxHours, label: s.label, color: s.color }; });
                    setSlaValues(prev => ({ ...prev, ...map }));
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await Promise.all(PRIORIDADES.map(p =>
                fetch('/api/master/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'sla', data: { priority: p.key, ...slaValues[p.key] } })
                })
            ));
            showFeedback('success', 'SLA salvo!');
        } finally { setSaving(false); }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="bg-background/50 px-6 py-4 border-b border-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <Clock size={12}/> Tempo máximo por prioridade
                    </p>
                </div>
                <div className="divide-y divide-border">
                    {PRIORIDADES.map(p => {
                        const val = slaValues[p.key];
                        return (
                            <div key={p.key} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted">Prioridade</label>
                                    <span className={`inline-flex px-4 py-2 rounded-xl text-[11px] font-black uppercase border ${
                                        p.color === 'red'   ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100' :
                                        p.color === 'amber' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100' :
                                        p.color === 'blue'  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100' :
                                        'bg-card text-muted border-border'
                                    }`}>{p.label}</span>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted">Prazo (horas)</label>
                                    <input
                                        type="number" min={1}
                                        value={val.maxHours}
                                        onChange={e => setSlaValues(prev => ({ ...prev, [p.key]: { ...prev[p.key], maxHours: Number(e.target.value) } }))}
                                        className="w-full p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-black text-foreground text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted">Cor</label>
                                    <div className="flex gap-2">
                                        {COLOR_OPTIONS.map(c => (
                                            <button key={c.value} onClick={() => setSlaValues(prev => ({ ...prev, [p.key]: { ...prev[p.key], color: c.value } }))}
                                                className={`w-7 h-7 rounded-full ${c.bg} transition-all ${val.color === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-50 hover:opacity-100'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 p-5 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 transition-all disabled:opacity-50">
                <Save size={16}/> {saving ? 'Salvando...' : 'Salvar SLA'}
            </button>
        </div>
    );
}

// =====================
// ABA: SISTEMA
// =====================
function TabSistema({ showFeedback }: any) {
    const [system, setSystem] = useState({
        systemName: 'TI BRODOWSKI', systemSubtitle: 'Central de Operações',
        cityName: 'Brodowski', supportPhone: '', supportEmail: '',
        primaryColor: '#2563eb', logoText: 'TI',
        allowedDomain: '', registrationOpen: 'true'
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/master/config')
            .then(r => r.json())
            .then(data => { if (data.system) setSystem(prev => ({ ...prev, ...data.system })); })
            .finally(() => setLoading(false));
    }, []);

    const save = async () => {
        setSaving(true);
        try {
            await Promise.all(Object.entries(system).map(([key, value]) =>
                fetch('/api/master/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'system', data: { key, value } })
                })
            ));
            showFeedback('success', 'Configurações salvas!');
        } finally { setSaving(false); }
    };

    if (loading) return <LoadingSpinner />;

    const inputClass = "w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-bold text-foreground text-sm transition-all";
    const labelClass = "text-[10px] font-black uppercase text-muted ml-1";

    return (
        <div className="space-y-6">
            {/* IDENTIDADE */}
            <SectionBox title="Identidade" icon={<Type size={12}/>}>
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Nome do sistema"><input value={system.systemName} onChange={e => setSystem(p => ({...p, systemName: e.target.value}))} className={inputClass} placeholder="TI BRODOWSKI"/></Field>
                    <Field label="Subtítulo"><input value={system.systemSubtitle} onChange={e => setSystem(p => ({...p, systemSubtitle: e.target.value}))} className={inputClass} placeholder="Central de Operações"/></Field>
                    <Field label="Cidade"><input value={system.cityName} onChange={e => setSystem(p => ({...p, cityName: e.target.value}))} className={inputClass} placeholder="Brodowski"/></Field>
                    <Field label="Sigla (máx 4 chars)"><input value={system.logoText} onChange={e => setSystem(p => ({...p, logoText: e.target.value.slice(0,4)}))} className={inputClass} maxLength={4} placeholder="TI"/></Field>
                </div>
            </SectionBox>

            {/* SUPORTE */}
            <SectionBox title="Contato de suporte" icon={<Phone size={12}/>}>
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Telefone"><input value={system.supportPhone} onChange={e => setSystem(p => ({...p, supportPhone: e.target.value}))} className={inputClass} placeholder="(16) 3664-0000"/></Field>
                    <Field label="E-mail"><input value={system.supportEmail} onChange={e => setSystem(p => ({...p, supportEmail: e.target.value}))} className={inputClass} placeholder="ti@brodowski.sp.gov.br"/></Field>
                </div>
            </SectionBox>

            {/* COR */}
            <SectionBox title="Cor primária" icon={<Palette size={12}/>}>
                <div className="flex items-center gap-4">
                    <input type="color" value={system.primaryColor} onChange={e => setSystem(p => ({...p, primaryColor: e.target.value}))} className="w-14 h-14 rounded-2xl border-2 border-border cursor-pointer bg-transparent"/>
                    <div>
                        <p className="font-black text-foreground">{system.primaryColor}</p>
                        <p className="text-[10px] text-muted">Afeta botões e destaques</p>
                    </div>
                    <div className="ml-auto px-5 py-2.5 rounded-2xl text-white text-xs font-black uppercase" style={{ backgroundColor: system.primaryColor }}>Preview</div>
                </div>
                <div className="flex gap-2 flex-wrap mt-3">
                    {['#2563eb','#4f46e5','#7c3aed','#16a34a','#0d9488','#ea580c','#db2777','#475569'].map(hex => (
                        <button key={hex} onClick={() => setSystem(p => ({...p, primaryColor: hex}))}
                            className={`w-8 h-8 rounded-xl transition-all hover:scale-110 ${system.primaryColor === hex ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`}
                            style={{ backgroundColor: hex }}
                        />
                    ))}
                </div>
            </SectionBox>

            {/* REGISTRO */}
            <SectionBox title="Controle de registro" icon={<Lock size={12}/>}>
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
                                placeholder="brodowski.sp.gov.br (vazio = qualquer e-mail)"/>
                        </div>
                    </Field>
                </div>
            </SectionBox>

            <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 p-5 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 transition-all disabled:opacity-50">
                <Save size={16}/> {saving ? 'Salvando...' : 'Salvar configurações'}
            </button>
        </div>
    );
}

// =====================
// ABA: PERFIS
// =====================
function TabPerfis({ showFeedback }: any) {
    const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>(DEFAULT_PERMISSIONS);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeRole, setActiveRole] = useState('FUNCIONARIO');

    useEffect(() => {
        fetch('/api/master/permissoes')
            .then(r => r.json())
            .then(data => {
                if (Object.keys(data).length > 0) {
                    setPermissions(prev => ({ ...prev, ...data }));
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const toggle = (section: string) => {
        if (activeRole === 'MASTER') return; // Master sempre tem tudo
        setPermissions(prev => ({
            ...prev,
            [activeRole]: { ...prev[activeRole], [section]: !prev[activeRole]?.[section] }
        }));
    };

    const save = async () => {
        setSaving(true);
        try {
            await Promise.all(ROLES.map(role =>
                fetch('/api/master/permissoes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ role, permissions: permissions[role] || {} })
                })
            ));
            showFeedback('success', 'Permissões salvas!');
        } finally { setSaving(false); }
    };

    if (loading) return <LoadingSpinner />;

    const roleColors: Record<string, string> = {
        FUNCIONARIO: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
        TECNICO:     'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
        CONTROLADOR: 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
        MASTER:      'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    };

    return (
        <div className="space-y-6">
            {/* SELETOR DE ROLE */}
            <div className="flex gap-2 flex-wrap">
                {ROLES.map(role => (
                    <button key={role} onClick={() => setActiveRole(role)}
                        className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase border-2 transition-all ${
                            activeRole === role ? roleColors[role] : 'border-border bg-card text-muted hover:text-foreground'
                        }`}>
                        {ROLE_LABELS[role]}
                    </button>
                ))}
            </div>

            {/* PERMISSÕES */}
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="bg-background/50 px-6 py-4 border-b border-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                        Seções acessíveis — {ROLE_LABELS[activeRole]}
                        {activeRole === 'MASTER' && <span className="ml-2 text-red-500">(acesso total, não editável)</span>}
                    </p>
                </div>
                <div className="divide-y divide-border">
                    {SECTIONS.map(section => {
                        const enabled = activeRole === 'MASTER' ? true : !!permissions[activeRole]?.[section.key];
                        return (
                            <div key={section.key} className="flex items-center justify-between px-6 py-4">
                                <div>
                                    <p className="text-sm font-bold text-foreground">{section.label}</p>
                                    <p className="text-[10px] text-muted">/{section.key.replace('_', '/')}</p>
                                </div>
                                <button
                                    onClick={() => toggle(section.key)}
                                    disabled={activeRole === 'MASTER'}
                                    className={`relative w-12 h-6 rounded-full transition-colors disabled:opacity-70 ${enabled ? 'bg-primary' : 'bg-border'}`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${enabled ? 'left-7' : 'left-1'}`}/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>

            <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 p-5 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 transition-all disabled:opacity-50">
                <Save size={16}/> {saving ? 'Salvando...' : 'Salvar permissões'}
            </button>
        </div>
    );
}

// =====================
// ABA: USUÁRIOS
// =====================
function TabUsuarios({ showFeedback }: any) {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>({});
    const [showCreate, setShowCreate] = useState(false);
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'FUNCIONARIO' });
    const [creating, setCreating] = useState(false);
    const [saving, setSaving] = useState(false);

    const load = () => {
        fetch('/api/master/usuarios')
            .then(r => r.json())
            .then(setUsers)
            .finally(() => setLoading(false));
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
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            if (res.ok) { setEditingId(null); load(); showFeedback('success', 'Usuário atualizado!'); }
            else showFeedback('error', 'Erro ao atualizar.');
        } finally { setSaving(false); }
    };

    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`Excluir permanentemente ${name}?`)) return;
        const res = await fetch('/api/master/usuarios', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        if (res.ok) { load(); showFeedback('success', 'Usuário removido.'); }
        else showFeedback('error', 'Erro ao remover.');
    };

    const toggleActive = async (user: any) => {
        await fetch('/api/master/usuarios', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: user.id, active: !user.active })
        });
        load();
    };

    const createUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) {
            showFeedback('error', 'Preencha todos os campos.'); return;
        }
        setCreating(true);
        try {
            const res = await fetch('/api/master/usuarios/criar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newUser)
            });
            const data = await res.json();
            if (res.ok) {
                setShowCreate(false);
                setNewUser({ name: '', email: '', password: '', role: 'FUNCIONARIO' });
                load();
                showFeedback('success', 'Usuário criado!');
            } else {
                showFeedback('error', data.message || 'Erro ao criar.');
            }
        } finally { setCreating(false); }
    };

    const roleColors: Record<string, string> = {
        FUNCIONARIO: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        TECNICO:     'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
        CONTROLADOR: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        MASTER:      'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    };

    const filtered = users.filter(u =>
        !search.trim() ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
    );

    const inputClass = "w-full p-3 bg-background border-2 border-border rounded-xl outline-none focus:border-primary font-bold text-foreground text-sm transition-all";

    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-5">
            {/* BARRA DE AÇÕES */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"/>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nome ou e-mail..."
                        className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl outline-none focus:border-primary text-sm font-bold text-foreground transition-all"/>
                </div>
                <button onClick={() => setShowCreate(!showCreate)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase text-[11px] transition-all ${
                        showCreate ? 'bg-border text-foreground' : 'bg-primary text-white hover:opacity-90'
                    }`}>
                    {showCreate ? <X size={15}/> : <UserPlus size={15}/>}
                    {showCreate ? 'Cancelar' : 'Novo usuário'}
                </button>
            </div>

            {/* FORMULÁRIO CRIAR */}
            {showCreate && (
                <div className="bg-card border border-border rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">Novo usuário</p>
                    <div className="grid md:grid-cols-2 gap-3">
                        <input value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} placeholder="Nome completo" className={inputClass}/>
                        <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))} placeholder="E-mail" className={inputClass}/>
                        <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} placeholder="Senha provisória" className={inputClass}/>
                        <select value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value}))} className={inputClass}>
                            {ROLES.map(r => <option key={r} value={r} className="bg-card">{ROLE_LABELS[r]}</option>)}
                        </select>
                    </div>
                    <button onClick={createUser} disabled={creating}
                        className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                        <UserCheck size={15}/> {creating ? 'Criando...' : 'Criar conta'}
                    </button>
                </div>
            )}

            {/* LISTA DE USUÁRIOS */}
            <div className="space-y-2">
                {filtered.length === 0 && (
                    <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl text-muted text-xs font-bold uppercase">
                        Nenhum usuário encontrado.
                    </div>
                )}
                {filtered.map(user => (
                    <div key={user.id} className={`bg-card border border-border rounded-2xl transition-all ${!user.active ? 'opacity-50' : ''}`}>
                        {editingId === user.id ? (
                            // MODO EDIÇÃO
                            <div className="p-5 space-y-3">
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Editando {user.name}</p>
                                <div className="grid md:grid-cols-2 gap-3">
                                    <input value={editData.name} onChange={e => setEditData((p: any) => ({...p, name: e.target.value}))} placeholder="Nome" className={inputClass}/>
                                    <input value={editData.email} onChange={e => setEditData((p: any) => ({...p, email: e.target.value}))} placeholder="E-mail" className={inputClass}/>
                                    <select value={editData.role} onChange={e => setEditData((p: any) => ({...p, role: e.target.value}))} className={inputClass}>
                                        {ROLES.map(r => <option key={r} value={r} className="bg-card">{ROLE_LABELS[r]}</option>)}
                                    </select>
                                    <input type="password" value={editData.newPassword} onChange={e => setEditData((p: any) => ({...p, newPassword: e.target.value}))} placeholder="Nova senha (vazio = não altera)" className={inputClass}/>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingId(null)} className="flex-1 p-3 rounded-xl bg-background border border-border text-muted font-black uppercase text-[10px] hover:bg-border transition-all">
                                        <X size={14} className="inline mr-1"/> Cancelar
                                    </button>
                                    <button onClick={saveEdit} disabled={saving} className="flex-1 p-3 rounded-xl bg-primary text-white font-black uppercase text-[10px] hover:opacity-90 disabled:opacity-50 transition-all">
                                        <Check size={14} className="inline mr-1"/> {saving ? 'Salvando...' : 'Salvar'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            // MODO VISUALIZAÇÃO
                            <div className="p-4 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary shrink-0">
                                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-black text-foreground text-sm truncate">{user.name}</p>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${roleColors[user.role] || 'bg-card text-muted'}`}>
                                            {ROLE_LABELS[user.role] || user.role}
                                        </span>
                                        {!user.active && (
                                            <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400">
                                                Inativo
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[10px] text-muted truncate">{user.email}</p>
                                    <p className="text-[9px] text-muted/60 mt-0.5">
                                        {user._count?.tickets || 0} chamados · {user._count?.comments || 0} comentários
                                    </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                    <button onClick={() => toggleActive(user)} title={user.active ? 'Desativar' : 'Ativar'}
                                        className={`p-2 rounded-xl transition-all ${user.active ? 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20' : 'text-muted hover:bg-background'}`}>
                                        {user.active ? <Unlock size={15}/> : <Lock size={15}/>}
                                    </button>
                                    <button onClick={() => startEdit(user)} title="Editar"
                                        className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-all">
                                        <Edit3 size={15}/>
                                    </button>
                                    <button onClick={() => deleteUser(user.id, user.name)} title="Excluir"
                                        className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                                        <UserX size={15}/>
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

// =====================
// HELPERS
// =====================
function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"/>
        </div>
    );
}

function SectionBox({ title, icon, children }: any) {
    return (
        <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                {icon} {title}
            </p>
            {children}
        </div>
    );
}

function Field({ label, children }: any) {
    return (
        <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase text-muted ml-1">{label}</label>
            {children}
        </div>
    );
}

// Adicionar Search ao import
function Search({ className, size }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
    );
}