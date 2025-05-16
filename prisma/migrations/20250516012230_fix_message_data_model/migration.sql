/*
  Warnings:

  - Changed the type of `role` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `content` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "messages" DROP COLUMN "role",
ADD COLUMN     "role" "MessageRole" NOT NULL,
DROP COLUMN "content",
ADD COLUMN     "content" TEXT NOT NULL;
