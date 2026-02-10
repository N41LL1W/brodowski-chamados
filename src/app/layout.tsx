import "./globals.css";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";
import AuthProvider from "./providers";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

export const metadata = {
  title: "TI Brodowski | Central de Chamados",
  description: "Sistema oficial de chamados técnicos da Prefeitura Municipal de Brodowski",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning é necessário para o ThemeToggle não dar erro
    <html lang="pt-BR" suppressHydrationWarning className="antialiased">
      <body className={`${inter.variable} font-sans bg-background text-foreground`}>
        <AuthProvider>
          <div className="relative min-h-screen flex flex-col">
            <Navbar /> 
            <main className="flex-1">
              {children}
            </main>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}