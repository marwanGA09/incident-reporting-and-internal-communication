// import {
//   BlendIcon,
//   Grid2X2Check,
//   NotebookIcon,
//   ShieldCheckIcon,
//   ShieldPlusIcon,
// } from "lucide-react";

// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarGroup,
//   SidebarGroupContent,
//   SidebarGroupLabel,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar";
// import SidebarClient from "./SidebarClient";
// import { currentUser } from "@clerk/nextjs/server";
// import { getDepartments, getNotifications } from "@/app/lib/actions";
// import { prisma } from "@/app/lib/prisma";
// import Image from "next/image";
// import SearchUsers from "./SearchUser";
// import { Badge } from "@/components/ui/badge";
// import { useEffect, useState } from "react";
// import { supabase } from "@/lib/supabaseClient";
// import { Notification } from "@prisma/client";

// // Menu items.
// const incidentsLink = [
//   {
//     title: "Incidents",
//     url: "/incidents",
//     icon: ShieldCheckIcon,
//   },
//   {
//     title: "Report Incidents",
//     url: "/incidents/new/step-1",
//     icon: ShieldPlusIcon,
//   },
// ];

// export async function AppSidebar() {
//   const user = await currentUser();
//   if (!user) return null;

//   const dbUser = await prisma.user.findUnique({
//     where: { clerkId: user.id },
//     select: { id: true },
//   });

//   if (!dbUser) return null;

//   const [unreadNot, setUnreadNot] = useState<Notification[]>([]);
//   // useEffect(
//   //   async () => {
//   //     //  **   markNotificationsAsRead(`/direct-chat/${targetUserId}`);
//   //     const { notifications, unreadCount } = await getNotifications();
//   //     setUnreadNot(notifications);
//   //     const NotificationChannel = supabase.channel("NOTIFICATION", {
//   //       config: { presence: { key: dbUser.id } },
//   //     });
//   //     NotificationChannel.on(
//   //       "broadcast",
//   //       { event: "new-notification" },
//   //       (payload) => {
//   //         const newNotification = payload.payload;
//   //         setUnreadNot((prev) => [...prev, { ...newNotification }]);
//   //       }
//   //     );
//   //     //       .on("broadcast", { event: "UpdateDirectMessage" }, (payload) => {
//   //     //         const updatedMessage = payload.payload;

//   //     //         setMessages((prev) =>
//   //     //           prev.map((msg) =>
//   //     //             msg.id === updatedMessage.id ? updatedMessage : msg
//   //     //           )
//   //     //         );
//   //     //       })
//   //     //       .on("broadcast", { event: "DeleteDirectMessage" }, (payload) => {
//   //     //         const { id } = payload.payload;
//   //     //         // console.log({ id });
//   //     //         setMessages((prev) => prev.filter((msg) => msg.id !== id));
//   //     //       })
//   //     //       .subscribe();

//   //     return () => {
//   //       supabase.removeChannel(NotificationChannel);
//   //     };
//   //   },
//   //   [
//   //     // currentUserId, targetUserId, roomName
//   //   ]
//   // );

//   // console.log({ user, dbUser });
//   // const unreadNotifications = await prisma.notification.findMany({
//   //   where: {
//   //     recipientId: dbUser.id,
//   //     isRead: false,
//   //   },
//   //   select: { url: true },
//   // });
//   const unreadNotifications = unreadNot;

//   // console.log({ unreadNotifications });
//   const notificationCounts = unreadNotifications.reduce((acc, notification) => {
//     if (notification.url) {
//       acc[notification.url] = (acc[notification.url] || 0) + 1;
//     }
//     return acc;
//   }, {} as Record<string, number>);

//   // console.log({ notificationCounts });
//   const groupsDepartmentLink =
//     user?.publicMetadata?.role === "admin"
//       ? (await getDepartments()).map((dep) => ({
//           title: dep.name,
//           url: `/group-chat/${dep.id}`,
//           icon: BlendIcon,
//         }))
//       : [
//           {
//             title: (
//               await getDepartments(`${user?.publicMetadata?.departmentId}`)
//             )[0].name,
//             url: `/group-chat/${user?.publicMetadata?.departmentId}`,
//             icon: BlendIcon,
//           },
//         ];

//   const incidentNotificationCount = Object.entries(notificationCounts).reduce(
//     (acc, [url, count]) => {
//       if (url.startsWith("/incidents")) {
//         return acc + count;
//       }
//       return acc;
//     },
//     0
//   );

//   const DmUsers = await prisma.directMessage.findMany({
//     select: {
//       senderId: true,
//       receiverId: true,
//     },
//     where: {
//       roomName: {
//         contains: user?.id,
//         mode: "insensitive",
//       },
//     },
//   });

//   const uniqueUserIds = [
//     ...new Set(DmUsers.flatMap((dm) => [dm.senderId, dm.receiverId])),
//   ].filter((id) => id !== user?.id);

//   const usersFromDB = await prisma.user.findMany({
//     where: {
//       clerkId: { in: uniqueUserIds },
//     },
//     include: {
//       department: true,
//     },
//   });

//   return (
//     <Sidebar collapsible="icon" variant="floating">
//       <SidebarContent>
//         <SidebarGroup>
//           <SidebarGroupLabel>Incidents</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {incidentsLink.map((item) => {
//                 const isIncidentParent = item.url === "/incidents";
//                 const count = isIncidentParent ? incidentNotificationCount : 0;

