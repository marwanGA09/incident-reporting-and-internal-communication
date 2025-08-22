// app/lib/actions.ts
"use server";
import { prisma } from "@/app/lib/prisma"; // assumes prisma client is set up
import { clerkClient } from "@/lib/clerkClient";
import logger from "./logger";

export async function createDepartment(name: string, email: string) {
  if (!name) throw new Error("Department name is required");
  // console.log({ name, email });
  // console.log("some thing");
  await prisma.department.create({
    data: {
      name,
      email: email || null,
    },
  });
  // console.log({ testDepartment });
  // optionally redirect or revalidate
}
export async function createIncidentCategory(
  name: string,
  description: string
) {
  if (!name) throw new Error("Department name is required");
  // console.log({ name, description });
  // console.log("some thing");
  await prisma.incidentCategory.create({
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
  // console.log({ testCategory });
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
  const take = 50;
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
  // console.log({ text, departmentId, senderId, roomName });
  return await prisma.groupMessage.create({
    data: { text, departmentId, senderId, roomName },
  });
}

export async function deleteGroupMessage(messageId: string) {
  // console.log({ messageId });
  return await prisma.groupMessage.delete({
    where: {
      id: messageId,
    },
  });
}
export async function updateGroupMessage(messageId: string, newText: string) {
  // console.log({ messageId, newText });
  return await prisma.groupMessage.update({
    where: { id: messageId },
    data: { text: newText },
  });
}

// ******

export async function sendDirectMessage({
  senderId,
  receiverId,
  text,
  roomName,
}: {
  senderId: string;
  receiverId: string;
  text: string;
  roomName: string;
}) {
  return await prisma.directMessage.create({
    data: {
      senderId,
      receiverId,
      text,
      roomName,
    },
  });
}

export async function getDirectMessages(userId1: string, userId2: string) {
  return await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function deleteDirectMessage(messageId: string) {
  // console.log({ messageId });
  return await prisma.directMessage.delete({
    where: {
      id: messageId,
    },
  });
}

export async function updateDirectMessage(messageId: string, newText: string) {
  // console.log({ messageId, newText });
  return await prisma.directMessage.update({
    where: { id: messageId },
    data: { text: newText },
  });
}

export async function searchUsers(searchTerm: string) {
  if (!searchTerm) return [];
  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: searchTerm, mode: "insensitive" } },
          { lastName: { contains: searchTerm, mode: "insensitive" } },
          { email: { contains: searchTerm, mode: "insensitive" } },
          { username: { contains: searchTerm, mode: "insensitive" } },
        ],
      },
    });
    return users;
  } catch (error) {
    logger.error({ error }, "Error searching users:");
    return [];
  }
}
