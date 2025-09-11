/*
  Warnings:

  - Added the required column `roomName` to the `DirectMessage` table without a default value. This is not possible if the table is not empty.
  - Added the required column `roomName` to the `GroupMessage` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AttachmentType" AS ENUM ('IMAGE', 'VIDEO', 'FILE');

-- AlterTable
ALTER TABLE "DirectMessage" ADD COLUMN     "roomName" TEXT NOT NULL,
ALTER COLUMN "text" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GroupMessage" ADD COLUMN     "roomName" TEXT NOT NULL,
ALTER COLUMN "text" DROP NOT NULL;

-- CreateTable
CREATE TABLE "DirectMessageAttachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "type" "AttachmentType" NOT NULL,
    "messageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DirectMessageAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GroupMessageAttachment" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "type" "AttachmentType" NOT NULL,
    "messageId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupMessageAttachment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DirectMessageAttachment" ADD CONSTRAINT "DirectMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "DirectMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupMessageAttachment" ADD CONSTRAINT "GroupMessageAttachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "GroupMessage"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
