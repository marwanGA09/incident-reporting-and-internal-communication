// app/(dashboard)/chat/[userId]/DirectChat.tsx

"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  deleteDirectMessage,
  getDirectMessages,
  sendDirectMessage,
  updateDirectMessage,
} from "@/app/lib/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DirectMessage } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCheckIcon,
  Edit3Icon,
  MoreHorizontalIcon,
  MoveLeftIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import Image from "next/image";
import logger from "@/app/lib/logger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const [editingMessage, setEditingMessage] = useState<DirectMessage | null>(
    null
  );
  const [editedText, setEditedText] = useState("");

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
        const newMessage = payload.payload;
        setMessages((prev) => [...prev, { ...newMessage, status: "sent" }]);
      })
      .on("broadcast", { event: "UpdateDirectMessage" }, (payload) => {
        const updatedMessage = payload.payload;

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === updatedMessage.id ? updatedMessage : msg
          )
        );
      })
      .on("broadcast", { event: "DeleteDirectMessage" }, (payload) => {
        const { id } = payload.payload;
        // console.log({ id });
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, targetUserId]);

  const handleSend = async () => {
    if (!messageText.trim() || !currentUserId) return;

    const tempId = crypto.randomUUID();
    const timestamp = new Date();

    const tempMessage: DirectMessage & { status: string } = {
      id: tempId,
      senderId: currentUserId,
      text: messageText,
      receiverId: targetUserId,
      roomName,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "pending",
    };

    // 1. Optimistically show in UI as pending
    setMessages((prev) => [...prev, tempMessage]);
    setMessageText("");
    try {
      // 2. Store in DB using your existing backend function

      const newMessage = await sendDirectMessage({
        senderId: currentUserId,
        receiverId: targetUserId,
        text: messageText,
        roomName,
      });

      // 3. If saved successfully, broadcast to other clients
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "direct-message",
        payload: { ...newMessage, status: "sent" },
      });

      // 4. Update message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, status: "sent", id: newMessage.id }
            : msg
        )
      );
    } catch (error) {
      logger.error({ error }, "Send failed:");
      const errorMessage =
        error instanceof Error ? error.message : "Send failed";

      // 5. Update message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                status: "error",
                errorMsg: errorMessage,
              }
            : msg
        )
      );
    }
  };

  const handleEdit = (msg: DirectMessage) => {
    setEditingMessage(msg);
    setEditedText(msg.text);
  };

  const handleDelete = async (id: string) => {
    try {
      // You need to implement this backend logic
      await deleteDirectMessage(id); // Your API
      // console.log({ deletedThing });
      setMessages((prev) => prev.filter((m) => m.id !== id));

      //  If deleted successfully, broadcast to other clients
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "DeleteDirectMessage",
        payload: { id: id },
      });
    } catch (error) {
      logger.error({ error }, "Failed to delete message");
      const errorMessage =
        error instanceof Error ? error.message : "Delete failed";
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === id
            ? {
                ...msg,
                status: "error ",
                errorMsg: errorMessage,
              }
            : msg
        )
      );
    }
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage) return;
    const updatedMessage = {
      ...editingMessage,
      text: editedText,
      updatedAt: new Date(),
    };
    // console.log({ editingMessage, updatedMessage });
    // 1. Optimistically show in UI as pending
    setMessages((prev) =>
      prev.map((msg) => (msg.id === editingMessage.id ? updatedMessage : msg))
    );
    setEditingMessage(null);
    setEditedText("");

    try {
      // 2. Store in DB using your existing backend function

      const dbUpdatedMessage = await updateDirectMessage(
        editingMessage.id,
        editedText
      );
      // console.log(
      //   "DB Updated Message",
      //   dbUpdatedMessage.updatedAt,
      //   dbUpdatedMessage.createdAt
      // );
      // 3. If saved successfully, broadcast to other clients
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "UpdateDirectMessage",
        payload: dbUpdatedMessage,
      });
    } catch (error) {
      logger.error({ error }, "Update failed");
      const errorMessage =
        error instanceof Error ? error.message : "Update failed";
      // 5. Update message with error
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === editingMessage.id
            ? {
                ...msg,
                status: "error",
                errorMsg: errorMessage,
              }
            : msg
        )
      );
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 shadow-xl">
      <CardContent>
        <div className="flex items-center justify-start gap-4 mb-4">
          <MoveLeftIcon />
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300">
              {targetUser.imageUrl ? (
                <Image
                  src={targetUser.imageUrl}
                  alt={targetUser.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold">
                  {targetUser.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm">{targetUser.name}</span>
              <span className="text-xs text-gray-500">last seen recently</span>
              {/* You can make this dynamic later if you implement online presence tracking */}
            </div>
          </div>
          <div className="ml-auto ">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost">
                  <MoreHorizontalIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View Profile</DropdownMenuItem>
                <DropdownMenuItem>Block</DropdownMenuItem>
                <DropdownMenuItem className="text-red-500">
                  Report
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <ScrollArea className="h-96 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {messages.map(
              (
                msg: DirectMessage & {
                  status?: "pending" | "sent" | "error";
                  errorMsg?: string;
                },
                idx
              ) => {
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
                      className={`flex items-end gap-2 px-6 ${
                        isOwn ? "self-end flex-row-reverse" : "self-start"
                      }`}
                    >
                      {/* {!isOwn && (
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                          {targetUser.imageUrl ? (
                            <Image
                              src={targetUser.imageUrl}
                              alt={targetUser.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">
                              {targetUser.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )} */}

                      {/* <div
                        className={`flex flex-col max-w-xs p-2 rounded-lg ${
                          isOwn
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-black"
                        } `}
                      >
                        <span className="text-sm">{msg.text}</span>
                      </div> */}
                      <div
                        className={`flex flex-col max-w-xs p-2 rounded-lg ${
                          isOwn
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-black"
                        } border ${
                          msg.status === "error"
                            ? "border-red-500"
                            : "border-transparent"
                        }`}
                      >
                        {/* <span className="text-xs opacity-70">
                          {isOwn ? "You" : targetUser.name}
                        </span> */}

                        {isOwn ? (
                          <div className="relative">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="absolute -top-2-right-2 h-6 w-6 p-0"
                                >
                                  <MoreHorizontalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(msg)}
                                >
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(msg.id)}
                                  className="text-red-500"
                                >
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <span className="whitespace-pre-wrap">
                              {msg.text}
                            </span>
                          </div>
                        ) : (
                          <span className="whitespace-pre-wrap">
                            {msg.text}
                          </span>
                        )}

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
                          <span className="text-xs text-green-500">
                            <CheckCheckIcon className="w-4 h-4" />
                          </span>
                        )}

                        <span className="text-xs opacity-50 self-end">
                          {`${currentDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })} ${isUpdated ? "(edited)" : ""}`}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              }
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>{" "}
        {/* <div className="mt-4 flex gap-2">
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
        </div> */}
        <div className="mt-4 flex gap-2">
          {!editingMessage ? (
            <>
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
              />
              <Button onClick={handleSend}>
                <SendIcon />
              </Button>
            </>
          ) : (
            <>
              {" "}
              <div className="flex flex-col justify-between items-center py-1">
                <Edit3Icon />
                <XIcon
                  className="cursor-pointer"
                  onClick={() => {
                    setEditingMessage(null);
                    setEditedText("");
                  }}
                />
              </div>
              <Textarea
                rows={1}
                placeholder="Type a message..."
                className="flex-1 resize-none rounded-xl border border-gray-300  px-4 py-2 text-sm leading-5 shadow-sm "
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleUpdateMessage();
                  }
                }}
              />
              <Button onClick={handleUpdateMessage}>
                <SendIcon />
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
