"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Monitor, Wifi, Printer, ShieldAlert, 
    FileText, Send, ArrowLeft, MapPin, CheckCircle, 
    Download, Home, Search, X, Camera, UploadCloud
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

    const [showMap, setShowMap] = useState(false);
    const [searchAddress, setSearchAddress] = useState("");
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [chatImage, setChatImage] = useState<string | null>(null);

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

    const handleSearchAddress = async (query: string) => {
        setSearchAddress(query);
        if (query.length < 3) { setSuggestions([]); return; }
        setSearchLoading(true);
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=br`,
                { headers: { 'Accept-Language': 'pt-BR' } }
            );
            const data = await res.json();
            setSuggestions(data);
        } catch {
            setSuggestions([]);
        } finally {
            setSearchLoading(false);
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
                // Se tem foto, envia como comentário
                if (chatImage) {
                    await fetch(`/api/tickets/${ticketData.id}`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            content: 'Foto anexada na abertura do chamado.',
                            proofImage: chatImage
                        })
                    });
                }
                setCreatedTicket(ticketData);
                setStep(3);
            } else {
                alert("Erro ao criar chamado.");
            }
        } catch {
            alert("Erro de conexão.");
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full p-4 border-2 border-border rounded-2xl bg-background text-foreground outline-none focus:border-primary transition-all font-medium placeholder:text-muted/50";
    const labelClass = "block text-[10px] font-black text-primary uppercase tracking-widest ml-1 mb-1";

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-screen">

            {/* MODAL BUSCA ENDEREÇO */}
            {showMap && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-border w-full max-w-lg rounded-[2.5rem] p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="font-black uppercase text-sm tracking-widest text-primary flex items-center gap-2">
                                <MapPin size={16}/> Buscar localização
                            </h3>
                            <button
                                onClick={() => { setShowMap(false); setSearchAddress(''); setSuggestions([]); }}
                                className="p-2 bg-background rounded-xl text-muted hover:text-foreground transition-colors"
                            >
                                <X size={18}/>
                            </button>
                        </div>

                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18}/>
                            {searchLoading && (
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                            )}
                            <input
                                autoFocus
                                className="w-full p-4 pl-12 pr-10 border-2 border-border rounded-2xl bg-background text-foreground outline-none focus:border-primary transition-all text-sm font-medium placeholder:text-muted/50"
                                placeholder="Digite a rua, prédio ou praça..."
                                value={searchAddress}
                                onChange={(e) => handleSearchAddress(e.target.value)}
                            />
                        </div>

                        <div className="mt-3 space-y-2 max-h-[300px] overflow-y-auto">
                            {suggestions.map((s, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => selectSuggestion(s)}
                                    className="w-full text-left p-4 hover:bg-primary/10 rounded-2xl transition-all border border-transparent hover:border-primary/20 group"
                                >
                                    <p className="text-xs font-bold text-foreground group-hover:text-primary leading-relaxed">{s.display_name}</p>
                                </button>
                            ))}
                            {searchAddress.length >= 3 && !searchLoading && suggestions.length === 0 && (
                                <p className="text-center text-[10px] font-bold text-muted p-4">Nenhum local encontrado.</p>
                            )}
                            {searchAddress.length < 3 && searchAddress.length > 0 && (
                                <p className="text-center text-[10px] font-bold text-muted p-4">Digite pelo menos 3 caracteres.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">
                        Novo <span className="text-primary">Chamado</span>
                    </h1>
                    <p className="text-muted font-medium text-sm">
                        {step === 3 ? "Concluído" : `Passo ${step} de 2`}
                    </p>
                </div>
                {step === 2 && (
                    <button
                        onClick={() => setStep(1)}
                        className="flex items-center gap-2 text-primary hover:opacity-80 font-bold text-sm transition-all"
                    >
                        <ArrowLeft size={18}/> Voltar
                    </button>
                )}
            </header>

            {/* PASSO 1: CATEGORIA */}
            {step === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-300">
                    {categories.map((cat: any) => {
                        const Icon = IconMap[cat.icon] || Monitor;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => { setForm({...form, categoryId: cat.id}); setStep(2); }}
                                className="p-8 bg-card border-2 border-border rounded-3xl hover:border-primary hover:shadow-xl hover:shadow-primary/10 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="p-5 bg-background rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-300 text-foreground">
                                    <Icon size={36}/>
                                </div>
                                <span className="font-black text-foreground uppercase text-xs tracking-widest text-center">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {/* PASSO 2: FORMULÁRIO */}
            {step === 2 && (
                <Card className="p-8 shadow-2xl border-none rounded-[2.5rem] animate-in fade-in slide-in-from-right-8 duration-300 bg-card">
                    <div className="space-y-6">

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* SECRETARIA */}
                            <div>
                                <label className={labelClass}>Sua secretaria</label>
                                <select
                                    className={inputClass}
                                    value={form.departmentId}
                                    onChange={e => setForm({...form, departmentId: e.target.value})}
                                >
                                    <option value="" className="bg-card text-foreground">Selecione...</option>
                                    {departments.map((dept: any) => (
                                        <option
                                            key={dept.id}
                                            value={dept.id}
                                            className="bg-card text-foreground"
                                        >
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* URGÊNCIA */}
                            <div>
                                <label className={labelClass}>Urgência</label>
                                <div className="flex gap-2 p-1 bg-background rounded-2xl border-2 border-border">
                                    {['BAIXA', 'NORMAL', 'ALTA'].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setForm({...form, priority: p})}
                                            className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${
                                                form.priority === p
                                                    ? 'bg-primary text-white shadow-lg'
                                                    : 'text-muted hover:text-foreground'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* LOCALIZAÇÃO */}
                        <div>
                            <label className={labelClass}>Localização exata</label>
                            <div className="flex gap-3">
                                <div className="relative flex-1">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={18}/>
                                    <input
                                        className="w-full p-4 pl-12 border-2 border-border rounded-2xl bg-background text-foreground outline-none focus:border-primary transition-all font-medium placeholder:text-muted/50"
                                        placeholder="Ex: Recepção, Sala 02..."
                                        value={form.location}
                                        onChange={e => setForm({...form, location: e.target.value})}
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowMap(true)}
                                    className="p-4 bg-background border-2 border-border text-muted rounded-2xl hover:border-primary hover:text-primary transition-all"
                                    title="Buscar no mapa"
                                >
                                    <Search size={22}/>
                                </button>
                            </div>
                        </div>

                        {/* ASSUNTO */}
                        <div>
                            <label className={labelClass}>Assunto</label>
                            <input
                                className={inputClass}
                                placeholder="Resumo do problema"
                                value={form.subject}
                                onChange={e => setForm({...form, subject: e.target.value})}
                            />
                        </div>

                        {/* DESCRIÇÃO */}
                        <div>
                            <label className={labelClass}>Descrição</label>
                            <textarea
                                className={`${inputClass} h-32 resize-none`}
                                placeholder="Descreva o problema em detalhes..."
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                            />
                        </div>

                        {/* FOTO OPCIONAL */}
                        <div>
                            <label className={labelClass}>Foto do problema (opcional)</label>
                            {!chatImage ? (
                                <label className="cursor-pointer flex items-center gap-4 p-5 border-2 border-dashed border-border rounded-2xl hover:border-primary transition-all group bg-background">
                                    <div className="p-3 bg-card rounded-xl text-muted group-hover:text-primary transition-colors">
                                        <UploadCloud size={24}/>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground">Clique para anexar uma foto</p>
                                        <p className="text-[10px] text-muted">JPG, PNG — ajuda no diagnóstico</p>
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (!file) return;
                                            const reader = new FileReader();
                                            reader.onloadend = () => setChatImage(reader.result as string);
                                            reader.readAsDataURL(file);
                                            e.target.value = '';
                                        }}
                                    />
                                </label>
                            ) : (
                                <div className="relative">
                                    <img
                                        src={chatImage}
                                        className="w-full max-h-48 object-cover rounded-2xl border-2 border-primary"
                                        alt="Preview"
                                    />
                                    <button
                                        onClick={() => setChatImage(null)}
                                        className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-black hover:bg-red-600 transition-colors"
                                    >
                                        <X size={16}/>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* BOTÃO ENVIAR */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !form.departmentId || !form.subject || !form.location}
                            className="w-full flex items-center justify-center gap-3 p-5 bg-primary text-white rounded-2xl font-black uppercase transition-all shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
                        >
                            <Send size={20}/>
                            {loading ? 'Enviando...' : 'Finalizar Chamado'}
                        </button>
                    </div>
                </Card>
            )}

            {/* PASSO 3: SUCESSO */}
            {step === 3 && createdTicket && (
                <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-6 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full">
                            <CheckCircle size={80}/>
                        </div>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter text-foreground">
                            Chamado <span className="text-emerald-600">Enviado!</span>
                        </h2>
                        <p className="text-muted font-medium max-w-xs mx-auto">
                            Seu protocolo é <span className="font-bold text-foreground">{createdTicket.protocol}</span>. Salve o comprovante abaixo.
                        </p>
                    </div>

                    <div className="grid gap-4 max-w-sm mx-auto">
                        <PDFDownloadLink
                            document={<TicketPDF ticket={createdTicket}/>}
                            fileName={`protocolo-${createdTicket.protocol}.pdf`}
                            className="flex items-center justify-center gap-3 p-5 bg-foreground text-background rounded-2xl font-black uppercase hover:opacity-90 transition-all"
                        >
                            {({ loading }) => (
                                <>
                                    <Download size={20}/>
                                    {loading ? 'Preparando PDF...' : 'Baixar Comprovante PDF'}
                                </>
                            )}
                        </PDFDownloadLink>

                        <button
                            onClick={() => router.push('/meus-chamados')}
                            className="flex items-center justify-center gap-3 p-5 bg-card border-2 border-border text-foreground rounded-2xl font-black uppercase hover:bg-background transition-all"
                        >
                            <Home size={20}/> Ir para meus chamados
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}