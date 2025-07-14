/*
  Warnings:

  - Added the required column `roomName` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomName` to the `GroupMessage` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "roomName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "GroupMessage" ADD COLUMN     "roomName" TEXT NOT NULL;
