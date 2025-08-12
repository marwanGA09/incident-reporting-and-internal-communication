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
  console.log("they came here");
  // useEffect(() => {
  //   console.log("userMetadataGuard", { user, isLoaded, pathname });

  //   console.log("user pupblic data", user?.publicMetadata);
  //   // console.log(pathname);
  //   if (!isLoaded && !user) return;
  //   console.log("after isloaded");
  //   // Do not redirect on the profile completion page itself
  //   // console.log(pathname.includes("complete-profile"));
  //   // console.log(pathname.startsWith("/complete-profile"));
  //   if (pathname.includes("complete-profile")) return;

  //   if (user) {
  //     const metadata = user.publicMetadata;
  //     const missing = !metadata?.departmentId || !metadata?.position;
  //     console.log({ metadata, missing });
  //     if (missing) {
  //       const encoded = encodeURIComponent(pathname);
  //       router.push(`/complete-profile?returnTo=${encoded}`);
  //       // router.push("/complete-profile");
  //     }
  //   }
  // }, [isLoaded, user, pathname, router]);
  useEffect(() => {
    if (!isLoaded) return; // Wait for Clerk to finish loading

    console.log("UserMetadataGuard", { user, isLoaded, pathname });
    console.log("user public data", user?.publicMetadata);

    if (!user) {
      // Maybe redirect to sign in
      return;
    }

    if (pathname.includes("complete-profile")) return;

    const metadata = user.publicMetadata;
    const missing = !metadata?.departmentId || !metadata?.position;

    if (missing) {
      const encoded = encodeURIComponent(pathname);
      router.push(`/complete-profile?returnTo=${encoded}`);
    }
  }, [isLoaded, user, pathname, router]);

  return <>{children}</>;
}
