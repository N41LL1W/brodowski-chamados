"use client";

import Card from "@/components/ui/Card";
import { Timer, CheckCircle2, AlertCircle, BarChart3 } from 'lucide-react';

export default function SLAAnalytics({ stats }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <KPICard 
        title="Tempo Médio de Resposta" 
        value="42min" 
        subText="-12% vs mês passado"
        icon={<Timer size={24} className="text-blue-500" />}
        trend="up"
      />
      <KPICard 
        title="Chamados no Prazo" 
        value="94.2%" 
        subText="Meta: 90%"
        icon={<CheckCircle2 size={24} className="text-emerald-500" />}
        trend="up"
      />
      <KPICard 
        title="Violações de SLA" 
        value="03" 
        subText="Críticos atrasados"
        icon={<AlertCircle size={24} className="text-red-500" />}
        trend="down"
      />
      <KPICard 
        title="Volume de Demandas" 
        value="158" 
        subText="Chamados este mês"
        icon={<BarChart3 size={24} className="text-slate-500" />}
      />
    </div>
  );
}

function KPICard({ title, value, subText, icon, trend }: any) {
  return (
    <Card className="p-6 border-none ring-1 ring-slate-200 dark:ring-slate-800 shadow-lg shadow-slate-100 dark:shadow-none">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
          {icon}
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
          }`}>
            {trend === 'up' ? '↑ Otimizado' : '↓ Atenção'}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{title}</p>
        <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</h4>
        <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">{subText}</p>
      </div>
    </Card>
  );
}