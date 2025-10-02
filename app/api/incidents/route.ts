import { supabase } from "@/lib/supabaseClient";
import logger from "@/app/lib/logger";
import { prisma } from "@/app/lib/prisma";
import { IncidentFormSchema } from "@/lib/validation/incidents";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const result = IncidentFormSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  try {
    const incident = await prisma.incident.create({
      data: result.data,
    });

    // --- Start Notification Logic ---
    try {
      // Find users who are admins or belong to the incident's department
      const usersToNotify = await prisma.user.findMany({
        where: {
          OR: [
            { role: "admin" },
            { departmentId: result.data.departmentId },
          ],
        },
        select: { id: true },
      });

      if (usersToNotify.length > 0) {
        const notificationsData = usersToNotify.map((user) => ({
          type: "INCIDENT" as const,
          message: `New incident reported: "${incident.title}"`,
          url: `/incidents/${incident.id}`,
          recipientId: user.id,
        }));

        const createdNotifications = [];
        for (const notificationData of notificationsData) {
          const notification = await prisma.notification.create({
            data: notificationData,
          });
          createdNotifications.push(notification);
        }

        // Broadcast each notification to the NOTIFICATION channel
        for (const notification of createdNotifications) {
          supabase.channel("NOTIFICATION").send({
            type: "broadcast",
            event: "new-notification",
            payload: notification,
          });
        }
      }
    } catch (notificationError) {
      logger.error(
        notificationError,
        "Failed to create or broadcast incident notifications"
      );
      // Do not re-throw; the incident was created successfully.
    }
    // --- End Notification Logic ---

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    logger.error({ error }, "ERROR");
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  const { id, status, note, userId } = await req.json();
  try {
    const updated = await prisma.incident.update({
      where: { id },
      data: {
        status,
        statusNotes: {
          create: {
            status,
            note,
            changedById: userId, // from your auth context
          },
        },
      },
    });

    return NextResponse.json(updated, { status: 201 });
  } catch (error) {
    logger.error({ error }, "ERROR");
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}