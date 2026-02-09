-- CreateTable
CREATE TABLE "UserGroupRelation" (
    "id" SERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "groupId" INTEGER NOT NULL,

    CONSTRAINT "UserGroupRelation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserGroupRelation" ADD CONSTRAINT "UserGroupRelation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGroupRelation" ADD CONSTRAINT "UserGroupRelation_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
