"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Monitor, Wifi, Printer, ShieldAlert, 
    FileText, Send, ArrowLeft, MapPin, CheckCircle, Download, Home, Search, Map as MapIcon, X
} from 'lucide-react';
import Card from '@/components/ui/Card';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { TicketPDF } from '@/components/TicketPDF';

const IconMap: any = { Monitor, Wifi, Printer, ShieldAlert, FileText };

export default function NovoChamadoPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [createdTicket, setCreatedTicket] = useState<any>(null);

    // ESTADOS PARA O MAPA
    const [showMap, setShowMap] = useState(false);
    const [searchAddress, setSearchAddress] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);

    const [form, setForm] = useState({
        categoryId: '',
        departmentId: '',
        location: '',
        subject: '',
        description: '',
        priority: 'NORMAL'
    });

    useEffect(() => {
        async function loadOptions() {
            try {
                const res = await fetch('/api/config/options');
                const data = await res.json();
                setCategories(data.categories || []);
                setDepartments(data.departments || []);
            } catch (err) { console.error("Erro ao carregar opções"); }
        }
        loadOptions();
    }, []);

    // FUNÇÃO PARA BUSCAR ENDEREÇO (OpenStreetMap - Gratuito)
    const handleSearchAddress = async (query: string) => {
        setSearchAddress(query);
        if (query.length < 3) {
            setSuggestions([]);
            return;
        }

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=br`);
            const data = await res.json();
            setSuggestions(data);
        } catch (err) {
            console.error("Erro na busca de endereço");
        }
    };

    const selectSuggestion = (suggestion: any) => {
        setForm({ ...form, location: suggestion.display_name });
        setSearchAddress("");
        setSuggestions([]);
        setShowMap(false);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                const ticketData = await res.json();
                setCreatedTicket(ticketData);
                setStep(3);
            } else { 
                alert("Erro ao criar chamado."); 
            }
        } catch (error) { 
            alert("Erro de conexão."); 
        } finally { 
            setLoading(false); 
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-screen">
            
            {/* MODAL DE BUSCA POR MAPA / ENDEREÇO */}
            {showMap && (
                <div className="fixed inset-0 z-100 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-black uppercase text-sm tracking-widest text-blue-600">Buscar Localização</h3>
                            <button onClick={() => setShowMap(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-4 text-slate-400" size={20} />
                            <input 
                                autoFocus
                                className="w-full p-4 pl-12 border-2 border-slate-100 rounded-2xl bg-slate-50 outline-none focus:border-blue-500 transition-all text-sm font-medium"
                                placeholder="Digite a rua, prédio ou praça..."
                                value={searchAddress}
                                onChange={(e) => handleSearchAddress(e.target.value)}
                            />
                        </div>

                        <div className="mt-4 space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
                            {suggestions.map((s, idx) => (
                                <button 
                                    key={idx}
                                    onClick={() => selectSuggestion(s)}
                                    className="w-full text-left p-4 hover:bg-blue-50 rounded-2xl transition-all border border-transparent hover:border-blue-200 group"
                                >
                                    <p className="text-xs font-bold text-slate-700 group-hover:text-blue-700">{s.display_name}</p>
                                </button>
                            ))}
                            {searchAddress.length >= 3 && suggestions.length === 0 && (
                                <p className="text-center text-[10px] font-bold text-slate-400 p-4">Nenhum local encontrado...</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">
                        Novo <span className="text-blue-600">Chamado</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm">
                        {step === 3 ? "Concluído" : `Passo ${step} de 2`}
                    </p>
                </div>
                {step === 2 && (
                    <button 
                        onClick={() => setStep(1)} 
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-bold text-sm transition-colors"
                    >
                        <ArrowLeft size={18}/> Voltar
                    </button>
                )}
            </header>

            {/* PASSO 1: SELEÇÃO DE CATEGORIA */}
            {step === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
                    {categories.map((cat: any) => {
                        const Icon = IconMap[cat.icon] || Monitor;
                        return (
                            <button 
                                key={cat.id}
                                onClick={() => { setForm({...form, categoryId: cat.id}); setStep(2); }}
                                className="p-8 bg-card border-2 border-border rounded-3xl hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/10 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="p-5 bg-secondary rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                                    <Icon size={40} />
                                </div>
                                <span className="font-black text-foreground uppercase text-xs tracking-widest text-center">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* PASSO 2: FORMULÁRIO DETALHADO */}
            {step === 2 && (
                <Card className="p-8 shadow-2xl border-none rounded-[2.5rem] animate-in fade-in slide-in-from-right-8 duration-300">
                    <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Sua Secretaria</label>
                                <select 
                                    className="w-full p-4 border-2 border-border rounded-2xl bg-secondary text-foreground outline-none focus:border-blue-500 transition-all appearance-none font-bold"
                                    value={form.departmentId}
                                    onChange={e => setForm({...form, departmentId: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {departments.map((dept: any) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Urgência</label>
                                <div className="flex gap-2 p-1 bg-secondary rounded-2xl">
                                    {['BAIXA', 'NORMAL', 'ALTA'].map(p => (
                                        <button 
                                            key={p}
                                            type="button"
                                            onClick={() => setForm({...form, priority: p})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all 
                                                ${form.priority === p ? 'bg-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:bg-background'}`}
                                        >{p}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* LOCALIZAÇÃO MELHORADA */}
                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Localização Exata</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-4 top-4 text-muted-foreground" size={20} />
                                    <input 
                                        className="w-full p-4 pl-12 border-2 border-border rounded-2xl bg-secondary text-foreground outline-none focus:border-blue-500 transition-all font-medium"
                                        placeholder="Ex: Recepção, Sala 02 ou busque no mapa"
                                        value={form.location}
                                        onChange={e => setForm({...form, location: e.target.value})}
                                    />
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => setShowMap(true)}
                                    className="p-4 bg-blue-50 text-blue-600 rounded-2xl hover:bg-blue-600 hover:text-white transition-all shadow-sm border border-blue-100"
                                >
                                    <MapIcon size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Assunto</label>
                            <input 
                                className="w-full p-4 border-2 border-border rounded-2xl bg-secondary text-foreground outline-none focus:border-blue-500 transition-all font-medium"
                                placeholder="Resumo do problema"
                                value={form.subject}
                                onChange={e => setForm({...form, subject: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Descrição</label>
                            <textarea 
                                className="w-full p-4 border-2 border-border rounded-2xl bg-secondary text-foreground h-32 outline-none focus:border-blue-500 transition-all resize-none font-medium"
                                placeholder="Detalhes..."
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                            />
                        </div>

                        <button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !form.departmentId || !form.subject || !form.location}
                            className={`w-full flex items-center justify-center gap-3 p-5 bg-blue-600 text-white rounded-2xl font-black uppercase transition-all shadow-lg shadow-blue-500/20 ${loading ? 'opacity-50' : 'hover:bg-blue-700 active:scale-[0.98]'}`}
                        >
                            <Send size={20} />
                            {loading ? 'Enviando...' : 'Finalizar Chamado'}
                        </button>
                    </form>
                </Card>
            )}

            {/* PASSO 3: SUCESSO */}
            {step === 3 && createdTicket && (
                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-6 bg-green-100 text-green-600 rounded-full shadow-inner">
                            <CheckCircle size={80} />
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Chamado <span className="text-green-600">Enviado!</span></h2>
                        <p className="text-muted-foreground font-medium max-w-xs mx-auto">
                            Seu protocolo é <span className="font-bold text-foreground">{createdTicket.protocol}</span>. Salve o comprovante abaixo.
                        </p>
                    </div>

                    <div className="grid gap-4 max-w-sm mx-auto">
                        <PDFDownloadLink 
                            document={<TicketPDF ticket={createdTicket} />} 
                            fileName={`protocolo-${createdTicket.protocol}.pdf`}
                            className="flex items-center justify-center gap-3 p-5 bg-foreground text-background rounded-2xl font-black uppercase hover:opacity-90 transition-all"
                        >
                            {({ loading }) => (
                                <>
                                    <Download size={20} />
                                    {loading ? 'Preparando PDF...' : 'Baixar Comprovante PDF'}
                                </>
                            )}
                        </PDFDownloadLink>

                        <button 
                            onClick={() => router.push('/meus-chamados')}
                            className="flex items-center justify-center gap-3 p-5 bg-secondary text-foreground rounded-2xl font-black uppercase hover:bg-border transition-all"
                        >
                            <Home size={20} /> Ir para meus chamados
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}