/*
  Warnings:

  - You are about to drop the `Concept` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Resource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workspace` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_WorkspaceConcept" DROP CONSTRAINT "_WorkspaceConcept_A_fkey";

-- DropForeignKey
ALTER TABLE "_WorkspaceConcept" DROP CONSTRAINT "_WorkspaceConcept_B_fkey";

-- DropTable
DROP TABLE "Concept";

-- DropTable
DROP TABLE "Resource";

-- DropTable
DROP TABLE "Workspace";

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "type" "WorkspaceType" NOT NULL,
    "idea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "concepts" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "familiarity" "Familiarity" DEFAULT 'NOOB',
    "content" TEXT,
    "embeddingStatus" "EmbeddingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concepts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resources" (
    "id" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "content" TEXT,
    "embeddingStatus" "EmbeddingStatus" NOT NULL DEFAULT 'PENDING',
    "recommendation" "ReadRecommendation",

    CONSTRAINT "resources_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "_WorkspaceConcept" ADD CONSTRAINT "_WorkspaceConcept_A_fkey" FOREIGN KEY ("A") REFERENCES "concepts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkspaceConcept" ADD CONSTRAINT "_WorkspaceConcept_B_fkey" FOREIGN KEY ("B") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
