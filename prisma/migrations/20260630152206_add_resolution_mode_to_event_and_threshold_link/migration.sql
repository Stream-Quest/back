/*
  Warnings:

  - You are about to drop the column `resolutionMode` on the `CampaignThresholdEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CampaignThresholdEvent" DROP COLUMN "resolutionMode";

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "resolutionMode" "ResolutionMode" NOT NULL DEFAULT 'MJ_CHOICE';

-- AlterTable
ALTER TABLE "SessionEvent" ADD COLUMN     "thresholdEventId" TEXT;

-- CreateIndex
CREATE INDEX "CampaignThresholdEvent_campaignId_idx" ON "CampaignThresholdEvent"("campaignId");

-- CreateIndex
CREATE INDEX "CampaignThresholdEvent_eventId_idx" ON "CampaignThresholdEvent"("eventId");

-- CreateIndex
CREATE INDEX "SessionEvent_thresholdEventId_idx" ON "SessionEvent"("thresholdEventId");

-- AddForeignKey
ALTER TABLE "SessionEvent" ADD CONSTRAINT "SessionEvent_thresholdEventId_fkey" FOREIGN KEY ("thresholdEventId") REFERENCES "CampaignThresholdEvent"("id") ON DELETE SET NULL ON UPDATE CASCADE;
