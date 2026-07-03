-- DropForeignKey
ALTER TABLE "KarmaEvent" DROP CONSTRAINT "KarmaEvent_sessionId_fkey";

-- AlterTable
ALTER TABLE "KarmaEvent" ALTER COLUMN "sessionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "KarmaEvent" ADD CONSTRAINT "KarmaEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;
