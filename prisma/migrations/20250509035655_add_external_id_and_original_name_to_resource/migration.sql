/*
  Warnings:

  - You are about to drop the column `name` on the `resources` table. All the data in the column will be lost.
  - Added the required column `externalId` to the `resources` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `resources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "resources" DROP COLUMN "name",
ADD COLUMN     "externalId" TEXT NOT NULL,
ADD COLUMN     "originalName" TEXT NOT NULL;
