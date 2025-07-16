"use client";
import { useEffect, useState } from "react";
import AblyChat from "@ably/chat";

export function useAblyChatClient() {
  const [client, setClient] = useState<typeof AblyChat | null>(null);

  useEffect(() => {
    async function init() {
      const res = await fetch("/api/ably-token");
      const tokenRequest = await res.json();
      const chatClient = await AblyChat.create({ tokenRequest });
      setClient(chatClient);
    }

    init();
  }, []);

  return client;
}
