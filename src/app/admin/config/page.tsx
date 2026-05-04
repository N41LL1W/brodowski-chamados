"use client";

import { useEffect, useState, useRef } from 'react';
import {
    Settings2, Shield, Clock, Palette, Save,
    CheckCircle2, AlertCircle, Building2, Phone,
    Mail, Type, Plus, Trash2, GripVertical,
    Users, Eye, EyeOff, Key, UserCheck,
    Monitor, Wifi, Printer, ShieldAlert, FileText,
    Wrench, Laptop, Server, HardDrive, Database,
    Globe, Lock, Unlock, Bell, Tag, LayoutGrid,
    Edit3, X, Check, RefreshCw, UserX, UserPlus,
    AlertTriangle, Download, Upload, History,
    MessageSquare, Calendar, ToggleLeft, ToggleRight,
    Sun, Moon, Sliders, BarChart3, BookOpen,
    Hash, AlignLeft, ChevronDown, List
} from 'lucide-react';

// =====================
// CONSTANTES
// =====================
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
    TECNICO: 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400',
    CONTROLADOR: 'border-purple-400 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    MASTER: 'border-red-400 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400',
};
const SECTIONS = [
    { key: 'abrir_chamado',  label: 'Abrir chamado',       desc: 'Criar novos chamados' },
    { key: 'meus_chamados',  label: 'Meus chamados',       desc: 'Ver chamados próprios' },
    { key: 'painel_tecnico', label: 'Painel técnico',      desc: 'Fila e atendimento' },
    { key: 'agenda',         label: 'Agenda de visitas',   desc: 'Agendamentos técnicos' },
    { key: 'controlador',    label: 'Painel controlador',  desc: 'Dashboard e logs' },
    { key: 'admin',          label: 'Painel admin/master', desc: 'Configurações do sistema' },
    { key: 'acompanhar',     label: 'Acompanhamento',      desc: 'Sem login necessário' },
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

// Variáveis de tema com labels amigáveis
const THEME_VARS = [
    { key: '--bg-primary',    label: 'Fundo principal',    group: 'Fundos' },
    { key: '--bg-secondary',  label: 'Fundo secundário',   group: 'Fundos' },
    { key: '--text-primary',  label: 'Texto principal',    group: 'Textos' },
    { key: '--text-secondary',label: 'Texto secundário',   group: 'Textos' },
    { key: '--border-color',  label: 'Cor das bordas',     group: 'Bordas' },
    { key: '--brand-color',   label: 'Cor de destaque',    group: 'Marca' },
];

const LIGHT_DEFAULTS: Record<string, string> = {
    '--bg-primary': '#f9fafb', '--bg-secondary': '#ffffff',
    '--text-primary': '#111827', '--text-secondary': '#4b5563',
    '--border-color': '#e5e7eb', '--brand-color': '#2563eb',
};
const DARK_DEFAULTS: Record<string, string> = {
    '--bg-primary': '#020617', '--bg-secondary': '#0f172a',
    '--text-primary': '#f8fafc', '--text-secondary': '#94a3b8',
    '--border-color': '#1e293b', '--brand-color': '#3b82f6',
};

const inputCls = "w-full p-3 bg-background border-2 border-border rounded-xl outline-none focus:border-primary font-bold text-foreground text-sm transition-all placeholder:text-muted/50";

// =====================
// PRINCIPAL
// =====================
export default function MasterConfigPage() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const showFeedback = (type: 'success' | 'error', msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 4000);
    };

    const TABS = [
        { id: 'dashboard',   label: 'Dashboard',   icon: BarChart3 },
        { id: 'categorias',  label: 'Categorias',  icon: LayoutGrid },
        { id: 'secretarias', label: 'Secretarias', icon: Building2 },
        { id: 'sla',         label: 'SLA',         icon: Clock },
        { id: 'sistema',     label: 'Sistema',     icon: Settings2 },
        { id: 'temas',       label: 'Temas',       icon: Palette },
        { id: 'perfis',      label: 'Perfis',      icon: Shield },
        { id: 'usuarios',    label: 'Usuários',    icon: Users },
        { id: 'notificacoes',label: 'Alertas',     icon: Bell },
        { id: 'campos',      label: 'Campos',      icon: Sliders },
        { id: 'horarios',    label: 'Horários',    icon: Calendar },
        { id: 'mensagens',   label: 'Mensagens',   icon: MessageSquare },
        { id: 'termos',      label: 'Termos',      icon: BookOpen },
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

            {/* ABAS — scroll horizontal no mobile */}
            <div className="overflow-x-auto pb-1">
                <div className="flex gap-1.5 bg-card border border-border p-1.5 rounded-2xl w-max min-w-full">
                    {TABS.map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                    activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'
                                }`}>
                                <Icon size={13}/>
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {activeTab === 'dashboard'    && <TabDashboard/>}
            {activeTab === 'categorias'   && <TabCategorias   showFeedback={showFeedback}/>}
            {activeTab === 'secretarias'  && <TabSecretarias  showFeedback={showFeedback}/>}
            {activeTab === 'sla'          && <TabSLA          showFeedback={showFeedback}/>}
            {activeTab === 'sistema'      && <TabSistema      showFeedback={showFeedback}/>}
            {activeTab === 'temas'        && <TabTemas        showFeedback={showFeedback}/>}
            {activeTab === 'perfis'       && <TabPerfis       showFeedback={showFeedback}/>}
            {activeTab === 'usuarios'     && <TabUsuarios     showFeedback={showFeedback}/>}
            {activeTab === 'notificacoes' && <TabNotificacoes showFeedback={showFeedback}/>}
            {activeTab === 'campos'       && <TabCampos       showFeedback={showFeedback}/>}
            {activeTab === 'horarios'     && <TabHorarios     showFeedback={showFeedback}/>}
            {activeTab === 'mensagens'    && <TabMensagens    showFeedback={showFeedback}/>}
            {activeTab === 'termos'       && <TabTermos       showFeedback={showFeedback}/>}
            {activeTab === 'auditoria'    && <TabAuditoria/>}
        </div>
    );
}

// =====================
// ABA DASHBOARD
// =====================
function TabDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/master/dashboard').then(r => r.json()).then(setData).finally(() => setLoading(false));
    }, []);

    if (loading) return <Spinner/>;
    if (!data) return <EmptyState text="Erro ao carregar dados."/>;

    return (
        <div className="space-y-6">
            {/* CARDS PRINCIPAIS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard label="Usuários ativos" value={data.users.active} sub={`${data.users.inactive} inativos`} color="text-blue-600" bg="bg-blue-500/10"/>
                <StatCard label="Chamados total" value={data.tickets.total} sub={`${data.tickets.last7} esta semana`} color="text-purple-600" bg="bg-purple-500/10"/>
                <StatCard label="Em andamento" value={data.tickets.emAndamento} sub={`${data.tickets.abertos} abertos`} color="text-amber-600" bg="bg-amber-500/10"/>
                <StatCard label="Concluídos" value={data.tickets.concluidos} sub={`${data.tickets.last30} este mês`} color="text-emerald-600" bg="bg-emerald-500/10"/>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* RANKING TÉCNICOS */}
                <SectionBox title="Ranking de técnicos" icon={<Users size={12}/>}>
                    <div className="space-y-3">
                        {data.tecnicos.length === 0 && <EmptyState text="Nenhum técnico cadastrado."/>}
                        {data.tecnicos.slice(0, 5).map((t: any, i: number) => (
                            <div key={t.id} className="flex items-center gap-3">
                                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                                    i === 0 ? 'bg-amber-100 text-amber-600' :
                                    i === 1 ? 'bg-slate-100 text-slate-600' :
                                    i === 2 ? 'bg-orange-100 text-orange-600' :
                                    'bg-card text-muted border border-border'
                                }`}>{i + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-foreground truncate">{t.name}</p>
                                    <div className="h-1.5 bg-border rounded-full mt-1">
                                        <div className="h-full bg-primary rounded-full"
                                            style={{ width: t.total > 0 ? `${(t.concluidos / t.total) * 100}%` : '0%' }}/>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="text-xs font-black text-foreground">{t.concluidos}</p>
                                    <p className="text-[9px] text-muted">concluídos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionBox>

                {/* AUDITORIA RECENTE */}
                <SectionBox title="Últimas ações" icon={<History size={12}/>}>
                    <div className="space-y-2">
                        {data.recentAudit.length === 0 && <EmptyState text="Nenhum registro."/>}
                        {data.recentAudit.map((log: any) => (
                            <div key={log.id} className="flex items-start gap-3 p-3 bg-background rounded-xl">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"/>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-foreground truncate">{log.details}</p>
                                    <p className="text-[9px] text-muted">{log.userName} · {new Date(log.createdAt).toLocaleString('pt-BR')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </SectionBox>
            </div>

            {/* STATUS DOS CHAMADOS */}
            <SectionBox title="Distribuição por status" icon={<BarChart3 size={12}/>}>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {[
                        { label: 'Abertos',      value: data.tickets.abertos,      color: 'bg-amber-500' },
                        { label: 'Em andamento', value: data.tickets.emAndamento,  color: 'bg-blue-500' },
                        { label: 'Pausados',     value: data.tickets.pausados,     color: 'bg-purple-500' },
                        { label: 'Concluídos',   value: data.tickets.concluidos,   color: 'bg-emerald-500' },
                        { label: 'Total',        value: data.tickets.total,        color: 'bg-foreground' },
                    ].map(item => (
                        <div key={item.label} className="bg-background rounded-2xl p-4 text-center">
                            <div className={`w-3 h-3 rounded-full ${item.color} mx-auto mb-2`}/>
                            <p className="text-2xl font-black text-foreground">{item.value}</p>
                            <p className="text-[9px] text-muted uppercase font-bold">{item.label}</p>
                        </div>
                    ))}
                </div>
            </SectionBox>
        </div>
    );
}

// =====================
// ABA TEMAS E CORES
// =====================
function TabTemas({ showFeedback }: any) {
    const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>('light');
    const [lightVars, setLightVars] = useState<Record<string, string>>({ ...LIGHT_DEFAULTS });
    const [darkVars, setDarkVars] = useState<Record<string, string>>({ ...DARK_DEFAULTS });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewActive, setPreviewActive] = useState(false);

    useEffect(() => {
        fetch('/api/master/temas').then(r => r.json()).then(data => {
            if (data.light) setLightVars(prev => ({ ...prev, ...data.light }));
            if (data.dark)  setDarkVars(prev => ({ ...prev, ...data.dark }));
        }).finally(() => setLoading(false));
    }, []);

    const currentVars = activeTheme === 'light' ? lightVars : darkVars;
    const setCurrentVars = activeTheme === 'light' ? setLightVars : setDarkVars;

    const updateVar = (key: string, value: string) => {
        setCurrentVars(prev => ({ ...prev, [key]: value }));
        if (previewActive) {
            document.documentElement.style.setProperty(key, value);
        }
    };

    const previewTheme = () => {
        setPreviewActive(true);
        const vars = activeTheme === 'light' ? lightVars : darkVars;
        Object.entries(vars).forEach(([key, value]) => {
            document.documentElement.style.setProperty(key, value);
        });
    };

    const resetVars = () => {
        const defaults = activeTheme === 'light' ? LIGHT_DEFAULTS : DARK_DEFAULTS;
        setCurrentVars({ ...defaults });
        if (previewActive) {
            Object.entries(defaults).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
        }
        showFeedback('success', `Tema ${activeTheme === 'light' ? 'claro' : 'escuro'} resetado para o padrão.`);
    };

    const save = async () => {
        setSaving(true);
        try {
            await Promise.all([
                fetch('/api/master/temas', {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ theme: 'light', vars: lightVars })
                }),
                fetch('/api/master/temas', {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ theme: 'dark', vars: darkVars })
                })
            ]);
            showFeedback('success', 'Temas salvos! As mudanças serão aplicadas para todos os usuários.');
        } finally { setSaving(false); }
    };

    if (loading) return <Spinner/>;

    // Agrupa as variáveis por grupo
    const groups = [...new Set(THEME_VARS.map(v => v.group))];

    return (
        <div className="space-y-6">
            {/* SELETOR DE TEMA */}
            <div className="flex items-center gap-3">
                <div className="flex gap-2 bg-card border border-border p-1.5 rounded-2xl">
                    <button onClick={() => setActiveTheme('light')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${
                            activeTheme === 'light' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400' : 'text-muted hover:text-foreground'
                        }`}>
                        <Sun size={14}/> Claro
                    </button>
                    <button onClick={() => setActiveTheme('dark')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${
                            activeTheme === 'dark' ? 'bg-slate-800 text-slate-100' : 'text-muted hover:text-foreground'
                        }`}>
                        <Moon size={14}/> Escuro
                    </button>
                </div>
                <button onClick={previewTheme}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase border transition-all ${
                        previewActive ? 'bg-primary/10 border-primary text-primary' : 'border-border text-muted hover:text-foreground'
                    }`}>
                    <Eye size={13}/> {previewActive ? 'Preview ativo' : 'Ver preview'}
                </button>
                <button onClick={resetVars}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase border border-border text-muted hover:text-foreground transition-all ml-auto">
                    <RefreshCw size={13}/> Resetar padrão
                </button>
            </div>

            {previewActive && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-amber-700 dark:text-amber-400 text-xs font-bold">
                    <AlertTriangle size={14}/>
                    Preview ativo — você está vendo as cores em tempo real. Salve para aplicar a todos ou feche sem salvar para descartar.
                </div>
            )}

            {/* EDITOR DE CORES POR GRUPO */}
            {groups.map(group => (
                <SectionBox key={group} title={group} icon={<Palette size={12}/>}>
                    <div className="space-y-4">
                        {THEME_VARS.filter(v => v.group === group).map(varDef => {
                            const value = currentVars[varDef.key] || (activeTheme === 'light' ? LIGHT_DEFAULTS[varDef.key] : DARK_DEFAULTS[varDef.key]);
                            return (
                                <div key={varDef.key} className="flex items-center gap-4">
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-foreground">{varDef.label}</p>
                                        <p className="text-[10px] text-muted font-mono">{varDef.key}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {/* Preview da cor */}
                                        <div className="w-10 h-10 rounded-xl border-2 border-border shadow-sm shrink-0"
                                            style={{ backgroundColor: value }}/>
                                        {/* Color picker */}
                                        <input type="color" value={value}
                                            onChange={e => updateVar(varDef.key, e.target.value)}
                                            className="w-10 h-10 rounded-xl border-2 border-border cursor-pointer bg-transparent shrink-0"/>
                                        {/* Input hex */}
                                        <input value={value}
                                            onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) updateVar(varDef.key, e.target.value); }}
                                            className="w-28 p-2 bg-background border-2 border-border rounded-xl outline-none focus:border-primary font-mono text-sm text-foreground"
                                            placeholder="#000000"
                                            maxLength={7}/>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </SectionBox>
            ))}

            {/* PREVIEW VISUAL */}
            <SectionBox title="Preview dos dois temas" icon={<Eye size={12}/>}>
                <div className="grid md:grid-cols-2 gap-4">
                    {/* TEMA CLARO */}
                    <div className="rounded-2xl p-4 border-2 border-border space-y-3"
                        style={{ backgroundColor: lightVars['--bg-primary'] }}>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: lightVars['--text-secondary'] }}>
                            Tema Claro
                        </p>
                        <div className="rounded-xl p-3" style={{ backgroundColor: lightVars['--bg-secondary'], border: `1px solid ${lightVars['--border-color']}` }}>
                            <p className="text-sm font-black" style={{ color: lightVars['--text-primary'] }}>Texto principal</p>
                            <p className="text-xs" style={{ color: lightVars['--text-secondary'] }}>Texto secundário</p>
                        </div>
                        <button className="px-4 py-2 rounded-xl text-white text-xs font-black uppercase" style={{ backgroundColor: lightVars['--brand-color'] }}>
                            Botão primário
                        </button>
                    </div>
                    {/* TEMA ESCURO */}
                    <div className="rounded-2xl p-4 border-2 border-border space-y-3"
                        style={{ backgroundColor: darkVars['--bg-primary'] }}>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: darkVars['--text-secondary'] }}>
                            Tema Escuro
                        </p>
                        <div className="rounded-xl p-3" style={{ backgroundColor: darkVars['--bg-secondary'], border: `1px solid ${darkVars['--border-color']}` }}>
                            <p className="text-sm font-black" style={{ color: darkVars['--text-primary'] }}>Texto principal</p>
                            <p className="text-xs" style={{ color: darkVars['--text-secondary'] }}>Texto secundário</p>
                        </div>
                        <button className="px-4 py-2 rounded-xl text-white text-xs font-black uppercase" style={{ backgroundColor: darkVars['--brand-color'] }}>
                            Botão primário
                        </button>
                    </div>
                </div>
            </SectionBox>

            <button onClick={save} disabled={saving}
                className="w-full flex items-center justify-center gap-2 p-5 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : 'Salvar ambos os temas'}
            </button>
        </div>
    );
}

// =====================
// ABA NOTIFICAÇÕES
// =====================
function TabNotificacoes({ showFeedback }: any) {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/master/notificacoes').then(r => r.json()).then(setEvents).finally(() => setLoading(false));
    }, []);

    const toggle = (idx: number, field: string, value: any) => {
        setEvents(prev => prev.map((e, i) => i === idx ? { ...e, [field]: value } : e));
    };

    const toggleRole = (idx: number, role: string) => {
        const current = events[idx].roles as string[];
        const updated = current.includes(role) ? current.filter(r => r !== role) : [...current, role];
        toggle(idx, 'roles', updated);
    };

    const save = async () => {
        setSaving(true);
        try {
            await Promise.all(events.map(e =>
                fetch('/api/master/notificacoes', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(e)
                })
            ));
            showFeedback('success', 'Configurações de alertas salvas!');
        } finally { setSaving(false); }
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-5">
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="bg-background/50 px-6 py-4 border-b border-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <Bell size={12}/> Eventos e destinatários
                    </p>
                </div>
                <div className="divide-y divide-border">
                    {events.map((event, idx) => (
                        <div key={event.event} className="p-5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-bold text-foreground">{event.label}</p>
                                    <p className="text-[10px] text-muted font-mono">{event.event}</p>
                                </div>
                                <button onClick={() => toggle(idx, 'enabled', !event.enabled)}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${event.enabled ? 'bg-primary' : 'bg-border'}`}>
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${event.enabled ? 'left-7' : 'left-1'}`}/>
                                </button>
                            </div>
                            {event.enabled && (
                                <div className="flex gap-2 flex-wrap">
                                    <p className="text-[9px] font-black text-muted uppercase w-full">Notificar:</p>
                                    {FIXED_ROLES.filter(r => r !== 'MASTER').map(role => (
                                        <button key={role} onClick={() => toggleRole(idx, role)}
                                            className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${
                                                event.roles.includes(role)
                                                    ? (ROLE_COLORS[role] || 'border-primary bg-primary/10 text-primary')
                                                    : 'border-border bg-card text-muted'
                                            }`}>
                                            {ROLE_LABELS[role]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={save} disabled={saving}
                className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : 'Salvar alertas'}
            </button>
        </div>
    );
}

