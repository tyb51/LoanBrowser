-- AlterTable
ALTER TABLE "LoanSimulation" ADD COLUMN     "calculationResult" TEXT,
ADD COLUMN     "delayMonths" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "monthlyPayment" DOUBLE PRECISION,
ADD COLUMN     "totalInterest" DOUBLE PRECISION,
ADD COLUMN     "totalPayment" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "_ClientToLoanSimulation" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClientToLoanSimulation_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ClientToLoanSimulation_B_index" ON "_ClientToLoanSimulation"("B");

-- AddForeignKey
ALTER TABLE "_ClientToLoanSimulation" ADD CONSTRAINT "_ClientToLoanSimulation_A_fkey" FOREIGN KEY ("A") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClientToLoanSimulation" ADD CONSTRAINT "_ClientToLoanSimulation_B_fkey" FOREIGN KEY ("B") REFERENCES "LoanSimulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
