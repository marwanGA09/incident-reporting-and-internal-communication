"use client";

import { useUser } from "@clerk/nextjs";
import React, { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
  deleteDirectMessage,
  getDirectMessages,
  markNotificationsAsRead,
  sendDirectMessage,
  updateDirectMessage,
} from "@/app/lib/actions";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DirectMessage, DirectMessageAttachment } from "@prisma/client";
import {
  CheckCheckIcon,
  Edit3Icon,
  FileIcon,
  MoreHorizontalIcon,
  MoveLeftIcon,
  NotebookIcon,
  PaperclipIcon,
  SendIcon,
  XIcon,
  PlayIcon,
} from "lucide-react";
import Image from "next/image";
import logger from "@/app/lib/logger";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { uploadFile } from "@/lib/uploadFile";
import { Input } from "@/components/ui/input";
import { PendingAttachment } from "@/lib/defination";
import { cn } from "@/lib/utils";
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
import { Dialog, DialogContent } from "@/components/ui/dialog";
import usePresence from "@/hooks/use-presence";

interface ExtendedDirectMessage extends DirectMessage {
  status?: "pending" | "sent" | "error";
  errorMsg?: string;
  attachments?: DirectMessageAttachment[];
}

// Helper function for date formatting
const isSameDay = (d1: Date, d2: Date) => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};

