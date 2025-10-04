import { supabase } from "@/lib/supabaseClient";
import logger from "@/app/lib/logger";
import { prisma } from "@/app/lib/prisma";
import { IncidentFormSchema } from "@/lib/validation/incidents";
import { NextResponse } from "next/server";

// import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// import logger from "@/app/lib/logger";
// import { prisma } from "@/app/lib/prisma";
// import { supabase } from "@/lib/supabaseClient";
// import { IncidentFormSchema } from "@/lib/validation/incidents";

export async function POST(req: Request) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json(
        { error: "User not authenticated" },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found in DB" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const result = IncidentFormSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.format() },
        { status: 400 }
      );
    }

    const { attachments, ...incidentPayload } = result.data;

    const incident = await prisma.incident.create({
      data: {
        ...incidentPayload,
        reporterId: user.id, // Set the reporter ID
        attachments: {
          createMany: {
            data: attachments || [],
          },
        },
      },
    });

    // --- Start Notification Logic ---
    try {
      const usersToNotify = await prisma.user.findMany({
        where: {
          OR: [{ role: "admin" }, { departmentId: result.data.departmentId }],
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
    }
    // --- End Notification Logic ---

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    logger.error({ error }, "Failed to create incident");
    return NextResponse.json(
      { error: "Internal server error" },
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
