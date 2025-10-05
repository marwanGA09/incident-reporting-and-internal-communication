// hooks/use-presence.ts
"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useUser } from "@clerk/nextjs";
import { RealtimeChannel } from "@supabase/supabase-js";
import { updateUserPresence } from "@/app/lib/actions";

const usePresence = (channelName: string) => {
  const { user } = useUser();
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    const presenceChannel = supabase.channel(channelName, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const newState = presenceChannel.presenceState();
        const userIds = Object.keys(newState);
        setOnlineUsers(userIds);
      })
      .on("presence", { event: "join" }, ({ key }) => {
        setOnlineUsers((prev) => [...prev, key]);
      })
      .on("presence", { event: "leave" }, ({ key }) => {
        setOnlineUsers((prev) => prev.filter((id) => id !== key));
      });

    presenceChannel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        await presenceChannel.track({
          user_id: user.id,
          online_at: new Date().toISOString(),
        });
        await updateUserPresence();
      }
    });

    setChannel(presenceChannel);

    const interval = setInterval(() => {
      updateUserPresence();
    }, 10000); // every 10 seconds

    return () => {
      clearInterval(interval);
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user, channelName]);

  return { onlineUsers };
};

export default usePresence;
