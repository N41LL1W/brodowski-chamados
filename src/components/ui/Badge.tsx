import React from 'react';

// Adicionamos o 'extends' para que o Badge aceite tudo que um 'span' comum aceita
interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'status' | 'priority';
  value?: string;
}

export function Badge({ children, variant = 'default', value, className = "", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border transition-all";

  // Mapeamento centralizado de cores (mais limpo que o switch case)
  const colors: Record<string, string> = {
    // Prioridades
    urgente: "bg-red-500 text-white border-red-600 shadow-sm shadow-red-100",
    alta: "bg-orange-100 text-orange-700 border-orange-200",
    normal: "bg-blue-100 text-blue-700 border-blue-200",
    baixa: "bg-slate-100 text-slate-600 border-slate-200",
    
    // Status
    aberto: "bg-amber-100 text-amber-700 border-amber-200",
    atendimento: "bg-indigo-600 text-white border-indigo-700",
    em_andamento: "bg-indigo-600 text-white border-indigo-700",
    concluido: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  // Função para normalizar o valor (remover acentos e espaços)
  const normalize = (val: string) => val?.toLowerCase().replace(/\s/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  let variantStyles = "bg-gray-100 text-gray-800 border-gray-200";
  
  if ((variant === 'priority' || variant === 'status') && value) {
    variantStyles = colors[normalize(value)] || colors.baixa;
  }

  if (variant === 'outline') {
    variantStyles = "bg-transparent border-slate-300 text-slate-600";
  }

  return (
    <span 
      className={`${baseStyles} ${variantStyles} ${className}`} 
      {...props} // Isso permite passar id, onClick, title, etc.
    >
      {children}
    </span>
  );
}