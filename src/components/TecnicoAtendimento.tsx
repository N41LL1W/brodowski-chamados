"use client";
import { useState } from 'react';
import { Send, FileText, History, User, MessageSquare, Terminal } from 'lucide-react';

export default function TecnicoAtendimento({ ticket, onUpdate }: any) {
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSave = async (isInternal: boolean) => {
        if (!note.trim()) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: note, isInternal })
            });
            if (res.ok) {
                setNote("");
                onUpdate(); // Recarrega os dados no pai
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid lg:grid-cols-2 gap-8 mt-8">
            {/* ENTRADA DE DADOS */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><FileText size={24} /></div>
                    <h2 className="text-sm font-black uppercase tracking-widest">Painel de Ações</h2>
                </div>

                <textarea 
                    className="w-full p-6 bg-slate-50 dark:bg-slate-950 border-2 border-slate-100 dark:border-slate-800 rounded-3xl h-40 outline-none focus:border-blue-500 transition-all resize-none font-medium"
                    placeholder="Escreva aqui sua mensagem ou nota técnica..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />

                <div className="grid grid-cols-2 gap-4 mt-4">
                    <button 
                        onClick={() => handleSave(false)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 p-4 bg-emerald-600 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-emerald-700 transition-all"
                    >
                        <MessageSquare size={16} /> Enviar ao Cliente
                    </button>
                    <button 
                        onClick={() => handleSave(true)}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 p-4 bg-amber-500 text-white rounded-2xl font-black uppercase text-[10px] hover:bg-amber-600 transition-all"
                    >
                        <Terminal size={16} /> Salvar Nota Interna
                    </button>
                </div>
            </div>

            {/* HISTÓRICO COM CORES DIFERENCIADAS */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl border border-slate-100 dark:border-slate-800 flex flex-col h-[500px]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl"><History size={24} /></div>
                    <h2 className="text-sm font-black uppercase tracking-widest">Linha do Tempo</h2>
                </div>

                <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {ticket.comments?.map((c: any) => {
                        const isInternal = c.content.startsWith("[INTERNO]");
                        const cleanContent = c.content.replace("[INTERNO] ", "");
                        const isTecnico = ["TECNICO", "ADMIN", "MASTER"].includes(c.user?.role);

                        // LÓGICA DE CORES
                        let bgColor = "bg-blue-600 text-white"; // Cliente (Azul)
                        let borderColor = "border-transparent";
                        let label = "Cliente";

                        if (isInternal) {
                            bgColor = "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400";
                            borderColor = "border-amber-200 dark:border-amber-800";
                            label = "Nota de Manutenção";
                        } else if (isTecnico) {
                            bgColor = "bg-emerald-600 text-white";
                            label = "Técnico (Resposta)";
                        }

                        return (
                            <div key={c.id} className={`p-4 rounded-2xl border ${bgColor} ${borderColor} shadow-sm`}>
                                <div className="flex justify-between items-center mb-1 opacity-80">
                                    <span className="text-[9px] font-black uppercase tracking-tighter">{label} • {c.user?.name}</span>
                                    <span className="text-[9px] font-mono">{new Date(c.createdAt).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-sm font-medium leading-snug">{cleanContent}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}