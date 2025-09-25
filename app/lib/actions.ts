// app/lib/actions.ts
"use server";
import { prisma } from "@/app/lib/prisma"; // assumes prisma client is set up
import { clerkClient } from "@/lib/clerkClient";
import logger from "./logger";
import {
  DirectMessageAttachment,
  GroupMessageAttachment,
} from "@prisma/client";
import { PendingAttachment } from "@/lib/defination";
import { auth } from "@clerk/nextjs/server";

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
  const departments =
    // id
    //   ? await prisma.department.findMany({
    //       where: { id },
    //       orderBy: {
    //         name: "asc",
    //       },
    //     })
    //   :
    await prisma.department.findMany({
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
    include: {
      attachments: true,
    },
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
  attachments = [],
}: {
  text: string;
  departmentId: string;
  senderId: string;
  roomName: string;
  attachments?: PendingAttachment[];
}) {
  const newGroupMessage = await prisma.groupMessage.create({
    data: {
      text,
      departmentId,
      senderId,
      roomName,
      attachments: {
        create: attachments.map((a) => ({
          url: a.url,
          type: a.type,
          fileName: a.fileName,
        })),
      },
    },
  });

  try {
    const sender = await prisma.user.findUnique({
      where: { clerkId: senderId },
      select: { id: true, username: true },
    });

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { name: true, users: { select: { id: true } } },
    });

    if (department && sender) {
      const recipients = department.users.filter(
        (user) => user.id !== sender.id
      );
      if (recipients.length > 0) {
        const notificationsData = recipients.map((user) => ({
          type: "GROUP_MESSAGE" as const,
          message: `New message in #${department.name} from ${
            sender.username || "a user"
          }`,
          url: `/group-chat/${departmentId}`,
          recipientId: user.id,
        }));

        await prisma.notification.createMany({
          data: notificationsData,
        });
      }
    }
  } catch (error) {
    logger.error(error, "Failed to create group message notifications");
  }

  return newGroupMessage;
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

// export async function sendDirectMessage({
//   senderId,
//   receiverId,
//   text,
//   roomName,
// }: {
//   senderId: string;
//   receiverId: string;
//   text: string;
//   roomName: string;
// }) {
//   return await prisma.directMessage.create({
//     data: {
//       senderId,
//       receiverId,
//       text,
//       roomName,
//     },
//   });
// }
export async function sendDirectMessage({
  senderId,
  receiverId,
  text,
  roomName,
  attachments = [],
}: {
  senderId: string;
  receiverId: string;
  text?: string;
  roomName: string;
  attachments?: PendingAttachment[];
}) {
  const newMessage = await prisma.directMessage.create({
    data: {
      senderId,
      receiverId,
      text,
      roomName,
      attachments: {
        create: attachments.map((a) => ({
          url: a.url,
          type: a.type,
          fileName: a.fileName,
        })),
      },
    },
    include: { attachments: true },
  });

  try {
    const sender = await prisma.user.findUnique({
      where: { clerkId: senderId },
      select: { username: true },
    });
    const receiver = await prisma.user.findUnique({
      where: { clerkId: receiverId },
      select: { id: true },
    });

    if (receiver && sender) {
      await prisma.notification.create({
        data: {
          type: "DIRECT_MESSAGE",
          message: `New message from ${sender.username || "a user"}`,
          url: `/direct-chat/${senderId}`,
          recipientId: receiver.id,
        },
      });
    }
  } catch (error) {
    logger.error(error, "Failed to create direct message notification");
  }

  return newMessage;
}

export async function getDirectMessages(userId1: string, userId2: string) {
  return await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    include: {
      attachments: true,
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

export async function markNotificationsAsRead(url: string) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) return;

    await prisma.notification.updateMany({
      where: {
        recipientId: user.id,
        url: url,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  } catch (error) {
    logger.error(error, `Failed to mark notifications as read for url: ${url}`);
  }
}

export async function deleteOldReadNotifications() {
  try {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const result = await prisma.notification.deleteMany({
      where: {
        isRead: true,
        readAt: {
          lt: fiveDaysAgo, // less than 5 days ago
        },
      },
    });
    logger.info(`Deleted ${result.count} old read notifications.`);
    return result;
  } catch (error) {
    logger.error(error, "Failed to delete old read notifications");
    throw error; // Re-throw so the cron job service knows it failed
  }
}

export async function getNotifications() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return {
      error: "User not authenticated",
      notifications: [],
      unreadCount: 0,
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return { error: "User not found", notifications: [], unreadCount: 0 };
    }

    const notifications = await prisma.notification.findMany({
      where: { recipientId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: user.id,
        isRead: false,
      },
    });

    return { notifications, unreadCount };
  } catch (error) {
    logger.error(error, "Failed to get notifications");
    return {
      error: "Failed to fetch notifications",
      notifications: [],
      unreadCount: 0,
    };
  }
}
