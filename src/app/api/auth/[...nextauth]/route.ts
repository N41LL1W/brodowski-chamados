import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email:    { label: "Email",    type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.passwordHash) return null;

                // BLOQUEIA usuário inativo
                if (user.active === false) {
                    throw new Error('Conta desativada. Contate o administrador.');
                }

                // BLOQUEIA e-mail não verificado (se verificação estiver ativa)
                const emailVerificationConfig = await prisma.systemConfig.findUnique({
                    where: { key: 'emailVerificationRequired' }
                });
                const requireVerification = emailVerificationConfig?.value !== 'false';

                if (requireVerification && !user.emailVerified) {
                    throw new Error('E-mail não verificado. Verifique sua caixa de entrada.');
                }

                const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
                if (!isValid) return null;

                return {
                    id:    user.id,
                    name:  user.name,
                    email: user.email,
                    image: user.image,
                    role:  user.role,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id   = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id   = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
        error:  '/login',
    },
    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };