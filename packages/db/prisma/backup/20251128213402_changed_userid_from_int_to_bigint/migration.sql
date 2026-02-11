-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_user_id_fkey";

-- DropForeignKey
ALTER TABLE "UserHomework" DROP CONSTRAINT "UserHomework_user_id_fkey";

-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "user_id" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "id" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "UserHomework" ALTER COLUMN "user_id" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserHomework" ADD CONSTRAINT "UserHomework_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
