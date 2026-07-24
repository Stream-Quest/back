-- CreateEnum
CREATE TYPE "CharacterStatus" AS ENUM ('OK', 'HURT', 'CRITICAL', 'UNCONSCIOUS', 'INSPIRED', 'POISONED', 'ASLEEP');

-- CreateEnum
CREATE TYPE "SessionEventOrigin" AS ENUM ('TWITCH', 'MANUAL', 'THRESHOLD');

-- CreateEnum
CREATE TYPE "SessionStreamerRole" AS ENUM ('GM', 'PLAYER');

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "overlayTheme" JSONB;

-- AlterTable
ALTER TABLE "PlayerCharacter" ADD COLUMN     "armorClass" INTEGER DEFAULT 10,
ADD COLUMN     "displayArmorClass" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "displayHp" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "displayStatus" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxHp" INTEGER DEFAULT 10;

-- AlterTable
ALTER TABLE "SessionEvent" ADD COLUMN     "origin" "SessionEventOrigin" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "viewerLogin" TEXT;

-- AlterTable
ALTER TABLE "SessionPlayerCharacter" ADD COLUMN     "charStatus" "CharacterStatus" NOT NULL DEFAULT 'OK',
ADD COLUMN     "currentHp" INTEGER DEFAULT 10;

-- AlterTable
ALTER TABLE "TwitchEventMapping" ADD COLUMN     "currentCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "showProgress" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "threshold" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "SessionStreamer" (
    "id" TEXT NOT NULL,
    "role" "SessionStreamerRole" NOT NULL DEFAULT 'PLAYER',
    "canViewEvents" BOOLEAN NOT NULL DEFAULT true,
    "canViewKarma" BOOLEAN NOT NULL DEFAULT true,
    "canViewMilestones" BOOLEAN NOT NULL DEFAULT true,
    "canViewContext" BOOLEAN NOT NULL DEFAULT true,
    "canViewPlayers" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "sessionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "playerCharacterId" TEXT,

    CONSTRAINT "SessionStreamer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionStreamer_sessionId_idx" ON "SessionStreamer"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SessionStreamer_sessionId_userId_key" ON "SessionStreamer"("sessionId", "userId");

-- AddForeignKey
ALTER TABLE "SessionStreamer" ADD CONSTRAINT "SessionStreamer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionStreamer" ADD CONSTRAINT "SessionStreamer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionStreamer" ADD CONSTRAINT "SessionStreamer_playerCharacterId_fkey" FOREIGN KEY ("playerCharacterId") REFERENCES "PlayerCharacter"("id") ON DELETE SET NULL ON UPDATE CASCADE;
