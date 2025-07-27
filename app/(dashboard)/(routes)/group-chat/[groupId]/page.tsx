// // import React from "react";

// import GroupChat from "./GroupChat";

// async function page({ params }: { params: Promise<{ groupId: string }> }) {
//   console.log("Group ID:", await params);
//   const groupId = (await params).groupId;
//   return (
//     <div className="p-6">
//       <GroupChat groupId={groupId} />
//     </div>
//   );
// }

// export default page;

// import React from "react";

import { clerkClient } from "@/lib/clerkClient";
import GroupChat from "./GroupChat";
import logger from "@/app/lib/logger";

async function page({ params }: { params: Promise<{ groupId: string }> }) {
  // console.log("Group ID:", await params);

  const groupId = (await params).groupId;
  const { data } = await clerkClient.users.getUserList({
    orderBy: "-created_at",
    limit: 500,
  });

  const users = data
    .filter((user) => user.publicMetadata.departmentId === groupId)
    .map((user) => {
      // console.log({ user });

      return {
        name: user?.firstName || "",
        id: user.id,
        imageUrl: user.imageUrl || "",
        username: user.username || "",
        email: user.primaryEmailAddress?.emailAddress || "",
      };
    });
  // console.log({ users });
  logger.info(
    `   Lorem ipsum dolor sit amet consectetur adipisicing elit. Quidem sapiente nisi placeat veniam aspernatur fugit, atque delectus ducimus autem, reiciendis ullam iure quibusdam! Hic illum sit voluptatibus, quas enim quis.
 `,
    users
  );
  return (
    <div className="p-6">
      <GroupChat groupId={groupId} users={users} />
    </div>
  );
}

export default page;
