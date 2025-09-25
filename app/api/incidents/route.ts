import logger from "@/app/lib/logger";
import { prisma } from "@/app/lib/prisma";
import { IncidentFormSchema } from "@/lib/validation/incidents";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const result = IncidentFormSchema.safeParse(body);
  // console.log({ result });
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }
  try {
    const incident = await prisma.incident.create({
      data: result.data,
    });
    console.log("NEW INCIDENT is created", incident);
    // --- Start Notification Logic ---
    try {
      const usersInDepartment = await prisma.user.findMany({
        where: { departmentId: incident.departmentId },
        select: { id: true },
      });
      console.log("usersInDepartment of created incident", usersInDepartment);
      if (usersInDepartment.length > 0) {
        const notificationsData = usersInDepartment.map((user) => ({
          type: "INCIDENT" as const,
          message: `New incident reported: "${incident.title}"`,
          url: `/incidents/${incident.id}`,
          recipientId: user.id,
        }));

        console.log("notificationsData of created incident", notificationsData);
        await prisma.notification.createMany({
          data: notificationsData,
        });
      }
    } catch (notificationError) {
      logger.error(
        notificationError,
        "Failed to create incident notifications"
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
    // const incident = await prisma.incident.update({
    //   where: { id },
    //   data: { assignedToId: userId },
    // });

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
