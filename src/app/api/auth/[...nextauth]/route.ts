// src/app/api/auth/[...nextauth]/route.ts

import NextAuth, { AuthOptions, SessionStrategy } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma"; 
import bcrypt from 'bcrypt'; // Importar a biblioteca de criptografia

// Definir a estratégia de sessão tipada
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
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                // 1. Buscar o usuário pelo email
                const user = await prisma.user.findUnique({ 
                    where: { email: credentials.email },
                });

                if (!user || !user.passwordHash) {
                    // Usuário não encontrado ou não tem senha (pode ter logado por outro método)
                    return null; 
                }
                
                // 2. Comparar a senha fornecida com o hash armazenado
                const isValidPassword = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash 
                );

                if (isValidPassword) { 
                    // Se a senha estiver correta, retorna o objeto user
                    return user;
                }

                return null;
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