import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'status' | 'priority';
  value?: string; // Para definir a cor automaticamente baseada no texto
}

export function Badge({ children, variant = 'default', value }: BadgeProps) {
  const baseStyles = "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border transition-colors";
  
  // Lógica de Cores para Prioridade
  const getPriorityStyles = (val: string) => {
    switch (val?.toLowerCase()) {
      case 'urgente':
      case 'alta':
        return "bg-red-100 text-red-700 border-red-200";
      case 'normal':
        return "bg-blue-100 text-blue-700 border-blue-200";
      case 'baixa':
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // Lógica de Cores para Status
  const getStatusStyles = (val: string) => {
    switch (val?.toLowerCase()) {
      case 'aberto':
        return "bg-amber-100 text-amber-700 border-amber-200";
      case 'em atendimento':
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case 'concluído':
      case 'concluido':
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  let variantStyles = "bg-gray-100 text-gray-800 border-gray-200";

  if (variant === 'priority' && value) variantStyles = getPriorityStyles(value);
  if (variant === 'status' && value) variantStyles = getStatusStyles(value);

  return (
    <span className={`${baseStyles} ${variantStyles}`}>
      {children}
    </span>
  );
}