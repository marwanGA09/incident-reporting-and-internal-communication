// app/lib/actions.ts
"use server";
import { prisma } from "@/app/lib/prisma"; // assumes prisma client is set up

export async function createDepartment(name: string, email: string) {
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
export async function createIncidentCategory(
  name: string,
  description: string
) {
  if (!name) throw new Error("Department name is required");
  console.log({ name, description });
  // console.log("some thing");
  const testCategory = await prisma.incidentCategory.create({
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
  console.log({ testCategory });
  // optionally redirect or revalidate
}
