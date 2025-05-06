/*
  Warnings:

  - You are about to drop the `Bookmark` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Paper` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pathway` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ResearchQuestion` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Summary` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VocabularyTerm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Paper" DROP CONSTRAINT "Paper_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Pathway" DROP CONSTRAINT "Pathway_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Summary" DROP CONSTRAINT "Summary_paperId_fkey";

-- DropTable
DROP TABLE "Bookmark";

-- DropTable
DROP TABLE "Paper";

-- DropTable
DROP TABLE "Pathway";

-- DropTable
DROP TABLE "ResearchQuestion";

-- DropTable
DROP TABLE "Summary";

-- DropTable
DROP TABLE "VocabularyTerm";

-- CreateTable
CREATE TABLE "research_questions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "research_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pathways" (
    "id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "title" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pathways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "papers" (
    "id" TEXT NOT NULL,
    "doi" TEXT,
    "title" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "recommendation" "PaperRecommendation" NOT NULL DEFAULT 'READ',
    "questionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "papers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "summaries" (
    "id" TEXT NOT NULL,
    "paperId" TEXT NOT NULL,
    "keyIdea" TEXT NOT NULL,
    "contribution" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "results" TEXT NOT NULL,

    CONSTRAINT "summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vocabulary_terms" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "definition" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vocabulary_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_pathway_question" ON "pathways"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "papers_doi_key" ON "papers"("doi");

-- CreateIndex
CREATE INDEX "idx_paper_question" ON "papers"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "summaries_paperId_key" ON "summaries"("paperId");

-- AddForeignKey
ALTER TABLE "pathways" ADD CONSTRAINT "pathways_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "research_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "research_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "summaries" ADD CONSTRAINT "summaries_paperId_fkey" FOREIGN KEY ("paperId") REFERENCES "papers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
