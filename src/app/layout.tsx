import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Meu App",
  description: "Sistema de Chamados",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* suppressHydrationWarning é necessário para temas */
    <html lang="pt-br" suppressHydrationWarning>
      <body className="pt-16">
        <Navbar />
        <main className="max-w-7xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}