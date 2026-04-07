"use client";

import { useState, useEffect, use, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, User, MapPin, CheckCircle, Loader2, Send, Undo2, 
  PauseCircle, Camera, X, Building, Terminal, MessageSquare, 
  UploadCloud, Eye, Calendar, Clock, Navigation, Filter, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DetalheChamadoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); 
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    // ESTADOS
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nota, setNota] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [filter, setFilter] = useState<'all' | 'images' | 'internal'>('all');
    const [elapsedTime, setElapsedTime] = useState("");

    // RESPOSTAS RÁPIDAS (MACROS)
    const macros = [
        "Peça solicitada ao almoxarifado.",
        "Aguardando liberação do local.",
        "Equipamento em fase de testes.",
        "Manutenção preventiva realizada.",
        "Cliente ausente no local."
    ];

    const loadTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`);
            const data = await res.json();
            setTicket(data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    // CRONÔMETRO DE ATENDIMENTO
    useEffect(() => {
        if (!ticket) return;
        const interval = setInterval(() => {
            const start = new Date(ticket.createdAt).getTime();
            const now = new Date().getTime();
            const diff = now - start;
            
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            
            setElapsedTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }, 1000);
        return () => clearInterval(interval);
    }, [ticket]);

    useEffect(() => { if (id) loadTicket(); }, [id]);

    // HANDLERS
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
        if (!contentToSend.trim()) return;
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
            if(res.ok) { setNota(""); loadTicket(); }
        } finally { setIsSubmitting(false); }
    };

    const handleUpdateStatus = async (action: string) => {
        if (!confirm(`Deseja realmente ${action.toLowerCase()} este chamado?`)) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, proofImage: imagePreview })
            });
            if (res.ok) { router.push('/tecnico'); router.refresh(); }
        } finally { setIsSubmitting(false); }
    };

    // FILTRO DE COMENTÁRIOS
    const filteredComments = ticket?.comments?.filter((c: any) => {
        if (filter === 'images') return c.proofImage && c.proofImage.length > 50;
        if (filter === 'internal') return c.content.includes("[INTERNO]");
        return true;
    });

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-tighter">Sincronizando Dados...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-12">
            
            {/* MODAL DE IMAGEM */}
            {selectedImage && (
                <div className="fixed inset-0 z-100 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl border border-white/10" alt="Evidência" />
                </div>
            )}

            {/* HEADER COM SLA */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm px-4 py-3">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/tecnico" className="p-2.5 hover:bg-slate-100 rounded-xl transition-all border border-slate-100"><ArrowLeft size={20} /></Link>
                        <div>
                            <h1 className="text-sm font-black text-slate-800 dark:text-white uppercase truncate max-w-[150px]">{ticket.subject}</h1>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600">
                                <Clock size={12} /> TEMPO DE ATENDIMENTO: {elapsedTime}
                            </div>
                        </div>
                    </div>
                    <button onClick={() => handleUpdateStatus('FINALIZAR')} className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-emerald-500/20 flex items-center gap-2">
                        <CheckCircle size={16} /> Concluir
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* COLUNA ESQUERDA */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 rounded-4xl border-none shadow-sm bg-white">
                        <div className="space-y-4">
                            <InfoItem icon={<User size={18}/>} label="Solicitante" value={ticket.requester?.name} color="blue" />
                            <div className="flex items-center justify-between group">
                                <InfoItem icon={<MapPin size={18}/>} label="Local" value={ticket.location} color="emerald" />
                                <a 
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ticket.location)}`}
                                    target="_blank"
                                    className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                                    title="Como chegar"
                                >
                                    <Navigation size={18} />
                                </a>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-slate-50 grid grid-cols-2 gap-3">
                            <ActionBtn icon={<PauseCircle size={18}/>} label="Pausar" onClick={() => handleUpdateStatus('PAUSAR')} variant="amber" />
                            <ActionBtn icon={<Undo2 size={18}/>} label="Devolver" onClick={() => handleUpdateStatus('DEVOLVER')} variant="slate" />
                        </div>
                    </Card>

                    <Card className="p-6 rounded-4xl bg-slate-900 text-white overflow-hidden relative">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500 rounded-lg text-white"><Camera size={18}/></div>
                            <h3 className="font-black uppercase text-[10px] tracking-widest">Evidência Visual</h3>
                        </div>
                        {!imagePreview ? (
                            <label className="cursor-pointer block border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:bg-slate-800 transition-all">
                                <UploadCloud className="mx-auto mb-2 text-slate-500" size={32} />
                                <p className="text-[9px] font-black uppercase text-slate-400">Capturar Foto</p>
                                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
                            </label>
                        ) : (
                            <div className="space-y-3">
                                <img src={imagePreview} className="rounded-xl aspect-video object-cover w-full border-2 border-blue-500" />
                                <div className="flex gap-2">
                                    <button onClick={() => setImagePreview(null)} className="flex-1 bg-slate-800 p-3 rounded-xl text-[10px] font-black uppercase">Cancelar</button>
                                    <button onClick={() => handleAction(true, "[FOTO ANEXADA]")} className="flex-2 bg-blue-600 p-3 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-blue-500/30">Enviar Foto</button>
                                </div>
                            </div>
                        )}
                    </Card>
                </div>

                {/* COLUNA DIREITA (CHAT + FILTROS) */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)]">
                    <Card className="flex-1 flex flex-col p-0 rounded-4xl border-none shadow-sm bg-white overflow-hidden">
                        
                        {/* BARRA DE FILTROS */}
                        <div className="px-6 py-3 border-b border-slate-50 flex items-center gap-4 bg-slate-50/50">
                            <Filter size={14} className="text-slate-400" />
                            <div className="flex gap-2">
                                <FilterTab active={filter === 'all'} label="Tudo" onClick={() => setFilter('all')} />
                                <FilterTab active={filter === 'images'} label="Fotos" onClick={() => setFilter('images')} icon={<ImageIcon size={12}/>} />
                                <FilterTab active={filter === 'internal'} label="Notas" onClick={() => setFilter('internal')} icon={<Terminal size={12}/>} />
                            </div>
                        </div>

                        {/* MENSAGENS */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {filteredComments?.map((c: any) => {
                                const isInternal = c.content.includes("[INTERNO]");
                                const content = c.content.replace("[INTERNO] ", "");
                                const isTecnico = ["TECNICO", "ADMIN", "MASTER"].includes(c.user?.role);
                                const hasImage = c.proofImage && c.proofImage.length > 50;
                                const hideText = content === "[FOTO ANEXADA]" || content.trim() === "";

                                return (
                                    <div key={c.id} className={`flex flex-col ${isInternal ? 'items-center' : (isTecnico ? 'items-end' : 'items-start')}`}>
                                        <div className="flex items-center gap-2 mb-1 px-2 opacity-50">
                                            <span className="text-[9px] font-black uppercase">{c.user?.name}</span>
                                            <span className="text-[9px] font-bold">{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>
                                        <div className={`p-4 rounded-2xl text-[13px] max-w-[85%] ${
                                            isInternal ? 'bg-amber-50 border border-amber-100 text-amber-800 text-center italic' :
                                            isTecnico ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
                                        }`}>
                                            {!hideText && content}
                                            {hasImage && (
                                                <button onClick={() => setSelectedImage(c.proofImage)} className={`block w-full rounded-lg overflow-hidden border border-white/10 ${!hideText ? 'mt-3' : ''}`}>
                                                    <img src={c.proofImage} className="w-full h-auto" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* INPUT E MACROS */}
                        <div className="p-4 bg-slate-50 border-t">
                            {/* LINHA DE MACROS */}
                            <div className="flex gap-2 overflow-x-auto pb-3 mb-3 scrollbar-hide">
                                {macros.map((m, idx) => (
                                    <button 
                                        key={idx} 
                                        onClick={() => setNota(m)}
                                        className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-[10px] font-bold text-slate-600 hover:border-blue-500 hover:text-blue-500 transition-all shadow-sm"
                                    >
                                        + {m}
                                    </button>
                                ))}
                            </div>

                            <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-200">
                                <textarea 
                                    value={nota} 
                                    onChange={(e) => setNota(e.target.value)}
                                    placeholder="Escreva aqui..."
                                    className="w-full p-3 outline-none text-sm resize-none min-h-[60px]"
                                />
                                <div className="flex gap-2 pt-2 border-t border-slate-50">
                                    <button onClick={() => handleAction(false)} className="flex-1 bg-slate-900 text-white py-3 rounded-xl font-black text-[10px] uppercase">Enviar Público</button>
                                    <button onClick={() => handleAction(true)} className="flex-1 bg-amber-500 text-white py-3 rounded-xl font-black text-[10px] uppercase shadow-lg shadow-amber-500/20">Nota Interna</button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}

// COMPONENTES AUXILIARES
function FilterTab({ active, label, onClick, icon }: any) {
    return (
        <button onClick={onClick} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase transition-all ${
            active ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-400 hover:bg-slate-100'
        }`}>
            {icon} {label}
        </button>
    );
}

function InfoItem({ icon, label, value, color }: any) {
    const colors: any = { blue: 'text-blue-500 bg-blue-50', emerald: 'text-emerald-500 bg-emerald-50' };
    return (
        <div className="flex gap-3 items-center">
            <div className={`p-2.5 rounded-xl ${colors[color]}`}>{icon}</div>
            <div className="overflow-hidden">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                <p className="text-xs font-bold text-slate-700 truncate">{value || "---"}</p>
            </div>
        </div>
    );
}

function ActionBtn({ icon, label, onClick, variant }: any) {
    const variants: any = {
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        slate: 'bg-slate-50 text-slate-700 border-slate-200',
    };
    return (
        <button onClick={onClick} className={`flex-1 p-3 rounded-xl font-black text-[9px] uppercase flex flex-col items-center gap-1 border transition-all ${variants[variant]}`}>
            {icon} {label}
        </button>
    );
}