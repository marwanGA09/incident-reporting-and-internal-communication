-- CreateTable
CREATE TABLE "IncidentStatusNote" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "incidentId" UUID NOT NULL,
    "changedById" TEXT,
    "status" "IncidentStatus" NOT NULL,
    "note" TEXT NOT NULL,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IncidentStatusNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "IncidentStatusNote_incidentId_idx" ON "IncidentStatusNote"("incidentId");

-- AddForeignKey
ALTER TABLE "IncidentStatusNote" ADD CONSTRAINT "IncidentStatusNote_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
