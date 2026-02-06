"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    Monitor, Wifi, Printer, ShieldAlert, 
    FileText, Send, ArrowLeft, MapPin 
} from 'lucide-react';
import Card from '@/components/ui/Card';

const IconMap: any = { Monitor, Wifi, Printer, ShieldAlert, FileText };

export default function NovoChamadoPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);

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

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                router.push('/meus-chamados'); 
                router.refresh();
            } else { alert("Erro ao criar chamado."); }
        } catch (error) { alert("Erro de conexão."); }
        finally { setLoading(false); }
    };

    return (
        <div className="p-4 md:p-8 max-w-3xl mx-auto min-h-screen">
            <header className="mb-10 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-foreground uppercase italic tracking-tighter">
                        Novo <span className="text-blue-600">Chamado</span>
                    </h1>
                    <p className="text-muted-foreground font-medium text-sm">Passo {step} de 2</p>
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
                                <span className="font-black text-foreground uppercase text-xs tracking-widest">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {step === 2 && (
                <Card className="p-8 shadow-2xl border-none rounded-4xl animate-in fade-in slide-in-from-right-8 duration-300">
                    <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Sua Secretaria</label>
                                <select 
                                    className="w-full p-4 border-2 border-border rounded-2xl bg-secondary text-foreground outline-none focus:border-blue-500 transition-all appearance-none"
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

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Localização Exata</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 text-muted-foreground" size={20} />
                                <input 
                                    className="w-full p-4 pl-12 border-2 border-border rounded-2xl bg-secondary text-foreground outline-none focus:border-blue-500 transition-all"
                                    placeholder="Ex: Recepção, Sala 02"
                                    value={form.location}
                                    onChange={e => setForm({...form, location: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Assunto</label>
                            <input 
                                className="w-full p-4 border-2 border-border rounded-2xl bg-secondary text-foreground outline-none focus:border-blue-500 transition-all"
                                placeholder="Resumo do problema"
                                value={form.subject}
                                onChange={e => setForm({...form, subject: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-black text-blue-600 uppercase tracking-widest ml-1">Descrição</label>
                            <textarea 
                                className="w-full p-4 border-2 border-border rounded-2xl bg-secondary text-foreground h-32 outline-none focus:border-blue-500 transition-all resize-none"
                                placeholder="Detalhes..."
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                            />
                        </div>

                        <button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !form.departmentId || !form.subject}
                            className={`w-full flex items-center justify-center gap-3 p-5 bg-blue-600 text-white rounded-2xl font-black uppercase transition-all shadow-lg shadow-blue-500/20 ${loading ? 'opacity-50' : 'hover:bg-blue-700 active:scale-[0.98]'}`}
                        >
                            <Send size={20} />
                            {loading ? 'Enviando...' : 'Finalizar Chamado'}
                        </button>
                    </form>
                </Card>
            )}
        </div>
    );
}