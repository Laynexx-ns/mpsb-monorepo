/*
  Warnings:

  - Added the required column `groupId` to the `StudyGroupRelation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `StudyGroupRelation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "StudyGroupRelation" ADD COLUMN     "groupId" INTEGER NOT NULL,
ADD COLUMN     "userId" BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE "StudyGroupRelation" ADD CONSTRAINT "StudyGroupRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyGroupRelation" ADD CONSTRAINT "StudyGroupRelation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
