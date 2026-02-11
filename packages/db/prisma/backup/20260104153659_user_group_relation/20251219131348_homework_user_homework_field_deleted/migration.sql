-- AlterTable
ALTER TABLE "Homework" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserHomework" ADD COLUMN     "deleted" BOOLEAN NOT NULL DEFAULT false;
