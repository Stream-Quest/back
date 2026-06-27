-- DropForeignKey
ALTER TABLE "Condition" DROP CONSTRAINT "Condition_conditionGroupId_fkey";

-- DropForeignKey
ALTER TABLE "ConditionGroup" DROP CONSTRAINT "ConditionGroup_parentGroupId_fkey";

-- DropForeignKey
ALTER TABLE "ConditionGroup" DROP CONSTRAINT "ConditionGroup_resolutionId_fkey";

-- AddForeignKey
ALTER TABLE "ConditionGroup" ADD CONSTRAINT "ConditionGroup_resolutionId_fkey" FOREIGN KEY ("resolutionId") REFERENCES "Resolution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionGroup" ADD CONSTRAINT "ConditionGroup_parentGroupId_fkey" FOREIGN KEY ("parentGroupId") REFERENCES "ConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Condition" ADD CONSTRAINT "Condition_conditionGroupId_fkey" FOREIGN KEY ("conditionGroupId") REFERENCES "ConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
