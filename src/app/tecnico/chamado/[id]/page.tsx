"use client";

import { useState, useEffect, use } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, Clock, User, MapPin, Wrench, 
  CheckCircle, Loader2, Send, Undo2, PauseCircle, Camera, X, Building
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

    const handleUpdateStatus = async (action: string) => {
        const confirmMsg = action === 'DEVOLVER' ? "Devolver para a fila geral?" : "Confirmar alteração?";
        if (!confirm(confirmMsg)) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, proofImage: imagePreview })
            });
            if (res.ok) {
                if (['DEVOLVER', 'FINALIZAR'].includes(action)) router.push('/tecnico');
                else loadTicket();
            }
        } catch (err) { 
            alert("Erro na operação"); 
        } finally { 
            setIsSubmitting(false); 
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={48} /></div>;
    if (!ticket) return <div className="p-20 text-center font-bold">Chamado não encontrado.</div>;

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
            <header className="flex justify-between items-center">
                <Link href="/tecnico" className="flex items-center gap-2 text-slate-500 font-bold text-xs uppercase hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> Voltar ao Painel
                </Link>
                <Badge variant="status" value={ticket.status}>{ticket.status}</Badge>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 shadow-xl border-none ring-1 ring-slate-200 dark:ring-slate-800">
                        <div className="flex justify-between items-start mb-6">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase leading-tight">{ticket.subject}</h1>
                            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{ticket.protocol}</span>
                        </div>
                        
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl mb-8 border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                            {ticket.description}
                        </div>

                        <div className="flex flex-wrap gap-3 mb-8">
                            <button onClick={() => handleUpdateStatus('PAUSAR')} className="flex-1 bg-amber-100 text-amber-700 p-4 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-amber-200 transition-all active:scale-95">
                                <PauseCircle size={18}/> Pausar Atendimento
                            </button>
                            <button onClick={() => handleUpdateStatus('DEVOLVER')} className="flex-1 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 p-4 rounded-2xl font-bold text-xs uppercase flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-95">
                                <Undo2 size={18}/> Devolver
                            </button>
                        </div>

                        <div className="space-y-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-400">Diário de Atividades</h4>
                            <textarea 
                                value={nota} 
                                onChange={(e) => setNota(e.target.value)} 
                                placeholder="Descreva o andamento técnica..." 
                                className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl min-h-[120px] focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                            />
                            <button 
                                onClick={async () => {
                                    if(!nota.trim()) return;
                                    setIsSubmitting(true);
                                    const res = await fetch(`/api/tickets/${id}`, { method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ content: nota }) });
                                    if(res.ok) { setNota(""); loadTicket(); }
                                    setIsSubmitting(false);
                                }} 
                                disabled={isSubmitting} 
                                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50"
                            >
                                <Send size={16} className="inline mr-2"/> Registrar Atividade
                            </button>
                        </div>
                    </Card>

                    <Card className="p-8 bg-emerald-50 dark:bg-emerald-950/20 border-2 border-emerald-100 dark:border-emerald-900/30 rounded-[2.5rem]">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500 rounded-lg text-white"><CheckCircle size={20}/></div>
                            <h3 className="font-black text-emerald-800 dark:text-emerald-400 uppercase text-sm">Conclusão de Chamado</h3>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="relative border-2 border-dashed border-emerald-200 dark:border-emerald-800 rounded-3xl p-8 text-center bg-white dark:bg-slate-900 transition-all">
                                {!imagePreview ? (
                                    <label className="cursor-pointer group">
                                        <Camera className="mx-auto text-emerald-400 group-hover:scale-110 transition-transform mb-3" size={40} />
                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-tighter">Anexar evidência da solução</p>
                                        <input type="file" className="hidden" accept="image/*" onChange={() => setImagePreview("/placeholder-upload.jpg")} />
                                    </label>
                                ) : (
                                    <div className="flex items-center justify-between bg-emerald-100/50 p-4 rounded-xl">
                                        <span className="text-xs font-black text-emerald-700 uppercase italic">Foto selecionada com sucesso</span>
                                        <button onClick={() => setImagePreview(null)} className="text-red-500 bg-white p-1 rounded-full shadow-sm"><X size={18}/></button>
                                    </div>
                                )}
                            </div>

                            <button 
                                onClick={() => handleUpdateStatus('FINALIZAR')} 
                                disabled={!imagePreview || isSubmitting} 
                                className="w-full bg-emerald-600 text-white p-6 rounded-3xl font-black text-xl uppercase shadow-xl shadow-emerald-200 dark:shadow-none hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-40 disabled:grayscale"
                            >
                                Finalizar Chamado
                            </button>
                        </div>
                    </Card>
                </div>

                <aside className="space-y-6">
                    <Card className="p-6 space-y-6 border-none ring-1 ring-slate-200 dark:ring-slate-800 shadow-lg">
                        <h3 className="font-black text-xs uppercase tracking-[0.2em] text-slate-400 border-b pb-4 dark:border-slate-800">Informações do Solicitante</h3>
                        
                        <div className="space-y-4">
                            <InfoItem icon={<User size={18}/>} label="Nome" value={ticket.requester?.name} />
                            <InfoItem icon={<Building size={18}/>} label="Secretaria" value={ticket.department?.name} />
                            <InfoItem icon={<MapPin size={18}/>} label="Local" value={ticket.location} />
                            <InfoItem icon={<Clock size={18}/>} label="Aberto em" value={new Date(ticket.createdAt).toLocaleString()} />
                            <div className="pt-4">
                                <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                            </div>
                        </div>
                    </Card>
                </aside>
            </div>
        </div>
    );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
    return (
        <div className="flex gap-4">
            <div className="text-slate-400">{icon}</div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{label}</p>
                <p className="text-sm font-black text-slate-700 dark:text-slate-200">{value || "Não informado"}</p>
            </div>
        </div>
    );
}