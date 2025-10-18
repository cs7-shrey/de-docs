/*
  Warnings:

  - You are about to drop the column `s3Bucket` on the `Document` table. All the data in the column will be lost.
  - You are about to drop the column `s3Key` on the `Document` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "s3Bucket",
DROP COLUMN "s3Key";
