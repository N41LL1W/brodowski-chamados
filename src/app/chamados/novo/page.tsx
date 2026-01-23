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
        <div className="p-4 md:p-8 max-w-3xl mx-auto">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 uppercase italic">Suporte TI</h1>
                    <p className="text-gray-500 font-medium">Passo {step} de 2</p>
                </div>
                {step === 2 && (
                    <button onClick={() => setStep(1)} className="flex items-center gap-2 text-blue-600 font-bold text-sm">
                        <ArrowLeft size={18}/> Voltar
                    </button>
                )}
            </header>

            {step === 1 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-300">
                    {categories.map((cat: any) => {
                        const Icon = IconMap[cat.icon] || Monitor;
                        return (
                            <button 
                                key={cat.id}
                                onClick={() => { setForm({...form, categoryId: cat.id}); setStep(2); }}
                                className="p-8 bg-white border-2 border-slate-100 rounded-3xl hover:border-blue-500 transition-all flex flex-col items-center gap-4 group"
                            >
                                <div className="p-5 bg-slate-50 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                    <Icon size={40} />
                                </div>
                                <span className="font-black text-slate-700 uppercase text-xs tracking-widest">{cat.name}</span>
                            </button>
                        );
                    })}
                </div>
            )}

            {step === 2 && (
                <Card className="p-8 shadow-2xl border-0 rounded-3xl animate-in fade-in slide-in-from-right-8 duration-300">
                    <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Sua Secretaria</label>
                                <select 
                                    className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 text-black outline-none focus:border-blue-500"
                                    value={form.departmentId}
                                    onChange={e => setForm({...form, departmentId: e.target.value})}
                                >
                                    <option value="">Selecione...</option>
                                    {departments.map((dept: any) => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Urgência</label>
                                <div className="flex gap-2">
                                    {['BAIXA', 'NORMAL', 'ALTA'].map(p => (
                                        <button 
                                            key={p}
                                            type="button"
                                            onClick={() => setForm({...form, priority: p})}
                                            className={`flex-1 p-3 rounded-xl text-[10px] font-bold border-2 transition-all 
                                                ${form.priority === p ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                                        >{p}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Localização Exata</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 text-slate-400" size={20} />
                                <input 
                                    className="w-full p-4 pl-12 border-2 border-slate-100 rounded-2xl bg-slate-50 text-black outline-none focus:border-blue-500"
                                    placeholder="Ex: Recepção, Sala 02"
                                    value={form.location}
                                    onChange={e => setForm({...form, location: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Assunto</label>
                            <input 
                                className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 text-black outline-none focus:border-blue-500"
                                placeholder="Resumo do problema"
                                value={form.subject}
                                onChange={e => setForm({...form, subject: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-blue-600 uppercase mb-2 tracking-widest">Descrição</label>
                            <textarea 
                                className="w-full p-4 border-2 border-slate-100 rounded-2xl bg-slate-50 text-black h-32 outline-none focus:border-blue-500"
                                placeholder="Detalhes..."
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                            />
                        </div>

                        <button 
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !form.departmentId || !form.subject}
                            className={`w-full flex items-center justify-center gap-3 p-5 bg-blue-600 text-white rounded-2xl font-black uppercase transition-all ${loading ? 'opacity-50' : 'hover:bg-blue-700'}`}
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