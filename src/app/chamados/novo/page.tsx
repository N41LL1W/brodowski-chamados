"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Monitor, Wifi, Printer, ShieldAlert, FileText,
    Wrench, Laptop, Server, HardDrive, Database,
    Globe, Lock, Bell, Tag, LayoutGrid, Settings2,
    Shield, Clock, Building2, Phone, Mail, Key, Eye,
    Send, ArrowLeft, MapPin, CheckCircle,
    Download, Home, Search, X, UploadCloud,
    Navigation, ExternalLink, ChevronRight
} from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TicketPDF } from '@/components/TicketPDF';
import { useSystemConfig } from '@/components/SystemConfigProvider';

const IconMap: Record<string, any> = {
    Monitor, Wifi, Printer, ShieldAlert, FileText,
    Wrench, Laptop, Server, HardDrive, Database,
    Globe, Lock, Bell, Tag, LayoutGrid, Settings2,
    Shield, Clock, Building2, Phone, Mail, Key, Eye
};

const PRIORITY_STYLES: Record<string, { active: string; dot: string }> = {
    URGENTE: { active: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-300 dark:border-red-700',      dot: 'bg-red-500' },
    ALTA:    { active: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-700', dot: 'bg-amber-500' },
    NORMAL:  { active: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700',   dot: 'bg-blue-500' },
    BAIXA:   { active: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600', dot: 'bg-slate-400' },
};

const DEFAULT_PRIORITIES = [
    { priority: 'URGENTE', label: 'Urgente', maxHours: 2 },
    { priority: 'ALTA',    label: 'Alta',    maxHours: 4 },
    { priority: 'NORMAL',  label: 'Normal',  maxHours: 24 },
    { priority: 'BAIXA',   label: 'Baixa',   maxHours: 72 },
];

export default function NovoChamadoPage() {
    const router = useRouter();
    const sysConfig = useSystemConfig(); // ← DENTRO do componente
    const [step, setStep] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>(DEFAULT_PRIORITIES);
    const [locaisSugeridos, setLocaisSugeridos] = useState<string[]>([]);
    const [createdTicket, setCreatedTicket] = useState<any>(null);
    const [selectedCategory, setSelectedCategory] = useState<any>(null);

    // Localização
    const [showSearch, setShowSearch] = useState(false);
    const [searchAddress, setSearchAddress] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | undefined>(undefined);

    // Foto
    const [photo, setPhoto] = useState<string | null>(null);

    const [form, setForm] = useState({
        categoryId: '',
        departmentId: '',
        location: '',
        subject: '',
        description: '',
        priority: 'NORMAL'
    });

    useEffect(() => {
        async function load() {
            try {
                const [optRes, slaRes, locaisRes] = await Promise.all([
                    fetch('/api/config/options'),
                    fetch('/api/master/config'),
                    fetch('/api/master/locais'),
                ]);
                const opts = await optRes.json();
                setCategories(opts.categories || []);
                setDepartments(opts.departments || []);

                const slaData = await slaRes.json();
                if (slaData.sla?.length) {
                    setPriorities(slaData.sla);
                    setForm(f => ({ ...f, priority: slaData.sla[0]?.priority || 'NORMAL' }));
                }

                const locais = await locaisRes.json();
                setLocaisSugeridos(Array.isArray(locais) ? locais : []);
            } catch (err) {
                console.error('Erro ao carregar:', err);
            }
        }
        load();
    }, []);

    // Busca de endereço com debounce
    useEffect(() => {
        if (!searchAddress || searchAddress.length < 3) {
            setSuggestions([]);
            return;
        }
        clearTimeout(searchTimeout.current);
        searchTimeout.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const query = `${searchAddress}, Brasil`;
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=7&countrycodes=br&addressdetails=1&dedupe=1`,
                    { headers: { 'Accept-Language': 'pt-BR', 'User-Agent': 'ChamadosTI/1.0' } }
                );
                const data = await res.json();
                const seen = new Set<string>();
                setSuggestions(data.filter((s: any) => {
                    if (seen.has(s.display_name)) return false;
                    seen.add(s.display_name);
                    return true;
                }));
            } catch {
                setSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        }, 600);
        return () => clearTimeout(searchTimeout.current);
    }, [searchAddress]);

    const selectLocation = (name: string) => {
        setForm(f => ({ ...f, location: name }));
        setShowSearch(false);
        setSearchAddress('');
        setSuggestions([]);
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const ticketBasico = await res.json();

                if (photo) {
                    await fetch(`/api/tickets/${ticketBasico.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: 'Foto anexada na abertura do chamado.',
                            proofImage: photo
                        })
                    });
                }

                // Busca o ticket COMPLETO com todos os includes para o PDF
                const resCompleto = await fetch(`/api/tickets/${ticketBasico.id}`);
                const ticketCompleto = resCompleto.ok ? await resCompleto.json() : ticketBasico;

                setCreatedTicket(ticketCompleto);
                setStep(3);
            } else {
                const err = await res.json();
                alert(err.message || 'Erro ao criar chamado.');
            }
        } catch {
            alert('Erro de conexão.');
        } finally {
            setSubmitting(false);
        }
    };

    const getPStyle = (p: string) => PRIORITY_STYLES[p?.toUpperCase()] || PRIORITY_STYLES['NORMAL'];
    const canSubmit = form.departmentId && form.subject.trim() && form.location.trim();

    const inputCls = "w-full p-4 border-2 border-border rounded-2xl bg-background text-foreground outline-none focus:border-primary transition-all font-medium placeholder:text-muted/40 text-sm";
    const labelCls = "block text-[10px] font-black text-muted uppercase tracking-widest mb-1.5 ml-0.5";

    return (
        <div className="min-h-screen bg-background">

            {/* MODAL BUSCA */}
            {showSearch && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-3 md:p-6">
                    <div className="bg-card border border-border w-full max-w-lg rounded-4xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-200">
                        <div className="p-4 border-b border-border">
                            <div className="flex items-center justify-between mb-3">
                                <p className="font-black text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
                                    <MapPin size={14} className="text-primary"/> Buscar localização
                                </p>
                                <button
                                    onClick={() => { setShowSearch(false); setSearchAddress(''); setSuggestions([]); }}
                                    className="p-1.5 rounded-xl bg-background text-muted hover:text-foreground"
                                >
                                    <X size={16}/>
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={15}/>
                                {searchLoading && (
                                    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                                )}
                                <input
                                    autoFocus
                                    value={searchAddress}
                                    onChange={e => setSearchAddress(e.target.value)}
                                    placeholder="Rua, prédio, praça..."
                                    className="w-full p-3 pl-10 pr-10 border-2 border-border rounded-xl bg-background text-foreground outline-none focus:border-primary text-sm font-medium transition-all placeholder:text-muted/50"
                                />
                            </div>
                        </div>

                        {/* LOCAIS PRÉ-CADASTRADOS */}
                        {locaisSugeridos.length > 0 && searchAddress.length < 3 && (
                            <div className="p-4 border-b border-border">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-2">Locais cadastrados</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {locaisSugeridos.map((l, i) => (
                                        <button key={i} onClick={() => selectLocation(l)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-background border border-border rounded-xl text-[10px] font-bold text-foreground hover:border-primary hover:text-primary transition-all">
                                            <MapPin size={9} className="text-primary"/>{l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* RESULTADOS */}
                        <div className="max-h-56 overflow-y-auto">
                            {suggestions.map((s, i) => (
                                <button key={i} onClick={() => selectLocation(s.display_name)}
                                    className="w-full text-left p-3.5 hover:bg-primary/5 transition-all border-b border-border/50 last:border-0 group flex items-start gap-2.5">
                                    <MapPin size={13} className="text-primary mt-0.5 shrink-0"/>
                                    <p className="text-xs font-bold text-foreground group-hover:text-primary leading-relaxed">{s.display_name}</p>
                                </button>
                            ))}
                            {searchAddress.length >= 3 && !searchLoading && suggestions.length === 0 && (
                                <p className="text-center text-[11px] text-muted p-6 font-bold">Nenhum local encontrado.</p>
                            )}
                        </div>

                        <div className="p-3 border-t border-border bg-background/50">
                            <button
                                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchAddress || 'Brasil')}`, '_blank')}
                                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-border text-muted hover:border-primary hover:text-primary text-[10px] font-black uppercase transition-all"
                            >
                                <ExternalLink size={12}/> Abrir no Google Maps
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTEÚDO */}
            <div className="max-w-2xl mx-auto px-4 py-8 md:py-12">

                {/* HEADER */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-foreground uppercase italic tracking-tighter leading-none">
                                {step === 3 ? 'Chamado Aberto!' : 'Novo Chamado'}
                            </h1>
                            <p className="text-muted text-sm mt-1 font-medium">
                                {step === 3 ? 'Registrado com sucesso' :
                                 step === 1 ? 'Selecione o tipo de problema' :
                                 'Preencha os detalhes'}
                            </p>
                        </div>
                        {step === 2 && (
                            <button onClick={() => setStep(1)}
                                className="flex items-center gap-1.5 text-muted hover:text-primary font-bold text-sm transition-all">
                                <ArrowLeft size={16}/> Voltar
                            </button>
                        )}
                    </div>

                    {step < 3 && (
                        <div className="flex gap-2">
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-border'}`}/>
                            <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-border'}`}/>
                        </div>
                    )}
                </div>

                {/* ========== PASSO 1 ========== */}
                {step === 1 && (
                    <div className="animate-in fade-in zoom-in-95 duration-300">
                        {categories.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-border rounded-3xl">
                                <p className="text-muted text-sm font-bold">Nenhuma categoria configurada.</p>
                                <p className="text-muted/60 text-xs mt-1">Configure em Admin → Categorias.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                                {categories.map((cat: any) => {
                                    const Icon = IconMap[cat.icon] || Monitor;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => {
                                                setSelectedCategory(cat);
                                                setForm(f => ({ ...f, categoryId: cat.id }));
                                                setStep(2);
                                            }}
                                            className="group p-5 md:p-6 bg-card border-2 border-border rounded-2xl md:rounded-3xl hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all flex flex-col items-center gap-3 active:scale-95 text-center"
                                        >
                                            <div className="p-3 md:p-4 bg-background rounded-xl md:rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300 text-muted">
                                                <Icon size={28}/>
                                            </div>
                                            <span className="font-black text-foreground uppercase text-[10px] tracking-widest leading-tight">
                                                {cat.name}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ========== PASSO 2 ========== */}
                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-5">

                        {/* CATEGORIA SELECIONADA */}
                        {selectedCategory && (
                            <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/20 rounded-2xl">
                                <div className="p-2 bg-primary rounded-xl text-white shrink-0">
                                    {(() => { const Icon = IconMap[selectedCategory.icon] || Monitor; return <Icon size={16}/>; })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[9px] font-black text-muted uppercase">Categoria selecionada</p>
                                    <p className="text-sm font-black text-foreground uppercase">{selectedCategory.name}</p>
                                </div>
                                <button onClick={() => setStep(1)} className="text-[10px] font-black text-primary uppercase hover:underline">
                                    Trocar
                                </button>
                            </div>
                        )}

                        {/* SECRETARIA */}
                        <div>
                            <label className={labelCls}>Sua secretaria *</label>
                            <select
                                className={`${inputCls} ${!form.departmentId ? 'text-muted/60' : ''}`}
                                value={form.departmentId}
                                onChange={e => setForm(f => ({ ...f, departmentId: e.target.value }))}
                            >
                                <option value="" className="bg-card text-foreground">Selecione a secretaria...</option>
                                {departments.map((d: any) => (
                                    <option key={d.id} value={d.id} className="bg-card text-foreground">{d.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* URGÊNCIA */}
                        <div>
                            <label className={labelCls}>Urgência</label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-background rounded-2xl border-2 border-border">
                                {priorities.map((p: any) => {
                                    const isActive = form.priority === p.priority;
                                    const style = getPStyle(p.priority);
                                    return (
                                        <button
                                            key={p.priority}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, priority: p.priority }))}
                                            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-[10px] font-black uppercase transition-all border ${
                                                isActive ? style.active : 'border-transparent text-muted hover:text-foreground'
                                            }`}
                                        >
                                            {isActive && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}/>}
                                            {p.label || p.priority}
                                        </button>
                                    );
                                })}
                            </div>
                            {(() => {
                                const sel = priorities.find(p => p.priority === form.priority);
                                return sel?.maxHours ? (
                                    <p className="text-[10px] text-muted mt-1.5 ml-0.5">
                                        Prazo: <span className="font-bold text-foreground">{sel.maxHours}h</span>
                                    </p>
                                ) : null;
                            })()}
                        </div>

                        {/* LOCALIZAÇÃO */}
                        <div>
                            <label className={labelCls}>Localização exata *</label>
                            <div className="space-y-2">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={15}/>
                                        <input
                                            value={form.location}
                                            onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                                            placeholder="Ex: Sala 02, Recepção, Servidor..."
                                            className="w-full p-4 pl-10 pr-10 border-2 border-border rounded-2xl bg-background text-foreground outline-none focus:border-primary transition-all font-medium placeholder:text-muted/40 text-sm"
                                        />
                                        {form.location && (
                                            <button onClick={() => setForm(f => ({ ...f, location: '' }))}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
                                                <X size={13}/>
                                            </button>
                                        )}
                                    </div>
                                    <button type="button" onClick={() => setShowSearch(true)} title="Buscar endereço"
                                        className="p-4 bg-background border-2 border-border rounded-2xl text-muted hover:border-primary hover:text-primary transition-all shrink-0">
                                        <Search size={17}/>
                                    </button>
                                </div>

                                {locaisSugeridos.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {locaisSugeridos.slice(0, 8).map((l, i) => (
                                            <button key={i} type="button"
                                                onClick={() => setForm(f => ({ ...f, location: l }))}
                                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                                                    form.location === l
                                                        ? 'border-primary bg-primary/10 text-primary'
                                                        : 'border-border bg-background text-muted hover:border-primary hover:text-primary'
                                                }`}>
                                                <MapPin size={9}/>{l}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ASSUNTO */}
                        <div>
                            <label className={labelCls}>Assunto *</label>
                            <input
                                value={form.subject}
                                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                                placeholder="Resumo do problema"
                                className={inputCls}
                            />
                        </div>

                        {/* DESCRIÇÃO */}
                        <div>
                            <label className={labelCls}>
                                Descrição <span className="normal-case font-medium">(opcional)</span>
                            </label>
                            <textarea
                                value={form.description}
                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                placeholder="Descreva o problema com detalhes..."
                                className={`${inputCls} h-28 resize-none`}
                            />
                        </div>

                        {/* FOTO */}
                        <div>
                            <label className={labelCls}>
                                Foto <span className="normal-case font-medium">(opcional)</span>
                            </label>
                            {!photo ? (
                                <label className="cursor-pointer flex items-center gap-4 p-4 border-2 border-dashed border-border rounded-2xl hover:border-primary transition-all group bg-background">
                                    <div className="p-2.5 bg-card rounded-xl text-muted group-hover:text-primary transition-colors shrink-0">
                                        <UploadCloud size={20}/>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">Anexar foto do problema</p>
                                        <p className="text-[10px] text-muted mt-0.5">JPG, PNG</p>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden"
                                        onChange={e => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onloadend = () => setPhoto(reader.result as string);
                                            reader.readAsDataURL(file);
                                            e.target.value = '';
                                        }}/>
                                </label>
                            ) : (
                                <div className="relative rounded-2xl overflow-hidden border-2 border-primary">
                                    <img src={photo} className="w-full max-h-44 object-cover" alt="Preview"/>
                                    <button onClick={() => setPhoto(null)}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center hover:bg-red-600 shadow-lg transition-colors">
                                        <X size={14}/>
                                    </button>
                                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[9px] font-black uppercase px-2.5 py-1 rounded-full backdrop-blur-sm">
                                        Foto anexada ✓
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* BOTÃO ENVIAR */}
                        <div className="pt-2">
                            <button
                                onClick={handleSubmit}
                                disabled={submitting || !canSubmit}
                                className="w-full flex items-center justify-center gap-3 p-4 md:p-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                            >
                                <Send size={17}/>
                                {submitting ? 'Enviando...' : 'Finalizar Chamado'}
                            </button>

                            {!canSubmit && (
                                <p className="text-center text-[10px] text-muted mt-2">
                                    Preencha:{' '}
                                    {[
                                        !form.departmentId && 'secretaria',
                                        !form.location.trim() && 'localização',
                                        !form.subject.trim() && 'assunto',
                                    ].filter(Boolean).join(' · ')}
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* ========== PASSO 3 — SUCESSO ========== */}
                {step === 3 && createdTicket && (
                    <div className="animate-in fade-in zoom-in-95 duration-500 text-center space-y-8">
                        <div className="flex flex-col items-center gap-5">
                            <div className="relative">
                                <div className="p-5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full">
                                    <CheckCircle size={60}/>
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-background">
                                    <ChevronRight size={14} className="text-white"/>
                                </div>
                            </div>

                            <div>
                                <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-foreground">
                                    Chamado <span className="text-emerald-600">Enviado!</span>
                                </h2>
                                <p className="text-muted font-medium mt-1 text-sm">
                                    Seu atendimento foi registrado com sucesso.
                                </p>
                            </div>

                            {/* PROTOCOLO */}
                            <div className="bg-card border-2 border-border rounded-2xl px-8 py-4 w-full max-w-xs">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-1">Protocolo de atendimento</p>
                                <p className="text-xl md:text-2xl font-mono font-black text-foreground tracking-widest">
                                    {createdTicket.protocol}
                                </p>
                            </div>
                        </div>

                        <div className="grid gap-3 max-w-sm mx-auto w-full">
                            {/* PDF DOWNLOAD */}
                            <PDFDownloadLink
                                document={
                                    <TicketPDF
                                        ticket={createdTicket}
                                        systemName={sysConfig.systemName}
                                        cityName={sysConfig.cityName}
                                    />
                                }
                                fileName={`protocolo-${createdTicket.protocol}.pdf`}
                                className="flex items-center justify-center gap-2 p-4 bg-foreground text-background rounded-2xl font-black uppercase text-sm hover:opacity-90 transition-all"
                            >
                                {({ loading }) => (
                                    <><Download size={17}/>{loading ? 'Preparando...' : 'Baixar Comprovante PDF'}</>
                                )}
                            </PDFDownloadLink>

                            <button
                                onClick={() => router.push('/meus-chamados')}
                                className="flex items-center justify-center gap-2 p-4 bg-card border-2 border-border text-foreground rounded-2xl font-black uppercase text-sm hover:bg-background transition-all"
                            >
                                <Home size={17}/> Ver meus chamados
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}