// /app/api/ably-token/route.ts

import { NextRequest, NextResponse } from "next/server";
import Ably from "ably";
import { auth } from "@clerk/nextjs/server";

const ablyApiKey = process.env.ABLY_API_KEY!;
const ablyClient = new Ably.Rest(ablyApiKey);

export async function GET(req: NextRequest) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tokenRequest = await ablyClient.auth.createTokenRequest({
    clientId: userId,
  });

  return NextResponse.json(tokenRequest);
}