// =====================
// ABA CAMPOS CUSTOMIZADOS
// =====================
function TabCampos({ showFeedback }: any) {
    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/master/campos').then(r => r.json()).then(setFields).finally(() => setLoading(false));
    }, []);

    const addField = () => {
        setFields(prev => [...prev, {
            id: `new_${Date.now()}`, name: '', label: '',
            type: 'text', options: [], required: false, active: true
        }]);
    };

    const update = (idx: number, field: string, value: any) => {
        setFields(prev => prev.map((f, i) => i === idx ? { ...f, [field]: value } : f));
    };

    const remove = (idx: number) => setFields(prev => prev.filter((_, i) => i !== idx));

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/master/campos', {
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(fields)
            });
            if (res.ok) showFeedback('success', 'Campos salvos!');
            else showFeedback('error', 'Erro ao salvar.');
        } finally { setSaving(false); }
    };

    const TYPE_ICONS: Record<string, any> = {
        text: Type, textarea: AlignLeft, number: Hash, select: List
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-5">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                    💡 Campos customizados aparecem no passo 2 do formulário "Novo Chamado". Use para capturar informações específicas da prefeitura.
                </p>
            </div>

            <div className="space-y-3">
                {fields.length === 0 && <EmptyState text="Nenhum campo customizado. Clique em adicionar."/>}
                {fields.map((field, idx) => {
                    const TypeIcon = TYPE_ICONS[field.type] || Type;
                    return (
                        <div key={field.id || idx} className={`bg-card border border-border rounded-2xl p-5 space-y-4 ${!field.active ? 'opacity-60' : ''}`}>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-background rounded-xl text-muted"><TypeIcon size={16}/></div>
                                <div className="flex-1 grid md:grid-cols-3 gap-3">
                                    <input value={field.label} onChange={e => update(idx, 'label', e.target.value)}
                                        placeholder="Label (ex: Patrimônio)" className={inputCls}/>
                                    <input value={field.name} onChange={e => update(idx, 'name', e.target.value.toLowerCase().replace(/\s/g, '_'))}
                                        placeholder="Nome técnico (ex: patrimonio)" className={inputCls}/>
                                    <select value={field.type} onChange={e => update(idx, 'type', e.target.value)} className={inputCls}>
                                        <option value="text" className="bg-card">Texto</option>
                                        <option value="textarea" className="bg-card">Texto longo</option>
                                        <option value="number" className="bg-card">Número</option>
                                        <option value="select" className="bg-card">Seleção</option>
                                    </select>
                                </div>
                                <div className="flex gap-2 shrink-0">
                                    <button onClick={() => update(idx, 'required', !field.required)}
                                        title={field.required ? 'Obrigatório' : 'Opcional'}
                                        className={`p-2.5 rounded-xl text-[10px] font-black uppercase border transition-all ${field.required ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted'}`}>
                                        {field.required ? 'Obrig.' : 'Opc.'}
                                    </button>
                                    <button onClick={() => update(idx, 'active', !field.active)}
                                        className={`p-2.5 rounded-xl transition-all ${field.active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-background text-muted'}`}>
                                        {field.active ? <Eye size={15}/> : <EyeOff size={15}/>}
                                    </button>
                                    <button onClick={() => remove(idx)} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 transition-all">
                                        <Trash2 size={15}/>
                                    </button>
                                </div>
                            </div>
                            {field.type === 'select' && (
                                <div className="pl-11">
                                    <p className="text-[10px] font-black text-muted uppercase mb-2">Opções (uma por linha)</p>
                                    <textarea
                                        value={Array.isArray(field.options) ? field.options.join('\n') : ''}
                                        onChange={e => update(idx, 'options', e.target.value.split('\n').filter(Boolean))}
                                        placeholder="Opção 1&#10;Opção 2&#10;Opção 3"
                                        className="w-full p-3 bg-background border-2 border-border rounded-xl outline-none focus:border-primary text-sm font-medium text-foreground resize-none h-24"/>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <button onClick={addField}
                    className="flex items-center gap-2 px-5 py-3 bg-background border-2 border-dashed border-border rounded-2xl text-[11px] font-black uppercase text-muted hover:border-primary hover:text-primary transition-all">
                    <Plus size={15}/> Adicionar campo
                </button>
                <button onClick={save} disabled={saving}
                    className="flex-1 flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                    <Save size={15}/> {saving ? 'Salvando...' : 'Salvar campos'}
                </button>
            </div>
        </div>
    );
}

// =====================
// ABA HORÁRIOS
// =====================
function TabHorarios({ showFeedback }: any) {
    const [days, setDays] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/master/horarios').then(r => r.json()).then(setDays).finally(() => setLoading(false));
    }, []);

    const update = (idx: number, field: string, value: any) => {
        setDays(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d));
    };

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/master/horarios', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(days)
            });
            if (res.ok) showFeedback('success', 'Horários salvos!');
            else showFeedback('error', 'Erro ao salvar.');
        } finally { setSaving(false); }
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-5">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                    💡 Fora do horário de atendimento, os usuários verão um aviso ao tentar abrir chamados.
                </p>
            </div>

            <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="divide-y divide-border">
                    {days.map((day, idx) => (
                        <div key={day.day} className={`p-5 flex items-center gap-4 ${!day.open ? 'opacity-60' : ''}`}>
                            <div className="w-32 shrink-0">
                                <p className="text-sm font-bold text-foreground">{day.label}</p>
                            </div>
                            <button onClick={() => update(idx, 'open', !day.open)}
                                className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${day.open ? 'bg-primary' : 'bg-border'}`}>
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${day.open ? 'left-7' : 'left-1'}`}/>
                            </button>
                            {day.open ? (
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-muted uppercase">Das</span>
                                        <input type="time" value={day.startTime} onChange={e => update(idx, 'startTime', e.target.value)}
                                            className="p-2.5 bg-background border-2 border-border rounded-xl outline-none focus:border-primary font-bold text-foreground text-sm"/>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-muted uppercase">às</span>
                                        <input type="time" value={day.endTime} onChange={e => update(idx, 'endTime', e.target.value)}
                                            className="p-2.5 bg-background border-2 border-border rounded-xl outline-none focus:border-primary font-bold text-foreground text-sm"/>
                                    </div>
                                </div>
                            ) : (
                                <span className="text-[10px] font-black text-muted uppercase">Fechado</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <button onClick={save} disabled={saving}
                className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : 'Salvar horários'}
            </button>
        </div>
    );
}

// =====================
// ABA MENSAGENS AUTOMÁTICAS
// =====================
function TabMensagens({ showFeedback }: any) {
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/master/mensagens').then(r => r.json()).then(setMessages).finally(() => setLoading(false));
    }, []);

    const update = (idx: number, field: string, value: any) => {
        setMessages(prev => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
    };

    const save = async () => {
        setSaving(true);
        try {
            await Promise.all(messages.map(m =>
                fetch('/api/master/mensagens', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(m)
                })
            ));
            showFeedback('success', 'Mensagens automáticas salvas!');
        } finally { setSaving(false); }
    };

    if (loading) return <Spinner/>;

    const VARIABLES: Record<string, string[]> = {
        TICKET_OPENED:   ['{protocol}', '{assunto}', '{prioridade}'],
        TICKET_ASSIGNED: ['{protocol}', '{tecnico}'],
        TICKET_PAUSED:   ['{protocol}', '{motivo}'],
        TICKET_CLOSED:   ['{protocol}', '{tecnico}'],
        VISIT_SCHEDULED: ['{protocol}', '{data}', '{hora}', '{observacao}'],
    };

    return (
        <div className="space-y-5">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                    💡 Estas mensagens são enviadas automaticamente no chat do chamado quando os eventos ocorrem. Use as variáveis disponíveis para personalizar.
                </p>
            </div>

            <div className="space-y-4">
                {messages.map((msg, idx) => (
                    <div key={msg.trigger} className={`bg-card border border-border rounded-3xl p-6 space-y-4 ${!msg.active ? 'opacity-60' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold text-foreground">{msg.label}</p>
                                <p className="text-[10px] text-muted font-mono">{msg.trigger}</p>
                            </div>
                            <button onClick={() => update(idx, 'active', !msg.active)}
                                className={`relative w-12 h-6 rounded-full transition-colors ${msg.active ? 'bg-primary' : 'bg-border'}`}>
                                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${msg.active ? 'left-7' : 'left-1'}`}/>
                            </button>
                        </div>
                        {msg.active && (
                            <>
                                <textarea value={msg.content} onChange={e => update(idx, 'content', e.target.value)}
                                    className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary text-sm font-medium text-foreground resize-none h-24"/>
                                <div className="flex gap-2 flex-wrap">
                                    <p className="text-[9px] font-black text-muted uppercase w-full">Variáveis disponíveis:</p>
                                    {(VARIABLES[msg.trigger] || []).map(v => (
                                        <button key={v}
                                            onClick={() => update(idx, 'content', msg.content + v)}
                                            className="px-2 py-1 bg-background border border-border rounded-lg text-[10px] font-mono text-primary hover:bg-primary hover:text-white transition-all">
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>

            <button onClick={save} disabled={saving}
                className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : 'Salvar mensagens'}
            </button>
        </div>
    );
}

// =====================
// ABA TERMOS DE USO
// =====================
function TabTermos({ showFeedback }: any) {
    const [content, setContent] = useState('');
    const [version, setVersion] = useState('1.0');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetch('/api/master/termos').then(r => r.json()).then(data => {
            setContent(data.content || '');
            setVersion(data.version || '1.0');
        }).finally(() => setLoading(false));
    }, []);

    const save = async () => {
        if (!content.trim()) { showFeedback('error', 'Conteúdo não pode estar vazio.'); return; }
        setSaving(true);
        try {
            const res = await fetch('/api/master/termos', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content, version })
            });
            if (res.ok) showFeedback('success', `Termos v${version} salvos!`);
            else showFeedback('error', 'Erro ao salvar.');
        } finally { setSaving(false); }
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-5">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                    💡 Os termos de uso são exibidos na página de registro. Ao salvar uma nova versão, usuários existentes verão o aviso de atualização no próximo login.
                </p>
            </div>

            <div className="flex gap-3 items-end">
                <Field label="Versão">
                    <input value={version} onChange={e => setVersion(e.target.value)}
                        className="w-32 p-3 bg-background border-2 border-border rounded-xl outline-none focus:border-primary font-bold text-foreground text-sm"
                        placeholder="1.0"/>
                </Field>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-muted">Conteúdo dos termos</label>
                <textarea value={content} onChange={e => setContent(e.target.value)}
                    placeholder="Digite os termos de uso aqui. Suporta texto simples ou Markdown..."
                    className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary text-sm font-medium text-foreground resize-none h-80"/>
            </div>

            {content && (
                <SectionBox title="Preview" icon={<Eye size={12}/>}>
                    <div className="text-sm text-foreground whitespace-pre-wrap font-medium leading-relaxed max-h-48 overflow-y-auto">
                        {content}
                    </div>
                </SectionBox>
            )}

            <button onClick={save} disabled={saving}
                className="w-full flex items-center justify-center gap-2 p-5 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : `Publicar termos v${version}`}
            </button>
        </div>
    );
}

// =====================
// ABAS REUTILIZADAS (copie do arquivo anterior)
// =====================
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
                method: 'PUT', headers: { 'Content-Type': 'application/json' },
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
                        <div key={item.id || idx} className={`bg-card border border-border rounded-2xl p-4 ${!item.active ? 'opacity-50' : ''}`}>
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
                                    placeholder="Nome da categoria..." className="flex-1 p-3 bg-background border-2 border-border rounded-xl outline-none focus:border-primary text-sm font-bold text-foreground placeholder:text-muted/50 transition-all"/>
                                <button onClick={() => updateItem(idx, 'active', !item.active)}
                                    className={`p-2.5 rounded-xl transition-all ${item.active ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-background text-muted'}`}>
                                    {item.active ? <Eye size={16}/> : <EyeOff size={16}/>}
                                </button>
                                <button onClick={() => removeItem(idx)} className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all">
                                    <Trash2 size={16}/>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="flex gap-3">
                <button onClick={addItem} className="flex items-center gap-2 px-5 py-3 bg-background border-2 border-dashed border-border rounded-2xl text-[11px] font-black uppercase text-muted hover:border-primary hover:text-primary transition-all">
                    <Plus size={15}/> Adicionar
                </button>
                <button onClick={save} disabled={saving} className="flex-1 flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                    <Save size={15}/> {saving ? 'Salvando...' : 'Salvar categorias'}
                </button>
            </div>
        </div>
    );
}

