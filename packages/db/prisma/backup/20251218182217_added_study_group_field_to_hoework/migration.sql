-- AlterTable
ALTER TABLE "Homework" ADD COLUMN     "studyGroupId" INTEGER;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
