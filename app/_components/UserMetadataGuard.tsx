"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

export default function UserMetadataGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Wait until Clerk has finished loading user data before running the check.
    if (!isLoaded) {
      return;
    }

    // If the user is already on the profile completion page, do nothing.
    if (pathname.startsWith("/complete-profile")) {
      return;
    }

    const departmentId = user?.publicMetadata.departmentId;
    const position = user?.publicMetadata?.position;

    // Check if essential metadata is missing.
    const isMetadataMissing = !departmentId || !position;

    if (isMetadataMissing) {
      const returnTo = encodeURIComponent(pathname);
      router.push(`/complete-profile?returnTo=${returnTo}`);
    }
  }, [isLoaded, router, pathname, user]);

  // To prevent a flash of the protected content before the redirect,
  // you can return null or a loading spinner while Clerk is loading.
  if (!isLoaded) {
    return null;
  }

  return <>{children}</>;
}
