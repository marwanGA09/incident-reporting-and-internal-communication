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
  markNotificationsAsRead,
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
import {
  Department,
  GroupMessage,
  GroupMessageAttachment,
} from "@prisma/client";
import Image from "next/image";
import logger from "@/app/lib/logger";
import { uploadFile } from "@/lib/uploadFile";
import { PendingAttachment } from "@/lib/defination";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

interface ExtendedGroupMessage extends GroupMessage {
  status?: "pending" | "sent" | "error";
  errorMsg?: string;
  attachments?: GroupMessageAttachment[];
}

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import { toast } from "sonner";

export default function GroupChat({
  department,
  users,
}: {
  department: Department;
  users: {
    name: string;
    id: string;
    imageUrl?: string;
    username?: string;
    email?: string;
  }[];
}) {
  const { user } = useUser();
  const [messages, setMessages] = useState<ExtendedGroupMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [page, setPage] = useState(1);
  const [editingMessage, setEditingMessage] =
    useState<ExtendedGroupMessage | null>(null);
  const [editedText, setEditedText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDeleteId, setMessageToDeleteId] = useState<string | null>(
    null
  );

  const scrollRef = useRef<HTMLDivElement>(null);
  const groupId = department.id;
  const roomName = `group-chat:${groupId}`;

  useEffect(() => {
    if (!groupId || !user?.id) return;

    markNotificationsAsRead(`/group-chat/${groupId}`);

    async function loadMessages() {
      const msgs = await getGroupMessages(groupId, page);
      setMessages(msgs.map((msg) => ({ ...msg, status: "sent" })));
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
        if (updatedMessage.departmentId === groupId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id
                ? { ...updatedMessage, status: "sent" }
                : msg
            )
          );
        }
      })
      .on("broadcast", { event: "DeleteGroupMessage" }, (payload) => {
        const { id } = payload.payload;
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      })
      .subscribe();

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
    if ((!messageText.trim() && selectedFiles.length === 0) || !user) return;

    const tempId = crypto.randomUUID();
    const timestamp = new Date();

    // 1. Optimistically show in UI as pending
    const tempMessage: ExtendedGroupMessage = {
      id: tempId,
      senderId: user.id,
      text: messageText,
      departmentId: groupId,
      roomName,
      createdAt: timestamp,
      updatedAt: timestamp,
      status: "pending",
      attachments: [], // Placeholder, actual attachments uploaded later
    };
    setMessages((prev) => [...prev, tempMessage]);

    // 2. Upload attachments
    let attachments: PendingAttachment[] = [];
    try {
      attachments = await Promise.all(
        selectedFiles.map((f) => uploadFile("group-messages", f, user.id))
      );
    } catch (err) {
      logger.error(err, "File upload failed");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? { ...msg, status: "error", errorMsg: "File upload failed" }
            : msg
        )
      );
      return;
    }

    setMessageText("");
    setSelectedFiles([]);

    try {
      // 3. Store in DB using your existing backend function
      const { newGroupMessage, notifications } = await sendGroupMessage({
        text: messageText,
        departmentId: groupId,
        senderId: user.id,
        roomName,
        attachments,
      });

      // 4. If saved successfully, broadcast to other clients
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "group-message",
        payload: { ...newGroupMessage, status: "sent" },
      });

      // Broadcast notifications to relevant recipients
      if (notifications && notifications.length > 0) {
        for (const notification of notifications) {
          supabase.channel("NOTIFICATION").send({
            type: "broadcast",
            event: "new-notification",
            payload: notification,
          });
        }
      }

      // 5. Update message status to sent
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                status: "sent",
                id: newGroupMessage.id,
                attachments: newGroupMessage.attachments,
              }
            : msg
        )
      );
    } catch (error) {
      logger.error({ error }, "Send failed:");
      const errorMessage =
        error instanceof Error ? error.message : "Send failed";

      // 6. Update message with error
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

  const handleEdit = (msg: ExtendedGroupMessage) => {
    setEditingMessage(msg);
    setEditedText(msg?.text || "");
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setEditedText("");
  };

  const confirmDelete = async () => {
    if (!messageToDeleteId) return;
    try {
      await deleteGroupMessage(messageToDeleteId);
      setMessages((prev) => prev.filter((m) => m.id !== messageToDeleteId));
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "DeleteGroupMessage",
        payload: { id: messageToDeleteId },
      });
    } catch (error) {
      logger.error({ error }, "Failed to delete message");
    } finally {
      setShowDeleteDialog(false);
      setMessageToDeleteId(null);
    }
  };

  const handleDeleteClick = (id: string) => {
    setMessageToDeleteId(id);
    setShowDeleteDialog(true);
  };

  const handleUpdateMessage = async () => {
    if (!editingMessage) return;
    const updatedMessage = {
      ...editingMessage,
      text: editedText,
      updatedAt: new Date(),
    };
    setMessages((prev) =>
      prev.map((msg) => (msg.id === editingMessage.id ? updatedMessage : msg))
    );
    setEditingMessage(null);
    setEditedText("");

    try {
      const dbUpdatedMessage = await updateGroupMessage(
        editingMessage.id,
        editedText
      );
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "UpdateGroupMessage",
        payload: dbUpdatedMessage,
      });
    } catch (error) {
      logger.error({ error }, "Update failed");
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold"># {department.name}</h2>
      </div>

      {/* Message Area */}
      <ScrollArea>
        <div className="flex-1 overflow-y-auto p-4 space-y-1 h-[60vh]">
          {messages.map((msg, idx) => {
            const isOwn = msg.senderId === user?.id;
            const prevMsg = messages[idx - 1];
            const isGrouped =
              prevMsg &&
              prevMsg.senderId === msg.senderId &&
              new Date(msg.createdAt).getTime() -
                new Date(prevMsg.createdAt).getTime() <
                5 * 60 * 1000; // 5 minutes threshold

            const currentUser = findUser(msg.senderId);

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-start gap-3",
                  isOwn && "justify-end",
                  isGrouped && "mt-1"
                )}
              >
                {!isOwn && (
                  <div className="w-8 h-8 rounded-full overflow-hidden border flex-shrink-0">
                    {isGrouped ? (
                      <div className="w-8" />
                    ) : currentUser.imageUrl ? (
                      <Image
                        src={currentUser.imageUrl}
                        alt={currentUser.name}
                        width={32}
                        height={32}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold">
                        {currentUser.name?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                )}
                <div className={cn("flex flex-col", isOwn && "items-end")}>
                  {!isGrouped && !isOwn && (
                    <p className="text-xs text-muted-foreground mb-0.5 ml-2">
                      {currentUser.name}
                    </p>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div
                        className={cn(
                          "relative max-w-xs md:max-w-md px-3 py-2 rounded-xl cursor-pointer",
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {msg.status === "pending" && (
                            <span className="text-xs text-muted-foreground">
                              Sending...
                            </span>
                          )}
                          {msg.status === "error" && (
                            <span className="text-xs text-red-500">Failed</span>
                          )}
                          {isOwn && msg.status === "sent" && (
                            <CheckCheckIcon className="w-4 h-4 text-blue-500" />
                          )}
                          <p className="text-xs opacity-70">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuTrigger>
                    {isOwn && (
                      <DropdownMenuContent align={isOwn ? "end" : "start"}>
                        <DropdownMenuItem onClick={() => handleEdit(msg)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(msg.id)}
                          className="text-red-500"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    )}
                  </DropdownMenu>
                </div>
              </div>
            );
          })}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      {/* Input Area */}
      <div className="p-2 border-t bg-background">
        {editingMessage ? (
          <div className="flex flex-col gap-2">
            <Textarea
              rows={1}
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleUpdateMessage();
                }
              }}
              placeholder="Edit your message"
              className="pr-24 resize-none"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={handleCancelEdit}>
                Cancel
              </Button>
              <Button onClick={handleUpdateMessage}>Save</Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <Textarea
              rows={1}
              placeholder={`Message #${department.name}`}
              className="pr-24 resize-none"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center">
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
              <Button onClick={handleSend} size="icon">
                <SendIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
