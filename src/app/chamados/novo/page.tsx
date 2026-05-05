"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Monitor, Wifi, Printer, ShieldAlert, FileText,
    Wrench, Laptop, Server, HardDrive, Database,
    Globe, Lock, Bell, Tag, LayoutGrid, Settings2,
    Shield, Clock, Building2, Phone, Mail, Key, Eye,
    Send, ArrowLeft, MapPin, CheckCircle,
    Download, Home, Search, X, Camera, UploadCloud,
    Navigation, ExternalLink
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TicketPDF } from '@/components/TicketPDF';

const IconMap: Record<string, any> = {
    Monitor, Wifi, Printer, ShieldAlert, FileText,
    Wrench, Laptop, Server, HardDrive, Database,
    Globe, Lock, Bell, Tag, LayoutGrid, Settings2,
    Shield, Clock, Building2, Phone, Mail, Key, Eye
};

// Cores por prioridade
const PRIORITY_STYLES: Record<string, { pill: string; dot: string }> = {
    URGENTE: { pill: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',    dot: 'bg-red-500' },
    ALTA:    { pill: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
    NORMAL:  { pill: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',  dot: 'bg-blue-500' },
    BAIXA:   { pill: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700', dot: 'bg-slate-400' },
};

const DEFAULT_PRIORITIES = [
    { priority: 'URGENTE', label: 'Urgente', maxHours: 2,  color: 'red' },
    { priority: 'ALTA',    label: 'Alta',    maxHours: 4,  color: 'amber' },
    { priority: 'NORMAL',  label: 'Normal',  maxHours: 24, color: 'blue' },
    { priority: 'BAIXA',   label: 'Baixa',   maxHours: 72, color: 'gray' },
];

export default function NovoChamadoPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [departments, setDepartments] = useState<any[]>([]);
    const [priorities, setPriorities] = useState<any[]>(DEFAULT_PRIORITIES);
    const [locaisSugeridos, setLocaisSugeridos] = useState<string[]>([]);
    const [createdTicket, setCreatedTicket] = useState<any>(null);

    // Localização
    const [showSearch, setShowSearch] = useState(false);
    const [searchAddress, setSearchAddress] = useState('');
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);

    // Foto
    const [chatImage, setChatImage] = useState<string | null>(null);

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
                console.error('Erro ao carregar opções:', err);
            }
        }
        load();
    }, []);

    // Busca com debounce
