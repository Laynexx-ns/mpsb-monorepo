-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL,
    "yandex_email" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL,
    "name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "patronymic" TEXT NOT NULL,
    "overdue_tasks" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Homework" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deadline" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "UserHomework" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "homework_id" INTEGER NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserHomework_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

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

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHomework" ADD CONSTRAINT "UserHomework_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHomework" ADD CONSTRAINT "UserHomework_homework_id_fkey" FOREIGN KEY ("homework_id") REFERENCES "Homework"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