function TabSecretarias({ showFeedback }: any) {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [newName, setNewName] = useState('');
    const [saving, setSaving] = useState(false);

    const load = () => { fetch('/api/config/options').then(r => r.json()).then(d => setItems(d.departments || [])).finally(() => setLoading(false)); };
    useEffect(() => { load(); }, []);

    const add = async () => {
        if (!newName.trim()) return;
        setSaving(true);
        try {
            const res = await fetch('/api/config/options', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'department', name: newName.trim() }) });
            if (res.ok) { setNewName(''); load(); showFeedback('success', 'Secretaria adicionada!'); }
        } finally { setSaving(false); }
    };

    const remove = async (id: string) => {
        if (!confirm('Excluir esta secretaria?')) return;
        const res = await fetch(`/api/config/options?type=department&id=${id}`, { method: 'DELETE' });
        if (res.ok) { load(); showFeedback('success', 'Removida.'); }
        else showFeedback('error', 'Erro: secretaria em uso.');
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-5">
            <div className="flex gap-3">
                <input value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && add()}
                    placeholder="Ex: Secretaria de Saúde..." className="flex-1 p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary text-sm font-bold text-foreground placeholder:text-muted/50 transition-all"/>
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
                        <button onClick={() => remove(item.id)} className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100">
                            <Trash2 size={15}/>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

