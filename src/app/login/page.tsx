//src\app\login\page.tsx

"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Link from 'next/link';
import { LogIn, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useSession();

  useEffect(() => {
    if (status === "authenticated") window.location.href = "/";
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = await signIn('credentials', {
      redirect: false, email, password,
    });

    if (result?.error) {
      setError('Acesso negado. Verifique suas credenciais.');
      setIsLoading(false);
    } else {
      window.location.href = "/";
    }
  };

  if (status === "loading") return null;

  return (
    <div className="flex justify-center items-center min-h-[90vh] p-4 bg-slate-50/50">
      <Card className="w-full max-w-md p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border-none rounded-[3rem] bg-white">
        <div className="flex flex-col items-center mb-12">
          <div className="bg-slate-900 text-white p-5 rounded-4xl shadow-2xl mb-6 scale-110">
            <LogIn size={32} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase text-slate-900">Brodowski</h1>
          <p className="font-bold text-[10px] uppercase tracking-[0.3em] text-blue-600 mt-2">Central de Operações</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border-2 border-red-100 text-red-600 p-4 rounded-2xl mb-8 text-[11px] font-black uppercase text-center animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase ml-1 tracking-widest text-slate-400">
              <Mail size={12}/> E-mail Corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="usuario@brodowski.sp.gov.br"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[10px] font-black uppercase ml-1 tracking-widest text-slate-400">
              <Lock size={12}/> Senha de Acesso
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-5 bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl outline-none transition-all font-bold text-slate-700 placeholder:text-slate-300"
              placeholder="••••••••"
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full py-8 text-xs font-black uppercase tracking-[0.2em] shadow-2xl bg-blue-600 hover:bg-slate-900 transition-all rounded-2xl"
            disabled={isLoading}
          >
            {isLoading ? 'Autenticando...' : 'Entrar no Sistema'}
          </Button>
        </form>

        <div className="text-center mt-12 pt-8 border-t border-slate-50">
          <Link href="/registro" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
            Solicitar acesso institucional
          </Link>
        </div>
      </Card>
    </div>
  );
}