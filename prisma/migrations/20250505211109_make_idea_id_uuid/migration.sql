/*
  Warnings:

  - The primary key for the `_workspace_idea_mapping` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `ideas` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "_workspace_idea_mapping" DROP CONSTRAINT "_workspace_idea_mapping_A_fkey";

-- AlterTable
ALTER TABLE "_workspace_idea_mapping" DROP CONSTRAINT "_workspace_idea_mapping_AB_pkey",
ALTER COLUMN "A" SET DATA TYPE TEXT,
ADD CONSTRAINT "_workspace_idea_mapping_AB_pkey" PRIMARY KEY ("A", "B");

-- AlterTable
ALTER TABLE "ideas" DROP CONSTRAINT "ideas_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "ideas_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ideas_id_seq";

-- AddForeignKey
ALTER TABLE "_workspace_idea_mapping" ADD CONSTRAINT "_workspace_idea_mapping_A_fkey" FOREIGN KEY ("A") REFERENCES "ideas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
