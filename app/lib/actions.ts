// app/lib/actions.ts
"use server";
import { prisma } from "@/app/lib/prisma"; // assumes prisma client is set up
export async function createDepartment(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name) throw new Error("Department name is required");
  console.log({ name, email });
  // console.log("some thing");
  await prisma.department.create({
    data: {
      name,
      email: email || null,
    },
  });

  // optionally redirect or revalidate
}
export async function createDepartmentTest(name: string, email: string) {
  if (!name) throw new Error("Department name is required");
  console.log({ name, email });
  // console.log("some thing");
  const testDepartment = await prisma.department.create({
    data: {
      name,
      email: email || null,
    },
  });
  console.log({ testDepartment });
  // optionally redirect or revalidate
}
