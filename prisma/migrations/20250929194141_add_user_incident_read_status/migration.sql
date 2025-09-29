-- CreateTable
CREATE TABLE "public"."UserIncidentReadStatus" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "incidentId" UUID NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserIncidentReadStatus_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserIncidentReadStatus_userId_incidentId_key" ON "public"."UserIncidentReadStatus"("userId", "incidentId");

-- AddForeignKey
ALTER TABLE "public"."UserIncidentReadStatus" ADD CONSTRAINT "UserIncidentReadStatus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserIncidentReadStatus" ADD CONSTRAINT "UserIncidentReadStatus_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "public"."Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
