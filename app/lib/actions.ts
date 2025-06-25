// app/lib/actions.ts
"use server";

// import { prisma } from "@/lib/prisma"; // assumes prisma client is set up
import { redirect } from "next/navigation";
export async function createDeparment(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;

  if (!name) throw new Error("Department name is required");
  console.log({ formData });
  console.log("some thing");
  // await prisma.department.create({
  //   data: {
  //     name,
  //     email: email || null,
  //   },
  // });

  // optionally redirect or revalidate
  redirect("/dashboard"); // or return a success result
}
