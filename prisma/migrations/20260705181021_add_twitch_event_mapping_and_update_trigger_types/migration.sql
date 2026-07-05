/*
  Warnings:

  - The values [SUB] on the enum `TriggerType` will be removed. If these variants are still used in the database, this will fail.

*/

-- 1. Enum
CREATE TYPE "TriggerType_new" AS ENUM ('SUB_TIER1', 'SUB_TIER2', 'SUB_TIER3', 'SUB_PRIME', 'GIFT_SUB', 'BITS', 'RAID', 'FOLLOW', 'CHAT_COMMAND');

-- 2. Migration
ALTER TABLE "Rule" ALTER COLUMN "triggerType" TYPE "TriggerType_new" USING (
  CASE "triggerType"::text
    WHEN 'SUB' THEN 'SUB_TIER1'
    ELSE "triggerType"::text
  END::"TriggerType_new"
);

ALTER TABLE "ViewerInteraction" ALTER COLUMN "triggerType" TYPE "TriggerType_new" USING (
  CASE "triggerType"::text
    WHEN 'SUB' THEN 'SUB_TIER1'
    ELSE "triggerType"::text
  END::"TriggerType_new"
);

-- 3. Replace old enum
ALTER TYPE "TriggerType" RENAME TO "TriggerType_old";
ALTER TYPE "TriggerType_new" RENAME TO "TriggerType";
DROP TYPE "TriggerType_old";

-- 4. CreateTable
CREATE TABLE "TwitchEventMapping" (
    "id" TEXT NOT NULL,
    "twitchEventType" "TriggerType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "campaignId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    CONSTRAINT "TwitchEventMapping_pkey" PRIMARY KEY ("id")
);

-- 5. CreateIndex
CREATE INDEX "TwitchEventMapping_campaignId_twitchEventType_idx" ON "TwitchEventMapping"("campaignId", "twitchEventType");
CREATE INDEX "TwitchEventMapping_eventId_idx" ON "TwitchEventMapping"("eventId");

-- 6. AddForeignKey
ALTER TABLE "TwitchEventMapping" ADD CONSTRAINT "TwitchEventMapping_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TwitchEventMapping" ADD CONSTRAINT "TwitchEventMapping_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;