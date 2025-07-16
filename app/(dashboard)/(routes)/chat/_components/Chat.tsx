"use client";

import * as Ably from "ably";
import { ChatClient } from "@ably/chat";
import { ChatClientProvider, ChatRoomProvider } from "@ably/chat/react";
import { useMemo } from "react";
import ChatBox from "./ChatBox";

export default function Chat() {
  const realtime = useMemo(() => new Ably.Realtime({ authUrl: "/api" }), []);
  const chatClient = useMemo(() => new ChatClient(realtime), [realtime]);
  const roomOptions = useMemo(() => ({}), []);

  return (
    <ChatClientProvider client={chatClient}>
      <ChatRoomProvider name="chat-demo" options={roomOptions}>
        <ChatBox />
        {/* <div className="w-64 h-64 bg-amber-400">chat</div> */}
      </ChatRoomProvider>
    </ChatClientProvider>
  );
}

// ("use client");
// Keep roomOptions memoized:
// const roomOptions = { history: { limit: 50 } };

// export default function Chat() {
//   const realtimeClient = useMemo(() => new Ably.Realtime({ authUrl: "/api" }), []);
//   const chatClient = useMemo(() => new ChatClient(realtimeClient), [realtimeClient]);

//   return (
//     <ChatClientProvider client={chatClient}>
//       <ChatRoomProvider id="chat-demo" options={roomOptions}>
//         <ChatBox />
//       </ChatRoomProvider>
//     </ChatClientProvider>
//   );
// }
