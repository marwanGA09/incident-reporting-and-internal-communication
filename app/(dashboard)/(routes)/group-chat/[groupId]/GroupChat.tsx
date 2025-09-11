"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import {
  deleteGroupMessage,
  getGroupMessages,
  sendGroupMessage,
  updateGroupMessage,
} from "@/app/lib/actions";
import {
  CheckCheckIcon,
  Edit3Icon,
  FileIcon,
  MoreHorizontalIcon,
  PaperclipIcon,
  SendIcon,
  XIcon,
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GroupMessage, GroupMessageAttachment } from "@prisma/client";
import Image from "next/image";
import logger from "@/app/lib/logger";
import { uploadFile } from "@/lib/uploadFile";
import { PendingAttachment } from "@/lib/defination";
import { Input } from "@/components/ui/input";

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
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [page, setPage] = useState(1);
  const [editingMessage, setEditingMessage] = useState<GroupMessage | null>(
    null
  );
  const [editedText, setEditedText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const scrollRef = useRef<HTMLDivElement>(null);

  const roomName = `group-chat:${groupId}`;

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
        const newMessage = payload.payload;
        if (newMessage.departmentId === groupId) {
          setMessages((prev) => [...prev, { ...newMessage, status: "sent" }]);
        }
      })
      .on("broadcast", { event: "UpdateGroupMessage" }, (payload) => {
        const updatedMessage = payload.payload;
        // console.log(
        //   "FROM BROADCAST",
        //   updatedMessage.updatedAt,
        //   updatedMessage.createdAt
        // );
        if (updatedMessage.departmentId === groupId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id ? updatedMessage : msg
            )
          );
        }
      })
      .on("broadcast", { event: "DeleteGroupMessage" }, (payload) => {
        const { id } = payload.payload;
        // console.log({ id });
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      })
      .subscribe(() => {
        // console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, user?.id, page, roomName]);

  const findUser = (userId: string) => {
    return (
      users.find((u) => u.id === userId) || {
        name: "Unknown User",
        imageUrl: "",
      }
    );
  };

  const handleSend = async () => {
    // console.log("Sending message:", messageText);
    if ((!messageText.trim() && selectedFiles.length === 0) || !user) return;

    const tempId = crypto.randomUUID();
    const timestamp = new Date();

    // 1. Upload attachments
    let attachments: PendingAttachment[] = [];
    try {
      attachments = await Promise.all(
        selectedFiles.map((f) => uploadFile("group-messages", f, user.id))
      );
    } catch (err) {
      logger.error(err, "File upload failed");
      return;
    }

    const tempMessage: GroupMessage & {
      status: string;
      attachments: PendingAttachment[];
    } = {
      id: tempId,
      senderId: user.id,
      text: messageText,
      departmentId: groupId,
      roomName,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "pending",
      attachments,
    };

    // 1. Optimistically show in UI as pending
    setMessages((prev) => [...prev, tempMessage]);
    setMessageText("");
    setSelectedFiles([]);

    try {
      // 2. Store in DB using your existing backend function
      const newMessage = await sendGroupMessage({
        text: messageText,
        departmentId: groupId,
        senderId: user.id,
        roomName,
        attachments,
      });

      // 3. If saved successfully, broadcast to other clients
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "group-message",
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

  const handleEdit = (msg: GroupMessage) => {
    setEditingMessage(msg);
    setEditedText(msg?.text || "");
  };

  const handleDelete = async (id: string) => {
    try {
      // You need to implement this backend logic
      await deleteGroupMessage(id); // Your API
      // console.log({ deletedThing });
      setMessages((prev) => prev.filter((m) => m.id !== id));

      //  If deleted successfully, broadcast to other clients
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "DeleteGroupMessage",
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

      const dbUpdatedMessage = await updateGroupMessage(
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
        event: "UpdateGroupMessage",
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
    if (scrollRef.current) {
      scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // console.log("SCROLL REF", scrollRef);
  }, [messages]);

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
            {/* PrismaGroupMessage & {
  status?: "pending" | "sent" | "error";
  errorMsg?: string;
}; */}
            {messages.map(
              (
                msg: GroupMessage & {
                  status?: "pending" | "sent" | "error";
                  errorMsg?: string;
                  attachments?: GroupMessageAttachment[];
                },
                idx
              ) => {
                const isOwn = msg.senderId === user?.id;
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

                const currentUser = findUser(msg.senderId);
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
                      {!isOwn && (
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
                          {currentUser.imageUrl ? (
                            <Image
                              src={currentUser.imageUrl}
                              alt={currentUser.name}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-400 text-white flex items-center justify-center text-xs font-semibold">
                              {currentUser.name?.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}
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
                        <span className="text-xs opacity-70">
                          {isOwn ? "You" : currentUser.name}
                        </span>

                        {isOwn ? (
                          <div className="relative">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="absolute -top-6 -right-2 h-6 w-6 p-0"
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
                        {/* <span className="text-xs opacity-50 self-end">
                        {`${
                          isUpdated ? "edited" : ""
                        } ${currentDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}`}
                      </span> */}
                        <span className="text-xs opacity-50 self-end">
                          {`${currentDate.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })} ${isUpdated ? "(edited)" : ""}`}
                        </span>
                        <div>
                          {msg.attachments?.map((att: any) => {
                            return (
                              <div key={att.id} className="mt-2">
                                {att.type === "IMAGE" && (
                                  <Image
                                    src={att.url}
                                    alt={att.fileName || "image"}
                                    width={200}
                                    height={200}
                                    className="rounded-lg"
                                  />
                                )}
                                {att.type === "VIDEO" && (
                                  <video
                                    controls
                                    className="rounded-lg max-w-xs"
                                  >
                                    <source src={att.url} />
                                  </video>
                                )}
                                {att.type === "FILE" && (
                                  <a
                                    href={att.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-blue-500 underline text-sm"
                                  >
                                    {att.fileName || "Download file"}
                                  </a>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              }
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        {/* <div className="mt-4 flex gap-2">
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
        </div> */}{" "}
        <div className="mt-4 flex flex-col gap-2">
          {/* File preview row */}
          {selectedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-lg border p-2 bg-muted">
              {selectedFiles.map((file, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1 rounded-md shadow px-2 py-1"
                >
                  <FileIcon className="h-4 w-4" />
                  <span className="text-xs truncate max-w-[120px]">
                    {file.name}
                  </span>
                  <XIcon
                    className="h-4 w-4 cursor-pointer"
                    onClick={() =>
                      setSelectedFiles((prev) =>
                        prev.filter((_, idx) => idx !== i)
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}

          {/* Input row */}
          {!editingMessage ? (
            <div className="flex items-end gap-2">
              <Textarea
                rows={1}
                placeholder="Type a message..."
                className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm leading-5 shadow-sm"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />

              {/* File picker button */}
              <label htmlFor="file-upload">
                <Button variant="ghost" size="icon" asChild>
                  <PaperclipIcon className="w-5 h-5" />
                </Button>

                <Input
                  id="file-upload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    setSelectedFiles(Array.from(e.target.files));
                  }}
                />
              </label>

              {/* Send button */}
              <Button onClick={handleSend} size="icon">
                <SendIcon />
              </Button>
            </div>
          ) : (
            <div className="flex items-end gap-2">
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
                placeholder="Edit message..."
                className="flex-1 resize-none rounded-xl border px-3 py-2 text-sm leading-5 shadow-sm"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleUpdateMessage();
                  }
                }}
              />
              <Button onClick={handleUpdateMessage} size="icon">
                <SendIcon />
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
