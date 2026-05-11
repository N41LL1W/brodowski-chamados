"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    CalendarClock, MapPin, User, ChevronRight,
    Clock, Plus, X, Check, Trash2, Edit3,
    Calendar, Bell, Ticket, CheckCircle2, Circle
} from 'lucide-react';

type Tab = 'chamados' | 'pessoal' | 'hoje';

export default function AgendaPage() {
    const [visitas, setVisitas]   = useState<any[]>([]);
    const [pessoal, setPessoal]   = useState<any[]>([]);
    const [loading, setLoading]   = useState(true);
    const [activeTab, setActiveTab] = useState<Tab>('hoje');

    // Modal novo item pessoal
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ title: '', description: '', date: '', time: '', type: 'pessoal' });
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        try {
            const [visitasRes, pessoalRes] = await Promise.all([
                fetch('/api/tecnico/agenda'),
                fetch('/api/tecnico/agenda/pessoal'),
            ]);
            setVisitas(await visitasRes.json());
            setPessoal(await pessoalRes.json());
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { load(); }, []);

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const amanha = new Date(hoje.getTime() + 24 * 60 * 60 * 1000);

    const visitasProximas = visitas.filter(v => new Date(v.visitDate) >= hoje);
    const visitasPassadas = visitas.filter(v => new Date(v.visitDate) < hoje);

    // Itens de hoje (visitas + pessoal)
    const visitasHoje = visitas.filter(v => {
        const d = new Date(v.visitDate); d.setHours(0,0,0,0);
        return d.getTime() === hoje.getTime();
    });
    const pessoalHoje = pessoal.filter(p => {
        const d = new Date(p.date); d.setHours(0,0,0,0);
        return d.getTime() === hoje.getTime();
    });
    const pessoalAmanha = pessoal.filter(p => {
        const d = new Date(p.date); d.setHours(0,0,0,0);
        return d.getTime() === amanha.getTime();
    });
    const totalHoje = visitasHoje.length + pessoalHoje.length;

    const handleSave = async () => {
        if (!form.title || !form.date || !form.time) return;
        setSaving(true);
        try {
            if (editingId) {
                await fetch('/api/tecnico/agenda/pessoal', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ id: editingId, ...form, date: form.date })
                });
            } else {
                await fetch('/api/tecnico/agenda/pessoal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(form)
                });
            }
            setShowModal(false);
            setForm({ title: '', description: '', date: '', time: '', type: 'pessoal' });
            setEditingId(null);
            load();
        } finally { setSaving(false); }
    };

    const toggleDone = async (id: string, done: boolean) => {
        await fetch('/api/tecnico/agenda/pessoal', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, done: !done })
        });
        load();
    };

    const deleteItem = async (id: string) => {
        if (!confirm('Excluir este item?')) return;
        await fetch('/api/tecnico/agenda/pessoal', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
        });
        load();
    };

    const startEdit = (item: any) => {
        setForm({
            title: item.title,
            description: item.description || '',
            date: new Date(item.date).toISOString().split('T')[0],
            time: item.time,
            type: item.type
        });
        setEditingId(item.id);
        setShowModal(true);
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"/>
        </div>
    );

    const inputCls = "w-full p-3 bg-background border-2 border-border rounded-xl outline-none focus:border-primary font-bold text-foreground text-sm transition-all placeholder:text-muted/50";

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-8 space-y-6">

            {/* MODAL NOVO ITEM */}
            {showModal && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4">
                    <div className="bg-card border border-border w-full max-w-md rounded-[2.5rem] p-6 shadow-2xl animate-in slide-in-from-bottom-4 md:zoom-in duration-200 space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="font-black uppercase text-sm text-foreground">
                                {editingId ? 'Editar item' : 'Novo item pessoal'}
                            </h3>
                            <button onClick={() => { setShowModal(false); setEditingId(null); setForm({ title: '', description: '', date: '', time: '', type: 'pessoal' }); }}
                                className="p-1.5 rounded-xl bg-background text-muted hover:text-foreground">
                                <X size={16}/>
                            </button>
                        </div>

                        <input value={form.title} onChange={e => setForm(f => ({...f, title: e.target.value}))}
                            placeholder="Título do compromisso" className={inputCls}/>

                        <textarea value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
                            placeholder="Descrição (opcional)" className={`${inputCls} h-20 resize-none`}/>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-muted">Data</label>
                                <input type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))}
                                    min={new Date().toISOString().split('T')[0]} className={inputCls}/>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase text-muted">Hora</label>
                                <input type="time" value={form.time} onChange={e => setForm(f => ({...f, time: e.target.value}))}
                                    className={inputCls}/>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {['pessoal', 'reuniao', 'lembrete'].map(t => (
                                <button key={t} onClick={() => setForm(f => ({...f, type: t}))}
                                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border transition-all ${
                                        form.type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted hover:text-foreground'
                                    }`}>
                                    {t}
                                </button>
                            ))}
                        </div>

                        <button onClick={handleSave} disabled={saving || !form.title || !form.date || !form.time}
                            className="w-full p-4 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 disabled:opacity-40 transition-all">
                            {saving ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Adicionar à agenda'}
                        </button>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                        Minha <span className="text-primary italic">Agenda</span>
                    </h1>
                    <p className="text-muted text-sm font-medium mt-0.5">
                        {hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                    </p>
                </div>
                <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-primary text-white rounded-2xl font-black uppercase text-[11px] hover:opacity-90 transition-all shadow-lg shadow-primary/20">
                    <Plus size={15}/> Novo item
                </button>
            </div>

            {/* ABAS */}
            <div className="flex gap-2 bg-card border border-border p-1.5 rounded-2xl">
                {([
                    { id: 'hoje',    label: `Hoje${totalHoje > 0 ? ` (${totalHoje})` : ''}`, icon: <Bell size={13}/> },
                    { id: 'chamados',label: `Visitas (${visitasProximas.length})`,           icon: <Ticket size={13}/> },
                    { id: 'pessoal', label: `Pessoal (${pessoal.filter(p => !p.done).length})`, icon: <Calendar size={13}/> },
                ] as { id: Tab; label: string; icon: any }[]).map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-1.5 flex-1 justify-center px-3 py-2.5 rounded-xl text-[11px] font-black uppercase transition-all ${
                            activeTab === tab.id ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-foreground'
                        }`}>
                        {tab.icon}{tab.label}
                    </button>
                ))}
            </div>

            {/* ABA HOJE */}
            {activeTab === 'hoje' && (
                <div className="space-y-5">
                    {totalHoje === 0 && pessoalAmanha.length === 0 && (
                        <div className="py-16 text-center border-2 border-dashed border-border rounded-3xl space-y-2">
                            <CalendarClock size={40} className="mx-auto text-border"/>
                            <p className="text-muted font-black uppercase text-[10px] tracking-widest">Nenhum compromisso hoje</p>
                        </div>
                    )}

                    {visitasHoje.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                <Ticket size={12}/> Visitas técnicas hoje
                            </p>
                            {visitasHoje.map(v => <VisitaCard key={v.id} visita={v}/>)}
                        </div>
                    )}

                    {pessoalHoje.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                <Calendar size={12}/> Compromissos pessoais hoje
                            </p>
                            {pessoalHoje.map(p => (
                                <PessoalCard key={p.id} item={p} onToggle={toggleDone} onDelete={deleteItem} onEdit={startEdit}/>
                            ))}
                        </div>
                    )}

                    {pessoalAmanha.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                                <Bell size={12}/> Amanhã
                            </p>
                            {pessoalAmanha.map(p => (
                                <PessoalCard key={p.id} item={p} onToggle={toggleDone} onDelete={deleteItem} onEdit={startEdit} muted/>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ABA VISITAS */}
            {activeTab === 'chamados' && (
                <div className="space-y-6">
                    <AgendaSection title="Próximas visitas" items={visitasProximas} empty="Nenhuma visita agendada.">
                        {visitasProximas.map(v => <VisitaCard key={v.id} visita={v}/>)}
                    </AgendaSection>
                    <AgendaSection title="Visitas realizadas" items={visitasPassadas} empty="Nenhuma visita anterior." muted>
                        {visitasPassadas.map(v => <VisitaCard key={v.id} visita={v} muted/>)}
                    </AgendaSection>
                </div>
            )}

            {/* ABA PESSOAL */}
            {activeTab === 'pessoal' && (
                <div className="space-y-3">
                    {pessoal.length === 0 && (
                        <div className="py-16 text-center border-2 border-dashed border-border rounded-3xl space-y-2">
                            <Calendar size={40} className="mx-auto text-border"/>
                            <p className="text-muted font-black uppercase text-[10px] tracking-widest">Nenhum item pessoal</p>
                            <button onClick={() => setShowModal(true)} className="text-primary text-[10px] font-black uppercase hover:underline">
                                + Adicionar agora
                            </button>
                        </div>
                    )}
                    {pessoal
                        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                        .map(p => (
                            <PessoalCard key={p.id} item={p} onToggle={toggleDone} onDelete={deleteItem} onEdit={startEdit}/>
                        ))
                    }
                </div>
            )}
        </div>
    );
}

function AgendaSection({ title, items, empty, muted, children }: any) {
    return (
        <div className="space-y-3">
            <p className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${muted ? 'text-muted' : 'text-primary'}`}>
                <CalendarClock size={12}/> {title}
            </p>
            {items.length === 0 ? (
                <div className="py-8 text-center border-2 border-dashed border-border rounded-3xl">
                    <p className="text-muted text-[10px] font-bold uppercase">{empty}</p>
                </div>
            ) : children}
        </div>
    );
}

function VisitaCard({ visita, muted }: any) {
    const data = new Date(visita.visitDate);
    return (
        <Link href={`/tecnico/chamado/${visita.id}`}>
            <div className={`p-5 rounded-3xl border transition-all hover:shadow-md flex items-center gap-4 group ${muted ? 'bg-card/50 border-border opacity-70' : 'bg-card border-border hover:border-blue-300 dark:hover:border-blue-700'}`}>
                <div className="shrink-0 w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex flex-col items-center justify-center border border-blue-100 dark:border-blue-900/30">
                    <span className="text-[9px] font-black text-blue-600 uppercase">
                        {data.toLocaleString('pt-BR', { month: 'short' })}
                    </span>
                    <span className="text-xl font-black text-blue-700 dark:text-blue-400 leading-none">
                        {data.getDate()}
                    </span>
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-black text-foreground uppercase text-sm truncate group-hover:text-primary transition-colors">
                        {visita.subject}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-[10px] font-bold text-muted uppercase">
                        <span className="flex items-center gap-1"><Clock size={10}/>{data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                        {visita.requester?.name && <span className="flex items-center gap-1"><User size={10}/>{visita.requester.name}</span>}
                        {visita.location && <span className="flex items-center gap-1"><MapPin size={10}/>{visita.location}</span>}
                    </div>
                    {visita.visitNote && <p className="text-[10px] text-muted italic truncate">{visita.visitNote}</p>}
                </div>
                <ChevronRight size={16} className="text-muted group-hover:text-primary shrink-0"/>
            </div>
        </Link>
    );
}

function PessoalCard({ item, onToggle, onDelete, onEdit, muted }: any) {
    const data = new Date(item.date);
    const isPast = data < new Date() && !item.done;

    const TYPE_COLORS: Record<string, string> = {
        pessoal: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        reuniao: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        lembrete: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    };

    return (
        <div className={`p-4 rounded-2xl border transition-all flex items-start gap-3 ${
            item.done ? 'bg-card/50 border-border opacity-60' :
            isPast ? 'bg-red-50/50 dark:bg-red-900/10 border-red-200 dark:border-red-800' :
            'bg-card border-border hover:border-primary'
        } ${muted ? 'opacity-70' : ''}`}>
            <button onClick={() => onToggle(item.id, item.done)} className="mt-0.5 shrink-0">
                {item.done
                    ? <CheckCircle2 size={18} className="text-emerald-500"/>
                    : <Circle size={18} className="text-muted hover:text-primary transition-colors"/>
                }
            </button>
            <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                    <p className={`text-sm font-bold flex-1 ${item.done ? 'line-through text-muted' : 'text-foreground'}`}>
                        {item.title}
                    </p>
                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${TYPE_COLORS[item.type] || TYPE_COLORS.pessoal}`}>
                        {item.type}
                    </span>
                </div>
                {item.description && (
                    <p className="text-[10px] text-muted mt-0.5 truncate">{item.description}</p>
                )}
                <div className="flex items-center gap-3 mt-1 text-[10px] text-muted font-bold">
                    <span className="flex items-center gap-1">
                        <Calendar size={9}/>
                        {data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                    </span>
                    <span className="flex items-center gap-1">
                        <Clock size={9}/>{item.time}
                    </span>
                    {isPast && <span className="text-red-500 font-black uppercase">Atrasado</span>}
                </div>
            </div>
            <div className="flex gap-1 shrink-0">
                <button onClick={() => onEdit(item)}
                    className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-primary/10 transition-all">
                    <Edit3 size={13}/>
                </button>
                <button onClick={() => onDelete(item.id)}
                    className="p-1.5 rounded-lg text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <Trash2 size={13}/>
                </button>
            </div>
        </div>
    );
}