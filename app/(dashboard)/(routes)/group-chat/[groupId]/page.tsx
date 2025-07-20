// import React from "react";

import GroupChat from "./GroupChat";

async function page({ params }: { params: Promise<{ groupId: string }> }) {
  console.log("Group ID:", await params);
  const groupId = (await params).groupId;
  return (
    <div className="p-6">
      <GroupChat groupId={groupId} />
    </div>
  );
}

export default page;
