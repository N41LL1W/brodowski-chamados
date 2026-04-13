"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { User, Mail, Shield, KeyRound, Save, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
    FUNCIONARIO: { label: 'Funcionário',  color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    TECNICO:     { label: 'Técnico',      color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
    CONTROLADOR: { label: 'Controlador',  color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    MASTER:      { label: 'Master',       color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

export default function ContaPage() {
    const { data: session, update } = useSession();
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    useEffect(() => {
        fetch('/api/conta')
            .then(r => r.json())
            .then(data => {
                setUserData(data);
                setName(data.name || '');
            })
            .finally(() => setLoading(false));
    }, []);

    const showFeedback = (type: 'success' | 'error', msg: string) => {
        setFeedback({ type, msg });
        setTimeout(() => setFeedback(null), 4000);
    };

    const handleSaveProfile = async () => {
        if (newPassword && newPassword !== confirmPassword) {
            showFeedback('error', 'As senhas não coincidem.');
            return;
        }
        if (newPassword && newPassword.length < 6) {
            showFeedback('error', 'A nova senha precisa ter pelo menos 6 caracteres.');
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/conta', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, currentPassword, newPassword })
            });

            const data = await res.json();

            if (!res.ok) {
                showFeedback('error', data.message || 'Erro ao salvar.');
                return;
            }

            showFeedback('success', 'Dados atualizados com sucesso!');
            setUserData(data);
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            await update({ name: data.name });

        } catch {
            showFeedback('error', 'Erro de conexão.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center h-[70vh]">
            <div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
        </div>
    );

    const roleInfo = ROLE_LABELS[(userData?.role as string)] || { label: userData?.role, color: 'bg-card text-muted' };
    const initials = userData?.name?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || '?';

    return (
        <div className="max-w-2xl mx-auto p-6 md:p-12 space-y-8">

            <header className="space-y-1">
                <h1 className="text-4xl font-black tracking-tighter uppercase text-foreground">
                    Minha <span className="text-primary italic">Conta</span>
                </h1>
                <p className="text-muted text-sm font-medium">Gerencie seus dados de acesso</p>
            </header>

            {/* AVATAR + INFO */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 flex items-center gap-6">
                <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-2xl font-black text-primary shrink-0">
                    {initials}
                </div>
                <div className="space-y-2 min-w-0">
                    <h2 className="text-xl font-black text-foreground truncate">{userData?.name}</h2>
                    <p className="text-sm text-muted flex items-center gap-2">
                        <Mail size={14} /> {userData?.email}
                    </p>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${roleInfo.color}`}>
                            <Shield size={10} className="inline mr-1" />
                            {roleInfo.label}
                        </span>
                        {userData?.createdAt && (
                            <span className="text-[10px] font-bold text-muted flex items-center gap-1">
                                <Calendar size={10} />
                                Desde {new Date(userData.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* FEEDBACK */}
            {feedback && (
                <div className={`flex items-center gap-3 p-4 rounded-2xl text-sm font-bold border animate-in fade-in duration-200 ${
                    feedback.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800'
                }`}>
                    {feedback.type === 'success' 
                        ? <CheckCircle2 size={18} /> 
                        : <AlertCircle size={18} />
                    }
                    {feedback.msg}
                </div>
            )}

            {/* FORMULÁRIO */}
            <div className="bg-card border border-border rounded-[2.5rem] p-8 space-y-6">

                {/* NOME */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <User size={12} /> Nome completo
                    </label>
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary transition-all font-bold text-foreground"
                        placeholder="Seu nome completo"
                    />
                </div>

                {/* EMAIL — somente leitura */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <Mail size={12} /> E-mail
                    </label>
                    <input
                        value={userData?.email || ''}
                        disabled
                        className="w-full p-4 bg-background/50 border-2 border-border rounded-2xl font-bold text-muted cursor-not-allowed opacity-60"
                    />
                    <p className="text-[10px] text-muted ml-1">O e-mail não pode ser alterado.</p>
                </div>

                <div className="border-t border-border pt-6 space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-2">
                        <KeyRound size={12} /> Alterar senha
                    </p>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-muted ml-1">Senha atual</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={e => setCurrentPassword(e.target.value)}
                            className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary transition-all font-bold text-foreground"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted ml-1">Nova senha</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary transition-all font-bold text-foreground"
                                placeholder="••••••••"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-muted ml-1">Confirmar</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                className="w-full p-4 bg-background border-2 border-border rounded-2xl outline-none focus:border-primary transition-all font-bold text-foreground"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-muted ml-1">Deixe em branco para não alterar a senha.</p>
                </div>

                <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full flex items-center justify-center gap-3 p-5 bg-primary text-white rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 active:scale-[0.98]"
                >
                    <Save size={18} />
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                </button>
            </div>
        </div>
    );
}