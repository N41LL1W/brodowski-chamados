"use client";

import { useState, useEffect, use, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, User, MapPin, CheckCircle, Loader2, Send, Undo2, 
  PauseCircle, Camera, X, Building, Terminal, MessageSquare, UploadCloud, Eye 
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null); // ESTADO PARA A GALERIA

    const loadTicket = async () => {
        try {
            const res = await fetch(`/api/tickets/${id}`);
            const data = await res.json();
            setTicket(data);
        } catch (err) { 
            console.error("Erro ao carregar:", err); 
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
            if(res.ok) { 
                setImagePreview(null); 
                loadTicket(); 
            }
        } finally { 
            setIsSubmitting(false); 
        }
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
        if (!confirm("Confirmar esta ação?")) return;
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

    if (loading) return <div className="h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 bg-slate-50/50 dark:bg-transparent min-h-screen relative">
            
            {/* MODAL DE ZOOM DA FOTO */}
            {selectedImage && (
                <div 
                    className="fixed inset-0 z-100 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setSelectedImage(null)}
                >
                    <button className="absolute top-8 right-8 text-white bg-white/10 p-4 rounded-full hover:bg-red-500 transition-all">
                        <X size={32} />
                    </button>
                    <img 
                        src={selectedImage} 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
                        alt="Evidência ampliada" 
                    />
                </div>
            )}

            <header className="flex justify-between items-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-3xl border border-slate-200 dark:border-slate-800 sticky top-4 z-20 shadow-lg">
                <Link href="/tecnico" className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all">
                    <ArrowLeft size={24} className="text-slate-600" />
                </Link>
                <div className="text-right">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{ticket.protocol}</p>
                    <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 rounded-[2.5rem] border-none shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-4 leading-tight">{ticket.subject}</h1>
                        <div className="space-y-4">
                            <InfoItem icon={<User size={16}/>} label="Solicitante" value={ticket.requester?.name} />
                            <InfoItem icon={<Building size={16}/>} label="Setor" value={ticket.department?.name} />
                            <InfoItem icon={<MapPin size={16}/>} label="Local" value={ticket.location || "Não informado"} />
                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-6">
                            <button onClick={() => handleUpdateStatus('PAUSAR')} className="bg-amber-50 text-amber-700 p-4 rounded-2xl font-black text-[10px] uppercase flex flex-col items-center gap-1 border border-amber-100 hover:bg-amber-100 transition-all">
                                <PauseCircle size={20}/> Pausar
                            </button>
                            <button onClick={() => handleUpdateStatus('DEVOLVER')} className="bg-slate-50 text-slate-700 p-4 rounded-2xl font-black text-[10px] uppercase flex flex-col items-center gap-1 border border-slate-200 hover:bg-slate-100 transition-all">
                                <Undo2 size={20}/> Devolver
                            </button>
                        </div>
                    </Card>

                    <Card className="p-6 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl border-none">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-600 rounded-lg"><Camera size={18}/></div>
                            <h3 className="font-black uppercase text-[10px] tracking-widest">Registrar Evidência</h3>
                        </div>

                        {!imagePreview ? (
                            <label className="cursor-pointer block border-2 border-dashed border-slate-700 rounded-2xl p-8 text-center hover:border-blue-500 transition-all">
                                <UploadCloud className="mx-auto mb-2 text-slate-500" size={32} />
                                <p className="text-[9px] font-black uppercase text-slate-400">Capturar Foto</p>
                                <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
                            </label>
                        ) : (
                            <div className="space-y-3">
                                <img src={imagePreview} className="w-full h-48 object-cover rounded-2xl border-2 border-blue-500" alt="Preview" />
                                <div className="grid grid-cols-2 gap-2">
                                    <button 
                                        onClick={handleSavePhotoOnly}
                                        disabled={isSubmitting}
                                        className="bg-blue-600 p-3 rounded-xl font-black text-[9px] uppercase hover:bg-blue-700"
                                    >
                                        {isSubmitting ? "Salvando..." : "Anexar ao Diário"}
                                    </button>
                                    <button 
                                        onClick={() => handleUpdateStatus('FINALIZAR')}
                                        className="bg-emerald-600 p-3 rounded-xl font-black text-[9px] uppercase hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                                    >
                                        Finalizar Com Foto
                                    </button>
                                </div>
                                <button onClick={() => setImagePreview(null)} className="w-full text-slate-400 text-[8px] font-black uppercase">Cancelar</button>
                            </div>
                        )}
                    </Card>
                </div>

                <div className="lg:col-span-8 h-[calc(100vh-160px)] flex flex-col">
                    <Card className="flex-1 flex flex-col p-0 rounded-[2.5rem] border-none shadow-2xl ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
                            {ticket.comments?.map((c: any) => {
                                const isInternal = c.content.startsWith("[INTERNO]");
                                const content = c.content.replace("[INTERNO] ", "");
                                const isTecnico = ["TECNICO", "ADMIN", "MASTER"].includes(c.user?.role);
                                const hasImage = c.proofImage && c.proofImage.length > 50; // VERIFICA SE O COMENTÁRIO TEM FOTO

                                return (
                                    <div key={c.id} className={`flex flex-col ${isInternal ? 'items-center' : (isTecnico ? 'items-end' : 'items-start')}`}>
                                        <div className={`p-4 rounded-3xl text-sm shadow-sm relative group ${
                                            isInternal ? 'bg-amber-50 border border-amber-200 text-amber-800 text-center max-w-md' :
                                            isTecnico ? 'bg-blue-600 text-white rounded-tr-none' :
                                            'bg-slate-100 text-slate-800 rounded-tl-none'
                                        }`}>
                                            {content}

                                            {/* BOTÃO DE VER FOTO - APARECE SE TIVER IMAGEM NO COMENTÁRIO */}
                                            {hasImage && (
                                                <button 
                                                    onClick={() => setSelectedImage(c.proofImage)}
                                                    className="mt-3 w-full flex items-center justify-center gap-2 bg-white/20 hover:bg-white/40 p-2 rounded-xl border border-white/30 transition-all"
                                                >
                                                    <Eye size={14} />
                                                    <span className="text-[10px] font-black uppercase">Ver Evidência</span>
                                                </button>
                                            )}
                                        </div>
                                        <span className="text-[8px] font-black text-slate-400 mt-1 uppercase">
                                            {new Date(c.createdAt).toLocaleString()} por {c.user?.name}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100">
                            <textarea 
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                                placeholder="Descreva a ação ou responda..."
                                className="w-full bg-white p-4 rounded-2xl border-2 border-slate-100 outline-none focus:border-blue-500 transition-all text-sm resize-none mb-3"
                                rows={2}
                            />
                            <div className="flex gap-2">
                                <button onClick={() => handleAction(false)} className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px] shadow-lg shadow-blue-500/20"><Send size={14} className="inline mr-2"/> Falar com Usuário</button>
                                <button onClick={() => handleAction(true)} className="px-6 bg-amber-500 text-white py-4 rounded-xl font-black uppercase text-[10px] shadow-lg shadow-amber-500/20"><Terminal size={14} className="inline mr-2"/> Nota Interna</button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex gap-3 items-start">
            <div className="mt-0.5 text-blue-500 bg-blue-50 p-2 rounded-xl">{icon}</div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1 tracking-widest">{label}</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{value || "---"}</p>
            </div>
        </div>
    );
}