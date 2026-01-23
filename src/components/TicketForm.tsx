"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function TicketForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Opções vindas do banco
    const [categories, setCategories] = useState([]);
    const [departments, setDepartments] = useState([]);

    const [form, setForm] = useState({
        subject: "",
        description: "",
        priority: "NORMAL",
        categoryId: "",
        departmentId: ""
    });

    useEffect(() => {
        async function loadData() {
            const res = await fetch('/api/config/options');
            const data = await res.json();
            setCategories(data.categories || []);
            setDepartments(data.departments || []);
        }
        loadData();
    }, []);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!form.categoryId || !form.departmentId) {
            setError("Selecione categoria e departamento");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Enviando para a API principal de tickets
            const res = await axios.post("/api/tickets", form);
            router.push('/meus-chamados');
            router.refresh();
        } catch (err: any) {
            setError(err?.response?.data?.details || "Erro ao salvar chamado");
        } finally {
            setLoading(false);
        }
    }

    const inputClass = "w-full border p-3 rounded-xl bg-white text-slate-900 border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none";

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Assunto</label>
                <input 
                    required
                    value={form.subject} 
                    onChange={(e) => setForm({...form, subject: e.target.value})} 
                    placeholder="Ex: Teclado não funciona" 
                    className={inputClass} 
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Categoria</label>
                    <select 
                        required
                        value={form.categoryId} 
                        onChange={e => setForm({...form, categoryId: e.target.value})} 
                        className={inputClass}
                    >
                        <option value="">Selecione...</option>
                        {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Secretaria</label>
                    <select 
                        required
                        value={form.departmentId} 
                        onChange={e => setForm({...form, departmentId: e.target.value})} 
                        className={inputClass}
                    >
                        <option value="">Selecione...</option>
                        {departments.map((d: any) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Urgência</label>
                <select 
                    value={form.priority} 
                    onChange={e => setForm({...form, priority: e.target.value})} 
                    className={inputClass}
                >
                    <option value="BAIXA">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                </select>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Descrição Detalhada</label>
                <textarea 
                    required
                    value={form.description} 
                    onChange={(e)=>setForm({...form, description: e.target.value})} 
                    className={`${inputClass} min-h-[120px]`} 
                />
            </div>

            {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium">{error}</div>}

            <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-4 rounded-xl transition-all disabled:opacity-50"
            >
                {loading ? "Processando..." : "Abrir Chamado Agora"}
            </button>
        </form>
    );
}