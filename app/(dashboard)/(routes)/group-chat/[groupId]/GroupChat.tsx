"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getGroupMessages, sendGroupMessage } from "@/app/lib/actions";
import { CheckCheckIcon, SendIcon } from "lucide-react";
// import { v4 as uuidv4 } from "uuid";

export default function GroupChat({
  groupId,
  users,
}: {
  groupId: string;
  users: {
    name: string;
    id: string;
    imageUrl?: string;
    username?: string;
    email?: string;
  }[];
}) {
  const { user } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const [page, setPage] = useState(1);

  const scrollRef = useRef<HTMLDivElement>(null);

  const roomName = `group-chat:${groupId}`;

  const findUser = (userId: string) => {
    return (
      users.find((u) => u.id === userId) || {
        name: "Unknown User",
        imageUrl: "",
      }
    );
  };

  useEffect(() => {
    if (!groupId || !user?.id) return;

    async function loadMessages() {
      const msgs = await getGroupMessages(groupId, page);
      setMessages(msgs);
    }
    loadMessages();

    const channel = supabase.channel(roomName, {
      config: { presence: { key: user.id } },
    });

    channel
      .on("broadcast", { event: "group-message" }, (payload) => {
        console.log("New message received:", payload);
        const newMessage = payload.payload;
        if (newMessage.departmentId === groupId) {
          setMessages((prev) => [...prev, { ...newMessage, status: "sent" }]);
        }
      })
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user?.id]);

  const handleSend = async () => {
    if (!messageText.trim() || !user) return;

    const tempId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const tempMessage = {
      id: tempId,
      senderId: user.id,
      text: messageText,
      departmentId: groupId,
      createdAt: timestamp,
      status: "pending",
    };

    // 1. Optimistically show in UI as pending
    setMessages((prev) => [...prev, tempMessage]);
    setMessageText("");

    try {
      // 2. Store in DB using your existing backend function
      await sendGroupMessage({
        text: messageText,
        departmentId: groupId,
        senderId: user.id,
        roomName,
      });

      // 3. If saved successfully, broadcast to other clients
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "group-message",
        payload: { ...tempMessage, status: "sent" },
      });

      // 4. Update message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, status: "sent" } : msg
        )
      );
    } catch (error: any) {
      console.error("Send failed:", error);

      // 5. Update message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                status: "error",
                errorMsg: error?.message || "Send failed",
              }
            : msg
        )
      );
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    console.log("SCROLL REF", scrollRef);
  }, [messages]);

  const totalMessages = messages.length;
  console.log("Total messages:", totalMessages);
  return (
    <Card className="w-full max-w-2xl mx-auto p-4 shadow-xl">
      <CardContent>
        <ScrollArea className="h-96 overflow-y-auto">
          <div className="flex justify-center">
            <span
              onClick={() => {
                setPage((prev) => prev + 1);
                getGroupMessages(groupId, page + 1).then((newMessages) => {
                  setMessages((prev) => [...newMessages.reverse(), ...prev]);
                });
              }}
              className="border-0  self-center text-xs text-gray-400 font-semibold py-2 cursor-pointer"
            >
              more
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {messages.map((msg, idx) => {
              if (idx === totalMessages - 1 && totalMessages > 10) {
                console.log({ idx });
              }
              const isOwn = msg.senderId === user?.id;
              const currentDate = new Date(msg.createdAt);
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
                    className={`flex flex-col max-w-xs p-2 rounded-lg ${
                      isOwn
                        ? "self-end bg-blue-500 text-white"
                        : "self-start bg-gray-200 text-black"
                    } border ${
                      msg.status === "error"
                        ? "border-red-500"
                        : "border-transparent"
                    }`}
                  >
                    <span className="text-xs opacity-70">
                      {isOwn ? "You" : findUser(msg.senderId).name}
                    </span>
                    <span>{msg.text}</span>
                    {msg.status === "pending" && (
                      <span className="text-xs text-yellow-400">
                        Sending...
                      </span>
                    )}
                    {msg.status === "error" && (
                      <span className="text-xs text-red-500">
                        Failed to send
                      </span>
                    )}
                    {isOwn && msg.status === "sent" && (
                      <span className="text-xs text-green-500 ">
                        <CheckCheckIcon className="w-4 h-4" />
                      </span>
                    )}
                    <span className="text-xs opacity-50 self-end">
                      {currentDate.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
            {totalMessages <= 10 && <div ref={scrollRef} />}
          </div>
        </ScrollArea>
        <div className="mt-4 flex gap-2">
          <Input
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
          />
          <Button onClick={handleSend}>
            <SendIcon />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
