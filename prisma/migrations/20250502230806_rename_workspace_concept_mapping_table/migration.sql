/*
  Warnings:

  - You are about to drop the `_WorkspaceConcept` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_WorkspaceConcept" DROP CONSTRAINT "_WorkspaceConcept_A_fkey";

-- DropForeignKey
ALTER TABLE "_WorkspaceConcept" DROP CONSTRAINT "_WorkspaceConcept_B_fkey";

-- DropTable
DROP TABLE "_WorkspaceConcept";

-- CreateTable
CREATE TABLE "_workspace_concept_mapping" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_workspace_concept_mapping_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_workspace_concept_mapping_B_index" ON "_workspace_concept_mapping"("B");

-- AddForeignKey
ALTER TABLE "_workspace_concept_mapping" ADD CONSTRAINT "_workspace_concept_mapping_A_fkey" FOREIGN KEY ("A") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_workspace_concept_mapping" ADD CONSTRAINT "_workspace_concept_mapping_B_fkey" FOREIGN KEY ("B") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
