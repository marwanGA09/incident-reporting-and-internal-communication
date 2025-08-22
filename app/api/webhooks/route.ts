import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import type { WebhookEvent, UserJSON } from "@clerk/nextjs/server";

import { prisma } from "@/app/lib/prisma";
import { isValidUUID } from "@/lib/utils";
import logger from "@/app/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const evt: WebhookEvent = await verifyWebhook(req);
    const eventType = evt.type;

    if (eventType === "user.created" || eventType === "user.updated") {
      const u = evt.data as UserJSON;

      const clerkId = u.id;
      const firstName = u.first_name ?? null;
      const lastName = u.last_name ?? null;
      const imageUrl = u.image_url ?? null;
      const username = u.username ?? null;
      const role = (u.public_metadata?.role as string | null) ?? null;
      const position = (u.public_metadata?.position as string | null) ?? null;
      const departmentId =
        (u.public_metadata?.departmentId as string | null) ?? null;

      const primaryEmail = Array.isArray(u.email_addresses)
        ? u.email_addresses[0]?.email_address
        : u.email_addresses && null;

 
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
      const u = evt.data as Pick<UserJSON, "id">;
      try {
        await prisma.user.delete({ where: { clerkId: u.id } });
      } catch {
        // ignore if already deleted
        logger.error("Error deleting user from database");
      }
      return new Response("deleted", { status: 200 });
    }

    return new Response("ignored", { status: 200 });
  } catch (error) {
    logger.error({error},"Webhook verification or handler error:");
    return new Response("Webhook verification failed", { status: 400 });
  }
}
