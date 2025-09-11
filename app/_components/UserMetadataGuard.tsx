"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function UserMetadataGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // if (!isLoaded) return; // Wait until Clerk finishes loading

    // If not signed in, redirect to sign-in
    // if (!user) {
    //   router.push("/sign-in");
    //   return;
    // }

    // Don’t block the profile completion page itself
    console.log("use effect of user metadata guard", pathname);
    if (pathname.startsWith("/complete-profile")) return;

    const departmentId = user?.publicMetadata.departmentId as
      | string
      | undefined;
    const position = user?.publicMetadata?.position;
    // const { departmentId, position } = user?.publicMetadata as {
    //   departmentId?: string;
    //   position?: string;
    // };

    const missing = !departmentId || !position;
    console.log({ missing, departmentId, position });
    if (missing) {
      const encoded = encodeURIComponent(pathname);
      router.push(`/complete-profile?returnTo=${encoded}`);
    }
  }, [
    router,
    pathname,
    user?.publicMetadata?.departmentId,
    user?.publicMetadata?.position,
  ]);
  return <>{children}</>;
}
