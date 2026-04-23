"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Clock, Tag, MapPin, Plus, ChevronRight, Search, Filter, X } from 'lucide-react';

interface Ticket {
    id: string;
    protocol: string;
    subject: string;
    status: string;
    createdAt: string;
    category: { name: string };
    department: { name: string };
}

export default function MeusChamadosPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('TODOS');
    const [dataInicio, setDataInicio] = useState('');
    const [dataFim, setDataFim] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetch('/api/tickets')
            .then(res => res.json())
            .then(data => setTickets(Array.isArray(data) ? data : []))
            .catch(() => setTickets([]))
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status: string) => {
        const s = status?.toUpperCase() || '';
        if (s === 'ABERTO') return 'bg-emerald-50 text-emerald-600 border-emerald-100';
        if (s.includes('ANDAMENTO')) return 'bg-blue-50 text-blue-600 border-blue-100';
        if (s === 'CONCLUIDO' || s === 'CONCLUDED') return 'bg-slate-50 text-slate-500 border-slate-100';
        return 'bg-background text-muted border-border';
    };

    const filtrados = useMemo(() => {
        return tickets.filter(t => {
            const matchSearch = !search.trim() ||
                t.subject.toLowerCase().includes(search.toLowerCase()) ||
                t.protocol.toLowerCase().includes(search.toLowerCase());

            const matchStatus = filtroStatus === 'TODOS' ||
                (filtroStatus === 'ABERTO' && ['ABERTO', 'OPEN'].includes(t.status)) ||
                (filtroStatus === 'EM_ANDAMENTO' && ['EM_ANDAMENTO', 'IN_PROGRESS'].includes(t.status)) ||
                (filtroStatus === 'CONCLUIDO' && ['CONCLUIDO', 'CONCLUDED'].includes(t.status)) ||
                t.status === filtroStatus;

            const created = new Date(t.createdAt);
            const matchInicio = !dataInicio || created >= new Date(dataInicio);
            const matchFim = !dataFim || created <= new Date(dataFim + 'T23:59:59');

            return matchSearch && matchStatus && matchInicio && matchFim;
        });
    }, [tickets, search, filtroStatus, dataInicio, dataFim]);

    const hasFilters = filtroStatus !== 'TODOS' || dataInicio || dataFim;

    const clearFilters = () => {
        setFiltroStatus('TODOS');
        setDataInicio('');
        setDataFim('');
    };

    if (loading) return (
        <div className="flex flex-col justify-center items-center h-[70vh] gap-6">
            <div className="w-10 h-10 border-4 border-border border-t-primary rounded-full animate-spin"/>
            <p className="font-black text-muted uppercase tracking-[0.3em] text-[10px]">Lendo Arquivos...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-6 md:p-12 space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                <div className="space-y-2">
                    <h1 className="text-6xl font-black text-foreground tracking-tighter uppercase leading-[0.8]">
                        Meus<br/>Chamados
                    </h1>
                    <p className="text-muted font-bold uppercase text-[10px] tracking-widest pl-1 italic">
                        {filtrados.length} de {tickets.length} registros
                    </p>
                </div>
                <Link
                    href="/chamados/novo"
                    className="group bg-slate-900 text-white px-10 py-5 rounded-4xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all flex items-center gap-3 shadow-2xl active:scale-95 text-[11px]"
                >
                    <Plus size={20} className="group-hover:rotate-90 transition-transform"/> Novo Protocolo
                </Link>
            </header>

            {/* BUSCA E FILTROS */}
            <div className="space-y-3">
                <div className="flex gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18}/>
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por assunto ou protocolo..."
                            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-2xl outline-none focus:border-primary transition-all text-sm font-bold text-foreground"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-5 py-4 rounded-2xl font-black text-[11px] uppercase border transition-all ${
                            showFilters || hasFilters
                                ? 'bg-primary text-white border-primary'
                                : 'bg-card border-border text-muted hover:text-foreground'
                        }`}
                    >
                        <Filter size={16}/>
                        Filtros
                        {hasFilters && (
                            <span className="bg-white/30 text-white text-[9px] px-1.5 py-0.5 rounded-full">
                                ativo
                            </span>
                        )}
                    </button>
                </div>

                {/* PAINEL DE FILTROS */}
                {showFilters && (
                    <div className="bg-card border border-border rounded-3xl p-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between">
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted">Filtros ativos</p>
                            {hasFilters && (
                                <button onClick={clearFilters} className="flex items-center gap-1 text-[10px] font-black text-red-500 hover:text-red-600 uppercase">
                                    <X size={12}/> Limpar tudo
                                </button>
                            )}
                        </div>

                        {/* STATUS */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted uppercase ml-1">Status</p>
                            <div className="flex gap-2 flex-wrap">
                                {['TODOS', 'ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setFiltroStatus(s)}
                                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                                            filtroStatus === s
                                                ? 'bg-primary text-white'
                                                : 'bg-background border border-border text-muted hover:text-foreground'
                                        }`}
                                    >
                                        {s === 'TODOS' ? 'Todos' :
                                         s === 'ABERTO' ? 'Abertos' :
                                         s === 'EM_ANDAMENTO' ? 'Em andamento' : 'Concluídos'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* PERÍODO */}
                        <div className="space-y-2">
                            <p className="text-[10px] font-bold text-muted uppercase ml-1">Período</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-muted ml-1">De</label>
                                    <input
                                        type="date"
                                        value={dataInicio}
                                        onChange={e => setDataInicio(e.target.value)}
                                        className="w-full p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary text-sm font-bold text-foreground"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-bold text-muted ml-1">Até</label>
                                    <input
                                        type="date"
                                        value={dataFim}
                                        onChange={e => setDataFim(e.target.value)}
                                        className="w-full p-3 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary text-sm font-bold text-foreground"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* LISTA */}
            {filtrados.length === 0 ? (
                <div className="p-24 text-center border-4 border-dashed border-border rounded-[3rem] space-y-4">
                    <Search size={48} className="mx-auto text-border"/>
                    <p className="font-black uppercase tracking-widest text-muted text-xs italic">
                        Nenhum chamado encontrado.
                    </p>
                    {hasFilters && (
                        <button onClick={clearFilters} className="text-primary text-xs font-black uppercase hover:underline">
                            Limpar filtros
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-6">
                    {filtrados.map(ticket => (
                        <Link href={`/meus-chamados/${ticket.id}`} key={ticket.id}>
                            <div className="p-8 bg-card border-2 border-border rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:border-blue-100 transition-all group relative overflow-hidden">
                                <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                                    <div className="space-y-4 flex-1">
                                        <div className="flex flex-wrap gap-2">
                                            <span className={`text-[9px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.15em] border-2 ${getStatusColor(ticket.status)}`}>
                                                {ticket.status.replace('_', ' ')}
                                            </span>
                                            <span className="text-[9px] font-black px-4 py-1.5 rounded-full bg-slate-900 text-white uppercase tracking-widest shadow-md">
                                                #{ticket.protocol}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-2xl text-foreground group-hover:text-blue-600 transition-colors leading-tight uppercase tracking-tight">
                                            {ticket.subject}
                                        </h3>
                                        <div className="flex flex-wrap gap-6">
                                            <span className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                                                <Tag size={14} className="text-primary"/> {ticket.category?.name}
                                            </span>
                                            <span className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                                                <MapPin size={14} className="text-primary"/> {ticket.department?.name}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-0 pt-4 md:pt-0 border-border">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-muted uppercase tracking-widest">
                                            <Clock size={14}/>
                                            {new Date(ticket.createdAt).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="hidden md:flex mt-6 h-12 w-12 bg-background rounded-full items-center justify-center text-muted group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-2">
                                            <ChevronRight size={20}/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}