// app/api/department/route.ts
import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  console.log("POST");
  const body = await req.json();
  const { name, email } = body;
  console.log({ body });
  if (!name) {
    return new NextResponse("Name is required", { status: 400 });
  }

  try {
    const department = await prisma.department.create({
      data: {
        name,
        email: email || null,
      },
    });

    return NextResponse.json({ data: department, statu: "status" });
  } catch (error) {
    console.log("ERROR", error);
    return new NextResponse("INTERNAL ERROR", { status: 500 });
  }
}