useEffect(() => {
    if (!searchAddress || searchAddress.length < 3) {
        setSuggestions([]);
        return;
    }
    
    // Limpa o timeout anterior se existir
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchAddress)}&limit=5&countrycodes=br`,
                    { headers: { 'Accept-Language': 'pt-BR' } }
                );
                const data = await res.json();
                setSuggestions(data);
            } catch {
                setSuggestions([]);
            } finally {
                setSearchLoading(false);
            }
        }, 500);

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [searchAddress]);

    const selectSuggestion = (name: string) => {
        setForm(f => ({ ...f, location: name }));
        setShowSearch(false);
        setSearchAddress('');
        setSuggestions([]);
    };

    const openGoogleMaps = () => {
        const query = form.location || 'Brodowski SP';
        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            if (res.ok) {
                const ticketData = await res.json();
                if (chatImage) {
                    await fetch(`/api/tickets/${ticketData.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: 'Foto anexada na abertura do chamado.',
                            proofImage: chatImage
                        })
                    });
                }
                setCreatedTicket(ticketData);
                setStep(3);
            } else {
                alert('Erro ao criar chamado.');
            }
        } catch {
            alert('Erro de conexão.');
        } finally {
            setLoading(false);
        }
    };

    const getPriorityStyle = (priority: string) => {
        return PRIORITY_STYLES[priority.toUpperCase()] || PRIORITY_STYLES['NORMAL'];
    };

    const inputClass = "w-full p-4 border-2 border-border rounded-2xl bg-background text-foreground outline-none focus:border-primary transition-all font-medium placeholder:text-muted/40 text-sm";
    const labelClass = "block text-[10px] font-black text-muted uppercase tracking-widest ml-1 mb-1.5";

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-screen">

            {/* MODAL BUSCA DE ENDEREÇO */}
            {showSearch && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
                    <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 md:zoom-in duration-200">
                        
                        <div className="p-5 border-b border-border">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-black uppercase text-sm tracking-widest text-foreground flex items-center gap-2">
                                    <MapPin size={16} className="text-primary"/> Buscar localização
                                </h3>
                                <button
                                    onClick={() => { setShowSearch(false); setSearchAddress(''); setSuggestions([]); }}
                                    className="p-2 bg-background rounded-xl text-muted hover:text-foreground transition-colors"
                                >
                                    <X size={16}/>
                                </button>
                            </div>
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16}/>
                                {searchLoading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                                )}
                                <input
                                    ref={searchRef}
                                    autoFocus
                                    className="w-full p-3.5 pl-11 pr-10 border-2 border-border rounded-2xl bg-background text-foreground outline-none focus:border-primary transition-all text-sm font-medium placeholder:text-muted/50"
                                    placeholder="Digite a rua, prédio, praça..."
                                    value={searchAddress}
                                    onChange={e => setSearchAddress(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* LOCAIS PRÉ-CADASTRADOS */}
                        {locaisSugeridos.length > 0 && searchAddress.length < 3 && (
                            <div className="p-4 border-b border-border">
                                <p className="text-[9px] font-black uppercase tracking-widest text-muted mb-3">Locais da prefeitura</p>
                                <div className="flex flex-wrap gap-2">
                                    {locaisSugeridos.map((local, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => selectSuggestion(local)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-xl text-[11px] font-bold text-foreground hover:border-primary hover:text-primary transition-all"
                                        >
                                            <MapPin size={10} className="text-primary"/>
                                            {local}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* RESULTADOS DA BUSCA */}
                        <div className="max-h-64 overflow-y-auto">
                            {suggestions.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => selectSuggestion(s.display_name)}
                                    className="w-full text-left p-4 hover:bg-primary/5 transition-all border-b border-border/50 last:border-0 group"
                                >
                                    <div className="flex items-start gap-3">
                                        <MapPin size={14} className="text-primary mt-0.5 shrink-0"/>
                                        <p className="text-xs font-bold text-foreground group-hover:text-primary leading-relaxed">{s.display_name}</p>
                                    </div>
                                </button>
                            ))}
                            {searchAddress.length >= 3 && !searchLoading && suggestions.length === 0 && (
                                <div className="p-6 text-center">
                                    <p className="text-[11px] font-bold text-muted">Nenhum local encontrado.</p>
                                    <p className="text-[10px] text-muted/60 mt-1">Tente um endereço diferente.</p>
                                </div>
                            )}
                        </div>

                        {/* ABRIR NO GOOGLE MAPS */}
                        <div className="p-4 bg-background/50 border-t border-border">
                            <button
                                onClick={() => {
                                    const q = searchAddress || 'Brodowski SP Brasil';
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`, '_blank');
                                }}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-border text-muted hover:border-primary hover:text-primary font-black uppercase text-[10px] transition-all"
                            >
                                <ExternalLink size={14}/> Abrir no Google Maps
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <header className="mb-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">
                            Novo <span className="text-primary">Chamado</span>
                        </h1>
                        <p className="text-muted font-medium text-sm mt-0.5">
                            {step === 3 ? 'Chamado registrado com sucesso' : `Etapa ${step} de 2`}
                        </p>
                    </div>
                    {step === 2 && (
                        <button
                            onClick={() => setStep(1)}
                            className="flex items-center gap-2 text-muted hover:text-primary font-bold text-sm transition-all p-2 rounded-xl hover:bg-background"
                        >
                            <ArrowLeft size={18}/> Voltar
                        </button>
                    )}
                </div>

                {/* PROGRESS BAR */}
                {step < 3 && (
                    <div className="mt-4 flex gap-2">
                        <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-primary' : 'bg-border'}`}/>
                        <div className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-primary' : 'bg-border'}`}/>
                    </div>
                )}
            </header>

            {/* PASSO 1: CATEGORIA */}
            {step === 1 && (
                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted">
                        Selecione o tipo de problema
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {categories.map((cat: any) => {
                            const Icon = IconMap[cat.icon] || Monitor;
                            return (
                                <button
                                    key={cat.id}
                                    onClick={() => { setForm({ ...form, categoryId: cat.id }); setStep(2); }}
                                    className="p-6 bg-card border-2 border-border rounded-3xl hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all flex flex-col items-center gap-3 group text-center active:scale-95"
                                >
                                    <div className="p-4 bg-background rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300 text-foreground">
                                        <Icon size={32}/>
                                    </div>
                                    <span className="font-black text-foreground uppercase text-[10px] tracking-widest leading-tight">{cat.name}</span>
                                </button>
                            );
                        })}
                        {categories.length === 0 && (
                            <div className="col-span-3 py-16 text-center border-2 border-dashed border-border rounded-3xl text-muted text-xs font-bold uppercase">
                                Nenhuma categoria configurada.
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* PASSO 2: FORMULÁRIO */}
            {step === 2 && (
                <div className="animate-in fade-in slide-in-from-right-8 duration-300 space-y-5">

                    {/* SECRETARIA + URGÊNCIA */}
                    <div className="grid md:grid-cols-2 gap-5">
                        <div>
                            <label className={labelClass}>Sua secretaria</label>
                            <select
                                className={inputClass}
                                value={form.departmentId}
                                onChange={e => setForm({ ...form, departmentId: e.target.value })}
                            >
                                <option value="" className="bg-card text-foreground">Selecione...</option>
                                {departments.map((dept: any) => (
                                    <option key={dept.id} value={dept.id} className="bg-card text-foreground">
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className={labelClass}>Urgência</label>
                            <div className="flex flex-wrap gap-2 p-1 bg-background rounded-2xl border-2 border-border">
                                {priorities.map((p: any) => {
                                    const style = getPriorityStyle(p.priority);
                                    const isActive = form.priority === p.priority;
                                    return (
                                        <button
                                            key={p.priority}
                                            type="button"
                                            onClick={() => setForm({ ...form, priority: p.priority })}
                                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                                                isActive
                                                    ? style.pill
                                                    : 'border-transparent text-muted hover:text-foreground'
                                            }`}
                                        >
                                            {isActive && (
                                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`}/>
                                            )}
                                            {p.label || p.priority}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Dica do SLA */}
                            {(() => {
                                const selected = priorities.find((p: any) => p.priority === form.priority);
                                if (!selected?.maxHours) return null;
                                return (
                                    <p className="text-[10px] text-muted mt-1.5 ml-1">
                                        Prazo de atendimento: <span className="font-bold text-foreground">{selected.maxHours}h</span>
                                    </p>
                                );
                            })()}
                        </div>
                    </div>

                    {/* LOCALIZAÇÃO */}
                    <div>
                        <label className={labelClass}>Localização exata</label>
                        <div className="space-y-3">
                            {/* Campo principal */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={16}/>
                                    <input
                                        className="w-full p-4 pl-11 border-2 border-border rounded-2xl bg-background text-foreground outline-none focus:border-primary transition-all font-medium placeholder:text-muted/40 text-sm"
                                        placeholder="Descreva o local (ex: Sala 02, Recepção...)"
                                        value={form.location}
                                        onChange={e => setForm({ ...form, location: e.target.value })}
                                    />
                                    {form.location && (
                                        <button
                                            onClick={() => setForm({ ...form, location: '' })}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
                                        >
                                            <X size={14}/>
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowSearch(true)}
                                    title="Buscar endereço"
                                    className="p-4 bg-background border-2 border-border rounded-2xl text-muted hover:border-primary hover:text-primary transition-all"
                                >
                                    <Search size={18}/>
                                </button>
                                <button
                                    type="button"
                                    onClick={openGoogleMaps}
                                    title="Abrir Google Maps"
                                    className="p-4 bg-background border-2 border-border rounded-2xl text-muted hover:border-primary hover:text-primary transition-all"
                                >
                                    <Navigation size={18}/>
                                </button>
                            </div>

                            {/* Locais pré-cadastrados como chips */}
                            {locaisSugeridos.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {locaisSugeridos.slice(0, 6).map((local, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => setForm({ ...form, location: local })}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all border ${
                                                form.location === local
                                                    ? 'border-primary bg-primary/10 text-primary'
                                                    : 'border-border bg-background text-muted hover:border-primary hover:text-primary'
                                            }`}
                                        >
                                            <MapPin size={9}/>
                                            {local}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ASSUNTO */}
                    <div>
                        <label className={labelClass}>Assunto</label>
                        <input
                            className={inputClass}
                            placeholder="Resumo do problema"
                            value={form.subject}
                            onChange={e => setForm({ ...form, subject: e.target.value })}
                        />
                    </div>

                    {/* DESCRIÇÃO */}
                    <div>
                        <label className={labelClass}>Descrição detalhada</label>
                        <textarea
                            className={`${inputClass} h-32 resize-none`}
                            placeholder="Descreva o problema com o máximo de detalhes possível..."
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    {/* FOTO OPCIONAL */}
                    <div>
                        <label className={labelClass}>Foto do problema <span className="normal-case font-medium text-muted">(opcional)</span></label>
                        {!chatImage ? (
                            <label className="cursor-pointer flex items-center gap-4 p-5 border-2 border-dashed border-border rounded-2xl hover:border-primary transition-all group bg-background">
                                <div className="p-3 bg-card rounded-xl text-muted group-hover:text-primary transition-colors shrink-0">
                                    <UploadCloud size={22}/>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">Clique para anexar uma foto</p>
                                    <p className="text-[10px] text-muted mt-0.5">Ajuda no diagnóstico do problema</p>
                                </div>
                                <input
                                    type="file" accept="image/*" className="hidden"
                                    onChange={e => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onloadend = () => setChatImage(reader.result as string);
                                        reader.readAsDataURL(file);
                                        e.target.value = '';
                                    }}
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                <img src={chatImage} className="w-full max-h-48 object-cover rounded-2xl border-2 border-primary" alt="Preview"/>
                                <button
                                    onClick={() => setChatImage(null)}
                                    className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    <X size={15}/>
                                </button>
                                <div className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full backdrop-blur-sm">
                                    Foto anexada
                                </div>
                            </div>
                        )}
                    </div>

                    {/* BOTÃO ENVIAR */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !form.departmentId || !form.subject || !form.location}
                        className="w-full flex items-center justify-center gap-3 p-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed text-sm"
                    >
                        <Send size={18}/>
                        {loading ? 'Enviando...' : 'Finalizar Chamado'}
                    </button>

                    {/* CAMPOS OBRIGATÓRIOS */}
                    {(!form.departmentId || !form.subject || !form.location) && (
                        <p className="text-center text-[10px] text-muted">
                            Preencha{' '}
                            {[
                                !form.departmentId && 'secretaria',
                                !form.location && 'localização',
                                !form.subject && 'assunto',
                            ].filter(Boolean).join(', ')} para continuar
                        </p>
                    )}
                </div>
            )}

            {/* PASSO 3: SUCESSO */}
            {step === 3 && createdTicket && (
                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="p-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full">
                                <CheckCircle size={72}/>
                            </div>
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                                <CheckCircle size={14} className="text-white"/>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-4xl font-black uppercase italic tracking-tighter text-foreground">
                                Chamado <span className="text-emerald-600">Enviado!</span>
                            </h2>
                            <p className="text-muted font-medium mt-2 max-w-xs mx-auto text-sm">
                                Protocolo registrado com sucesso. Guarde o número abaixo.
                            </p>
                        </div>

                        {/* PROTOCOLO EM DESTAQUE */}
                        <div className="bg-card border-2 border-border rounded-2xl px-8 py-4">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Protocolo</p>
                            <p className="text-2xl font-mono font-black text-foreground tracking-widest">
                                {createdTicket.protocol}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 max-w-sm mx-auto">
                        <PDFDownloadLink
                            document={<TicketPDF ticket={createdTicket}/>}
                            fileName={`protocolo-${createdTicket.protocol}.pdf`}
                            className="flex items-center justify-center gap-3 p-4 bg-foreground text-background rounded-2xl font-black uppercase text-sm hover:opacity-90 transition-all"
                        >
                            {({ loading }) => (
                                <>
                                    <Download size={18}/>
                                    {loading ? 'Preparando PDF...' : 'Baixar Comprovante'}
                                </>
                            )}
                        </PDFDownloadLink>

                        <button
                            onClick={() => router.push('/meus-chamados')}
                            className="flex items-center justify-center gap-3 p-4 bg-card border-2 border-border text-foreground rounded-2xl font-black uppercase text-sm hover:bg-background transition-all"
                        >
                            <Home size={18}/> Ver meus chamados
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}