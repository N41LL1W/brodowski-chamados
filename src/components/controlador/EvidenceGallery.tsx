"use client";

import Image from "next/image";
import Card from "@/components/ui/Card";
import { Camera, ExternalLink, ShieldCheck, Eye, Download } from "lucide-react";

interface EvidenceGalleryProps {
  proofImage: string | null;
  protocol: string;
}

export default function EvidenceGallery({ proofImage, protocol }: EvidenceGalleryProps) {
  
  // Função para abrir a imagem em tela cheia, mesmo sendo Base64
  const handleExpandImage = () => {
    if (!proofImage) return;
    
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Evidência - Protocolo ${protocol}</title>
            <style>
              body { margin: 0; background: #0f172a; display: flex; align-items: center; justify-content: center; height: 100vh; }
              img { max-width: 100%; max-height: 100%; border-radius: 8px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
            </style>
          </head>
          <body>
            <img src="${proofImage}" alt="Evidência ${protocol}" />
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  if (!proofImage) {
    return (
      <div className="p-12 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem] flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-full mb-4">
          <Camera size={48} className="opacity-20" />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.2em]">Sem evidência de conclusão</p>
      </div>
    );
  }

  return (
    <Card className="p-8 border-none bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] overflow-hidden group">
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
        
        {/* Botão de Expandir corrigido */}
        <button 
          onClick={handleExpandImage}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-600 hover:text-white rounded-xl transition-all text-[10px] font-black uppercase tracking-widest"
        >
          <Eye size={14} /> Expandir Detalhes
        </button>
      </div>

      <div className="relative aspect-video rounded-4x1 overflow-hidden border-4 border-slate-50 dark:border-slate-800">
        <img 
          src={proofImage} 
          alt={`Evidência do chamado ${protocol}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>
      
      <div className="mt-6 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                Verificado via: <span className="text-slate-600 dark:text-slate-200 font-black">{protocol}</span>
            </p>
         </div>
         
         {/* Opção extra: Download da imagem */}
         <a 
            href={proofImage} 
            download={`evidencia-${protocol}.jpg`}
            className="text-slate-400 hover:text-blue-600 transition-colors"
            title="Baixar Imagem"
         >
            <Download size={18} />
         </a>
      </div>
    </Card>
  );
}