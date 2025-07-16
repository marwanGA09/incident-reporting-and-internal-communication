import { auth } from "@clerk/nextjs/server";
import Ably from "ably";

// ensure Vercel doesn't cache the result of this route,
// as otherwise the token request data will eventually become outdated
// and we won't be able to authenticate on the client side
export const revalidate = 0;

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return new Response("unauthorized", { status: 401 });
  }
  const client = new Ably.Rest(process.env.ABLY_API_KEY!);
  const tokenRequestData = await client.auth.createTokenRequest({
    clientId: userId,
  });
  return Response.json(tokenRequestData);
}
