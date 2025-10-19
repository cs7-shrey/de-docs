-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('private', 'public');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'private';
