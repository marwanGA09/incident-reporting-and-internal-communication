/*
  Warnings:

  - The values [IN_REVIEW] on the enum `IncidentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assignedToId` on the `Incident` table. All the data in the column will be lost.
  - You are about to drop the column `location` on the `Incident` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[incidentNumber]` on the table `Incident` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "IncidentPriority" AS ENUM ('URGENT', 'HIGH', 'NORMAL', 'LOW');

-- AlterEnum
BEGIN;
CREATE TYPE "IncidentStatus_new" AS ENUM ('REPORTED', 'ACKNOWLEDGED', 'INVESTIGATING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
ALTER TABLE "public"."Incident" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Incident" ALTER COLUMN "status" TYPE "IncidentStatus_new" USING ("status"::text::"IncidentStatus_new");
ALTER TABLE "IncidentStatusNote" ALTER COLUMN "status" TYPE "IncidentStatus_new" USING ("status"::text::"IncidentStatus_new");
ALTER TYPE "IncidentStatus" RENAME TO "IncidentStatus_old";
ALTER TYPE "IncidentStatus_new" RENAME TO "IncidentStatus";
DROP TYPE "public"."IncidentStatus_old";
ALTER TABLE "Incident" ALTER COLUMN "status" SET DEFAULT 'REPORTED';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."Attachment" DROP CONSTRAINT "Attachment_incidentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."DirectMessageAttachment" DROP CONSTRAINT "DirectMessageAttachment_messageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."GroupMessageAttachment" DROP CONSTRAINT "GroupMessageAttachment_messageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."IncidentStatusNote" DROP CONSTRAINT "IncidentStatusNote_incidentId_fkey";

-- AlterTable
ALTER TABLE "Incident" DROP COLUMN "assignedToId",
DROP COLUMN "location",
ADD COLUMN     "affectedServices" TEXT[],
ADD COLUMN     "assigneeId" UUID,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "communicationChannel" TEXT,
ADD COLUMN     "incidentNumber" SERIAL NOT NULL,
ADD COLUMN     "locationAddress" TEXT,
ADD COLUMN     "locationLatitude" DOUBLE PRECISION,
ADD COLUMN     "locationLongitude" DOUBLE PRECISION,
ADD COLUMN     "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "priority" "IncidentPriority" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "reporterId" UUID NOT NULL DEFAULT 'a1621dc9-625a-4015-9f0f-306ef350b3c3',
ADD COLUMN     "resolvedAt" TIMESTAMP(3),
ADD COLUMN     "rootCause" TEXT,
ADD COLUMN     "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM';

-- CreateIndex
CREATE UNIQUE INDEX "Incident_incidentNumber_key" ON "Incident"("incidentNumber");

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incident" ADD CONSTRAINT "Incident_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IncidentStatusNote" ADD CONSTRAINT "IncidentStatusNote_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DirectMessageAttachment" ADD CONSTRAINT "DirectMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "DirectMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessageAttachment" ADD CONSTRAINT "GroupMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "GroupMessage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
