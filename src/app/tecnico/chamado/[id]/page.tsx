"use client";

import { useState, useEffect, use, useRef } from 'react';
import Card from '@/components/ui/Card';
import {
    ArrowLeft, User, MapPin, CheckCircle, Loader2, Undo2,
    PauseCircle, Camera, UploadCloud, Image as ImageIcon,
    Clock, Navigation, Filter, Terminal, CalendarClock, Send,
    X, AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SLABadge from '@/components/SLABadge';

export default function DetalheChamadoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();

    const [showVisitModal, setShowVisitModal] = useState(false);
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('');
    const [visitNote, setVisitNote] = useState('');
    const [savingVisit, setSavingVisit] = useState(false);

    const [showPauseModal, setShowPauseModal] = useState(false);
    const [pauseReason, setPauseReason] = useState('');

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nota, setNota] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'images' | 'internal'>('all');
    const [elapsedTime, setElapsedTime] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);

    const macros = [
        'Peça solicitada.',
        'Aguardando usuário no local.',
        'Equipamento em testes.',
        'Problema identificado.',
        'Serviço em andamento.',
    ];

    const loadTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`);
            const data = await res.json();
            setTicket(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!ticket) return;
        const interval = setInterval(() => {
            const start = new Date(ticket.createdAt).getTime();
            const diff = Date.now() - start;
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setElapsedTime(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [ticket]);

    useEffect(() => { if (id) loadTicket(); }, [id]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket?.comments]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleAction = async (isInternal: boolean, customContent?: string) => {
        const content = customContent || nota;
        if (!content.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: isInternal ? `[INTERNO] ${content}` : content,
                    isInternal
                })
            });
            if (res.ok) { setNota(''); setImagePreview(null); loadTicket(); }
        } finally { setIsSubmitting(false); }
    };

    const handleSaveVisit = async () => {
        if (!visitDate || !visitTime) return;
        setSavingVisit(true);
        try {
            const res = await fetch(`/api/tickets/${id}/visita`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitDate: `${visitDate}T${visitTime}:00`, visitNote })
            });
            if (res.ok) {
                setShowVisitModal(false);
                setVisitDate(''); setVisitTime(''); setVisitNote('');
                loadTicket();
            }
        } finally { setSavingVisit(false); }
    };

    const handleUpdateStatus = async (action: string, reason?: string) => {
        if (action === 'PAUSAR' && !reason) {
            setShowPauseModal(true);
            return;
        }
        if (!confirm(`Deseja ${action.toLowerCase()} este chamado?`)) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, proofImage: imagePreview })
            });
            if (res.ok) {
                if (action === 'PAUSAR' && reason) {
                    await fetch(`/api/tickets/${id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: `[INTERNO] Chamado pausado. Motivo: ${reason}`,
                            isInternal: true
                        })
                    });
                }
                router.push('/tecnico');
            }
        } finally { setIsSubmitting(false); }
    };

    const handleConfirmPause = async () => {
        if (!pauseReason.trim()) return;
        setShowPauseModal(false);
        await handleUpdateStatus('PAUSAR', pauseReason);
        setPauseReason('');
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-background">
            <Loader2 className="animate-spin text-primary mb-3" size={40}/>
            <p className="text-muted font-black uppercase text-[10px] tracking-widest">Carregando...</p>
        </div>
    );

    if (!ticket) return (
        <div className="h-screen flex items-center justify-center bg-background">
            <p className="text-muted font-bold">Chamado não encontrado.</p>
        </div>
    );

    const filteredComments = ticket?.comments?.filter((c: any) => {
        if (filter === 'images') return !!c.proofImage;
        if (filter === 'internal') return c.content.includes('[INTERNO]');
        return true;
    }) || [];

    return (
        <div className="min-h-screen bg-background transition-colors duration-300 pb-12">

            {/* MODAL IMAGEM */}
            {selectedImage && (
                <div
                    className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <img src={selectedImage} className="max-w-full max-h-full rounded-2xl shadow-2xl" alt="Preview"/>
                </div>
            )}

            {/* MODAL VISITA */}
            {showVisitModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-border animate-in zoom-in duration-200">
                        <h3 className="font-black uppercase text-sm tracking-widest text-foreground mb-6 flex items-center gap-2">
                            <CalendarClock size={18} className="text-primary"/> Agendar Visita
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-muted">Data</label>
                                    <input type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-bold text-foreground text-sm"/>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase text-muted">Hora</label>
                                    <input type="time" value={visitTime} onChange={e => setVisitTime(e.target.value)}
                                        className="w-full p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-bold text-foreground text-sm"/>
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase text-muted">Observação (opcional)</label>
                                <textarea value={visitNote} onChange={e => setVisitNote(e.target.value)}
                                    placeholder="Ex: Levar cabo HDMI, verificar servidor..."
                                    className="w-full p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary font-medium text-foreground text-sm resize-none h-20"/>
                            </div>
                            <div className="flex gap-3">
                                <button onClick={() => setShowVisitModal(false)}
                                    className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase bg-background border border-border text-muted hover:bg-border transition-all">
                                    Cancelar
                                </button>
                                <button onClick={handleSaveVisit} disabled={!visitDate || !visitTime || savingVisit}
                                    className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase bg-primary text-white hover:opacity-90 disabled:opacity-40 transition-all">
                                    {savingVisit ? 'Salvando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL PAUSA */}
            {showPauseModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-border animate-in zoom-in duration-200">
                        <h3 className="font-black uppercase text-sm tracking-widest text-foreground mb-2 flex items-center gap-2">
                            <PauseCircle size={18} className="text-amber-500"/> Pausar chamado
                        </h3>
                        <p className="text-muted text-sm mb-5">Informe o motivo. Ficará registrado no histórico.</p>
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {['Aguardando peça', 'Aguardando usuário', 'Aguardando aprovação', 'Problema externo'].map(m => (
                                    <button key={m} onClick={() => setPauseReason(m)}
                                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                            pauseReason === m
                                                ? 'bg-amber-500 text-white border-amber-500'
                                                : 'bg-background border-border text-muted hover:border-amber-400'
                                        }`}>
                                        {m}
                                    </button>
                                ))}
                            </div>
                            <textarea value={pauseReason} onChange={e => setPauseReason(e.target.value)}
                                placeholder="Ou descreva o motivo..."
                                className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-amber-500 font-medium text-foreground text-sm resize-none h-24"/>
                            <div className="flex gap-3">
                                <button onClick={() => { setShowPauseModal(false); setPauseReason(''); }}
                                    className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase bg-background border border-border text-muted hover:bg-border transition-all">
                                    Cancelar
                                </button>
                                <button onClick={handleConfirmPause} disabled={!pauseReason.trim() || isSubmitting}
                                    className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 transition-all">
                                    {isSubmitting ? 'Pausando...' : 'Pausar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER STICKY */}
            <div className="bg-card border-b border-border sticky top-0 z-30 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <Link href="/tecnico" className="p-2 hover:bg-background rounded-xl transition-colors text-foreground shrink-0">
                            <ArrowLeft size={20}/>
                        </Link>
                        <div className="min-w-0">
                            <h1 className="text-sm font-black text-foreground uppercase truncate leading-none">
                                {ticket.subject}
                            </h1>
                            <div className="flex items-center gap-3 mt-0.5">
                                <span className="text-[10px] font-mono text-muted">#{ticket.protocol}</span>
                                <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase">
                                    <Clock size={10}/> {elapsedTime}
                                </div>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => handleUpdateStatus('FINALIZAR')}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase transition-all disabled:opacity-50 shrink-0 shadow-lg shadow-emerald-500/20"
                    >
                        <CheckCircle size={15}/> Concluir
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-5">

                {/* COLUNA INFO */}
                <div className="lg:col-span-4 space-y-4">

                    {/* INFO CARD */}
                    <Card className="p-5 rounded-3xl border-none shadow-sm bg-card space-y-4">
                        <div className="space-y-3">
                            <InfoRow icon={<User size={15}/>} label="Solicitante" value={ticket.requester?.name} color="blue"/>
                            {ticket.location && (
                                <div className="flex items-start justify-between gap-2">
                                    <InfoRow icon={<MapPin size={15}/>} label="Local" value={ticket.location} color="emerald"/>
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.location)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl shrink-0r:opacity-80 transition-opacity"
                                    >
                                        <Navigation size={15}/>
                                    </a>
                                </div>
                            )}
                        </div>

                        {/* SLA */}
                        <SLABadge ticketId={id}/>

                        {/* AÇÕES */}
                        <div className="pt-3 border-t border-border grid grid-cols-2 gap-2">
                            <ActionBtn icon={<PauseCircle size={16}/>} label="Pausar" onClick={() => handleUpdateStatus('PAUSAR')} variant="amber"/>
                            <ActionBtn icon={<Undo2 size={16}/>} label="Devolver" onClick={() => handleUpdateStatus('DEVOLVER')} variant="slate"/>
                        </div>

                        <button
                            onClick={() => setShowVisitModal(true)}
                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-black text-[10px] uppercase bg-primary/5 dark:bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all"
                        >
                            <CalendarClock size={15}/> Marcar Visita
                        </button>
                    </Card>

                    {/* CARD FOTO */}
                    <Card className="p-5 rounded-3xl bg-slate-900 dark:bg-slate-950 text-white border-none">
                        <div className="flex items-center gap-2 mb-4">
                            <Camera size={16} className="text-primary"/>
                            <h3 className="font-black uppercase text-[10px] tracking-widest">Foto de evidência</h3>
                        </div>
                        {!imagePreview ? (
                            <label className="cursor-pointer block border-2 border-dashed border-slate-700 rounded-2xl p-5 text-center hover:bg-white/5 transition-all">
                                <UploadCloud className="mx-auto mb-2 text-slate-500" size={22}/>
                                <p className="text-[9px] font-black uppercase text-slate-400">Tirar ou selecionar foto</p>
                                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageChange}/>
                            </label>
                        ) : (
                            <div className="space-y-3">
                                <img src={imagePreview} className="rounded-xl w-full object-cover max-h-40 border-2 border-primary" alt="Preview"/>
                                <div className="flex gap-2">
                                    <button onClick={() => setImagePreview(null)} className="flex-1 bg-white/10 p-2.5 rounded-xl text-[10px] font-black uppercase hover:bg-white/20 transition-all">
                                        Remover
                                    </button>
                                    <button onClick={() => handleAction(true, '[FOTO ANEXADA]')} className="flex-1 bg-primary p-2.5 rounded-xl text-[10px] font-black uppercase hover:opacity-90 transition-all">
                                        Enviar
                                    </button>
                                </div>
                            </div>
                        )}
                    </Card>

                    {/* VISITA ATUAL */}
                    {ticket.visitDate && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <CalendarClock size={14} className="text-blue-600"/>
                                <p className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">Visita agendada</p>
                            </div>
                            <p className="text-sm font-bold text-blue-700 dark:text-blue-300">
                                {new Date(ticket.visitDate).toLocaleString('pt-BR')}
                            </p>
                            {ticket.visitNote && <p className="text-[10px] text-blue-600/70 mt-1 italic">{ticket.visitNote}</p>}
                        </div>
                    )}
                </div>

                {/* COLUNA CHAT */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
                    <Card className="flex-1 flex flex-col p-0 rounded-3xl border-none shadow-sm bg-card overflow-hidden">

                        {/* FILTROS */}
                        <div className="px-5 py-3 border-b border-border flex items-center gap-3 bg-background/50 shrink-0">
                            <Filter size={12} className="text-muted"/>
                            <div className="flex gap-1.5">
                                <FilterTab active={filter === 'all'}      label="Tudo"   onClick={() => setFilter('all')}/>
                                <FilterTab active={filter === 'images'}   label="Fotos"  icon={<ImageIcon size={11}/>} onClick={() => setFilter('images')}/>
                                <FilterTab active={filter === 'internal'} label="Notas"  icon={<Terminal size={11}/>}  onClick={() => setFilter('internal')}/>
                            </div>
                            <span className="ml-auto text-[9px] font-black text-muted uppercase">
                                {filteredComments.length} mensagens
                            </span>
                        </div>

                        {/* MENSAGENS */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {filteredComments.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full opacity-40">
                                    <MessageSquare size={32} className="text-muted mb-2"/>
                                    <p className="text-muted text-[10px] font-black uppercase">Nenhuma mensagem</p>
                                </div>
                            )}
                            {filteredComments.map((c: any) => {
                                const isVisita   = c.content.startsWith('[VISITA]');
                                const isInternal = c.content.includes('[INTERNO]');
                                const isTecnico  = ['TECNICO', 'ADMIN', 'MASTER'].includes(c.user?.role);

                                return (
                                    <div key={c.id} className={`flex flex-col ${
                                        isVisita ? 'items-center' :
                                        isInternal ? 'items-center' :
                                        isTecnico ? 'items-end' : 'items-start'
                                    }`}>
                                        <span className="text-[9px] font-bold text-muted mb-1 px-2">
                                            {c.user?.name} · {new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                        <div className={`p-4 rounded-2xl text-sm max-w-[85%] ${
                                            isVisita
                                                ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 w-full flex items-center gap-3'
                                                : isInternal
                                                    ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 italic'
                                                    : isTecnico
                                                        ? 'bg-slate-900 dark:bg-primary text-white shadow-sm'
                                                        : 'bg-background border border-border text-foreground shadow-sm'
                                        }`}>
                                            {isVisita ? (
                                                <>
                                                    <CalendarClock size={16} className="text-blue-600 shrink-0"/>
                                                    <p className="font-bold text-sm">{c.content.replace('[VISITA] ', '')}</p>
                                                </>
                                            ) : (
                                                <>
                                                    {c.content.replace('[INTERNO] ', '') !== '[FOTO ANEXADA]' && (
                                                        <p className="font-medium leading-relaxed">{c.content.replace('[INTERNO] ', '')}</p>
                                                    )}
                                                    {c.proofImage && (
                                                        <img
                                                            src={c.proofImage}
                                                            onClick={() => setSelectedImage(c.proofImage)}
                                                            className="mt-2 rounded-xl cursor-pointer hover:opacity-90 transition-opacity max-w-full"
                                                            alt="Anexo"
                                                        />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={chatEndRef}/>
                        </div>

                        {/* INPUT */}
                        <div className="p-4 bg-background border-t border-border shrink-0">
                            {/* MACROS */}
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-3">
                                {macros.map((m, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setNota(m)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-card border border-border rounded-full text-[10px] font-bold text-muted hover:border-primary hover:text-primary transition-all shrink-0"
                                    >
                                        + {m}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                                <textarea
                                    value={nota}
                                    onChange={e => setNota(e.target.value)}
                                    placeholder="Escreva uma atualização..."
                                    className="w-full p-4 bg-transparent outline-none text-sm text-foreground resize-none h-20 placeholder:text-muted/50"
                                />
                                <div className="flex gap-2 border-t border-border p-2">
                                    <button
                                        onClick={() => handleAction(false)}
                                        disabled={isSubmitting || !nota.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-foreground text-background rounded-xl font-black text-[10px] uppercase hover:opacity-90 disabled:opacity-40 transition-all"
                                    >
                                        <Send size={13}/> Público
                                    </button>
                                    <button
                                        onClick={() => handleAction(true)}
                                        disabled={isSubmitting || !nota.trim()}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase hover:opacity-90 disabled:opacity-40 transition-all"
                                    >
                                        <Terminal size={13}/> Nota interna
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

// HELPERS
function FilterTab({ active, label, onClick, icon }: any) {
    return (
        <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
            active ? 'bg-primary text-white shadow-md' : 'bg-card text-muted border border-border hover:text-foreground'
        }`}>
            {icon} {label}
        </button>
    );
}

function InfoRow({ icon, label, value, color }: any) {
    const colors: any = {
        blue:   'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
        emerald:'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
    };
    return (
        <div className="flex gap-3 items-center">
            <div className={`p-2.5 rounded-xl ${colors[color] || 'bg-background text-muted'} shrink-0`}>{icon}</div>
            <div className="overflow-hidden">
                <p className="text-[9px] font-black text-muted uppercase tracking-widest">{label}</p>
                <p className="text-sm font-bold text-foreground truncate">{value || '—'}</p>
            </div>
        </div>
    );
}

function ActionBtn({ icon, label, onClick, variant }: any) {
    const variants: any = {
        amber: 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 hover:bg-amber-500 hover:text-white',
        slate: 'bg-background text-muted border-border hover:bg-foreground hover:text-background',
    };
    return (
        <button
            onClick={onClick}
            className={`flex-1 p-3 rounded-xl font-black text-[9px] uppercase flex flex-col items-center gap-1 border transition-all ${variants[variant]}`}
        >
            {icon} {label}
        </button>
    );
}

// Import faltando — adiciona aqui mesmo
function MessageSquare({ size, className }: any) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
    );
}