//                 return (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton asChild>
//                       <a
//                         href={item.url}
//                         className="flex justify-between items-center w-full"
//                       >
//                         <div className="flex items-center gap-2">
//                           <item.icon />
//                           <span>{item.title}</span>
//                         </div>
//                         {count > 0 && (
//                           <Badge className="h-5 w-5 flex items-center justify-center p-0">
//                             {count}
//                           </Badge>
//                         )}
//                       </a>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>
//         <SidebarGroup>
//           <SidebarGroupLabel>Departments Groups</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               {groupsDepartmentLink.map((item) => {
//                 const count = notificationCounts[item.url] || 0;
//                 // console.log({ item, count });
//                 return (
//                   <SidebarMenuItem key={item.title}>
//                     <SidebarMenuButton asChild>
//                       <a
//                         href={item.url}
//                         className="flex justify-between items-center w-full"
//                       >
//                         <div className="flex items-center gap-2">
//                           <item.icon />
//                           <span>{item.title}</span>
//                         </div>
//                         {count > 0 && (
//                           <Badge className="h-5 w-5 flex items-center justify-center p-0">
//                             {count}
//                           </Badge>
//                         )}
//                       </a>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//         </SidebarGroup>{" "}
//         <SidebarGroup className=" h-full">
//           <SidebarGroupLabel>Chats</SidebarGroupLabel>
//           <SidebarGroupContent>
//             <SidebarMenu>
//               <SidebarMenuItem key={user.id}>
//                 <SidebarMenuButton asChild>
//                   <a href={`/direct-chat/${user.id}`}>
//                     <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300 flex justify-center items-center">
//                       {<NotebookIcon className="w-5 h-5" />}
//                     </div>
//                     <span>Saved Message</span>
//                   </a>
//                 </SidebarMenuButton>
//               </SidebarMenuItem>
//               {usersFromDB.map((dbUser) => {
//                 const url = `/direct-chat/${dbUser.clerkId}`;
//                 const count = notificationCounts[url] || 0;
//                 return (
//                   <SidebarMenuItem key={dbUser.id}>
//                     <SidebarMenuButton asChild>
//                       <a
//                         href={url}
//                         className="flex justify-between items-center w-full"
//                       >
//                         <div className="flex items-center gap-2">
//                           <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-300">
//                             {dbUser.imageUrl ? (
//                               <Image
//                                 src={dbUser.imageUrl}
//                                 alt={dbUser.username || "user"}
//                                 width={20}
//                                 height={20}
//                                 className="w-full h-full object-cover"
//                               />
//                             ) : (
//                               <div className="w-full h-full bg-gray-400 text-white flex items-center justify-center text-sm font-semibold">
//                                 {dbUser.username?.charAt(0).toUpperCase()}
//                               </div>
//                             )}
//                           </div>
//                           <span>{dbUser.username}</span>
//                         </div>
//                         {count > 0 && (
//                           <Badge className="h-5 w-5 flex items-center justify-center p-0">
//                             {count}
//                           </Badge>
//                         )}
//                       </a>
//                     </SidebarMenuButton>
//                   </SidebarMenuItem>
//                 );
//               })}
//             </SidebarMenu>
//           </SidebarGroupContent>
//           <div className="mt-auto">
//             <SearchUsers />
//           </div>
//         </SidebarGroup>
//       </SidebarContent>
//       <SidebarFooter>
//         {user?.publicMetadata.role === "admin" && (
//           <SidebarMenu>
//             <SidebarMenuItem>
//               <SidebarMenuButton asChild>
//                 <a href={"/dashboard"}>
//                   <Grid2X2Check />
//                   <span>Admin Dashboard</span>
//                 </a>
//               </SidebarMenuButton>
//             </SidebarMenuItem>
//           </SidebarMenu>
//         )}
//         {/* <SidebarClient userId={dbUser.id} /> */}
//       </SidebarFooter>
//     </Sidebar>
//   );
// }

import {
  BlendIcon,
  Grid2X2Check,
  NotebookIcon,
  ShieldCheckIcon,
  ShieldPlusIcon,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { currentUser } from "@clerk/nextjs/server";
import { getDepartments, getNotifications } from "@/app/lib/actions";
import { prisma } from "@/app/lib/prisma";
import SidebarClient from "./SidebarClient";

// Menu items.

export async function AppSidebar() {
  const user = await currentUser();
  if (!user) return null;

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true, role: true, departmentId: true, clerkId: true },
  });

  if (!dbUser) return null;

  const { unReadNotifications } = await getNotifications();
  const departments = await getDepartments();

  const DmUsers = await prisma.directMessage.findMany({
    select: {
      senderId: true,
      receiverId: true,
    },
    where: {
      roomName: {
        contains: user?.id,
        mode: "insensitive",
      },
    },
  });

  const uniqueUserIds = [
    ...new Set(DmUsers.flatMap((dm) => [dm.senderId, dm.receiverId])),
  ].filter((id) => id !== user?.id);

  const usersFromDB = await prisma.user.findMany({
    where: {
      clerkId: { in: uniqueUserIds },
    },
    include: {
      department: true,
    },
  });

  return (
    <SidebarClient
      dbUser={dbUser}
      unreadNotificationsProps={unReadNotifications || []}
      // groupsDepartmentLink={groupsDepartmentLink}
      departments={departments}
      usersFromDB={usersFromDB}
    />
    // <div>some thing</div>
  );
}
