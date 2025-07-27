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

    return NextResponse.json(incident, { status: 201 });
  } catch (error) {
    console.error("ERROR", error);
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
    console.error("ERROR", error);
    return NextResponse.json(
      { error: "internal server error" },
      { status: 500 }
    );
  }
}
