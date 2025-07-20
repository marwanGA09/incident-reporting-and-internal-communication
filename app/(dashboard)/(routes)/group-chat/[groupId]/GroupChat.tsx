"use client";

import { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getGroupMessages, sendGroupMessage } from "@/app/lib/actions";
import { useRouter } from "next/navigation";

export default function GroupChat({ groupId }: { groupId: string }) {
  const { user } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const roomName = `group-chat:${groupId}`;
  useEffect(() => {
    if (!groupId) return;

    async function loadMessages() {
      const msgs = await getGroupMessages(groupId);
      setMessages(msgs);
    }

    loadMessages();

    const channel = supabase.channel(roomName, {
      config: {
        presence: { key: user?.id || "anon" },
      },
    });

    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "GroupMessage" },
        (payload) => {
          if (payload.new.departmentId === groupId) {
            setMessages((prev) => [...prev, payload.new]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user?.id]);

  const handleSend = async () => {
    if (!messageText.trim() || !user) return;
    await sendGroupMessage({
      text: messageText,
      departmentId: groupId,
      senderId: user.id,
      roomName,
    });
    setMessageText("");
    router.refresh();
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 shadow-xl">
      <CardContent>
        <ScrollArea className="h-96 overflow-y-auto">
          <div className="space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <span className="text-sm font-semibold">{msg.senderId}</span>
                <span>{msg.text}</span>
              </div>
            ))}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <Button onClick={handleSend}>Send</Button>
        </div>
      </CardContent>
    </Card>
  );
}
