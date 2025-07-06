import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ incidentId: string }> }
) {
  const body = await req.json();
  const { status } = body;
  const { incidentId } = await params;
  console.log("PPPP", { incidentId, status });
  const updated = await prisma.incident.update({
    where: { id: incidentId },
    data: { status },
  });

  return NextResponse.json("updated");
}
