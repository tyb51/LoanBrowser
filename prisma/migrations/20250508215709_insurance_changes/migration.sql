-- DropIndex
DROP INDEX "InsuranceSimulation_caseId_key";

-- AlterTable
ALTER TABLE "InsuranceSimulation" ADD COLUMN     "simulatedInterestRate" DOUBLE PRECISION,
ALTER COLUMN "clientId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "CaseLink" (
    "id" TEXT NOT NULL,
    "fromCaseId" TEXT NOT NULL,
    "toCaseId" TEXT NOT NULL,
    "linkType" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CaseLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeInsuranceClient" (
    "id" TEXT NOT NULL,
    "insuranceSimulationId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "sharePercentage" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HomeInsuranceClient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HomeInsuranceClient_insuranceSimulationId_clientId_key" ON "HomeInsuranceClient"("insuranceSimulationId", "clientId");

-- AddForeignKey
ALTER TABLE "CaseLink" ADD CONSTRAINT "CaseLink_fromCaseId_fkey" FOREIGN KEY ("fromCaseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseLink" ADD CONSTRAINT "CaseLink_toCaseId_fkey" FOREIGN KEY ("toCaseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeInsuranceClient" ADD CONSTRAINT "HomeInsuranceClient_insuranceSimulationId_fkey" FOREIGN KEY ("insuranceSimulationId") REFERENCES "InsuranceSimulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeInsuranceClient" ADD CONSTRAINT "HomeInsuranceClient_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
