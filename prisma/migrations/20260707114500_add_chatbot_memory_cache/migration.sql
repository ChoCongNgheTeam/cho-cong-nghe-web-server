-- AlterTable
ALTER TABLE "chat_sessions" ADD COLUMN IF NOT EXISTS "userId" UUID;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_sessions_userId_idx" ON "chat_sessions"("userId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "user_preferences" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "user_preferences_userId_key_key" ON "user_preferences"("userId", "key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "user_preferences_userId_idx" ON "user_preferences"("userId");

-- CreateTable
CREATE TABLE IF NOT EXISTS "chat_memory_vectors" (
    "id" UUID NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" UUID,
    "content" TEXT NOT NULL,
    "embedding" vector(384),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "chat_memory_vectors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_memory_vectors_sessionId_idx" ON "chat_memory_vectors"("sessionId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_memory_vectors_userId_idx" ON "chat_memory_vectors"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chat_memory_vectors_embedding_idx" ON "chat_memory_vectors" USING hnsw ("embedding" vector_cosine_ops);

-- CreateTable
CREATE TABLE IF NOT EXISTS "chatbot_semantic_cache" (
    "id" UUID NOT NULL,
    "query" TEXT NOT NULL,
    "embedding" vector(384),
    "toolSignatureHash" VARCHAR(255) NOT NULL,
    "ttlDays" INTEGER,
    "response" JSONB NOT NULL,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "chatbot_semantic_cache_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "chatbot_semantic_cache_toolSignatureHash_idx" ON "chatbot_semantic_cache"("toolSignatureHash");

-- AddForeignKey
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_sessions_userId_fkey') THEN
    ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_preferences_userId_fkey') THEN
    ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chat_memory_vectors_userId_fkey') THEN
    ALTER TABLE "chat_memory_vectors" ADD CONSTRAINT "chat_memory_vectors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END
$$;
