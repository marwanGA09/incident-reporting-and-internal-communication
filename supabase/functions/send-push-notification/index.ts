// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
// import "jsr:@supabase/functions-js/edge-runtime.d.ts"

// console.log("Hello from Functions!")

// Deno.serve(async (req) => {
//   const { name } = await req.json()
//   const data = {
//     message: `Hello ${name}!`,
//   }

//   return new Response(
//     JSON.stringify(data),
//     { headers: { "Content-Type": "application/json" } },
//   )
// })

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// import webpush from "https://deno.land/x/webpush@0.2.0/mod.ts";
import webpush from "npm:web-push";
// Initialize web-push with your VAPID keys
webpush.setVapidDetails(
  "mailto:ademkedir724@gmail.com", // Replace with your email
  Deno.env.get("VAPID_PUBLIC_KEY")!,
  Deno.env.get("VAPID_PRIVATE_KEY")!
);

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get("PROJECT_URL")!,
    Deno.env.get("ANON_KEY")!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${Deno.env.get("SERVICE_ROLE_KEY")!}`,
        },
      },
    }
  );

  const payload = await req.json();
  const newNotification = payload.record;

  // 1. Get the recipient's push subscriptions
  const { data: subscriptions, error } = await supabaseClient
    .from("PushSubscription")
    .select("endpoint, p256dh, auth")
    .eq("userId", newNotification.recipientId);

  if (error) {
    console.error("Error fetching subscriptions:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return new Response(
      JSON.stringify({ message: "No subscriptions found for user." }),
      { status: 200 }
    );
  }

  // 2. Prepare the notification payload
  const notificationPayload = JSON.stringify({
    title: "New Notification",
    body: newNotification.message,
    url: newNotification.url,
  });

  // 3. Send a push message to each subscription
  const sendPromises = subscriptions.map((sub) =>
    webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      notificationPayload
    )
  );

  await Promise.all(sendPromises);

  return new Response(JSON.stringify({ message: "Push notifications sent." }), {
    status: 200,
  });
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/send-push-notification' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
