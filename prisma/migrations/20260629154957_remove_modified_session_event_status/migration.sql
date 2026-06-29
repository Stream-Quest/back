/*
  Warnings:

  - The values [MODIFIED] on the enum `SessionEventStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SessionEventStatus_new" AS ENUM ('PENDING', 'VALIDATED', 'REJECTED');
ALTER TABLE "public"."SessionEvent" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "SessionEvent" ALTER COLUMN "status" TYPE "SessionEventStatus_new" USING ("status"::text::"SessionEventStatus_new");
ALTER TYPE "SessionEventStatus" RENAME TO "SessionEventStatus_old";
ALTER TYPE "SessionEventStatus_new" RENAME TO "SessionEventStatus";
DROP TYPE "public"."SessionEventStatus_old";
ALTER TABLE "SessionEvent" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
