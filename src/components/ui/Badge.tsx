import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'status' | 'priority';
  value?: string;
}

export function Badge({ children, variant = 'default', value, className = "", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase border transition-all shadow-xs";

  const colors: Record<string, string> = {
    urgente: "bg-red-500 text-white border-red-600",
    alta: "bg-orange-500 text-white border-orange-600",
    normal: "bg-blue-500 text-white border-blue-600",
    baixa: "bg-slate-500 text-white border-slate-600",
    
    aberto: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800",
    atendimento: "bg-blue-600 text-white border-blue-700",
    em_andamento: "bg-blue-600 text-white border-blue-700",
    concluido: "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800",
    pausado: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
  };

  const normalize = (val: string) => val?.toLowerCase()
    .replace(/\s/g, '_')
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  let variantStyles = "bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-slate-300";
  
  if ((variant === 'priority' || variant === 'status') && value) {
    variantStyles = colors[normalize(value)] || colors.baixa;
  }

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </span>
  );
}