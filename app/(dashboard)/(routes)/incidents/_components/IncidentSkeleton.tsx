import { Skeleton } from "@/components/ui/skeleton";

export function IncidentSkeleton() {
  return (
    <div className="grid gap-y-12 gap-6 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto">
      {/* <div className="flex flex-col items-center space-x-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-[300px]" />
          <Skeleton className="h-4 w-[200px]" />
        </div>
      </div> */}
      {Array.from({ length: 9 }, (_, i) => (
        <div
          key={i}
          className="flex flex-col items- justify-start space-x-4 space-y-4"
        >
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-6 w-18" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-18 w-[300px]" />
            <Skeleton className="h-6 w-[250px]" />
            <Skeleton className="h-6 w-[250px]" />
            <Skeleton className="h-6 w-[250px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

//    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto">
//       {/* <Skeleton className="h-12 w-12 rounded-full" /> */}
//       {/* <div className="space-y-2"> */}
//       <Skeleton className="h-12 w-[300px]" />
//       <Skeleton className="h-4 w-[200px]" />
//       {/* </div> */}
//     </div>
