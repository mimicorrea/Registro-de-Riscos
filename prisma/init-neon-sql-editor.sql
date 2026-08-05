-- Execute no Neon: Dashboard → SQL Editor → colar e Run
-- Use quando a porta 5432 estiver bloqueada na sua rede (erro P1001)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$ BEGIN CREATE TYPE "RoleName" AS ENUM ('EMPLOYEE', 'MANAGER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE "Category" AS ENUM ('ACCIDENT', 'NEAR_MISS', 'RISK', 'MAINTENANCE', 'INFRASTRUCTURE', 'SAFETY', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE "Severity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN CREATE TYPE "Status" AS ENUM ('OPEN', 'REVIEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "name" TEXT,
  "email" TEXT NOT NULL,
  "image" TEXT,
  "role" "RoleName" NOT NULL DEFAULT 'EMPLOYEE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");

CREATE TABLE IF NOT EXISTS "Account" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL,
  "sessionToken" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Session_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Session_sessionToken_key" ON "Session"("sessionToken");

CREATE TABLE IF NOT EXISTS "Location" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "parentId" TEXT,
  "type" TEXT NOT NULL,
  CONSTRAINT "Location_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Location_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Occurrence" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" "Category" NOT NULL,
  "severity" "Severity" NOT NULL,
  "status" "Status" NOT NULL DEFAULT 'OPEN',
  "reporterId" TEXT,
  "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
  "anonContact" TEXT,
  "assigneeId" TEXT,
  "locationId" TEXT,
  "latitude" DECIMAL(9,6),
  "longitude" DECIMAL(9,6),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "dueDate" TIMESTAMP(3),
  CONSTRAINT "Occurrence_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Occurrence_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "Occurrence_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "Occurrence_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Attachment" (
  "id" TEXT NOT NULL,
  "occurrenceId" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "label" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Attachment_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Comment" (
  "id" TEXT NOT NULL,
  "occurrenceId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Comment_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE,
  CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "StatusHistory" (
  "id" TEXT NOT NULL,
  "occurrenceId" TEXT NOT NULL,
  "previous" "Status" NOT NULL,
  "current" "Status" NOT NULL,
  "note" TEXT,
  "createdById" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StatusHistory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "StatusHistory_occurrenceId_fkey" FOREIGN KEY ("occurrenceId") REFERENCES "Occurrence"("id") ON DELETE CASCADE,
  CONSTRAINT "StatusHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "details" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Usuários de teste (login: Senha123!)
INSERT INTO "User" ("id", "name", "email", "role", "createdAt", "updatedAt")
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Administrador', 'admin@empresa.com', 'ADMIN', NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'Gestor', 'gestor@empresa.com', 'MANAGER', NOW(), NOW())
ON CONFLICT ("email") DO UPDATE SET
  "name" = EXCLUDED."name",
  "role" = EXCLUDED."role",
  "updatedAt" = NOW();

-- Locais básicos (só se ainda não existir nenhum)
INSERT INTO "Location" ("id", "name", "type", "parentId")
SELECT 'b0000000-0000-0000-0000-000000000001', 'Campus Principal', 'campus', NULL
WHERE NOT EXISTS (SELECT 1 FROM "Location");

INSERT INTO "Location" ("id", "name", "type", "parentId")
SELECT 'b0000000-0000-0000-0000-000000000002', 'Bloco A', 'building', 'b0000000-0000-0000-0000-000000000001'
WHERE NOT EXISTS (SELECT 1 FROM "Location" WHERE "name" = 'Bloco A');

INSERT INTO "Location" ("id", "name", "type", "parentId")
SELECT 'b0000000-0000-0000-0000-000000000003', 'Sala 101', 'room', 'b0000000-0000-0000-0000-000000000002'
WHERE NOT EXISTS (SELECT 1 FROM "Location" WHERE "name" = 'Sala 101');
