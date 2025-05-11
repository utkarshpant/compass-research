/*
  Warnings:

  - You are about to drop the `bookmarks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `papers` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pathways` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `research_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `summaries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `vocabulary_terms` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ReadRecommendation" AS ENUM ('READ', 'SKIP', 'SKIM');

-- CreateEnum
CREATE TYPE "EmbeddingStatus" AS ENUM ('PENDING', 'AVAILABLE');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('WEB_CLIPPING', 'FILE', 'MEDIA');

-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('LEARN', 'RESEARCH');

-- CreateEnum
CREATE TYPE "Familiarity" AS ENUM ('NOOB', 'HEM_HAW', 'FLUENT', 'TOOLBOX', 'LOOKITUP_BABY');

-- DropForeignKey
ALTER TABLE "papers" DROP CONSTRAINT "papers_questionId_fkey";

-- DropForeignKey
ALTER TABLE "pathways" DROP CONSTRAINT "pathways_questionId_fkey";

-- DropForeignKey
ALTER TABLE "summaries" DROP CONSTRAINT "summaries_paperId_fkey";

-- DropTable
DROP TABLE "bookmarks";

-- DropTable
DROP TABLE "papers";

-- DropTable
DROP TABLE "pathways";

-- DropTable
DROP TABLE "research_questions";

-- DropTable
DROP TABLE "summaries";

-- DropTable
DROP TABLE "vocabulary_terms";

-- DropEnum
DROP TYPE "PaperRecommendation";

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "type" "WorkspaceType" NOT NULL,
    "idea" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Concept" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "familiarity" "Familiarity" DEFAULT 'NOOB',
    "content" TEXT,
    "embeddingStatus" "EmbeddingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Concept_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "content" TEXT,
    "embeddingStatus" "EmbeddingStatus" NOT NULL DEFAULT 'PENDING',
    "recommendation" "ReadRecommendation",

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_WorkspaceConcept" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_WorkspaceConcept_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_WorkspaceConcept_B_index" ON "_WorkspaceConcept"("B");

-- AddForeignKey
ALTER TABLE "_WorkspaceConcept" ADD CONSTRAINT "_WorkspaceConcept_A_fkey" FOREIGN KEY ("A") REFERENCES "Concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_WorkspaceConcept" ADD CONSTRAINT "_WorkspaceConcept_B_fkey" FOREIGN KEY ("B") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
