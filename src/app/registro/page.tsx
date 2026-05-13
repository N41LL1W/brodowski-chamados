"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { UserPlus, ArrowRight, Mail, CheckCircle2, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
    const [name, setName]         = useState('');
    const [email, setEmail]       = useState('');
    const [password, setPassword] = useState('');
    const [confirm, setConfirm]   = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError]       = useState<string | null>(null);
    const [success, setSuccess]   = useState<string | null>(null);
    const [needsVerification, setNeedsVerification] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name || !email || !password || !confirm) {
            setError('Preencha todos os campos para continuar.');
            return;
        }
        if (password !== confirm) {
            setError('As senhas não coincidem.');
            return;
        }
        if (password.length < 6) {
            setError('A senha precisa ter pelo menos 6 caracteres.');
            return;
        }

        setError(null);
        setIsLoading(true);

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, role: 'FUNCIONARIO' }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.message || 'Erro ao criar conta.');
            } else if (data.needsVerification) {
                setNeedsVerification(true);
                setSuccess('Conta criada! Verifique seu e-mail para ativar o acesso.');
            } else {
                setSuccess('Conta criada com sucesso! Redirecionando...');
                setTimeout(() => router.push('/login'), 2000);
            }
        } catch {
            setError('Falha na conexão com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputCls = "w-full p-4 bg-background border-2 border-border rounded-2xl transition-all outline-none font-bold text-foreground focus:border-primary placeholder:text-muted/40 text-sm";
    const labelCls = "text-[10px] font-black uppercase tracking-widest text-muted ml-0.5";

    // Tela de verificação pendente
    if (needsVerification) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-6 bg-background">
                <Card className="w-full max-w-md p-10 bg-card shadow-2xl rounded-[3rem] border-none text-center space-y-6">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-3xl flex items-center justify-center mx-auto">
                        <Mail size={32} className="text-blue-600"/>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter uppercase text-foreground">
                            Verifique seu e-mail
                        </h1>
                        <p className="text-muted text-sm mt-2 leading-relaxed">
                            Enviamos um link de confirmação para <span className="font-bold text-foreground">{email}</span>.
                            Clique no link para ativar sua conta.
                        </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl text-xs font-bold text-blue-700 dark:text-blue-400 text-left space-y-1">
                        <p>• Verifique sua caixa de entrada e spam</p>
                        <p>• O link expira em 24 horas</p>
                        <p>• Após confirmar, faça login normalmente</p>
                    </div>
                    <Link href="/login"
                        className="flex items-center justify-center gap-2 p-4 bg-primary text-white rounded-2xl font-black uppercase text-sm hover:opacity-90 transition-all">
                        Ir para o login
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6 bg-background">
            <Card className="w-full max-w-md p-10 bg-card shadow-2xl rounded-[3rem] border-none">

                {/* HEADER */}
                <div className="text-center mb-8">
                    <div className="w-14 h-14 bg-primary rounded-3xl flex items-center justify-center text-white mx-auto mb-5 shadow-xl shadow-primary/20">
                        <UserPlus size={28}/>
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase text-foreground">
                        Criar Conta
                    </h1>
                    <p className="text-muted text-sm mt-1 font-medium">
                        Solicite acesso ao sistema de chamados
                    </p>
                </div>

                {/* FEEDBACK */}
                {success && (
                    <div className="mb-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0"/>
                        <p className="text-emerald-700 dark:text-emerald-400 text-sm font-bold">{success}</p>
                    </div>
                )}
                {error && (
                    <div className="mb-5 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3">
                        <AlertCircle size={16} className="text-red-600 shrink-0"/>
                        <p className="text-red-700 dark:text-red-400 text-sm font-bold">{error}</p>
                    </div>
                )}

                {/* FORMULÁRIO */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className={labelCls}>Nome completo</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className={inputCls}
                            placeholder="Ex: João Silva"
                            disabled={isLoading}
                            autoComplete="name"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>E-mail institucional</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className={inputCls}
                            placeholder="email@brodowski.sp.gov.br"
                            disabled={isLoading}
                            autoComplete="email"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className={inputCls}
                            placeholder="Mínimo 6 caracteres"
                            disabled={isLoading}
                            autoComplete="new-password"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className={labelCls}>Confirmar senha</label>
                        <input
                            type="password"
                            value={confirm}
                            onChange={e => setConfirm(e.target.value)}
                            className={`${inputCls} ${confirm && confirm !== password ? 'border-red-400 focus:border-red-500' : ''}`}
                            placeholder="Repita a senha"
                            disabled={isLoading}
                            autoComplete="new-password"
                        />
                        {confirm && confirm !== password && (
                            <p className="text-[10px] text-red-500 font-bold ml-0.5">As senhas não coincidem.</p>
                        )}
                    </div>

                    {/* FORÇA DA SENHA */}
                    {password.length > 0 && (
                        <div className="space-y-1">
                            <div className="flex gap-1">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className={`h-1 flex-1 rounded-full transition-all ${
                                        password.length >= i * 3
                                            ? i <= 1 ? 'bg-red-400'
                                            : i <= 2 ? 'bg-amber-400'
                                            : i <= 3 ? 'bg-blue-400'
                                            : 'bg-emerald-500'
                                            : 'bg-border'
                                    }`}/>
                                ))}
                            </div>
                            <p className="text-[10px] text-muted">
                                Força: {password.length < 4 ? 'Fraca' : password.length < 7 ? 'Regular' : password.length < 10 ? 'Boa' : 'Forte'}
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading || (!!confirm && confirm !== password)}
                        className="w-full p-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 mt-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                                Criando conta...
                            </>
                        ) : (
                            <>Criar conta <ArrowRight size={18}/></>
                        )}
                    </button>
                </form>

                {/* LINKS */}
                <div className="text-center mt-7 pt-6 border-t border-border space-y-3">
                    <p className="text-sm text-muted">
                        Já tem uma conta?{' '}
                        <Link href="/login" className="font-black text-primary hover:underline">
                            Fazer login
                        </Link>
                    </p>
                    <Link href="/acompanhar"
                        className="block text-[10px] font-black uppercase tracking-widest text-muted hover:text-primary transition-colors">
                        Acompanhar chamado por protocolo
                    </Link>
                </div>
            </Card>
        </div>
    );
}