// app/lib/actions.ts
"use server";
import { prisma } from "@/app/lib/prisma"; // assumes prisma client is set up
import { clerkClient } from "@/lib/clerkClient";
import logger from "./logger";

import { PendingAttachment } from "@/lib/defination";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabaseClient";

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
  console.log("we are sending group message", {
    text,
    departmentId,
    senderId,
    roomName,
    attachments,
  });
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

  let notifications: any[] = [];
  try {
    const sender = await prisma.user.findUnique({
      where: { clerkId: senderId },
      select: { id: true, username: true },
    });

    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      select: { name: true, users: { select: { id: true, clerkId: true } } },
    });

    if (department && sender) {
      // Recipients from the department (excluding the sender)
      const departmentRecipients = department.users.filter(
        (user) => user.id !== sender.id
      );

      // Fetch all admin users
      const adminUsers = await prisma.user.findMany({
        where: { role: "admin" },
        select: { id: true, clerkId: true },
      });

      // Combine department recipients and admin users, ensuring no duplicates
      const allRecipientsMap = new Map<
        string,
        { id: string; clerkId: string | null }
      >();
      departmentRecipients.forEach((user) =>
        allRecipientsMap.set(user.id, user)
      );
      adminUsers.forEach((user) => allRecipientsMap.set(user.id, user));

      const allRecipients = Array.from(allRecipientsMap.values());

      if (allRecipients.length > 0) {
        const notificationsData = allRecipients.map((user) => ({
          type: "GROUP_MESSAGE" as const,
          message: `New message in #${department.name} from ${
            sender.username || "a user"
          }`,
          url: `/group-chat/${departmentId}`,
          recipientId: user.id,
        }));

        // Create notifications one by one to get the created notification objects
        for (const notificationData of notificationsData) {
          const notification = await prisma.notification.create({
            data: notificationData,
          });
          notifications.push(notification);
        }
      }
    }
  } catch (error) {
    logger.error(error, "Failed to create group message notifications");
  }
  console.log("from send group message", { newGroupMessage, notifications });
  return { newGroupMessage, notifications };
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
  console.log("we are sending direct message", {
    text,
    senderId,
    receiverId,
    roomName,
    attachments,
  });
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
  let notification = {};
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
      notification = await prisma.notification.create({
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

  return { newMessage, notification };
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

export async function markIncidentAsRead(incidentId: string) {
  const { userId: clerkId } = await auth();
  console.log(
    `markIncidentAsRead called for incidentId: ${incidentId}, clerkId: ${clerkId}`
  );
  if (!clerkId) return { error: "User not authenticated" };

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) return { error: "User not found" };

    const result = await prisma.userIncidentReadStatus.upsert({
      where: {
        userId_incidentId: {
          userId: user.id,
          incidentId: incidentId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        userId: user.id,
        incidentId: incidentId,
        readAt: new Date(),
      },
    });
    console.log(`UserIncidentReadStatus upserted: ${JSON.stringify(result)}`);

    // Broadcast an event that the incident has been read
    supabase.channel("INCIDENT_READ_STATUS").send({
      type: "broadcast",
      event: "incident-read",
      payload: { incidentId, userId: user.id },
    });

    // Also mark the corresponding notification as read
    try {
      await prisma.notification.updateMany({
        where: {
          recipientId: user.id,
          url: `/incidents/${incidentId}`,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
    } catch (notificationError) {
      logger.error(
        notificationError,
        `Failed to mark notification as read for incident ${incidentId}`
      );
      // Do not throw an error here, as the primary action (marking incident as read) succeeded.
    }

    return { success: true };
  } catch (error) {
    logger.error(error, `Failed to mark incident ${incidentId} as read`);
    return { error: "Failed to mark incident as read" };
  }
}

export async function getUnreadIncidentsCount() {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return { error: "User not authenticated", count: 0 };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, role: true, departmentId: true },
    });

    if (!user) {
      return { error: "User not found", count: 0 };
    }

    const readIncidentIds = (
      await prisma.userIncidentReadStatus.findMany({
        where: { userId: user.id },
        select: { incidentId: true },
      })
    ).map((status) => status.incidentId);

    const where: any = {
      id: {
        notIn: readIncidentIds,
      },
    };

    if (user.role !== "admin") {
      where.OR = [
        { departmentId: user.departmentId },
        { assignedToId: clerkId },
      ];
    }

    const unreadIncidentsCount = await prisma.incident.count({
      where,
    });

    return { count: unreadIncidentsCount };
  } catch (error) {
    logger.error(error, "Failed to get unread incidents count");
    return { error: "Failed to fetch unread incidents count", count: 0 };
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
      // take: 50,
    });
    const unReadNotifications = await prisma.notification.findMany({
      where: { recipientId: user.id, isRead: false },
      orderBy: { createdAt: "desc" },
      // take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: {
        recipientId: user.id,
        isRead: false,
      },
    });

    return { notifications, unreadCount, unReadNotifications };
  } catch (error) {
    logger.error(error, "Failed to get notifications");
    return {
      error: "Failed to fetch notifications",
      notifications: [],
      unreadCount: 0,
    };
  }
}
