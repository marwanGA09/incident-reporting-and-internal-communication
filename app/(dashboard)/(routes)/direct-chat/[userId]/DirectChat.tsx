// app/(dashboard)/chat/[userId]/DirectChat.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { getDirectMessages, sendDirectMessage } from "@/app/lib/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DirectMessage } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import { SendIcon } from "lucide-react";

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
            {messages.map((msg, idx) => {
              // console.log({ msg });
              const isOwn = msg.senderId === currentUserId;
              const isUpdated =
                new Date(msg.updatedAt).getTime() >
                new Date(msg.createdAt).getTime();
              const currentDate = isUpdated
                ? new Date(msg.updatedAt)
                : new Date(msg.createdAt);
              const prevDate =
                idx > 0 ? new Date(messages[idx - 1].createdAt) : null;

              const showDateSeparator =
                !prevDate ||
                currentDate.getDate() !== prevDate.getDate() ||
                currentDate.getMonth() !== prevDate.getMonth() ||
                currentDate.getFullYear() !== prevDate.getFullYear();

              const dateOptions: Intl.DateTimeFormatOptions = {
                month: "long",
                day: "numeric",
              };

              if (currentDate.getFullYear() !== new Date().getFullYear()) {
                dateOptions.year = "numeric";
              }

              const formattedDate = currentDate.toLocaleDateString(
                undefined,
                dateOptions
              );

              return (
                <React.Fragment key={msg.id}>
                  {showDateSeparator && (
                    <div className="self-center text-xs text-gray-400 font-semibold py-2">
                      {formattedDate}
                    </div>
                  )}
                  <div
                    key={msg.id}
                    className={`flex items-end gap-2 px-6 ${
                      isOwn ? "self-end flex-row-reverse" : "self-start"
                    }`}
                  >
                    <div
                      className={`flex flex-col max-w-xs p-2 rounded-lg ${
                        isOwn
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-black"
                      } `}
                    >
                      <span className="text-sm">{msg.text}</span>
                    </div>

                    {/* <div className="bg-gray-200 p-2 rounded-lg max-w-xs">
                  </div> */}
                  </div>
                </React.Fragment>
              );
            })}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>{" "}
        <div className="mt-4 flex gap-2">
          <Textarea
            rows={1}
            placeholder="Type a message..."
            className="flex-1 resize-none rounded-xl border border-gray-300  px-4 py-2 text-sm leading-5 shadow-sm "
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />{" "}
          <Button onClick={handleSend}>
            <SendIcon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
