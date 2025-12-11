// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Sistema",
  description: "Sistema",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        
        <Navbar /> 

        {/* 1. min-h-screen: Garante que o bloco Main use toda a altura da tela. */}
        {/* 2. pt-24: Reintroduce o espaçamento necessário para descolar da Navbar (96px). */}
        {/* 3. flex, items-center, justify-center: Prepara o palco para centralização. */}
        <main className="min-h-screen pt-24 flex items-center justify-center">
          {children}
        </main>
       
      </body>
    </html>
  );
}