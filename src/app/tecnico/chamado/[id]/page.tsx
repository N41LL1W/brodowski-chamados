"use client";

import { useState, useEffect, use, useRef } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, Clock, User, MapPin, 
  CheckCircle, Loader2, Send, Undo2, PauseCircle, Camera, X, Building, Terminal, MessageSquare
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

    useEffect(() => { 
        if (id) loadTicket(); 
    }, [id]);

    // Scroll para o fim do chat quando carregar mensagens novas
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

    const handleAction = async (isInternal: boolean) => {
        if (!nota.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, { 
                method: 'POST', 
                headers: {'Content-Type': 'application/json'}, 
                body: JSON.stringify({ content: nota, isInternal }) 
            });
            if(res.ok) { 
                setNota(""); 
                loadTicket(); 
            }
        } finally { 
            setIsSubmitting(false); 
        }
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
        } finally { 
            setIsSubmitting(false); 
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
    if (!ticket) return <div className="p-20 text-center font-black text-slate-500 uppercase">Chamado não encontrado.</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6 bg-slate-50/50 dark:bg-transparent min-h-screen">
            {/* Header Sticky */}
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
                
                {/* Lado Esquerdo: Detalhes do Chamado */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 rounded-[2.5rem] border-none shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                        <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-4 leading-tight">{ticket.subject}</h1>
                        <div className="space-y-4">
                            <InfoItem icon={<User size={16}/>} label="Solicitante" value={ticket.requester?.name} />
                            <InfoItem icon={<Building size={16}/>} label="Setor" value={ticket.department?.name} />
                            <InfoItem icon={<MapPin size={16}/>} label="Local" value={ticket.location || "Não informado"} />
                            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Descrição</p>
                                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl italic">
                                    "{ticket.description}"
                                </p>
                            </div>
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

                    {/* Finalização com Foto */}
                    <Card className="p-6 rounded-[2.5rem] bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30">
                         <div className={`relative border-2 border-dashed rounded-3xl p-4 text-center mb-4 transition-all ${imagePreview ? 'border-emerald-500 bg-white' : 'border-emerald-200'}`}>
                            {!imagePreview ? (
                                <label className="cursor-pointer block py-4">
                                    <Camera className="text-emerald-500 mx-auto mb-2" size={32} />
                                    <p className="text-[10px] font-black text-emerald-700 uppercase">Foto do Serviço</p>
                                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
                                </label>
                            ) : (
                                <div className="relative group">
                                    <img src={imagePreview} className="w-full h-40 object-cover rounded-2xl" alt="Preview" />
                                    <button onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg">
                                        <X size={16}/>
                                    </button>
                                </div>
                            )}
                        </div>
                        <button 
                            onClick={() => handleUpdateStatus('FINALIZAR')} 
                            disabled={!imagePreview || isSubmitting}
                            className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-lg shadow-emerald-500/30 disabled:opacity-30"
                        >
                            Concluir Chamado
                        </button>
                    </Card>
                </div>

                {/* Lado Direito: Timeline de Interação (CHAT) */}
                <div className="lg:col-span-8 space-y-4 h-[calc(100vh-160px)] flex flex-col">
                    <Card className="flex-1 flex flex-col p-0 rounded-[2.5rem] border-none shadow-2xl ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden bg-white dark:bg-slate-900">
                        {/* Area de Mensagens */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
                            {ticket.comments?.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center opacity-30 italic">
                                    <MessageSquare size={48} className="mb-2"/>
                                    <p className="text-sm">Nenhuma interação registrada ainda.</p>
                                </div>
                            )}
                            
                            {ticket.comments?.map((c: any) => {
                                const isInternal = c.content.startsWith("[INTERNO]");
                                const content = c.content.replace("[INTERNO] ", "");
                                const isTecnico = ["TECNICO", "ADMIN", "MASTER"].includes(c.user?.role);

                                if (isInternal) {
                                    return (
                                        <div key={c.id} className="flex flex-col items-center py-2">
                                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-400 px-6 py-3 rounded-2xl text-xs font-bold max-w-md text-center shadow-sm">
                                                <Terminal size={12} className="inline mr-2 mb-1"/>
                                                {content}
                                                <div className="text-[8px] mt-1 opacity-60 uppercase">{new Date(c.createdAt).toLocaleString('pt-BR')}</div>
                                            </div>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={c.id} className={`flex flex-col ${isTecnico ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-[80%] p-4 rounded-3xl text-sm font-medium shadow-sm ${
                                            isTecnico 
                                            ? 'bg-blue-600 text-white rounded-tr-none' 
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none'
                                        }`}>
                                            {content}
                                        </div>
                                        <span className="text-[9px] font-black text-slate-400 mt-2 px-2 uppercase tracking-tighter">
                                            {isTecnico ? 'Você' : c.user?.name} • {new Date(c.createdAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800">
                            <textarea 
                                value={nota}
                                onChange={(e) => setNota(e.target.value)}
                                placeholder="Responda ao usuário ou salve uma nota técnica..."
                                className="w-full bg-white dark:bg-slate-900 p-4 rounded-2xl border-2 border-slate-100 dark:border-slate-800 outline-none focus:border-blue-500 transition-all text-sm resize-none mb-3"
                                rows={2}
                            />
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleAction(false)}
                                    disabled={isSubmitting || !nota.trim()}
                                    className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20"
                                >
                                    <Send size={14}/> Responder Usuário
                                </button>
                                <button 
                                    onClick={() => handleAction(true)}
                                    disabled={isSubmitting || !nota.trim()}
                                    className="px-6 bg-amber-500 text-white py-4 rounded-xl font-black uppercase text-[10px] flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20"
                                    title="Salvar apenas no Diário Interno"
                                >
                                    <Terminal size={14}/> Nota Interna
                                </button>
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
        <div className="flex gap-3 items-start group">
            <div className="mt-0.5 text-blue-500 bg-blue-50 dark:bg-blue-900/50 p-2 rounded-xl group-hover:scale-110 transition-transform">{icon}</div>
            <div>
                <p className="text-[9px] font-black text-slate-400 uppercase leading-none mb-1 tracking-widest">{label}</p>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{value || "---"}</p>
            </div>
        </div>
    );
}