const formatDateForDisplay = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return "Today";
  }
  if (isSameDay(date, yesterday)) {
    return "Yesterday";
  }
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
};

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
  const { onlineUsers } = usePresence("direct-chat");
  const [messages, setMessages] = useState<ExtendedDirectMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [editingMessage, setEditingMessage] =
    useState<ExtendedDirectMessage | null>(null);
  const [editedText, setEditedText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [messageToDeleteId, setMessageToDeleteId] = useState<string | null>(
    null
  );
  const [pendingAttachments, setPendingAttachments] = useState<
    PendingAttachment[]
  >([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<string | null>(null);

  const isOnline = onlineUsers.includes(targetUser.id);

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaContainerRef = useRef<HTMLDivElement>(null);

  const currentUserId = user?.id;
  const targetUserId = targetUser.id;

  const roomName = `direct-chat:${[currentUserId, targetUserId]
    .sort()
    .join("-")}`;

  useEffect(() => {
    if (!currentUserId || !targetUserId) return;

    getDirectMessages(currentUserId, targetUserId).then(setMessages);
    const directChannel = supabase.channel(roomName, {
      config: { presence: { key: currentUserId } },
    });
    const notificationChannel = supabase.channel(roomName, {
      config: { presence: { key: currentUserId } },
    });
    console.log({ directChannel, notificationChannel });
    directChannel
      .on("broadcast", { event: "direct-message" }, (payload) => {
        const newMessage = payload.payload;
        setMessages((prev) => [...prev, { ...newMessage, status: "sent" }]);
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
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
        setMessages((prev) => prev.filter((msg) => msg.id !== id));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(directChannel);
      supabase.removeChannel(notificationChannel);
    };
  }, [currentUserId, targetUserId, roomName]);

  const handleSend = async () => {
    if ((!messageText.trim() && selectedFiles.length === 0) || !currentUserId)
      return;

    const tempId = crypto.randomUUID();
    const timestamp = new Date();

    // 1. Optimistically show in UI as pending
    const tempMessage: ExtendedDirectMessage = {
      id: tempId,
      senderId: currentUserId,
      text: messageText || null,
      receiverId: targetUserId,
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
        selectedFiles.map((f) =>
          uploadFile("direct-messages", f, currentUserId)
        )
      );
    } catch (err) {
      logger.error(err, "File upload failed");
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? ({
                ...msg,
                status: "error",
                errorMsg: "File upload failed",
              } as ExtendedDirectMessage)
            : msg
        )
      );
      return;
    }

    setMessageText("");
    setSelectedFiles([]);
    setPendingAttachments([]);

    try {
      const { newMessage, notification } = await sendDirectMessage({
        senderId: currentUserId,
        receiverId: targetUserId,
        text: messageText || undefined,
        roomName,
        attachments,
      });

      supabase.channel(roomName).send({
        type: "broadcast",
        event: "direct-message",
        payload: { ...newMessage, status: "sent" },
      });

      supabase.channel("NOTIFICATION").send({
        type: "broadcast",
        event: "new-notification",
        payload: notification,
      });

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? ({
                ...msg,
                status: "sent",
                id: newMessage.id,
                attachments: newMessage.attachments,
              } as ExtendedDirectMessage)
            : msg
        )
      );
    } catch (error) {
      logger.error({ error }, "Send failed:");
      const errorMessage =
        error instanceof Error ? error.message : "Send failed";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? ({
                ...msg,
                status: "error",
                errorMsg: errorMessage,
              } as ExtendedDirectMessage)
            : msg
        )
      );
    }
  };

  const handleEdit = (msg: ExtendedDirectMessage) => {
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
      await deleteDirectMessage(messageToDeleteId);
      setMessages((prev) => prev.filter((m) => m.id !== messageToDeleteId));
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "DeleteDirectMessage",
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
      const dbUpdatedMessage = await updateDirectMessage(
        editingMessage.id,
        editedText
      );
      supabase.channel(roomName).send({
        type: "broadcast",
        event: "UpdateDirectMessage",
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
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Header - preserved from DirectChat */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-start gap-4">
          <MoveLeftIcon />
          <div className="flex items-center gap-3">
            {user?.id === targetUserId ? (
              <>
                <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex justify-center items-center">
                  <NotebookIcon />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">Saved Message</span>
                </div>
              </>
            ) : (
              <>
                {" "}
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
                      {targetUser.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm">
                    {targetUser.username || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </>
            )}
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
      </div>

      {/* Message Area */}
      <ScrollArea
        ref={scrollAreaContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-1 h-[60vh]"
      >
        {messages.map((msg, idx) => {
          const isOwn = msg.senderId === currentUserId;
          const prevMsg = messages[idx - 1];
          const msgDate = new Date(msg.createdAt);
          const prevMsgDate = prevMsg ? new Date(prevMsg.createdAt) : null;

          let showDateSeparator = false;
          if (!prevMsgDate) {
            showDateSeparator = true;
          } else {
            showDateSeparator = !isSameDay(msgDate, prevMsgDate);
          }

          const isGrouped =
            prevMsg &&
            prevMsg.senderId === msg.senderId &&
            new Date(msg.createdAt).getTime() -
              new Date(prevMsg.createdAt).getTime() <
              5 * 60 * 1000 &&
            prevMsgDate !== null && // Ensure prevMsgDate is not null
            isSameDay(msgDate, prevMsgDate);

          return (
            <React.Fragment key={msg.id}>
              {showDateSeparator && (
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      {formatDateForDisplay(msgDate)}
                    </span>
                  </div>
                </div>
              )}
              <div
                className={cn(
                  "flex items-start gap-3",
                  isOwn && "justify-end",
                  isGrouped && "mt-1"
                )}
              >
                <div className={cn("flex flex-col", isOwn && "items-end")}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div
                        className={cn(
                          "relative max-w-xs md:max-w-md px-3 py-2 rounded-xl cursor-pointer mt-1",
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-none"
                            : "bg-muted rounded-bl-none"
                        )}
                      >
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                        {msg.attachments && msg.attachments.length > 0 && (
                          <div className="flex flex-col gap-2 mt-2">
                            {msg.attachments.map((attachment) => (
                              <div key={attachment.id}>
                                {attachment.type === "IMAGE" ? (
                                  <Image
                                    src={attachment.url}
                                    alt={attachment.fileName || "Attachment"}
                                    width={200}
                                    height={200}
                                    className="rounded-md cursor-pointer"
                                    onClick={() => {
                                      setCurrentImage(attachment.url);
                                      setShowImageModal(true);
                                    }}
                                  />
                                ) : attachment.type === "VIDEO" ? (
                                  <div
                                    onClick={() => {
                                      setCurrentVideo(attachment.url);
                                      setShowVideoModal(true);
                                    }}
                                    className="relative block rounded-md overflow-hidden cursor-pointer"
                                  >
                                    <video
                                      src={attachment.url}
                                      controls={false}
                                      preload="metadata"
                                      className="w-full h-auto max-h-[200px] object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-md">
                                      <PlayIcon className="w-8 h-8 text-white" />
                                    </div>
                                  </div>
                                ) : (
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 bg-background p-1 rounded-md text-sm hover:underline"
                                  >
                                    <FileIcon className="w-4 h-4" />
                                    <span className="truncate max-w-[100px]">
                                      {attachment.fileName || "File"}
                                    </span>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {" "}
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
                          {msg.updatedAt &&
                            new Date(msg.updatedAt).getTime() !==
                              new Date(msg.createdAt).getTime() && (
                              <span className="text-xs opacity-50 ml-1">
                                (Edited)
                              </span>
                            )}
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
            </React.Fragment>
          );
        })}
        <div ref={scrollRef} />
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
            {pendingAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 border-t border-b bg-secondary/20">
                {pendingAttachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 bg-secondary rounded-md p-1"
                  >
                    {attachment.type === "IMAGE" ||
                    attachment.type === "VIDEO" ? (
                      <Image
                        src={attachment.url}
                        alt={attachment.fileName}
                        width={24}
                        height={24}
                        className="rounded"
                      />
                    ) : (
                      <FileIcon className="w-4 h-4" />
                    )}
                    <span className="text-sm truncate max-w-[100px]">
                      {attachment.fileName}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-5 h-5"
                      onClick={() => {
                        const newSelectedFiles = selectedFiles.filter(
                          (_, i) => i !== index
                        );
                        setSelectedFiles(newSelectedFiles);
                        setPendingAttachments(
                          pendingAttachments.filter((_, i) => i !== index)
                        );
                      }}
                    >
                      <XIcon className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            <Textarea
              rows={1}
              placeholder={`Message ${targetUser.username || targetUser.name}`}
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
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-4">
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
                    const files = Array.from(e.target.files);
                    setSelectedFiles(files);
                    setPendingAttachments(
                      files.map((file) => ({
                        fileName: file.name,
                        type: file.type.startsWith("image/")
                          ? "IMAGE"
                          : file.type.startsWith("video/")
                          ? "VIDEO"
                          : "FILE",
                        url: URL.createObjectURL(file),
                      }))
                    );
                  }}
                />
              </label>
              <Button onClick={handleSend} size="icon">
                <SendIcon className=" w-5 h-5" />
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

      {/* Image Modal */}
      <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
        <DialogContent className="max-w-3xl">
          {currentImage && (
            <Image
              src={currentImage}
              alt="Full size image"
              layout="responsive"
              width={1000}
              height={1000}
              objectFit="contain"
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Video Modal */}
      <Dialog open={showVideoModal} onOpenChange={setShowVideoModal}>
        <DialogContent className="max-w-3xl">
          {currentVideo && (
            <video controls width="100%" src={currentVideo}>
              Your browser does not support the video tag.
            </video>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
