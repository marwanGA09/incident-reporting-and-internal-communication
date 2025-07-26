// app/lib/actions.ts
"use server";
import { prisma } from "@/app/lib/prisma"; // assumes prisma client is set up
import { clerkClient } from "@/lib/clerkClient";
import { json } from "stream/consumers";

export async function createDepartment(name: string, email: string) {
  if (!name) throw new Error("Department name is required");
  console.log({ name, email });
  // console.log("some thing");
  const testDepartment = await prisma.department.create({
    data: {
      name,
      email: email || null,
    },
  });
  console.log({ testDepartment });
  // optionally redirect or revalidate
}
export async function createIncidentCategory(
  name: string,
  description: string
) {
  if (!name) throw new Error("Department name is required");
  console.log({ name, description });
  // console.log("some thing");
  const testCategory = await prisma.incidentCategory.create({
    data: {
      name,
      description,
    },
  });
  // const testDepartment = await prisma.department.create({
  //   data: {
  //     name,
  //     email: email || null,
  //   },
  // });
  console.log({ testCategory });
  // optionally redirect or revalidate
}

export const getDepartments = async (id?: string) => {
  const departments = id
    ? await prisma.department.findMany({
        where: { id },
        orderBy: {
          name: "asc",
        },
      })
    : await prisma.department.findMany({
        orderBy: {
          name: "asc",
        },
      });
  return departments ?? [];
};

export async function getGroupMessages(groupId: string, page: number = 1) {
  const take = 10;
  const skip = (page - 1) * take;
  const sssss = await prisma.groupMessage.findMany({
    where: { departmentId: groupId },
    orderBy: { createdAt: "desc" },
    take,
    skip,
  });

  return sssss.reverse();
}

export const getUser = async (userId: string) => {
  return (
    (await clerkClient.users.getUser(userId)) || {
      name: "Unknown",
      url: "",
    }
  );
};

export async function sendGroupMessage({
  text,
  departmentId,
  senderId,
  roomName,
}: {
  text: string;
  departmentId: string;
  senderId: string;
  roomName: string;
}) {
  console.log({ text, departmentId, senderId, roomName });
  return await prisma.groupMessage.create({
    data: { text, departmentId, senderId, roomName },
  });
}

export async function deleteGroupMessage(messageId: string, senderId: string) {
  return await prisma.groupMessage.delete({
    where: {
      id: messageId,
      senderId,
    },
  });
}
export async function updateGroupMessage(
  messageId: string,
  newText: string,
  senderId: string
) {
  console.log({ messageId, newText, senderId });
  return await prisma.groupMessage.update({
    where: { id: messageId, senderId },
    data: { text: newText },
  });
}
