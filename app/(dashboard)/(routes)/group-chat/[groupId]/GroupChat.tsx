"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  FileIcon,
  PaperclipIcon,
  SendIcon,
  XIcon,
  PlayIcon,
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import GroupMembers from "./GroupMembers";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UsersIcon } from "lucide-react";

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
// import { DialogTitle } from "@radix-ui/react-dialog";
// import { toast } from "sonner";

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
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<ExtendedGroupMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [editingMessage, setEditingMessage] =
    useState<ExtendedGroupMessage | null>(null);
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaContainerRef = useRef<HTMLDivElement>(null); // Ref for the ScrollArea component itself
  const groupId = department.id;
  const roomName = `group-chat:${groupId}`;

  // Initial message load and real-time updates
  useEffect(() => {
    if (!groupId || !user?.id) return;

    markNotificationsAsRead(`/group-chat/${groupId}`);

    async function loadInitialMessages() {
      setIsLoadingMore(true);
      const newMsgs = await getGroupMessages(groupId, 1); // Load first page
      setMessages(
        newMsgs.map(
          (msg) => ({ ...msg, status: "sent" } as ExtendedGroupMessage)
        )
      );
      setHasMoreMessages(newMsgs.length === 20); // Assuming 20 messages per page
      setIsLoadingMore(false);
      // Scroll to bottom after initial load
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: "instant" }); // Use instant for initial load
      }
    }
    loadInitialMessages();

    const channel = supabase.channel(roomName, {
      config: { presence: { key: user.id } },
    });

    channel
      .on("broadcast", { event: "group-message" }, (payload) => {
        const newMessage = payload.payload;
        if (newMessage.departmentId === groupId) {
          setMessages((prev) => [
            ...prev,
            { ...newMessage, status: "sent" } as ExtendedGroupMessage,
          ]);
          // Scroll to bottom for new messages
          scrollRef.current?.scrollIntoView({ behavior: "smooth" });
        }
      })
      .on("broadcast", { event: "UpdateGroupMessage" }, (payload) => {
        const updatedMessage = payload.payload;
        if (updatedMessage.departmentId === groupId) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === updatedMessage.id
                ? ({
                    ...updatedMessage,
                    status: "sent",
                  } as ExtendedGroupMessage)
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
  }, [groupId, user?.id, roomName]);

  // Effect for loading more messages on page change
  useEffect(() => {
    if (page > 1 && hasMoreMessages) {
      async function loadMoreMessages() {
        setIsLoadingMore(true);
        const oldScrollHeight =
          scrollAreaContainerRef.current?.querySelector(
            "[data-radix-scroll-area-viewport]"
          )?.scrollHeight || 0;
        const newMsgs = await getGroupMessages(groupId, page);
        setMessages((prev) => [
          ...newMsgs.map(
            (msg) => ({ ...msg, status: "sent" } as ExtendedGroupMessage)
          ),
          ...prev,
        ]);
        setHasMoreMessages(newMsgs.length === 20);
        setIsLoadingMore(false);

        // Maintain scroll position
        const viewport = scrollAreaContainerRef.current?.querySelector(
          "[data-radix-scroll-area-viewport]"
        );
        if (viewport) {
          const newScrollHeight = viewport.scrollHeight;
          viewport.scrollTop = newScrollHeight - oldScrollHeight;
        }
      }
      loadMoreMessages();
    }
  }, [page, groupId, hasMoreMessages]);

  // Scroll event listener for loading more messages
  useEffect(() => {
    const viewport = scrollAreaContainerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    ) as HTMLDivElement | null;

    if (!viewport) return;

    const handleScroll = () => {
      if (viewport.scrollTop === 0 && hasMoreMessages && !isLoadingMore) {
        setPage((prevPage) => prevPage + 1);
      }
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => {
      viewport.removeEventListener("scroll", handleScroll);
    };
  }, [hasMoreMessages, isLoadingMore]);

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
            ? ({
                ...msg,
                status: "error",
                errorMsg: "File upload failed",
              } as ExtendedGroupMessage)
            : msg
        )
      );
      return;
    }

    setMessageText("");
    setSelectedFiles([]);
    setPendingAttachments([]);

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
            ? ({
                ...msg,
                status: "sent",
                id: newGroupMessage.id,
                attachments: newGroupMessage.attachments,
              } as ExtendedGroupMessage)
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
            ? ({
                ...msg,
                status: "error",
                errorMsg: errorMessage,
              } as ExtendedGroupMessage)
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

  // Scroll to bottom when new messages arrive (initial load or new broadcast)
  useEffect(() => {
    // Only scroll to bottom if the user is already near the bottom
    // or if it's the very first load (page 1)
    const viewport = scrollAreaContainerRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );

    if (viewport) {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // Threshold of 100px from bottom

      // If it's the initial load (page 1 and messages just loaded) or user is near bottom, scroll to bottom
      if (page === 1 && messages.length > 0 && !isLoadingMore) {
        scrollRef.current?.scrollIntoView({ behavior: "instant" });
      } else if (isAtBottom && !isLoadingMore) {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }
  }, [messages.length, page, isLoadingMore]);

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-background rounded-lg border shadow-sm">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold"># {department.name}</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <UsersIcon className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Group Members</SheetTitle>
              </SheetHeader>
              <GroupMembers groupId={department.id} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Message Area */}
        <ScrollArea ref={scrollAreaContainerRef}>
          <div className="flex-1 overflow-y-auto p-4 space-y-1 h-[60vh]">
            {isLoadingMore && (
              <div className="text-center text-muted-foreground py-2">
                Loading older messages...
              </div>
            )}
            {messages.map((msg, idx) => {
              const isOwn = msg.senderId === user?.id;
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

              const currentUser = findUser(msg.senderId);

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
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="flex flex-col gap-2 mt-2">
                                {msg.attachments.map((attachment) => (
                                  <div key={attachment.id}>
                                    {attachment.type === "IMAGE" ? (
                                      <Image
                                        src={attachment.url}
                                        alt={
                                          attachment.fileName || "Attachment"
                                        }
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
                                <span className="text-xs text-red-500">
                                  Failed
                                </span>
                              )}
                              {isOwn && msg.status === "sent" && (
                                <CheckCheckIcon className="w-4 h-4 text-blue-500" />
                              )}
                              <p className="text-xs opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
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

        {/* Image Modal */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-3xl">
            <DialogTitle className="sr-only">Image Preview</DialogTitle>
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
            <DialogTitle className="sr-only">Video Playback</DialogTitle>
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

  return (
    <div className="flex h-full bg-background rounded-lg border shadow-sm">
      <div className="flex flex-col flex-grow h-full">
        {/* Header */}
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold"># {department.name}</h2>
        </div>

        {/* Message Area */}
        <ScrollArea ref={scrollAreaContainerRef}>
          <div className="flex-1 overflow-y-auto p-4 space-y-1 h-[60vh]">
            {isLoadingMore && (
              <div className="text-center text-muted-foreground py-2">
                Loading older messages...
              </div>
            )}
            {messages.map((msg, idx) => {
              const isOwn = msg.senderId === user?.id;
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

              const currentUser = findUser(msg.senderId);

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
                            {msg.attachments && msg.attachments.length > 0 && (
                              <div className="flex flex-col gap-2 mt-2">
                                {msg.attachments.map((attachment) => (
                                  <div key={attachment.id}>
                                    {attachment.type === "IMAGE" ? (
                                      <Image
                                        src={attachment.url}
                                        alt={
                                          attachment.fileName || "Attachment"
                                        }
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
                                <span className="text-xs text-red-500">
                                  Failed
                                </span>
                              )}
                              {isOwn && msg.status === "sent" && (
                                <CheckCheckIcon className="w-4 h-4 text-blue-500" />
                              )}
                              <p className="text-xs opacity-70">
                                {new Date(msg.createdAt).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
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
                  <SendIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Group Members */}
      <div className="w-1/3 border-l">
        <GroupMembers groupId={department.id} />
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
        {/* <DialogTitle>Image Preview</DialogTitle> */}
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
        {/* <DialogTitle>Video Playback</DialogTitle> */}
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
