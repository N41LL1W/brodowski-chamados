"use client";

import { useState, useEffect, use, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, User, MapPin, CheckCircle, Loader2, Undo2, 
  PauseCircle, Camera, UploadCloud, Image as ImageIcon,
  Clock, Navigation, Filter, Terminal, CalendarClock
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SLABadge from '@/components/SLABadge';

export default function DetalheChamadoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); 
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [showVisitModal, setShowVisitModal] = useState(false);
    const [visitDate, setVisitDate] = useState('');
    const [visitTime, setVisitTime] = useState('');
    const [visitNote, setVisitNote] = useState('');
    const [savingVisit, setSavingVisit] = useState(false);

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nota, setNota] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'images' | 'internal'>('all');
    const [elapsedTime, setElapsedTime] = useState("");

    const macros = ["Peça solicitada.", "Aguardando local.", "Equipamento em testes.", "Cliente ausente."];

    const loadTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`);
            const data = await res.json();
            setTicket(data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    useEffect(() => {
        if (!ticket) return;
        const interval = setInterval(() => {
            const start = new Date(ticket.createdAt).getTime();
            const diff = new Date().getTime() - start;
            const h = Math.floor(diff / 3600000).toString().padStart(2, '0');
            const m = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
            const s = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
            setElapsedTime(`${h}:${m}:${s}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [ticket]);

    useEffect(() => { if (id) loadTicket(); }, [id]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleAction = async (isInternal: boolean, customContent?: string) => {
        const contentToSend = customContent || nota;
        if (!contentToSend.trim() || isSubmitting) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ 
                    content: isInternal ? `[INTERNO] ${contentToSend}` : contentToSend, 
                    isInternal 
                }) 
            });
            if(res.ok) { setNota(""); setImagePreview(null); loadTicket(); }
        } finally { setIsSubmitting(false); }
    };

    const handleSaveVisit = async () => {
        if (!visitDate || !visitTime) return;
        setSavingVisit(true);
        try {
            const fullDate = `${visitDate}T${visitTime}:00`;
            const res = await fetch(`/api/tickets/${id}/visita`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visitDate: fullDate, visitNote })
            });
            if (res.ok) {
                setShowVisitModal(false);
                setVisitDate('');
                setVisitTime('');
                setVisitNote('');
                loadTicket();
            }
        } finally {
            setSavingVisit(false);
        }
    };

    const handleUpdateStatus = async (action: string) => {
        if (!confirm(`Deseja ${action.toLowerCase()}?`)) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, proofImage: imagePreview })
            });
            if (res.ok) router.push('/tecnico');
        } finally { setIsSubmitting(false); }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-background">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-muted font-black uppercase text-xs">Sincronizando...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-background transition-colors duration-300 pb-12">

            {/* MODAL IMAGEM */}
            {selectedImage && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} className="max-w-full max-h-full rounded-lg shadow-2xl" alt="Preview" />
                </div>
            )}

            {/* MODAL VISITA */}
            {showVisitModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-border">
                        <h3 className="font-black uppercase text-sm tracking-widest text-foreground mb-6 flex items-center gap-2">
                            <CalendarClock size={18} className="text-blue-600" /> Agendar Visita
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted">Data</label>
                                    <input
                                        type="date"
                                        value={visitDate}
                                        onChange={e => setVisitDate(e.target.value)}
                                        min={new Date().toISOString().split('T')[0]}
                                        className="w-full p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-foreground text-sm"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-muted">Hora</label>
                                    <input
                                        type="time"
                                        value={visitTime}
                                        onChange={e => setVisitTime(e.target.value)}
                                        className="w-full p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-blue-500 transition-all font-bold text-foreground text-sm"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-muted">Observação (opcional)</label>
                                <textarea
                                    value={visitNote}
                                    onChange={e => setVisitNote(e.target.value)}
                                    placeholder="Ex: Levar cabo HDMI, verificar servidor..."
                                    className="w-full p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-blue-500 transition-all font-medium text-foreground text-sm resize-none h-24"
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowVisitModal(false)}
                                    className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase bg-background border border-border text-muted hover:bg-border transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleSaveVisit}
                                    disabled={!visitDate || !visitTime || savingVisit}
                                    className="flex-1 p-4 rounded-2xl font-black text-[10px] uppercase bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-40"
                                >
                                    {savingVisit ? 'Salvando...' : 'Confirmar'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER STICKY */}
            <div className="bg-card border-b border-border sticky top-0 z-30 px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/tecnico" className="p-2 hover:bg-background rounded-xl transition-colors text-foreground">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-sm font-black text-foreground uppercase truncate max-w-[200px]">{ticket.subject}</h1>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase">
                                <Clock size={12} /> {elapsedTime}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => handleUpdateStatus('FINALIZAR')} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all">
                        <CheckCircle size={16} /> Concluir
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* COLUNA INFO */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 rounded-3xl border-none shadow-sm bg-card">
                        <div className="space-y-4">
                            <InfoItem icon={<User size={18}/>} label="Solicitante" value={ticket.requester?.name} color="blue" />
                            <SLABadge ticketId={id} />
                            <h1 className="text-sm font-bold text-foreground">TA AQUI O PROBLEMA</h1>
                            <div className="flex items-center justify-between">
                                <InfoItem icon={<MapPin size={18}/>} label="Local" value={ticket.location} color="emerald" />
                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.location || '')}`} target="_blank" className="p-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl">
                                    <Navigation size={18} />
                                </a>
                            </div>
                        </div>

                        {/* AÇÕES */}
                        <div className="mt-6 pt-6 border-t border-border space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <ActionBtn icon={<PauseCircle size={18}/>} label="Pausar" onClick={() => handleUpdateStatus('PAUSAR')} variant="amber" />
                                <ActionBtn icon={<Undo2 size={18}/>} label="Devolver" onClick={() => handleUpdateStatus('DEVOLVER')} variant="slate" />
                            </div>
                            <button
                                onClick={() => setShowVisitModal(true)}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl font-black text-[9px] uppercase bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 transition-all hover:bg-blue-600 hover:text-white"
                            >
                                <CalendarClock size={16} /> Marcar Visita
                            </button>
                        </div>
                    </Card>

                    {/* CARD FOTO */}
                    <Card className="p-6 rounded-3xl bg-slate-900 dark:bg-blue-950 text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Camera size={18} className="text-blue-400"/>
                            <h3 className="font-black uppercase text-[10px] tracking-widest">Anexar Foto</h3>
                        </div>
                        {!imagePreview ? (
                            <label className="cursor-pointer block border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:bg-white/5 transition-all">
                                <UploadCloud className="mx-auto mb-2 text-slate-500" size={24} />
                                <p className="text-[9px] font-black uppercase text-slate-400">Capturar</p>
                                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
                            </label>
                        ) : (
                            <div className="space-y-3">
                                <img src={imagePreview} className="rounded-xl aspect-video object-cover w-full border-2 border-blue-500" alt="Preview" />
                                <div className="flex gap-2">
                                    <button onClick={() => setImagePreview(null)} className="flex-1 bg-white/10 p-2 rounded-lg text-[10px] font-bold">Limpar</button>
                                    <button onClick={() => handleAction(true, "[FOTO ANEXADA]")} className="flex-1 bg-blue-600 p-2 rounded-lg text-[10px] font-black uppercase">Enviar</button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* COLUNA CHAT */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-160px)]">
                    <Card className="flex-1 flex flex-col p-0 rounded-3xl border-none shadow-sm bg-card overflow-hidden">
                        <div className="px-6 py-3 border-b border-border flex items-center gap-4 bg-background/50">
                            <Filter size={14} className="text-muted" />
                            <div className="flex gap-2">
                                <FilterTab active={filter === 'all'} label="Tudo" onClick={() => setFilter('all')} />
                                <FilterTab active={filter === 'images'} label="Fotos" icon={<ImageIcon size={12}/>} onClick={() => setFilter('images')} />
                                <FilterTab active={filter === 'internal'} label="Notas" icon={<Terminal size={12}/>} onClick={() => setFilter('internal')} />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {ticket?.comments?.filter((c: any) => {
                                if (filter === 'images') return c.proofImage?.length > 50;
                                if (filter === 'internal') return c.content.includes("[INTERNO]");
                                return true;
                            }).map((c: any) => {
                                const isVisita   = c.content.startsWith('[VISITA]');
                                const isInternal = c.content.includes("[INTERNO]");
                                const isTecnico  = ["TECNICO", "ADMIN", "MASTER"].includes(c.user?.role);

                                return (
                                    <div key={c.id} className={`flex flex-col ${
                                        isVisita ? 'items-center' :
                                        isInternal ? 'items-center' : 
                                        isTecnico ? 'items-end' : 'items-start'
                                    }`}>
                                        <span className="text-[9px] font-bold text-muted mb-1 px-2">
                                            {c.user?.name} • {new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                        <div className={`p-4 rounded-2xl text-sm max-w-[90%] ${
                                            isVisita   ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 w-full max-w-full' :
                                            isInternal ? 'bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-200 italic' :
                                            isTecnico  ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-sm' : 
                                            'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                                        }`}>
                                            {isVisita ? (
                                                <div className="flex items-center gap-3">
                                                    <CalendarClock size={18} className="text-blue-600 shrink-0" />
                                                    <p className="font-bold text-sm">
                                                        {c.content.replace('[VISITA] ', '')}
                                                    </p>
                                                </div>
                                            ) : (
                                                <>
                                                    {c.content.replace("[INTERNO] ", "") !== "[FOTO ANEXADA]" && (
                                                        <p className="font-semibold">{c.content.replace("[INTERNO] ", "")}</p>
                                                    )}
                                                    {c.proofImage && (
                                                        <img src={c.proofImage} onClick={() => setSelectedImage(c.proofImage)} className="mt-2 rounded-lg cursor-pointer hover:opacity-90 transition-opacity" alt="Anexo" />
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 bg-background border-t border-border">
                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2">
                                {macros.map((m, i) => (
                                    <button key={i} onClick={() => setNota(m)} className="whitespace-nowrap px-3 py-1.5 bg-card border border-border rounded-full text-[10px] font-bold text-muted hover:border-blue-500">
                                        + {m}
                                    </button>
                                ))}
                            </div>
                            <div className="bg-card rounded-2xl p-2 shadow-sm border border-border">
                                <textarea value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Escreva aqui..." className="w-full p-3 bg-transparent outline-none text-sm text-foreground resize-none h-20" />
                                <div className="flex gap-2 border-t border-border pt-2">
                                    <button onClick={() => handleAction(false)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase">Público</button>
                                    <button onClick={() => handleAction(true)} className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-black text-[10px] uppercase">Nota Interna</button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

function FilterTab({ active, label, onClick, icon }: any) {
    return (
        <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all ${
            active ? 'bg-blue-600 text-white shadow-lg' : 'bg-card text-muted border border-border'
        }`}>
            {icon} {label}
        </button>
    );
}

function InfoItem({ icon, label, value, color }: any) {
    const colors: any = { 
        blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', 
        emerald: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
    };
    return (
        <div className="flex gap-3 items-center">
            <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
            <div className="overflow-hidden">
                <p className="text-[9px] font-black text-muted uppercase tracking-widest">{label}</p>
                <p className="text-xs font-bold text-foreground truncate">{value || "---"}</p>
            </div>
        </div>
    );
}

function ActionBtn({ icon, label, onClick, variant }: any) {
    const variants: any = {
        amber: 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-500 border-amber-100 dark:border-amber-900/30',
        slate: 'bg-background text-muted border-border',
    };
    return (
        <button onClick={onClick} className={`flex-1 p-3 rounded-xl font-black text-[9px] uppercase flex flex-col items-center gap-1 border transition-all ${variants[variant]}`}>
            {icon} {label}
        </button>
    );
}