import { deleteOldReadNotifications } from "@/app/lib/actions";

// app/api/cron/delete-notifications/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);

  // get ?secret=... from request
  const secret = url.searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (!secret || secret !== cronSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await deleteOldReadNotifications();
    return NextResponse.json({ success: true, deletedCount: result.count });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 }
    );
  }
}
