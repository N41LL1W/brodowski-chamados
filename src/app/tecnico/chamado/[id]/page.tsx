"use client";

import { useState, useEffect, use } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, Clock, User, MapPin, 
  CheckCircle, Loader2, Send, Undo2, PauseCircle, Camera, X, Building, Image as ImageIcon
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DetalheChamadoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params); 
    const router = useRouter();

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [nota, setNota] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const loadTicket = async () => {
        try {
            setLoading(true);
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 4 * 1024 * 1024) {
                alert("Imagem muito grande! Máximo 4MB.");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
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
        } catch (err) { 
            alert("Erro de conexão"); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center dark:bg-slate-950"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
    if (!ticket) return <div className="p-20 text-center font-black text-slate-500 uppercase">Chamado não encontrado.</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
            <header className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 sticky top-2 z-10 shadow-sm">
                <Link href="/tecnico" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                    <ArrowLeft size={20} className="text-slate-600" />
                </Link>
                <div className="text-right">
                    <p className="text-[10px] font-mono font-bold text-slate-400">{ticket.protocol}</p>
                    <Badge variant="status" value={ticket.status}>{ticket.status}</Badge>
                </div>
            </header>

            <main className="space-y-6">
                {/* Informações Principais */}
                <Card className="p-6 md:p-8 rounded-4xl border-none shadow-xl ring-1 ring-slate-100 dark:ring-slate-800">
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase leading-tight mb-4">{ticket.subject}</h1>
                    <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl text-slate-600 dark:text-slate-400 text-sm font-medium mb-6">
                        {ticket.description}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        <InfoItem icon={<User size={16}/>} label="Solicitante" value={ticket.requester?.name} />
                        <InfoItem icon={<Building size={16}/>} label="Setor" value={ticket.department?.name} />
                        <InfoItem icon={<MapPin size={16}/>} label="Local" value={ticket.location} />
                        <InfoItem icon={<Clock size={16}/>} label="Aberto em" value={new Date(ticket.createdAt).toLocaleDateString('pt-BR')} />
                    </div>

                    {/* Ações Técnicas */}
                    <div className="flex gap-3 border-t border-slate-100 dark:border-slate-800 pt-6">
                        <button onClick={() => handleUpdateStatus('PAUSAR')} className="flex-1 bg-amber-50 text-amber-700 p-4 rounded-xl font-black text-[10px] uppercase flex flex-col items-center gap-1 border border-amber-100 active:scale-95 transition-all">
                            <PauseCircle size={20}/> Pausar
                        </button>
                        <button onClick={() => handleUpdateStatus('DEVOLVER')} className="flex-1 bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 p-4 rounded-xl font-black text-[10px] uppercase flex flex-col items-center gap-1 border border-slate-200 dark:border-slate-700 active:scale-95 transition-all">
                            <Undo2 size={20}/> Devolver
                        </button>
                    </div>
                </Card>

                {/* Diário de Atividades */}
                <Card className="p-6 md:p-8 rounded-4xl border-none shadow-lg ring-1 ring-slate-100 dark:ring-slate-800">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Diário de Atividades</h3>
                    <textarea 
                        value={nota} 
                        onChange={(e) => setNota(e.target.value)} 
                        placeholder="O que foi feito?" 
                        className="w-full p-4 bg-slate-50 dark:bg-slate-950 border-none rounded-2xl min-h-[100px] text-sm focus:ring-2 focus:ring-blue-500 outline-none mb-3" 
                    />
                    <button 
                        onClick={async () => {
                            if(!nota.trim()) return;
                            setIsSubmitting(true);
                            const res = await fetch(`/api/tickets/${id}`, { 
                                method: 'POST', 
                                headers: {'Content-Type': 'application/json'}, 
                                body: JSON.stringify({ content: nota }) 
                            });
                            if(res.ok) { setNota(""); loadTicket(); }
                            setIsSubmitting(false);
                        }} 
                        disabled={isSubmitting || !nota.trim()} 
                        className="w-full bg-slate-900 dark:bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50 transition-all"
                    >
                        <Send size={14} className="inline mr-2"/> Salvar Nota
                    </button>
                </Card>

                {/* Finalização */}
                <Card className="p-6 md:p-8 rounded-4xl bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-emerald-500 rounded-lg text-white"><CheckCircle size={18}/></div>
                        <h3 className="font-black text-emerald-800 dark:text-emerald-400 uppercase text-xs">Concluir Chamado</h3>
                    </div>

                    <div className="space-y-4">
                        <div className={`relative border-2 border-dashed rounded-3xl p-6 text-center transition-all ${imagePreview ? 'border-emerald-500 bg-white dark:bg-slate-900' : 'border-emerald-200 dark:border-emerald-800'}`}>
                            {!imagePreview ? (
                                <label className="cursor-pointer block">
                                    <Camera className="text-emerald-500 mx-auto mb-2" size={32} />
                                    <p className="text-[10px] font-black text-emerald-700 uppercase">Tirar Foto do Serviço</p>
                                    <input type="file" className="hidden" accept="image/*" capture="environment" onChange={handleImageChange} />
                                </label>
                            ) : (
                                <div className="space-y-3">
                                    <img src={imagePreview} className="w-full aspect-square md:aspect-video object-cover rounded-xl border-2 border-emerald-100" alt="Evidência" />
                                    <button onClick={() => setImagePreview(null)} className="flex items-center gap-2 mx-auto text-red-500 font-black text-[10px] uppercase px-4 py-2 bg-red-50 rounded-lg">
                                        <X size={14}/> Remover Foto
                                    </button>
                                </div>
                            )}
                        </div>

                        <button 
                            onClick={() => handleUpdateStatus('FINALIZAR')} 
                            disabled={!imagePreview || isSubmitting} 
                            className="w-full bg-emerald-600 text-white p-5 rounded-2xl font-black text-lg uppercase shadow-lg shadow-emerald-500/20 disabled:opacity-30 transition-all"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "Concluir Agora"}
                        </button>
                    </div>
                </Card>
            </main>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex gap-3 items-start">
            <div className="mt-1 text-blue-500 bg-blue-50 dark:bg-blue-900/50 p-2 rounded-lg">{icon}</div>
            <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">{label}</p>
                <p className="text-xs font-black text-slate-700 dark:text-slate-200">{value || "---"}</p>
            </div>
        </div>
    );
}