-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "projectName" TEXT,
ADD COLUMN     "purchaseDate" TIMESTAMP(3),
ADD COLUMN     "purchasePrice" DOUBLE PRECISION;
