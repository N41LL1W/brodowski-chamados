"use client";

import { useState, useEffect, use, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, User, MapPin, CheckCircle, Loader2, Send, Undo2, 
  PauseCircle, Camera, X, Building, Terminal, MessageSquare, 
  UploadCloud, Eye, Calendar, Hash, Info
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DetalheChamadoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); 
    const router = useRouter();
    const scrollRef = useRef<HTMLDivElement>(null);

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nota, setNota] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

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

    useEffect(() => { if (id) loadTicket(); }, [id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [ticket?.comments]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSavePhotoOnly = async () => {
        if (!imagePreview) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ 
                    content: "[FOTO ANEXADA]", 
                    isInternal: true,
                    proofImage: imagePreview 
                }) 
            });
            if(res.ok) { setImagePreview(null); loadTicket(); }
        } finally { setIsSubmitting(false); }
    };

    const handleAction = async (isInternal: boolean) => {
        if (!nota.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ content: nota, isInternal }) 
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
                body: JSON.stringify({ 
                    action, 
                    proofImage: action === 'FINALIZAR' ? imagePreview : null 
                })
            });
            if (res.ok) {
                router.push('/tecnico');
                router.refresh();
            }
        } finally { setIsSubmitting(false); }
    };

    if (loading) return (
        <div className="h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
            <p className="text-slate-400 font-black uppercase tracking-tighter animate-pulse">Carregando Painel Técnico...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 pb-12">
            
            {/* GALERIA OVERLAY */}
            {selectedImage && (
                <div className="fixed inset-0 z-100 bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6 transition-all" onClick={() => setSelectedImage(null)}>
                    <button className="absolute top-8 right-8 bg-white/10 hover:bg-red-500 text-white p-4 rounded-full transition-colors border border-white/10">
                        <X size={32} />
                    </button>
                    <img src={selectedImage} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10" alt="Evidência" />
                </div>
            )}

            {/* HEADER DINÂMICO */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-sm px-4 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/tecnico" className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border border-slate-100 dark:border-slate-800">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md uppercase">{ticket.protocol}</span>
                                <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                            </div>
                            <h1 className="text-lg font-bold text-slate-800 dark:text-white truncate max-w-[200px] md:max-w-md">
                                {ticket.subject}
                            </h1>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => handleUpdateStatus('FINALIZAR')}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-500/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <CheckCircle size={18} /> <span className="hidden md:inline">Concluir Chamado</span>
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* COLUNA ESQUERDA - INFOS */}
                <div className="lg:col-span-4 space-y-6">
                    
                    {/* CARD DE DETALHES DO CLIENTE */}
                    <Card className="p-6 rounded-4xl border-none shadow-sm ring-1 ring-slate-200/50 bg-white dark:bg-slate-900">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">
                            <Info size={16} className="text-blue-500" />
                            <h3 className="font-black uppercase text-[11px] tracking-widest text-slate-400">Informações de Origem</h3>
                        </div>
                        <div className="space-y-5">
                            <InfoItem icon={<User size={18}/>} label="Solicitante" value={ticket.requester?.name} color="blue" />
                            <InfoItem icon={<Building size={18}/>} label="Setor/Departamento" value={ticket.department?.name} color="indigo" />
                            <InfoItem icon={<MapPin size={18}/>} label="Localização Exata" value={ticket.location} color="emerald" />
                            <InfoItem icon={<Calendar size={18}/>} label="Aberto em" value={new Date(ticket.createdAt).toLocaleDateString()} color="slate" />
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800 grid grid-cols-2 gap-3">
                            <ActionBtn icon={<PauseCircle size={18}/>} label="Pausar" onClick={() => handleUpdateStatus('PAUSAR')} variant="amber" />
                            <ActionBtn icon={<Undo2 size={18}/>} label="Devolver" onClick={() => handleUpdateStatus('DEVOLVER')} variant="slate" />
                        </div>
                    </Card>

                    {/* CARD DE CÂMERA / EVIDÊNCIA */}
                    <Card className="p-6 rounded-4xl bg-slate-900 shadow-2xl border-none relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                            <Camera size={120} />
                        </div>
                        
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2.5 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/40 text-white"><Camera size={20}/></div>
                                <h3 className="font-black uppercase text-[11px] tracking-widest text-white">Anexar Evidência</h3>
                            </div>

                            {!imagePreview ? (
                                <label className="cursor-pointer block border-2 border-dashed border-slate-700 rounded-3xl p-10 text-center hover:border-blue-500 hover:bg-slate-800/50 transition-all">
                                    <UploadCloud className="mx-auto mb-4 text-slate-500" size={40} />
                                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-tighter">Capturar ou Subir Foto</p>
                                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
                                </label>
                            ) : (
                                <div className="space-y-4">
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-blue-500 shadow-2xl aspect-video">
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                                        <button onClick={() => setImagePreview(null)} className="absolute top-2 right-2 bg-black/60 p-2 rounded-full text-white hover:bg-red-500"><X size={16}/></button>
                                    </div>
                                    <button 
                                        onClick={handleSavePhotoOnly}
                                        disabled={isSubmitting}
                                        className="w-full bg-blue-600 hover:bg-blue-700 p-4 rounded-xl font-black text-xs uppercase text-white shadow-xl shadow-blue-900/20 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Enviando..." : "Salvar no Histórico"}
                                    </button>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* COLUNA DIREITA - TIMELINE */}
                <div className="lg:col-span-8 flex flex-col h-[calc(100vh-140px)]">
                    <Card className="flex-1 flex flex-col p-0 rounded-4xl border-none shadow-sm ring-1 ring-slate-200/50 bg-white dark:bg-slate-900 overflow-hidden relative">
                        
                        {/* MENSAGENS */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scrollbar-hide">
                            {ticket.comments?.map((c: any) => {
                                const isInternal = c.content.startsWith("[INTERNO]");
                                const content = c.content.replace("[INTERNO] ", "");
                                const isTecnico = ["TECNICO", "ADMIN", "MASTER"].includes(c.user?.role);
                                const hasImage = c.proofImage && c.proofImage.length > 50;

                                return (
                                    <div key={c.id} className={`flex flex-col ${isInternal ? 'items-center' : (isTecnico ? 'items-end' : 'items-start')}`}>
                                        
                                        {/* CABEÇALHO DA MENSAGEM */}
                                        <div className="flex items-center gap-2 mb-2 px-2">
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{c.user?.name}</span>
                                            <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase">{new Date(c.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                        </div>

                                        {/* BOLHA */}
                                        <div className={`p-5 rounded-[1.8rem] text-[14px] leading-relaxed shadow-sm max-w-[85%] md:max-w-[70%] relative ${
                                            isInternal ? 'bg-amber-50 border border-amber-100 text-amber-800 text-center italic font-medium' :
                                            isTecnico ? 'bg-slate-900 text-white rounded-tr-none' :
                                            'bg-slate-100 text-slate-800 rounded-tl-none'
                                        }`}>
                                            {isInternal && <Terminal size={14} className="inline-block mr-2 opacity-50" />}
                                            {content}

                                            {hasImage && (
                                                <button 
                                                    onClick={() => setSelectedImage(c.proofImage)}
                                                    className="mt-4 group relative overflow-hidden rounded-2xl block w-full aspect-square md:aspect-video border border-white/10"
                                                >
                                                    <img src={c.proofImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                        <Eye className="text-white" size={32} />
                                                    </div>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* ÁREA DE INPUT */}
                        <div className="p-6 bg-slate-50/80 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 backdrop-blur-md">
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 shadow-inner border border-slate-200 dark:border-slate-800">
                                <textarea 
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                    placeholder="Escreva uma atualização ou nota interna..."
                                    className="w-full bg-transparent p-4 outline-none text-sm font-medium text-slate-700 dark:text-slate-200 resize-none min-h-20"
                                />
                                <div className="flex gap-2 p-2 border-t border-slate-50 dark:border-slate-800">
                                    <button 
                                        onClick={() => handleAction(false)} 
                                        className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-black uppercase text-[10px] hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare size={14}/> Responder Usuário
                                    </button>
                                    <button 
                                        onClick={() => handleAction(true)} 
                                        className="px-6 bg-amber-500 text-white py-4 rounded-xl font-black uppercase text-[10px] hover:bg-amber-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20"
                                    >
                                        <Terminal size={14}/> Nota Interna
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

// COMPONENTES AUXILIARES
function InfoItem({ icon, label, value, color }: any) {
    const colors: any = {
        blue: 'text-blue-500 bg-blue-50',
        indigo: 'text-indigo-500 bg-indigo-50',
        emerald: 'text-emerald-500 bg-emerald-50',
        slate: 'text-slate-500 bg-slate-50',
    };
    return (
        <div className="flex gap-4 items-center group">
            <div className={`p-3 rounded-2xl transition-all group-hover:scale-110 ${colors[color]}`}>
                {icon}
            </div>
            <div className="overflow-hidden">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{value || "---"}</p>
            </div>
        </div>
    );
}

function ActionBtn({ icon, label, onClick, variant }: any) {
    const variants: any = {
        amber: 'bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100',
        slate: 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100',
    };
    return (
        <button onClick={onClick} className={`flex-1 p-4 rounded-2xl font-black text-[10px] uppercase flex flex-col items-center gap-2 border transition-all active:scale-95 ${variants[variant]}`}>
            {icon} {label}
        </button>
    );
}