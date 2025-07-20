"use client";

import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { getGroupMessages, sendGroupMessage } from "@/app/lib/actions";
import { ArrowRightToLine, CheckCheckIcon, SendIcon } from "lucide-react";
// import { v4 as uuidv4 } from "uuid";

export default function GroupChat({ groupId }: { groupId: string }) {
  const { user } = useUser();
  const [messages, setMessages] = useState<any[]>([]);
  const [messageText, setMessageText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const roomName = `group-chat:${groupId}`;

  useEffect(() => {
    if (!groupId || !user?.id) return;

    async function loadMessages() {
      const msgs = await getGroupMessages(groupId);
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

  // const handleSend = async () => {
  //   if (!messageText.trim() || !user) return;

  //   const tempId = crypto.randomUUID();

  //   const tempMessage = {
  //     id: tempId,
  //     senderId: user.id,
  //     text: messageText,
  //     departmentId: groupId,
  //     created_at: new Date().toISOString(),
  //     status: "pending",
  //   };

  //   // 1. Broadcast to other clients immediately
  //   supabase.channel(roomName).send({
  //     type: "broadcast",
  //     event: "group-message",
  //     payload: tempMessage,
  //   });

  //   // 2. Optimistically add to UI
  //   setMessages((prev) => [...prev, tempMessage]);
  //   setMessageText("");

  //   // 3. Store in DB
  //   const { error } = await supabase.from("GroupMessage").insert([
  //     {
  //       senderId: tempMessage.senderId,
  //       departmentId: tempMessage.departmentId,
  //       text: tempMessage.text,
  //       created_at: tempMessage.created_at,
  //     },
  //   ]);

  //   // 4. Update message status
  //   setMessages((prev) =>
  //     prev.map((msg) =>
  //       msg.id === tempId
  //         ? {
  //             ...msg,
  //             status: error ? "error" : "sent",
  //             errorMsg: error?.message,
  //           }
  //         : msg
  //     )
  //   );
  // };
  const handleSend = async () => {
    if (!messageText.trim() || !user) return;

    const tempId = crypto.randomUUID();
    const timestamp = new Date().toISOString();

    const tempMessage = {
      id: tempId,
      senderId: user.id,
      text: messageText,
      departmentId: groupId,
      // createdAt: timestamp,
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

  // function formatDateHeader(dateStr: string) {
  //   const date = new Date(dateStr);
  //   const today = new Date();

  //   const isSameDay =
  //     date.getFullYear() === today.getFullYear() &&
  //     date.getMonth() === today.getMonth() &&
  //     date.getDate() === today.getDate();

  //   const options: Intl.DateTimeFormatOptions = {
  //     month: "long",
  //     day: "numeric",
  //   };

  //   // Add year if it's not current year
  //   if (date.getFullYear() !== today.getFullYear()) {
  //     options.year = "numeric";
  //   }

  //   return isSameDay ? null : date.toLocaleDateString(undefined, options);
  // }

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 shadow-xl">
      <CardContent>
        <ScrollArea className="h-96 overflow-y-auto">
          <div className="flex flex-col gap-2">
            {messages.map((msg, idx) => {
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
                      {isOwn ? "You" : msg.senderId}
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
            <div ref={scrollRef} />
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

// "use client";

// import { useEffect, useRef, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Card, CardContent } from "@/components/ui/card";
// import { supabase } from "@/lib/supabaseClient";
// import { getGroupMessages, sendGroupMessage } from "@/app/lib/actions";
// import { useRouter } from "next/navigation";

// export default function GroupChat({ groupId }: { groupId: string }) {
//   const { user } = useUser();
//   const [messages, setMessages] = useState<any[]>([]);
//   const [messageText, setMessageText] = useState("");
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const [isSending, setIsSending] = useState(false);

//   const router = useRouter();

//   const roomName = `group-chat:${groupId}`;
//   useEffect(() => {
//     if (!groupId) return;

//     async function loadMessages() {
//       const msgs = await getGroupMessages(groupId);
//       setMessages(msgs);
//     }

//     loadMessages();

//     const channel = supabase.channel(roomName, {
//       config: {
//         presence: { key: user?.id || "anon" },
//       },
//     });
//     console.log("SUPABASE CHANNEL:", supabase);
//     console.log("Subscribing to channel:", channel);
//     channel
//       .on(
//         "postgres_changes",
//         { event: "INSERT", schema: "public", table: "GroupMessage" },
//         (payload) => {
//           console.log(
//             "New message received on POSTGRES change **INSERT:",
//             payload
//           );
//           if (payload.new.departmentId === groupId) {
//             setMessages((prev) => [...prev, payload.new]);
//           }
//         }
//       )
//       .subscribe((status) => {
//         console.log("Subscription status:", status); // Should log "SUBSCRIBED"
//       });

//     return () => {
//       supabase.removeChannel(channel);
//     };
//   }, [groupId, user?.id]);

//   const handleSend = async () => {
//     if (!messageText.trim() || !user) return;
//     setIsSending(true);
//     try {
//       await sendGroupMessage({
//         text: messageText,
//         departmentId: groupId,
//         senderId: user.id,
//         roomName,
//       });
//       setMessageText("");
//     } catch (error) {
//       console.error("Send failed:", error);
//     } finally {
//       setIsSending(false);
//     }
//   };

//   useEffect(() => {
//     scrollRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages]);

//   return (
//     <Card className="w-full max-w-2xl mx-auto p-4 shadow-xl">
//       <CardContent>
//         <ScrollArea className="h-96 overflow-y-auto">
//           <ScrollArea className="h-96 overflow-y-auto">
//             <div className="flex flex-col gap-2">
//               {messages.map((msg) => {
//                 const isOwnMessage = msg.senderId === user?.id;
//                 return (
//                   <div
//                     key={msg.id}
//                     className={`flex flex-col max-w-xs p-2 rounded-lg ${
//                       isOwnMessage
//                         ? "self-end bg-blue-500 text-white"
//                         : "self-start bg-gray-200 text-black"
//                     }`}
//                   >
//                     <span className="text-xs opacity-70">
//                       {isOwnMessage ? "You" : msg.senderId}
//                     </span>
//                     <span>{msg.text}</span>
//                   </div>
//                 );
//               })}
//               <div ref={scrollRef} />
//             </div>
//           </ScrollArea>
//         </ScrollArea>
//         <div className="mt-4 flex gap-2">
//           <Input
//             placeholder="Type a message..."
//             value={messageText}
//             onChange={(e) => setMessageText(e.target.value)}
//           />
//           <Button onClick={handleSend} disabled={isSending}>
//             {isSending ? "Sending..." : "Send"}
//           </Button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// }
