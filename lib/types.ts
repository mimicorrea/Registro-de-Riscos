import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user?: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
    role: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: 'EMPLOYEE' | 'MANAGER' | 'ADMIN';
  }
}
