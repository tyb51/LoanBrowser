-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "LoanType" AS ENUM ('ANNUITY', 'BULLET', 'MODULAR');

-- CreateEnum
CREATE TYPE "InsuranceType" AS ENUM ('LIFE', 'HOME');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('LUMP_SUM', 'DISTRIBUTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "hashedPassword" TEXT,
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Case" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Case_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ClientType" NOT NULL,
    "age" INTEGER,
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "smoker" BOOLEAN,
    "currentCapital" DOUBLE PRECISION NOT NULL,
    "currentDebt" DOUBLE PRECISION NOT NULL,
    "monthlyIncome" DOUBLE PRECISION NOT NULL,
    "caseId" TEXT NOT NULL,

    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoanSimulation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "loanType" "LoanType" NOT NULL,
    "principal" DOUBLE PRECISION NOT NULL,
    "interestRate" DOUBLE PRECISION NOT NULL,
    "termYears" INTEGER NOT NULL,
    "ownContribution" DOUBLE PRECISION NOT NULL,
    "purchasePrice" DOUBLE PRECISION,
    "startYear" INTEGER,
    "insuranceCoveragePct" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "caseId" TEXT NOT NULL,

    CONSTRAINT "LoanSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModularScheduleItem" (
    "id" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "loanSimulationId" TEXT NOT NULL,

    CONSTRAINT "ModularScheduleItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvestmentSimulation" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startCapital" DOUBLE PRECISION NOT NULL,
    "annualGrowthRate" DOUBLE PRECISION NOT NULL,
    "refInvestCapital" DOUBLE PRECISION NOT NULL,
    "altInvestCapital" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "caseId" TEXT NOT NULL,
    "referenceLoanId" TEXT NOT NULL,
    "alternativeLoanId" TEXT NOT NULL,

    CONSTRAINT "InvestmentSimulation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Insurance" (
    "id" TEXT NOT NULL,
    "type" "InsuranceType" NOT NULL,
    "coveragePercentage" DOUBLE PRECISION NOT NULL,
    "initialPremium" DOUBLE PRECISION NOT NULL,
    "clientId" TEXT NOT NULL,

    CONSTRAINT "Insurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LifeInsurance" (
    "id" TEXT NOT NULL,
    "paymentType" "PaymentType" NOT NULL,
    "basedOnRemainingCapital" BOOLEAN NOT NULL,
    "insuranceId" TEXT NOT NULL,

    CONSTRAINT "LifeInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomeInsurance" (
    "id" TEXT NOT NULL,
    "propertyValue" DOUBLE PRECISION NOT NULL,
    "propertyType" TEXT NOT NULL,
    "insuranceId" TEXT NOT NULL,

    CONSTRAINT "HomeInsurance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "InvestmentSimulation_caseId_key" ON "InvestmentSimulation"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "LifeInsurance_insuranceId_key" ON "LifeInsurance"("insuranceId");

-- CreateIndex
CREATE UNIQUE INDEX "HomeInsurance_insuranceId_key" ON "HomeInsurance"("insuranceId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Client" ADD CONSTRAINT "Client_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoanSimulation" ADD CONSTRAINT "LoanSimulation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModularScheduleItem" ADD CONSTRAINT "ModularScheduleItem_loanSimulationId_fkey" FOREIGN KEY ("loanSimulationId") REFERENCES "LoanSimulation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentSimulation" ADD CONSTRAINT "InvestmentSimulation_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "Case"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentSimulation" ADD CONSTRAINT "InvestmentSimulation_referenceLoanId_fkey" FOREIGN KEY ("referenceLoanId") REFERENCES "LoanSimulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvestmentSimulation" ADD CONSTRAINT "InvestmentSimulation_alternativeLoanId_fkey" FOREIGN KEY ("alternativeLoanId") REFERENCES "LoanSimulation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Insurance" ADD CONSTRAINT "Insurance_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LifeInsurance" ADD CONSTRAINT "LifeInsurance_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomeInsurance" ADD CONSTRAINT "HomeInsurance_insuranceId_fkey" FOREIGN KEY ("insuranceId") REFERENCES "Insurance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