function TabSLA({ showFeedback }: any) {
    const [slaList, setSlaList] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [newSLA, setNewSLA] = useState({ priority: '', maxHours: 24, label: '', color: 'blue' });
    const [showAdd, setShowAdd] = useState(false);

    const load = () => {
        fetch('/api/master/config').then(r => r.json()).then(data => {
            setSlaList(data.sla?.length ? data.sla : [
                { priority: 'URGENTE', maxHours: 2, label: 'Urgente', color: 'red' },
                { priority: 'ALTA', maxHours: 4, label: 'Alta', color: 'amber' },
                { priority: 'NORMAL', maxHours: 24, label: 'Normal', color: 'blue' },
                { priority: 'BAIXA', maxHours: 72, label: 'Baixa', color: 'gray' },
            ]);
        }).finally(() => setLoading(false));
    };
    useEffect(() => { load(); }, []);

    const updateSLA = (idx: number, field: string, value: any) => setSlaList(p => p.map((item, i) => i === idx ? { ...item, [field]: value } : item));

    const saveAll = async () => {
        setSaving(true);
        try {
            await Promise.all(slaList.map(s => fetch('/api/master/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'sla', data: s }) })));
            showFeedback('success', 'SLA salvo!');
        } finally { setSaving(false); }
    };

    const addSLA = async () => {
        if (!newSLA.priority.trim() || !newSLA.label.trim()) { showFeedback('error', 'Preencha prioridade e nome.'); return; }
        await fetch('/api/master/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'sla', data: { ...newSLA, priority: newSLA.priority.toUpperCase() } }) });
        setShowAdd(false); setNewSLA({ priority: '', maxHours: 24, label: '', color: 'blue' }); load(); showFeedback('success', 'SLA adicionado!');
    };

    const deleteSLA = async (priority: string) => {
        if (!confirm(`Excluir SLA "${priority}"?`)) return;
        await fetch('/api/master/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'sla_delete', data: { priority } }) });
        load(); showFeedback('success', 'SLA removido.');
    };

    if (loading) return <Spinner/>;

    const cb = (color: string) => ({ red:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', amber:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', blue:'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', green:'bg-green-100 text-green-700', purple:'bg-purple-100 text-purple-700', gray:'bg-gray-100 text-gray-700' }[color] || 'bg-blue-100 text-blue-700');

    return (
        <div className="space-y-5">
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="bg-background/50 px-6 py-4 border-b border-border flex justify-between items-center">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2"><Clock size={12}/> Prazos por prioridade</p>
                    <button onClick={() => setShowAdd(!showAdd)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${showAdd ? 'bg-border text-foreground' : 'bg-primary text-white'}`}>
                        {showAdd ? <X size={12}/> : <Plus size={12}/>} {showAdd ? 'Cancelar' : 'Novo'}
                    </button>
                </div>
                {showAdd && (
                    <div className="p-5 border-b border-border bg-background/30 space-y-3 animate-in fade-in duration-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <input value={newSLA.priority} onChange={e => setNewSLA(p => ({...p, priority: e.target.value.toUpperCase()}))} placeholder="Ex: CRITICO" className={inputCls}/>
                            <input value={newSLA.label} onChange={e => setNewSLA(p => ({...p, label: e.target.value}))} placeholder="Rótulo" className={inputCls}/>
                            <input type="number" min={1} value={newSLA.maxHours} onChange={e => setNewSLA(p => ({...p, maxHours: Number(e.target.value)}))} className={inputCls}/>
                            <div className="flex gap-1.5 items-center">
                                {COLOR_OPTIONS.map(c => <button key={c.value} onClick={() => setNewSLA(p => ({...p, color: c.value}))} className={`w-7 h-7 rounded-full ${c.bg} ${newSLA.color === c.value ? 'ring-2 ring-offset-1 ring-foreground scale-110' : 'opacity-60'}`}/>)}
                            </div>
                        </div>
                        <button onClick={addSLA} className="w-full p-3 bg-primary text-white rounded-xl font-black uppercase text-[10px]">Adicionar SLA</button>
                    </div>
                )}
                <div className="divide-y divide-border">
                    {slaList.map((s, idx) => (
                        <div key={s.priority} className="p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-center group">
                            <span className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase w-fit ${cb(s.color)}`}>{s.label}</span>
                            <div>
                                <label className="text-[9px] font-black text-muted uppercase">Prazo (h)</label>
                                <input type="number" min={1} value={s.maxHours} onChange={e => updateSLA(idx, 'maxHours', Number(e.target.value))} className="w-full p-2.5 mt-1 bg-background border-2 border-border rounded-xl outline-none focus:border-primary font-black text-foreground text-sm"/>
                            </div>
                            <div className="flex gap-1.5 items-center">
                                {COLOR_OPTIONS.map(c => <button key={c.value} onClick={() => updateSLA(idx, 'color', c.value)} className={`w-6 h-6 rounded-full ${c.bg} ${s.color === c.value ? 'ring-2 ring-offset-1 ring-foreground scale-110' : 'opacity-50'}`}/>)}
                            </div>
                            <div className="flex justify-end">
                                <button onClick={() => deleteSLA(s.priority)} className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all opacity-0 group-hover:opacity-100"><Trash2 size={15}/></button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <button onClick={saveAll} disabled={saving} className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : 'Salvar SLAs'}
            </button>
        </div>
    );
}

function TabSistema({ showFeedback }: any) {
    const [system, setSystem] = useState({ systemName: 'TI BRODOWSKI', systemSubtitle: 'Central de Operações', cityName: 'Brodowski', supportPhone: '', supportEmail: '', primaryColor: '#2563eb', logoText: 'TI', allowedDomain: '', registrationOpen: 'true', maintenanceMode: 'false', maintenanceMessage: 'Sistema em manutenção. Voltamos em breve.' });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => { fetch('/api/master/config').then(r => r.json()).then(data => { if (data.system) setSystem(p => ({ ...p, ...data.system })); }).finally(() => setLoading(false)); }, []);

    const save = async () => {
        setSaving(true);
        try {
            await Promise.all(Object.entries(system).map(([key, value]) => fetch('/api/master/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'system', data: { key, value } }) })));
            showFeedback('success', 'Configurações salvas! Recarregue a página.');
        } finally { setSaving(false); }
    };

    const exportConfig = () => {
        const blob = new Blob([JSON.stringify(system, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = `config-${new Date().toISOString().slice(0,10)}.json`; a.click(); URL.revokeObjectURL(url);
    };

    const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]; if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => { try { setSystem(p => ({ ...p, ...JSON.parse(ev.target?.result as string) })); showFeedback('success', 'Importado! Clique em Salvar.'); } catch { showFeedback('error', 'Arquivo inválido.'); } };
        reader.readAsText(file); e.target.value = '';
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-5">
            <div className={`border-2 rounded-3xl p-5 space-y-4 ${system.maintenanceMode === 'true' ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/10' : 'border-border bg-card'}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${system.maintenanceMode === 'true' ? 'bg-amber-500 text-white' : 'bg-background text-muted'}`}><AlertTriangle size={16}/></div>
                        <div><p className="font-black text-foreground text-sm">Modo manutenção</p><p className="text-[10px] text-muted">Bloqueia acesso para todos exceto Master</p></div>
                    </div>
                    <button onClick={() => setSystem(p => ({...p, maintenanceMode: p.maintenanceMode === 'true' ? 'false' : 'true'}))} className={`relative w-12 h-6 rounded-full transition-colors ${system.maintenanceMode === 'true' ? 'bg-amber-500' : 'bg-border'}`}>
                        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${system.maintenanceMode === 'true' ? 'left-7' : 'left-1'}`}/>
                    </button>
                </div>
                {system.maintenanceMode === 'true' && (
                    <textarea value={system.maintenanceMessage} onChange={e => setSystem(p => ({...p, maintenanceMessage: e.target.value}))} className="w-full p-3 bg-white dark:bg-slate-900 border-2 border-amber-300 rounded-2xl outline-none text-sm font-medium text-foreground resize-none h-20"/>
                )}
            </div>
            <SectionBox title="Identidade" icon={<Type size={12}/>}>
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Nome"><input value={system.systemName} onChange={e => setSystem(p => ({...p, systemName: e.target.value}))} className={inputCls}/></Field>
                    <Field label="Subtítulo"><input value={system.systemSubtitle} onChange={e => setSystem(p => ({...p, systemSubtitle: e.target.value}))} className={inputCls}/></Field>
                    <Field label="Cidade"><input value={system.cityName} onChange={e => setSystem(p => ({...p, cityName: e.target.value}))} className={inputCls}/></Field>
                    <Field label="Sigla (máx 4)"><input value={system.logoText} onChange={e => setSystem(p => ({...p, logoText: e.target.value.slice(0,4)}))} className={inputCls} maxLength={4}/></Field>
                </div>
            </SectionBox>
            <SectionBox title="Contato" icon={<Phone size={12}/>}>
                <div className="grid md:grid-cols-2 gap-4">
                    <Field label="Telefone"><input value={system.supportPhone} onChange={e => setSystem(p => ({...p, supportPhone: e.target.value}))} className={inputCls} placeholder="(16) 3664-0000"/></Field>
                    <Field label="E-mail"><input value={system.supportEmail} onChange={e => setSystem(p => ({...p, supportEmail: e.target.value}))} className={inputCls} placeholder="ti@brodowski.sp.gov.br"/></Field>
                </div>
            </SectionBox>
            <SectionBox title="Cor primária" icon={<Palette size={12}/>}>
                <div className="flex items-center gap-4">
                    <input type="color" value={system.primaryColor} onChange={e => setSystem(p => ({...p, primaryColor: e.target.value}))} className="w-14 h-14 rounded-2xl border-2 border-border cursor-pointer bg-transparent"/>
                    <div><p className="font-black text-foreground">{system.primaryColor}</p></div>
                    <div className="ml-auto px-5 py-2.5 rounded-2xl text-white text-xs font-black uppercase" style={{ backgroundColor: system.primaryColor }}>Preview</div>
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                    {['#2563eb','#4f46e5','#7c3aed','#16a34a','#0d9488','#ea580c','#db2777','#475569'].map(hex => (
                        <button key={hex} onClick={() => setSystem(p => ({...p, primaryColor: hex}))} className={`w-8 h-8 rounded-xl transition-all hover:scale-110 ${system.primaryColor === hex ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''}`} style={{ backgroundColor: hex }}/>
                    ))}
                </div>
            </SectionBox>
            <SectionBox title="Controle de acesso" icon={<Lock size={12}/>}>
                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border">
                        <div><p className="text-sm font-black text-foreground">Permitir auto-registro</p><p className="text-[10px] text-muted">Usuários criam conta pela página de registro</p></div>
                        <button onClick={() => setSystem(p => ({...p, registrationOpen: p.registrationOpen === 'true' ? 'false' : 'true'}))} className={`relative w-12 h-6 rounded-full transition-colors ${system.registrationOpen === 'true' ? 'bg-primary' : 'bg-border'}`}>
                            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${system.registrationOpen === 'true' ? 'left-7' : 'left-1'}`}/>
                        </button>
                    </div>
                    <Field label="Domínio obrigatório">
                        <div className="flex items-center gap-2 p-4 bg-background border-2 border-border rounded-2xl focus-within:border-primary transition-all">
                            <span className="text-muted font-bold text-sm">@</span>
                            <input value={system.allowedDomain} onChange={e => setSystem(p => ({...p, allowedDomain: e.target.value}))} className="flex-1 bg-transparent outline-none font-bold text-foreground text-sm" placeholder="brodowski.sp.gov.br"/>
                        </div>
                    </Field>
                </div>
            </SectionBox>
            <SectionBox title="Backup" icon={<Download size={12}/>}>
                <div className="flex gap-3">
                    <button onClick={exportConfig} className="flex-1 flex items-center justify-center gap-2 p-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 transition-all"><Download size={15}/> Exportar JSON</button>
                    <label className="flex-1 flex items-center justify-center gap-2 p-4 bg-background border-2 border-dashed border-border rounded-2xl font-black uppercase text-[11px] text-muted hover:border-primary hover:text-primary transition-all cursor-pointer">
                        <Upload size={15}/> Importar JSON<input type="file" accept=".json" className="hidden" onChange={importConfig}/>
                    </label>
                </div>
            </SectionBox>
            <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 p-5 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : 'Salvar configurações'}
            </button>
        </div>
    );
}

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
        setPermissions(prev => ({ ...prev, [activeRole]: { ...prev[activeRole], [section]: !prev[activeRole]?.[section] } }));
    };

    const save = async () => {
        setSaving(true);
        try {
            await Promise.all(allRoles.map(role => fetch('/api/master/permissoes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role, permissions: permissions[role] || {} }) })));
            showFeedback('success', 'Permissões salvas!');
        } finally { setSaving(false); }
    };

    const addRole = () => {
        const key = newRoleName.trim().toUpperCase().replace(/\s+/g, '_');
        if (!key || allRoles.includes(key)) { showFeedback('error', 'Nome inválido ou já existe.'); return; }
        setAllRoles(p => [...p, key]);
        setPermissions(p => ({ ...p, [key]: { abrir_chamado: false, meus_chamados: false, painel_tecnico: false, agenda: false, controlador: false, admin: false, acompanhar: true } }));
        setNewRoleName(''); setShowNewRole(false); setActiveRole(key);
    };

    const deleteRole = async (role: string) => {
        if (FIXED_ROLES.includes(role)) { showFeedback('error', 'Não pode excluir roles fixas.'); return; }
        if (!confirm(`Excluir "${role}"?`)) return;
        const res = await fetch('/api/master/permissoes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ role }) });
        if (res.ok) { setAllRoles(p => p.filter(r => r !== role)); setPermissions(p => { const n = {...p}; delete n[role]; return n; }); setActiveRole('FUNCIONARIO'); showFeedback('success', 'Perfil removido.'); }
    };

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-6">
            <div className="flex gap-2 flex-wrap items-center">
                {allRoles.map(role => (
                    <div key={role} className="relative group">
                        <button onClick={() => setActiveRole(role)} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase border-2 transition-all ${activeRole === role ? (ROLE_COLORS[role] || 'border-primary bg-primary/10 text-primary') : 'border-border bg-card text-muted hover:text-foreground'}`}>
                            {ROLE_LABELS[role] || role}
                        </button>
                        {!FIXED_ROLES.includes(role) && (
                            <button onClick={() => deleteRole(role)} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full text-[9px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={8}/></button>
                        )}
                    </div>
                ))}
                {showNewRole ? (
                    <div className="flex items-center gap-2">
                        <input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addRole()} placeholder="Nome do perfil" autoFocus className="p-2.5 bg-background border-2 border-primary rounded-xl outline-none text-sm font-bold text-foreground w-36"/>
                        <button onClick={addRole} className="p-2.5 bg-primary text-white rounded-xl"><Check size={14}/></button>
                        <button onClick={() => setShowNewRole(false)} className="p-2.5 bg-background border border-border rounded-xl text-muted"><X size={14}/></button>
                    </div>
                ) : (
                    <button onClick={() => setShowNewRole(true)} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[11px] font-black uppercase border-2 border-dashed border-border text-muted hover:border-primary hover:text-primary transition-all">
                        <Plus size={13}/> Novo perfil
                    </button>
                )}
            </div>
            <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <div className="bg-background/50 px-6 py-4 border-b border-border">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                        Permissões — {ROLE_LABELS[activeRole] || activeRole}
                        {activeRole === 'MASTER' && <span className="ml-2 text-red-500">(acesso total)</span>}
                    </p>
                </div>
                <div className="divide-y divide-border">
                    {SECTIONS.map(section => {
                        const enabled = activeRole === 'MASTER' ? true : !!permissions[activeRole]?.[section.key];
                        return (
                            <div key={section.key} className="flex items-center justify-between px-6 py-4 hover:bg-background/30 transition-colors">
                                <div><p className="text-sm font-bold text-foreground">{section.label}</p><p className="text-[10px] text-muted">{section.desc}</p></div>
                                <button onClick={() => toggle(section.key)} disabled={activeRole === 'MASTER'} className={`relative w-12 h-6 rounded-full transition-colors disabled:cursor-not-allowed ${enabled ? 'bg-primary' : 'bg-border'}`}>
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${enabled ? 'left-7' : 'left-1'}`}/>
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
            <button onClick={save} disabled={saving} className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                <Save size={15}/> {saving ? 'Salvando...' : 'Salvar permissões'}
            </button>
        </div>
    );
}

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

    const load = () => { fetch('/api/master/usuarios').then(r => r.json()).then(setUsers).finally(() => setLoading(false)); };
    useEffect(() => { load(); }, []);

    const startEdit = (user: any) => { setEditingId(user.id); setEditData({ name: user.name, email: user.email, role: user.role, active: user.active ?? true, newPassword: '' }); };
    const saveEdit = async () => {
        setSaving(true);
        try {
            const body: any = { id: editingId, ...editData };
            const res = await fetch('/api/master/usuarios', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (res.ok) { setEditingId(null); load(); showFeedback('success', 'Atualizado!'); }
            else showFeedback('error', 'Erro ao atualizar.');
        } finally { setSaving(false); }
    };
    const deleteUser = async (id: string, name: string) => {
        if (!confirm(`Excluir "${name}"?`)) return;
        const res = await fetch('/api/master/usuarios', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
        const data = await res.json();
        if (res.ok) { load(); showFeedback('success', 'Removido.'); }
        else showFeedback('error', data.message || 'Erro.');
    };
    const toggleActive = async (user: any) => {
        await fetch('/api/master/usuarios', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: user.id, active: !user.active }) });
        load(); showFeedback('success', user.active ? 'Desativado.' : 'Ativado.');
    };
    const createUser = async () => {
        if (!newUser.name || !newUser.email || !newUser.password) { showFeedback('error', 'Preencha todos os campos.'); return; }
        setCreating(true);
        try {
            const res = await fetch('/api/master/usuarios/criar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newUser) });
            const data = await res.json();
            if (res.ok) { setShowCreate(false); setNewUser({ name: '', email: '', password: '', role: 'FUNCIONARIO' }); load(); showFeedback('success', 'Criado!'); }
            else showFeedback('error', data.message || 'Erro.');
        } finally { setCreating(false); }
    };

    const roleColors: Record<string, string> = {
        FUNCIONARIO: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        TECNICO: 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400',
        CONTROLADOR: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
        MASTER: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    };
    const counts = FIXED_ROLES.reduce((acc, r) => ({ ...acc, [r]: users.filter(u => u.role === r).length }), {} as Record<string, number>);
    const filtered = users.filter(u => {
        const ms = !search.trim() || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
        const mr = filterRole === 'TODOS' || u.role === filterRole;
        return ms && mr;
    });

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {FIXED_ROLES.map(role => (
                    <button key={role} onClick={() => setFilterRole(filterRole === role ? 'TODOS' : role)}
                        className={`p-4 rounded-2xl border-2 transition-all text-left ${filterRole === role ? (ROLE_COLORS[role] || 'border-primary bg-primary/10') : 'border-border bg-card'}`}>
                        <p className="text-2xl font-black text-foreground">{counts[role] || 0}</p>
                        <p className="text-[10px] font-black uppercase text-muted">{ROLE_LABELS[role]}</p>
                    </button>
                ))}
            </div>
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"/>
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl outline-none focus:border-primary text-sm font-bold text-foreground transition-all"/>
                </div>
                <button onClick={() => setShowCreate(!showCreate)} className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black uppercase text-[11px] transition-all ${showCreate ? 'bg-border text-foreground' : 'bg-primary text-white hover:opacity-90'}`}>
                    {showCreate ? <X size={15}/> : <UserPlus size={15}/>} {showCreate ? 'Cancelar' : 'Novo'}
                </button>
            </div>
            {showCreate && (
                <div className="bg-card border border-border rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary">Criar usuário</p>
                    <div className="grid md:grid-cols-2 gap-3">
                        <input value={newUser.name} onChange={e => setNewUser(p => ({...p, name: e.target.value}))} placeholder="Nome completo" className={inputCls}/>
                        <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))} placeholder="E-mail" className={inputCls}/>
                        <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} placeholder="Senha" className={inputCls}/>
                        <select value={newUser.role} onChange={e => setNewUser(p => ({...p, role: e.target.value}))} className={inputCls}>
                            {FIXED_ROLES.map(r => <option key={r} value={r} className="bg-card">{ROLE_LABELS[r]}</option>)}
                        </select>
                    </div>
                    <button onClick={createUser} disabled={creating} className="w-full flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-50 transition-all">
                        <UserCheck size={15}/> {creating ? 'Criando...' : 'Criar conta'}
                    </button>
                </div>
            )}
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
                                    <button onClick={() => setEditingId(null)} className="flex-1 p-3 rounded-xl bg-background border border-border text-muted font-black uppercase text-[10px]">Cancelar</button>
                                    <button onClick={saveEdit} disabled={saving} className="flex-1 p-3 rounded-xl bg-primary text-white font-black uppercase text-[10px] disabled:opacity-50">{saving ? 'Salvando...' : 'Salvar'}</button>
                                </div>
                            </div>
                        ) : (
                            <div className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary shrink-0 text-sm">{user.name?.charAt(0)?.toUpperCase() || '?'}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-black text-foreground text-sm truncate">{user.name}</p>
                                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${roleColors[user.role] || 'bg-card text-muted'}`}>{ROLE_LABELS[user.role] || user.role}</span>
                                        {!user.active && <span className="text-[9px] font-black px-2 py-0.5 rounded-full uppercase bg-red-50 text-red-600">Inativo</span>}
                                    </div>
                                    <p className="text-[10px] text-muted truncate">{user.email}</p>
                                    <p className="text-[9px] text-muted/60">{user._count?.tickets || 0} chamados</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                    <button onClick={() => toggleActive(user)} className={`p-2 rounded-xl transition-all ${user.active ? 'text-emerald-600 hover:bg-emerald-50' : 'text-muted hover:bg-background'}`}>{user.active ? <Unlock size={14}/> : <Lock size={14}/>}</button>
                                    <button onClick={() => startEdit(user)} className="p-2 rounded-xl text-muted hover:text-primary hover:bg-primary/10 transition-all"><Edit3 size={14}/></button>
                                    <button onClick={() => deleteUser(user.id, user.name)} className="p-2 rounded-xl text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><UserX size={14}/></button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

function TabAuditoria() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => { fetch('/api/master/auditoria').then(r => r.json()).then(setLogs).finally(() => setLoading(false)); }, []);

    const ACTION_STYLE: Record<string, string> = {
        SLA_UPDATE: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
        SLA_DELETE: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400',
        SYSTEM_CONFIG: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
    };

    const filtered = logs.filter(l => !search.trim() || l.action.toLowerCase().includes(search.toLowerCase()) || l.userName.toLowerCase().includes(search.toLowerCase()) || l.details.toLowerCase().includes(search.toLowerCase()));

    if (loading) return <Spinner/>;

    return (
        <div className="space-y-4">
            <div className="relative">
                <SearchIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filtrar..." className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-2xl outline-none focus:border-primary text-sm font-bold text-foreground transition-all"/>
            </div>
            {filtered.length === 0 && <EmptyState text="Nenhum registro."/>}
            <div className="space-y-2">
                {filtered.map(log => (
                    <div key={log.id} className="bg-card border border-border rounded-2xl p-4 flex items-start gap-4">
                        <div className={`px-2.5 py-1 rounded-xl text-[9px] font-black uppercase whitespace-nowrap shrink-0 ${ACTION_STYLE[log.action] || 'bg-card text-muted border border-border'}`}>{log.action.replace('_', ' ')}</div>
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

// =====================
// HELPERS
// =====================
function Spinner() { return <div className="flex items-center justify-center h-40"><div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"/></div>; }
function EmptyState({ text }: { text: string }) { return <div className="text-center py-12 border-2 border-dashed border-border rounded-3xl text-muted text-xs font-bold uppercase">{text}</div>; }
function SectionBox({ title, icon, children }: any) { return <div className="bg-card border border-border rounded-3xl p-6 space-y-4"><p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">{icon} {title}</p>{children}</div>; }
function Field({ label, children }: any) { return <div className="space-y-1.5"><label className="text-[10px] font-black uppercase text-muted ml-1">{label}</label>{children}</div>; }
function StatCard({ label, value, sub, color, bg }: any) { return <div className="bg-card border border-border rounded-3xl p-5"><div className={`${bg} ${color} w-9 h-9 rounded-xl flex items-center justify-center mb-3`}><BarChart3 size={16}/></div><p className="text-3xl font-black tracking-tighter text-foreground">{value}</p><p className="text-[10px] font-black uppercase text-muted">{label}</p>{sub && <p className="text-[9px] text-muted/60 mt-0.5">{sub}</p>}</div>; }

// SearchIcon como componente separado para evitar conflito com o import do lucide
function SearchIcon({ className, size }: { className?: string; size: number }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
    );
}