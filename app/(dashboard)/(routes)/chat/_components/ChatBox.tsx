"use client";

import { useState, useEffect, useRef } from "react";
import { useMessages } from "@ably/chat/react";
import { Message } from "@ably/chat";

export default function ChatBox() {
  //   const [messageText, setMessageText] = useState("");
  //   const [messages, setMessages] = useState([]);
  const inputBox = useRef<HTMLTextAreaElement | null>(null);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  const [messageText, setMessageText] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);

  const { send: sendMessage } = useMessages({
    listener: (payload: { message: Message }) => {
      const newMsg = payload.message;

      setMessages((prev) => {
        if (prev.some((m) => m.isSameAs(newMsg))) return prev;

        const idx = prev.findIndex((m) => m.after(newMsg));
        const arr = [...prev];
        idx === -1 ? arr.push(newMsg) : arr.splice(idx, 0, newMsg);
        return arr;
      });
    },
  });

  const sendChatMessage = async (text: any) => {
    if (!sendMessage) return;
    await sendMessage({ text });
    setMessageText("");
    inputBox.current?.focus();
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    sendChatMessage(messageText);
  };
  const handleKeyPress = (e: any) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage(messageText);
    }
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <div>
        {messages.map((m, i) => (
          <span key={m.serial ?? i}>{m.text}</span>
        ))}
        <div ref={messageEndRef}></div>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          ref={inputBox}
          value={messageText}
          placeholder="Type a message..."
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button type="submit" disabled={!messageText.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
