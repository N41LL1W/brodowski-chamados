"use client";

import { useEffect, useState } from 'react';
import { 
    Settings2, Shield, Clock, Palette, 
    Save, CheckCircle2, AlertCircle, Building2,
    Phone, Mail, Type, Hash,
} from 'lucide-react';

const PRIORIDADES = [
    { key: 'URGENTE', label: 'Urgente',  defaultHours: 2,  color: 'red' },
    { key: 'ALTA',    label: 'Alta',     defaultHours: 4,  color: 'amber' },
    { key: 'NORMAL',  label: 'Normal',   defaultHours: 24, color: 'blue' },
    { key: 'BAIXA',   label: 'Baixa',    defaultHours: 72, color: 'gray' },
];

const COLOR_OPTIONS = [
    { value: 'red',    label: 'Vermelho', bg: 'bg-red-500' },
    { value: 'amber',  label: 'Laranja',  bg: 'bg-amber-500' },
    { value: 'blue',   label: 'Azul',     bg: 'bg-blue-500' },
    { value: 'green',  label: 'Verde',    bg: 'bg-green-500' },
    { value: 'purple', label: 'Roxo',     bg: 'bg-purple-500' },
    { value: 'gray',   label: 'Cinza',    bg: 'bg-gray-500' },
];

export default function MasterConfigPage() {
    const [activeTab, setActiveTab] = useState<'sla' | 'sistema'>('sla');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const [slaValues, setSlaValues] = useState<Record<string, { maxHours: number; label: string; color: string }>>(
        Object.fromEntries(PRIORIDADES.map(p => [p.key, { maxHours: p.defaultHours, label: p.label, color: p.color }]))
    );

    const [system, setSystem] = useState({
        systemName:     'TI BRODOWSKI',
        systemSubtitle: 'Central de Operações',
        cityName:       'Brodowski',
        supportPhone:   '',
        supportEmail:   '',
        primaryColor:   '#2563eb',
        logoText:       'TI',
        allowedDomain: '',       // Ex: brodowski.sp.gov.br
        registrationOpen: 'true' // 'true' ou 'false'
    });

    useEffect(() => {
        fetch('/api/master/config')
            .then(r => r.json())
            .then(data => {
                if (data.sla?.length) {
                    const slaMap: any = {};
                    data.sla.forEach((s: any) => {
                        slaMap[s.priority] = { maxHours: s.maxHours, label: s.label, color: s.color };
                    });
                    setSlaValues(prev => ({ ...prev, ...slaMap }));
                }
                if (data.system) {
                    setSystem(prev => ({ ...prev, ...data.system }));
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const showFeedback = (type: 'success' | 'error', msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 3000);
    };

    const saveSLA = async () => {
        setSaving(true);
        try {
            await Promise.all(
                PRIORIDADES.map(p =>
                    fetch('/api/master/config', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'sla', data: { priority: p.key, ...slaValues[p.key] } })
                    })
                )
            );
            showFeedback('success', 'SLA salvo com sucesso!');
        } catch {
            showFeedback('error', 'Erro ao salvar SLA.');
        } finally {
            setSaving(false);
        }
    };

    const saveSystem = async () => {
        setSaving(true);
        try {
            await Promise.all(
                Object.entries(system).map(([key, value]) =>
                    fetch('/api/master/config', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ type: 'system', data: { key, value } })
                    })
                )
            );
            showFeedback('success', 'Configurações do sistema salvas!');
        } catch {
            showFeedback('error', 'Erro ao salvar.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin" />
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">

            <header>
                <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">
                    Configurações <span className="text-primary italic">Master</span>
                </h1>
                <p className="text-muted text-sm font-medium mt-1">Personalize o sistema sem mexer no código</p>
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
            <div className="flex gap-2 bg-card border border-border p-1.5 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('sla')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'sla' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'
                    }`}
                >
                    <Clock size={14}/> SLA
                </button>
                <button
                    onClick={() => setActiveTab('sistema')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
                        activeTab === 'sistema' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'
                    }`}
                >
                    <Palette size={14}/> Sistema
                </button>
            </div>

            {/* ABA SLA */}
            {activeTab === 'sla' && (
                <div className="space-y-6">
                    <div className="bg-card border border-border rounded-3xl p-2 overflow-hidden">
                        <div className="bg-background/50 px-6 py-4 border-b border-border">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                <Clock size={12}/> Tempo máximo de atendimento por prioridade
                            </p>
                        </div>
                        <div className="divide-y divide-border">
                            {PRIORIDADES.map(p => {
                                const val = slaValues[p.key];
                                return (
                                    <div key={p.key} className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                                        
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted">
                                                Prioridade
                                            </label>
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-black uppercase border ${
                                                p.color === 'red'    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100' :
                                                p.color === 'amber'  ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100' :
                                                p.color === 'blue'   ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100' :
                                                'bg-card text-muted border-border'
                                            }`}>
                                                {p.label}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted">
                                                Prazo máximo (horas)
                                            </label>
                                            <input
                                                type="number"
                                                min={1}
                                                value={val.maxHours}
                                                onChange={e => setSlaValues(prev => ({
                                                    ...prev,
                                                    [p.key]: { ...prev[p.key], maxHours: Number(e.target.value) }
                                                }))}
                                                className="w-full p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-black text-foreground text-sm"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-muted">
                                                Cor do badge
                                            </label>
                                            <div className="flex gap-2">
                                                {COLOR_OPTIONS.map(c => (
                                                    <button
                                                        key={c.value}
                                                        onClick={() => setSlaValues(prev => ({
                                                            ...prev,
                                                            [p.key]: { ...prev[p.key], color: c.value }
                                                        }))}
                                                        title={c.label}
                                                        className={`w-7 h-7 rounded-full ${c.bg} transition-all ${
                                                            val.color === c.value ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'opacity-50 hover:opacity-100'
                                                        }`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Preview de como fica */}
                    <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Preview dos badges</p>
                        <div className="flex gap-3 flex-wrap">
                            {PRIORIDADES.map(p => {
                                const val = slaValues[p.key];
                                return (
                                    <div key={p.key} className="space-y-1 text-center">
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase ${
                                            val.color === 'red'    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                            val.color === 'amber'  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                            val.color === 'blue'   ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                            val.color === 'green'  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                            val.color === 'purple' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                            'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
                                        }`}>
                                            {p.label}
                                        </div>
                                        <p className="text-[9px] text-muted font-bold">{val.maxHours}h</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <button
                        onClick={saveSLA}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-3 p-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        <Save size={18}/> {saving ? 'Salvando...' : 'Salvar configurações de SLA'}
                    </button>
                </div>
            )}

            {/* ABA SISTEMA */}
            {activeTab === 'sistema' && (
                <div className="space-y-6">

                    {/* IDENTIDADE */}
                    <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                            <Type size={12}/> Identidade do sistema
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted ml-1">Nome do sistema</label>
                                <input
                                    value={system.systemName}
                                    onChange={e => setSystem(p => ({ ...p, systemName: e.target.value }))}
                                    className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-bold text-foreground"
                                    placeholder="Ex: TI BRODOWSKI"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted ml-1">Subtítulo</label>
                                <input
                                    value={system.systemSubtitle}
                                    onChange={e => setSystem(p => ({ ...p, systemSubtitle: e.target.value }))}
                                    className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-bold text-foreground"
                                    placeholder="Ex: Central de Operações"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted ml-1">Nome da cidade</label>
                                <input
                                    value={system.cityName}
                                    onChange={e => setSystem(p => ({ ...p, cityName: e.target.value }))}
                                    className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-bold text-foreground"
                                    placeholder="Ex: Brodowski"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted ml-1">Sigla / Logo texto</label>
                                <input
                                    value={system.logoText}
                                    onChange={e => setSystem(p => ({ ...p, logoText: e.target.value.slice(0, 4) }))}
                                    className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-bold text-foreground"
                                    placeholder="Ex: TI"
                                    maxLength={4}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SUPORTE */}
                    <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                            <Building2 size={12}/> Informações de suporte
                        </p>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted ml-1 flex items-center gap-1">
                                    <Phone size={10}/> Telefone de suporte
                                </label>
                                <input
                                    value={system.supportPhone}
                                    onChange={e => setSystem(p => ({ ...p, supportPhone: e.target.value }))}
                                    className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-bold text-foreground"
                                    placeholder="Ex: (16) 3664-0000"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted ml-1 flex items-center gap-1">
                                    <Mail size={10}/> E-mail de suporte
                                </label>
                                <input
                                    value={system.supportEmail}
                                    onChange={e => setSystem(p => ({ ...p, supportEmail: e.target.value }))}
                                    className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-bold text-foreground"
                                    placeholder="Ex: ti@brodowski.sp.gov.br"
                                />
                            </div>
                        </div>
                    </div>

                    {/* COR PRIMÁRIA */}
                    <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                            <Palette size={12}/> Cor primária do sistema
                        </p>
                        <div className="flex items-center gap-4">
                            <input
                                type="color"
                                value={system.primaryColor}
                                onChange={e => setSystem(p => ({ ...p, primaryColor: e.target.value }))}
                                className="w-14 h-14 rounded-2xl border-2 border-border cursor-pointer bg-transparent"
                            />
                            <div className="space-y-1">
                                <p className="text-sm font-black text-foreground">{system.primaryColor}</p>
                                <p className="text-[10px] text-muted">Afeta botões, links e destaques do sistema</p>
                            </div>
                            <div
                                className="ml-auto px-6 py-3 rounded-2xl text-white text-xs font-black uppercase"
                                style={{ backgroundColor: system.primaryColor }}
                            >
                                Preview
                            </div>
                        </div>

                        {/* Cores predefinidas */}
                        <div className="flex gap-3 flex-wrap">
                            {[
                                { label: 'Azul',    hex: '#2563eb' },
                                { label: 'Índigo',  hex: '#4f46e5' },
                                { label: 'Roxo',    hex: '#7c3aed' },
                                { label: 'Verde',   hex: '#16a34a' },
                                { label: 'Teal',    hex: '#0d9488' },
                                { label: 'Laranja', hex: '#ea580c' },
                                { label: 'Rosa',    hex: '#db2777' },
                                { label: 'Cinza',   hex: '#475569' },
                            ].map(c => (
                                <button
                                    key={c.hex}
                                    onClick={() => setSystem(p => ({ ...p, primaryColor: c.hex }))}
                                    title={c.label}
                                    className={`w-8 h-8 rounded-xl transition-all hover:scale-110 ${
                                        system.primaryColor === c.hex ? 'ring-2 ring-offset-2 ring-foreground scale-110' : ''
                                    }`}
                                    style={{ backgroundColor: c.hex }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* PREVIEW GERAL */}
                    <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted">Preview do sistema</p>
                        <div className="bg-background rounded-2xl p-4 border border-border space-y-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm"
                                    style={{ backgroundColor: system.primaryColor }}
                                >
                                    {system.logoText || 'TI'}
                                </div>
                                <div>
                                    <p className="font-black text-foreground text-sm uppercase tracking-tight">
                                        {system.systemName || 'TI BRODOWSKI'}
                                    </p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: system.primaryColor }}>
                                        {system.systemSubtitle || 'Central de Operações'}
                                    </p>
                                </div>
                            </div>
                            {(system.supportPhone || system.supportEmail) && (
                                <div className="flex gap-4 text-[10px] text-muted font-bold pt-2 border-t border-border">
                                    {system.supportPhone && <span>📞 {system.supportPhone}</span>}
                                    {system.supportEmail && <span>✉ {system.supportEmail}</span>}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CONTROLE DE REGISTRO */}
                    <div className="bg-card border border-border rounded-3xl p-6 space-y-5">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                            <Shield size={12}/> Controle de registro
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border">
                                <div>
                                    <p className="text-sm font-black text-foreground">Permitir auto-registro</p>
                                    <p className="text-[10px] text-muted">Usuários podem criar conta pela página de registro</p>
                                </div>
                                <button
                                    onClick={() => setSystem(p => ({
                                        ...p,
                                        registrationOpen: p.registrationOpen === 'true' ? 'false' : 'true'
                                    }))}
                                    className={`relative w-12 h-6 rounded-full transition-colors ${
                                        system.registrationOpen === 'true' ? 'bg-primary' : 'bg-border'
                                    }`}
                                >
                                    <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${
                                        system.registrationOpen === 'true' ? 'left-7' : 'left-1'
                                    }`}/>
                                </button>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted ml-1">
                                    Domínio de e-mail obrigatório
                                </label>
                                <div className="flex items-center gap-2 p-4 bg-background border-2 border-border rounded-2xl focus-within:border-primary transition-all">
                                    <span className="text-muted font-bold text-sm">@</span>
                                    <input
                                        value={system.allowedDomain}
                                        onChange={e => setSystem(p => ({ ...p, allowedDomain: e.target.value }))}
                                        className="flex-1 bg-transparent outline-none font-bold text-foreground text-sm"
                                        placeholder="brodowski.sp.gov.br (deixe vazio para qualquer e-mail)"
                                    />
                                </div>
                                <p className="text-[10px] text-muted ml-1">
                                    Se preenchido, só e-mails com esse domínio poderão se registrar.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={saveSystem}
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-3 p-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                        <Save size={18}/> {saving ? 'Salvando...' : 'Salvar configurações do sistema'}
                    </button>
                </div>
            )}
        </div>
    );
}