-- AlterTable
ALTER TABLE "InvestmentSimulation" ADD COLUMN     "clientId" TEXT;

-- CreateTable
CREATE TABLE "InsuranceSimulation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "InsuranceType" NOT NULL,
    "parameters" JSONB NOT NULL,
    "calculationResult" JSONB,
    "clientId" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InsuranceSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsuranceSimulation_caseId_key" ON "InsuranceSimulation"("caseId");

-- AddForeignKey
ALTER TABLE "InvestmentSimulation" ADD CONSTRAINT "InvestmentSimulation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceSimulation" ADD CONSTRAINT "InsuranceSimulation_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InsuranceSimulation" ADD CONSTRAINT "InsuranceSimulation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;
