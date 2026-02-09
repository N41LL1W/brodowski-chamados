"use client";

import { Clock, User, Activity, ArrowRight } from 'lucide-react';

interface LogEntry {
  id: string;
  action: string;
  userName: string;
  ticketProtocol: string;
  timestamp: string;
  details: string;
}

export default function AuditLog({ logs }: { logs: LogEntry[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-4xl border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 className="font-black text-xs uppercase tracking-widest text-slate-400 flex items-center gap-2">
          <Activity size={16} className="text-blue-500" /> Fluxo de Atividades (Logs)
        </h3>
        <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-2 py-1 rounded">Tempo Real</span>
      </div>

      <div className="divide-y divide-slate-50 dark:divide-slate-800">
        {logs.map((log) => (
          <div key={log.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-start gap-4">
            <div className="mt-1 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <Clock size={14} className="text-slate-500" />
            </div>
            
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-800 dark:text-slate-200">{log.userName}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{log.action}</span>
              </div>
              
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Chamado <span className="font-bold text-blue-600">#{log.ticketProtocol}</span>: {log.details}
              </p>
              
              <p className="text-[10px] text-slate-400 font-medium">
                {new Date(log.timestamp).toLocaleString('pt-BR')}
              </p>
            </div>

            <button className="text-slate-300 hover:text-blue-500 transition-colors">
              <ArrowRight size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}