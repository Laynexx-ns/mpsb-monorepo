-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'GUEST');

-- CreateTable
CREATE TABLE "User" (
    "id" BIGINT NOT NULL,
    "username" TEXT,
    "yandex_email" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "patronymic" TEXT NOT NULL,
    "overdue_tasks" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" NOT NULL DEFAULT 'GUEST',
    "score" INTEGER NOT NULL DEFAULT 0,
    "studyGroupId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "resolved" BOOLEAN NOT NULL,
    "canceled" BOOLEAN NOT NULL,
    "messageId" TEXT[],
    "user_id" BIGINT NOT NULL
);

-- CreateTable
CREATE TABLE "Homework" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deadline" TIMESTAMP(3),
    "studyGroupId" INTEGER NOT NULL,
    "expired" BOOLEAN NOT NULL DEFAULT false,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserHomework" (
    "id" SERIAL NOT NULL,
    "user_id" BIGINT NOT NULL,
    "homework_id" INTEGER NOT NULL,
    "deleted" BOOLEAN NOT NULL DEFAULT false,
    "checked" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserHomework_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyGroupRelation" (
    "id" SERIAL NOT NULL
);

-- CreateTable
CREATE TABLE "StudyGroup" (
    "id" SERIAL NOT NULL,
    "grade" INTEGER,
    "letter" TEXT,
    "title" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Request_id_key" ON "Request"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Request_user_id_key" ON "Request"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "Homework_id_key" ON "Homework"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Homework_name_key" ON "Homework"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserHomework_user_id_homework_id_key" ON "UserHomework"("user_id", "homework_id");

-- CreateIndex
CREATE UNIQUE INDEX "StudyGroupRelation_id_key" ON "StudyGroupRelation"("id");

-- CreateIndex
CREATE UNIQUE INDEX "StudyGroup_id_key" ON "StudyGroup"("id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Homework" ADD CONSTRAINT "Homework_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHomework" ADD CONSTRAINT "UserHomework_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "Homework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHomework" ADD CONSTRAINT "UserHomework_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
