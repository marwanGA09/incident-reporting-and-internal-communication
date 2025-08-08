// app/(dashboard)/chat/[userId]/DirectChat.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getDirectMessages, sendDirectMessage } from "@/app/lib/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DirectMessage } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";

export default function DirectChat({
  targetUser,
}: {
  targetUser: {
    name: string;
    id: string;
    imageUrl?: string;
    username?: string;
    email?: string;
  };
}) {
  const { user } = useUser();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?.id;
  const targetUserId = targetUser.id;

  const roomName = `direct-chat:${[currentUserId, targetUserId]
    .sort()
    .join("-")}`;

  useEffect(() => {
    if (!currentUserId || !targetUserId) return;

    getDirectMessages(currentUserId, targetUserId).then(setMessages);

    const channel = supabase.channel(roomName, {
      config: { presence: { key: currentUserId } },
    });

    channel
      .on("broadcast", { event: "direct-message" }, (payload) => {
        setMessages((prev) => [...prev, payload.payload]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, targetUserId]);

  const handleSend = async () => {
    if (!messageText.trim() || !currentUserId) return;

    const newMessage = await sendDirectMessage({
      senderId: currentUserId,
      recipientId: targetUserId,
      text: messageText,
      roomName,
    });

    setMessageText("");

    supabase.channel(roomName).send({
      type: "broadcast",
      event: "direct-message",
      payload: newMessage,
    });

    setMessages((prev) => [...prev, newMessage]);
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 shadow-xl">
      <CardContent>
        <ScrollArea className="h-96 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`self-${
                  msg.senderId === currentUserId ? "end" : "start"
                }`}
              >
                <div className="bg-gray-200 p-2 rounded-lg max-w-xs">
                  <span className="text-sm">{msg.text}</span>
                </div>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
          <div className="mt-4 flex gap-2">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              rows={1}
              placeholder="Type a message..."
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
