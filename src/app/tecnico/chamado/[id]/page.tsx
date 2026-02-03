"use client";

import { useState, useEffect, use } from 'react';
import { Badge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { 
  ArrowLeft, Clock, User, MapPin, Wrench, 
  CheckCircle, AlertTriangle, Loader2, MessageSquare, Send
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DetalheChamadoPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params); 
    const id = resolvedParams.id;
    const router = useRouter();

    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Estados para novas interações
    const [nota, setNota] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadTicket = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/tickets/${id}`);
            if (!res.ok) throw new Error("Falha ao carregar");
            const data = await res.json();
            setTicket(data);
        } catch (err) {
            console.error("Erro no fetch:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTicket();
    }, [id]);

    // Função para registrar nota técnica
    const handleSaveNote = async () => {
        if (!nota.trim()) return;
        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: nota })
            });
            if (res.ok) {
                setNota("");
                await loadTicket(); // Recarrega para mostrar a nota na lista
            }
        } catch (err) {
            alert("Erro ao salvar nota.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Função para finalizar chamado
    const handleFinalize = async () => {
        const confirmacao = confirm("Tem certeza que deseja finalizar este chamado? Esta ação não pode ser desfeita.");
        if (!confirmacao) return;

        setIsSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'FINALIZAR' })
            });
            if (res.ok) {
                router.push('/tecnico');
                router.refresh();
            }
        } catch (err) {
            alert("Erro ao finalizar chamado.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={48} />
                    <p className="font-black text-slate-400 uppercase tracking-[0.2em]">Sincronizando...</p>
                </div>
            </div>
        );
    }

    if (error || !ticket) {
        return (
            <div className="flex h-screen w-full items-center justify-center p-6 text-center">
                <div className="max-w-md space-y-4">
                    <AlertTriangle className="mx-auto text-red-500" size={64} />
                    <h2 className="text-2xl font-black text-slate-800 uppercase">Não encontrado</h2>
                    <Link href="/tecnico" className="block w-full bg-slate-800 text-white py-3 rounded-xl font-bold uppercase text-sm">Voltar</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
            {/* CABEÇALHO */}
            <div className="flex justify-between items-center">
                <Link href="/tecnico" className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors font-bold uppercase text-xs tracking-widest">
                    <ArrowLeft size={16} /> Painel Técnico
                </Link>
                <div className="flex gap-2">
                    <Badge variant="priority" value={ticket.priority}>{ticket.priority}</Badge>
                    <Badge variant="status" value={ticket.status}>{ticket.status}</Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-8 space-y-6 shadow-xl border-none ring-1 ring-slate-200">
                        <header className="border-b border-slate-100 pb-6">
                            <span className="text-[11px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase mb-4 inline-block italic">
                                {ticket.protocol}
                            </span>
                            <h1 className="text-4xl font-black text-slate-800 tracking-tighter leading-none uppercase">
                                {ticket.subject || ticket.title}
                            </h1>
                        </header>
                        
                        <div className="space-y-4">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Relato do Solicitante</h3>
                            <div className="bg-slate-50 p-6 rounded-3xl text-slate-700 leading-relaxed text-lg border border-slate-100">
                                {ticket.description}
                            </div>
                        </div>

                        {/* ÁREA DE COMENTÁRIOS / TIMELINE */}
                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <MessageSquare size={14}/> Diário de Bordo ({ticket.comments?.length || 0})
                            </h3>
                            
                            <div className="space-y-4 mb-8">
                                {ticket.comments?.map((c: any) => (
                                    <div key={c.id} className="flex gap-3 items-start animate-in slide-in-from-left-2 duration-300">
                                        <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0 flex items-center justify-center text-[10px] font-bold">
                                            {c.user?.name?.charAt(0)}
                                        </div>
                                        <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex-1">
                                            <p className="text-sm text-slate-800 leading-tight">{c.content}</p>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase mt-2 block">
                                                {c.user?.name} • {new Date(c.createdAt).toLocaleTimeString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4 bg-slate-50 p-4 rounded-3xl border border-slate-200">
                                <textarea 
                                    value={nota}
                                    onChange={(e) => setNota(e.target.value)}
                                    placeholder="Registrar nova ação técnica..."
                                    className="w-full p-4 bg-white border border-slate-200 rounded-2xl min-h-40 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 shadow-sm text-sm"
                                />
                                <div className="flex justify-end">
                                    <button 
                                        onClick={handleSaveNote}
                                        disabled={isSubmitting || !nota.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-8 py-3 rounded-xl font-black text-xs uppercase transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <Send size={16}/> {isSubmitting ? "Enviando..." : "Registrar Nota"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <button 
                        onClick={handleFinalize}
                        disabled={isSubmitting}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white p-8 rounded-[2.5rem] font-black text-2xl uppercase shadow-2xl transition-all flex items-center justify-center gap-4 group"
                    >
                        <CheckCircle size={32} /> 
                        {isSubmitting ? "Finalizando..." : "Concluir Chamado"}
                    </button>
                </div>

                {/* INFO LATERAL */}
                <aside className="space-y-6">
                    <Card className="p-8 border-none ring-1 ring-slate-200 bg-white shadow-lg rounded-[2.5rem]">
                        <h2 className="font-black text-slate-400 uppercase text-[10px] tracking-[0.2em] mb-8 border-b border-slate-50 pb-2">Informações</h2>
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-black text-2xl uppercase">
                                    {ticket.requester?.name?.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-black text-slate-800 text-base">{ticket.requester?.name}</p>
                                    <p className="text-xs text-slate-400 truncate max-w-[150px] italic">{ticket.requester?.email}</p>
                                </div>
                            </div>
                            <div className="space-y-6 pt-4">
                                <InfoItem icon={<MapPin size={20}/>} label="Unidade" value={ticket.location || "Não Informada"} />
                                <InfoItem icon={<Clock size={20}/>} label="Entrada" value={new Date(ticket.createdAt).toLocaleString('pt-BR')} />
                                <InfoItem icon={<User size={20}/>} label="Técnico" value={ticket.assignedTo?.name || "Aguardando..."} />
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
        <div className="flex items-start gap-4">
            <div className="p-3 bg-slate-50 rounded-xl text-blue-600">{icon}</div>
            <div>
                <p className="font-black text-slate-800 text-[10px] uppercase opacity-40 leading-none mb-1">{label}</p>
                <p className="text-sm text-slate-600 font-bold">{value}</p>
            </div>
        </div>
    );
}