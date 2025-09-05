// "use client";

// import { useUser } from "@clerk/nextjs";
// import { useRouter, usePathname } from "next/navigation";
// import { useEffect } from "react";

// export default function UserMetadataGuard({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   console.log("UserMetadata guard file");
//   const { user, isLoaded } = useUser();
//   const router = useRouter();
//   const pathname = usePathname();
//   console.log({ user, isLoaded, router, pathname });
//   useEffect(() => {
//     console.log("userMetadataGuard", { user, isLoaded, pathname });

//     console.log("user pupblic data", user?.publicMetadata);
//     // console.log(pathname);
//     if (!isLoaded && !user) return;
//     console.log("after isloaded");
//     // Do not redirect on the profile completion page itself
//     // console.log(pathname.includes("complete-profile"));
//     // console.log(pathname.startsWith("/complete-profile"));
//     if (pathname.includes("complete-profile")) return;

//     if (user) {
//       const metadata = user.publicMetadata;
//       const missing = !metadata?.departmentId || !metadata?.position;
//       console.log({ metadata, missing });
//       if (missing) {
//         const encoded = encodeURIComponent(pathname);
//         router.push(`/complete-profile?returnTo=${encoded}`);
//         // router.push("/complete-profile");
//       }
//     }
//   }, [isLoaded, user, pathname, router]);
//   // *************************
//   // useEffect(() => {
//   //   if (!isLoaded) return; // Wait for Clerk to finish loading

//   //   if (!user) {
//   //     // Maybe redirect to sign in
//   //     return;
//   //   }

//   //   if (pathname.includes("complete-profile")) return;

//   //   const metadata = user.publicMetadata;
//   //   const missing = !metadata?.departmentId || !metadata?.position;

//   //   if (missing) {
//   //     const encoded = encodeURIComponent(pathname);
//   //     router.push(`/complete-profile?returnTo=${encoded}`);
//   //   }
//   // }, [isLoaded, user, pathname, router]);

//   return <>{children}</>;
// }

// ******************
// "use client";

// import { useUser } from "@clerk/nextjs";
// import { useRouter, usePathname } from "next/navigation";
// import { useEffect } from "react";

// export default function UserMetadataGuard({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const { user, isLoaded } = useUser();
//   const router = useRouter();
//   const pathname = usePathname();

//   useEffect(() => {
//     console.log(pathname);
//     if (!isLoaded) return;

//     // Do not redirect on the profile completion page itself
//     console.log(pathname.includes("complete-profile"));
//     console.log(pathname.startsWith("/complete-profile"));
//     if (pathname.includes("complete-profile")) return;

//     if (user) {
//       const metadata = user.publicMetadata;
//       const missing = !metadata?.departmentId || !metadata?.position;
//       console.log({ metadata, missing });
//       if (missing) {
//         const encoded = encodeURIComponent(pathname);
//         router.push(`/complete-profile?returnTo=${encoded}`);
//         // router.push("/complete-profile");
//       }
//     }
//   }, [isLoaded, user, pathname, router]);

//   return <>{children}</>;
// }

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
    if (missing) {
      const encoded = encodeURIComponent(pathname);
      router.push(`/complete-profile?returnTo=${encoded}`);
    }
  }, [router, pathname, user]);
  return <>{children}</>;
}
