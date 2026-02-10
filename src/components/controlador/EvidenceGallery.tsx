"use client";

import Image from "next/image";
import Card from "@/components/ui/Card";
import { Camera, ExternalLink, ShieldCheck, Eye } from "lucide-react";

interface EvidenceGalleryProps {
  proofImage: string | null;
  protocol: string;
}

export default function EvidenceGallery({ proofImage, protocol }: EvidenceGalleryProps) {
  // Caso não haja imagem, exibe um placeholder elegante para o controlador
  if (!proofImage) {
    return (
      <div className="p-12 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-full mb-4">
          <Camera size={48} className="opacity-20" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sem evidência de conclusão anexada</p>
      </div>
    );
  }

  return (
    <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-2xl shadow-slate-200/50 dark:shadow-none rounded-[3rem] overflow-hidden group">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-xl">
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-black text-[11px] uppercase tracking-widest text-slate-400 leading-none">Validação Visual</h3>
            <p className="font-black text-lg text-slate-800 dark:text-white tracking-tighter">Evidência do Serviço</p>
          </div>
        </div>
        
        <a 
          href={proofImage} 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <ExternalLink size={14} /> Expandir
        </a>
      </div>

      <div className="relative aspect-video rounded-4xl overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-inner group-hover:border-blue-500/20 transition-colors">
        <Image 
          src={proofImage} 
          alt={`Evidência do chamado ${protocol}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
          sizes="(max-width: 768px) 100vw, 600px"
        />
        
        {/* Overlay de hover */}
        <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 p-4 rounded-full shadow-2xl transform scale-50 group-hover:scale-100 transition-transform">
                <Eye className="text-blue-600" size={32} />
            </div>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
            Arquivo verificado via protocolo: <span className="text-slate-600 dark:text-slate-200 font-black">{protocol}</span>
        </p>
      </div>
    </Card>
  );
}