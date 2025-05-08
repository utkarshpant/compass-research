/*
  Warnings:

  - Added the required column `name` to the `resources` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "resources" ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_workspace_resource_mapping" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_workspace_resource_mapping_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_workspace_resource_mapping_B_index" ON "_workspace_resource_mapping"("B");

-- AddForeignKey
ALTER TABLE "_workspace_resource_mapping" ADD CONSTRAINT "_workspace_resource_mapping_A_fkey" FOREIGN KEY ("A") REFERENCES "resources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_workspace_resource_mapping" ADD CONSTRAINT "_workspace_resource_mapping_B_fkey" FOREIGN KEY ("B") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
