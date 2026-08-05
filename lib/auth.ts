import 'server-only';

import CredentialsProvider from 'next-auth/providers/credentials';
import type { NextAuthOptions } from 'next-auth';
import { prisma } from './prisma';
import type { DbUser } from '@/lib/db-types';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials): Promise<DbUser | null> {
        if (!credentials?.email || !credentials.password) return null;

        // Senha compartilhada de teste — lida de variável de ambiente, nunca
        // hardcoded. Sem AUTH_SHARED_PASSWORD configurada, login fica bloqueado.
        const sharedPassword = process.env.AUTH_SHARED_PASSWORD;
        if (!sharedPassword) {
          console.error('AUTH_SHARED_PASSWORD não configurada — login bloqueado.');
          return null;
        }

        const email = credentials.email.trim().toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        if (credentials.password !== sharedPassword) return null;

        return user;
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as DbUser).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as DbUser['role'];
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export type AuthOptions = typeof authOptions;
