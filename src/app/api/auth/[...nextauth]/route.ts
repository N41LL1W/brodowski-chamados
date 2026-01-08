// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma"; 
import bcrypt from 'bcryptjs'; 

const sessionStrategy: SessionStrategy = "jwt"; 

export const authOptions: AuthOptions = { 
    adapter: PrismaAdapter(prisma),

    providers: [
        CredentialsProvider({
            name: "Credenciais",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Senha", type: "password" }
            },
            async authorize(credentials, req) {

                console.log("=== TENTATIVA DE LOGIN ===");
                console.log("Email recebido:", credentials?.email);


                if (!credentials?.email || !credentials.password) {
                    console.log("Erro: Email ou senha não fornecidos.");
                    return null;
                }

                // 1. Buscar o usuário pelo email
                const user = await prisma.user.findUnique({ 
                    where: { email: credentials.email.trim() },
                });

                if (!user || !user.passwordHash) {
                    console.log("Erro: Usuário não encontrado no banco.");
                    // Usuário não encontrado ou sem hash de senha
                    return null; 
                }
                
                // 2. Comparar a senha fornecida com o hash armazenado
                const isValidPassword = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash 
                );
                
                console.log("Usuário encontrado! Role:", user.role);

                if (isValidPassword) { 
                    console.log("Erro: Senha incorreta.");
                    // Se a senha estiver correta, retorna o objeto user
                    return null;
                }
                console.log("Sucesso: Senha validada.");
                return user;
            }
        })
    ],

    session: {
        strategy: sessionStrategy, 
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // Adicionar id e role ao token para acesso posterior
                token.id = (user as any).id;
                token.role = (user as any).role; 
            }
            return token;
        },
        async session({ session, token }) {
            if (token) {
                // Adicionar id e role à sessão do cliente
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        }
    },
    pages: {
        signIn: '/login',
    }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };