-- AlterTable
ALTER TABLE "User" ADD COLUMN     "studyGroupId" INTEGER;

-- CreateTable
CREATE TABLE "StudyGroup" (
    "id" SERIAL NOT NULL,
    "grade" INTEGER,
    "letter" TEXT,
    "title" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "StudyGroup_id_key" ON "StudyGroup"("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
