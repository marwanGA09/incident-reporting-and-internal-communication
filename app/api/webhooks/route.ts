import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     const evt = await verifyWebhook(req);

//     // Do something with payload
//     // For this guide, log payload to console
//     const { id } = evt.data;
//     const eventType = evt.type;
//     console.log(
//       `Received webhook with ID ${id} and event type of ${eventType}`
//     );
//     console.log("Webhook payload:", evt.data);

//     if (evt.type === "user.created") {
//       console.log("userId: from user.created", evt.data.id);
//     }
//     if (evt.type === "user.updated") {
//       console.log("userId: from user.updated", evt.data.id);
//     }
//     if (evt.type === "user.deleted") {
//       console.log("userId: from user.deleted", evt.data.id);
//     }

//     return new Response("Webhook received", { status: 200 });
//   } catch (err) {
//     console.error("Error verifying webhook:", err);
//     return new Response("Error verifying webhook", { status: 400 });
//   }
// }
import { prisma } from "@/app/lib/prisma";
import { isValidUUID } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req);
    const eventType = evt.type;

    // Narrow to user events we care about
    if (eventType === "user.created" || eventType === "user.updated") {
      const u = evt.data as any; // Clerk's UserJSON — shape varies; be defensive

      const clerkId = u.id;
      const firstName = u.first_name ?? u.firstName ?? null;
      const lastName = u.last_name ?? u.lastName ?? null;
      const imageUrl = u.image_url ?? u.imageUrl ?? null;
      const username = u.username ?? null;
      const role = u.public_metadata?.role ?? null;
      const position = u.public_metadata?.position ?? null;
      const departmentId = u.public_metadata?.departmentId ?? null;
      // Primary email can arrive nested; defensively extract if present
      const primaryEmail =
        u.primary_email_address?.email_address ||
        u.primary_email_address?.email ||
        (Array.isArray(u.email_addresses) &&
          u.email_addresses[0]?.email_address) ||
        null;

      //   console.log({
      //     id,
      //     firstName,
      //     lastName,
      //     imageUrl,
      //     primaryEmail,
      //     username,
      //     role,
      //     position,
      //     departmentId,
      //   });
      //   console.log("all payload", u);
      await prisma.user.upsert({
        where: { clerkId },
        create: {
          clerkId,
          firstName,
          lastName,
          imageUrl,
          email: primaryEmail,
          position,
          role,
          departmentId: isValidUUID(departmentId) ? departmentId : null,
          username,
        },
        update: {
          firstName,
          lastName,
          imageUrl,
          email: primaryEmail,
          position,
          role,
          departmentId: isValidUUID(departmentId) ? departmentId : null,
          username,
        },
      });

      return new Response("ok", { status: 200 });
    }
    if (eventType === "user.deleted") {
      const u = evt.data as any;
      try {
        await prisma.user.delete({ where: { clerkId: u.id } });
      } catch (e) {
        // ignore if already deleted
      }
      return new Response("deleted", { status: 200 });
    }

    // For any other events, just return 200 so Clerk marks as delivered
    return new Response("ignored", { status: 200 });
  } catch (err) {
    console.error("Webhook verification or handler error:", err);
    return new Response("Webhook verification failed", { status: 400 });
  }
}
