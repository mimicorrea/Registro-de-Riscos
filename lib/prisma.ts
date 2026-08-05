import 'server-only';

import { PrismaClient } from '@prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  // Neon via WebSocket (porta 443) — contorna bloqueio da porta 5432
  if (connectionString?.includes('neon.tech')) {
    neonConfig.webSocketConstructor = ws;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaNeon(pool);
    return new PrismaClient({ adapter });
  }

  return new PrismaClient();
}

// Construção OPCIONAL (lazy). O Next.js importa este módulo durante o build
// ("Collecting page data" em toda rota que usa auth/prisma) apenas para
// inspecionar exports — nunca deve executar uma query nesse momento. Se a
// conexão fosse criada aqui, de forma eager, qualquer problema de
// configuração do banco (env var ausente/malformada) derrubava o build
// inteiro em vez de falhar só em runtime. Com o Proxy, a conexão real só é
// criada na primeira chamada de fato (ex: prisma.occurrence.findMany).
function getPrismaClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    return Reflect.get(getPrismaClient() as object, prop, receiver);
  },
});
