/*
  Warnings:

  - Added the required column `canceled` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "canceled" BOOLEAN NOT NULL;
