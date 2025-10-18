/*
  Warnings:

  - You are about to drop the column `awsPath` on the `Document` table. All the data in the column will be lost.
  - Added the required column `briefContent` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Bucket` to the `Document` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3Key` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" DROP COLUMN "awsPath",
ADD COLUMN     "briefContent" TEXT NOT NULL,
ADD COLUMN     "s3Bucket" TEXT NOT NULL,
ADD COLUMN     "s3Key" TEXT NOT NULL;
