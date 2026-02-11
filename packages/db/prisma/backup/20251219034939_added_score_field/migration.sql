/*
  Warnings:

  - Made the column `studyGroupId` on table `Homework` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Homework" DROP CONSTRAINT "Homework_studyGroupId_fkey";

-- AlterTable
ALTER TABLE "Homework" ALTER COLUMN "studyGroupId" SET NOT NULL;

-- AlterTable
ALTER TABLE "UserHomework" ADD COLUMN     "score" INTEGER;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
