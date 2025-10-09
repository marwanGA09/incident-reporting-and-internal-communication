import { deleteOldReadNotifications } from "@/app/lib/actions";
// import { NextResponse } from "next/server";

// export async function GET(request: Request) {
//   const { searchParams } = new URL(request.url);
//   const cronSecret = searchParams.get("secret");

//   if (cronSecret !== process.env.CRON_SECRET) {
//     logger.warn("Unauthorized cron job access attempt");
//     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const result = await deleteOldReadNotifications();
//     return NextResponse.json({ success: true, deletedCount: result.count });
//   } catch (error) {
//     logger.error(error, "Cron job failed: deleteOldReadNotifications");
//     return NextResponse.json(
//       { error: "Failed to delete notifications" },
//       { status: 500 }
//     );
//   }
// }

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
