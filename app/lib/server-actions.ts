"use server";

import { prisma, Prisma } from "@/app/lib/prisma";
import logger from "./logger";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { IncidentStatus } from "@prisma/client";

export async function updateIncidentAction(payload: {
  id: string;
  status?: IncidentStatus;
  assigneeId?: string | null;
  note?: string;
}) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    throw new Error("User not authenticated");
  }

  const { id, status, assigneeId, note } = payload;

  try {
    const dataToUpdate: Prisma.IncidentUpdateInput = {};

    if (status) {
      dataToUpdate.status = status;
      // If status is changing, and a note is provided, create a status note
      if (note) {
        dataToUpdate.statusNotes = {
          create: {
            status,
            note,
            changedById: clerkId,
          },
        };
      }
    }

    if (assigneeId !== undefined) {
      dataToUpdate.assigneeId = assigneeId;
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return;
    }

    await prisma.incident.update({
      where: { id },
      data: dataToUpdate,
    });

    revalidatePath(`/incidents/${id}`);
    revalidatePath("/incidents");
  } catch (error) {
    logger.error({ error }, "Failed to update incident");
    throw new Error("Failed to update incident.");
  }
}

export async function addAttachmentToAction(payload: {
  incidentId: string;
  url: string;
  fileName: string;
}) {
  const { incidentId, url, fileName } = payload;
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  try {
    await prisma.attachment.create({
      data: {
        incidentId,
        url,
        fileName,
      },
    });

    revalidatePath(`/incidents/${incidentId}`);
  } catch (error) {
    logger.error({ error }, "Failed to add attachment");
    throw new Error("Failed to add attachment.");
  }
}

export async function updateUserRoleAndDepartment(
  userId: string,
  role: string,
  departmentId: string
) {
  await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      departmentId,
    },
  });
  revalidatePath("/dashboard/users");
}

export async function updateDepartment(
  id: string,
  name: string,
  email: string
) {
  await prisma.department.update({
    where: { id },
    data: {
      name,
      email,
    },
  });
  revalidatePath("/dashboard/departments");
}

export async function deleteDepartment(id: string) {
  await prisma.department.delete({
    where: { id },
  });
  revalidatePath("/dashboard/departments");
}

export async function updateIncidentCategory(
  id: string,
  name: string,
  description: string
) {
  await prisma.incidentCategory.update({
    where: { id },
    data: {
      name,
      description,
    },
  });
  revalidatePath("/dashboard/categories");
}

export async function deleteIncidentCategory(id: string) {
  await prisma.incidentCategory.delete({
    where: { id },
  });
  revalidatePath("/dashboard/categories");
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
  
  if (!clerkId) return { error: "User not authenticated" };

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) return { error: "User not found" };

    await prisma.userIncidentReadStatus.upsert({
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

    const where: Prisma.IncidentWhereInput = {
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

export async function getMyIncidents() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return [];

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true },
  });
  if (!user) return [];

  return await prisma.incident.findMany({
    where: {
      OR: [
        { reporterId: user.id },
        { assigneeId: user.id },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10, // Also limit this to a reasonable number for the homepage
    include: {
      assignee: true,
      department: true,
    },
  });
}

export async function updateUserPresence() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return;

  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) return;

    await prisma.userPresence.upsert({
      where: { userId: user.id },
      update: { lastSeen: new Date() },
      create: { userId: user.id, lastSeen: new Date() },
    });
  } catch (error) {
    logger.error(error, "Failed to update user presence");
  }
}