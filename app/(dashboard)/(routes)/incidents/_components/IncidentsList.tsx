"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { useUser } from "@clerk/nextjs";
import { IncidentSkeleton } from "./IncidentSkeleton";
import { Dropdown } from "./DropDown";
import SelectItems from "../new/_components/SelectItems";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2Icon } from "lucide-react";

function getBadgeVariantForStatus(status: string) {
  switch (status) {
    case "REPORTED":
      return "reported";
    case "IN_REVIEW":
      return "inReview";
    case "RESOLVED":
      return "resolved";
    case "CLOSED":
      return "closed";
    default:
      return "default";
  }
}

function IncidentItem({
  incident,
  currentUser,
  users,
}: {
  // incident: Incident & { department: Department; category: IncidentCategory };
  incident: any;
  currentUser: any;
  users: { name: string; id: string }[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const handleAssign = async (userId: string, id: string) => {
    const assign = startTransition(async () => {
      await axios.patch("api/incidents", { userId, id });
      router.refresh();
    });
  };

  return (
    <Card
      key={incident.id}
      className="rounded-2xl border border-muted bg-background shadow-sm hover:shadow-lg   transition-shadow"
    >
      {" "}
      {isPending ? (
        <div className="w-full h-full flex justify-center items-center bg-slate-200/10">
          {" "}
          <Loader2Icon className="animate-spin repeat-infinite" />
        </div>
      ) : (
        <>
          {" "}
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              {incident.title}
              <Badge
                variant={getBadgeVariantForStatus(incident.status)}
                className="px-4 py-2"
              >
                <span>{incident.status}</span>
                {currentUser?.publicMetadata.position === "higher" && (
                  <Dropdown status={incident.status} incidentId={incident.id} />
                )}
              </Badge>
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Reported {formatDistanceToNow(new Date(incident.createdAt))} ago{" "}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {incident.description && (
              <p className="text-sm">{incident.description}</p>
            )}
            <div className="text-sm text-muted-foreground">
              <strong>Location:</strong> {incident.location || "N/A"}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Category:</strong> {incident.category?.name}
            </div>
            <div className="text-sm text-muted-foreground">
              <strong>Department:</strong> {incident.department?.name}
            </div>

            {incident.assignedToId ? (
              <div className="text-sm text-muted-foreground">
                <strong>Assigned to:</strong>{" "}
                {users.find((user) => user.id == incident.assignedToId)?.name}
              </div>
            ) : (
              <SelectItems
                label="Assign to Staff"
                value={incident.assignedToId ?? ""}
                items={users}
                onChange={(userId) => {
                  handleAssign(userId, incident.id);
                }}
                // disabled={
                //   currentUser.publicMetadata.role === "admin" ||
                //   currentUser.publicMetadata.position !== "lower"
                // }
              />
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}

export default function IncidentsList({
  incidents,
  users,
}: {
  incidents: any;
  users: { name: string; id: string }[];
}) {
  const { isLoaded, user: currentUser } = useUser();
  // const [userId, setUserId] = useState(incident.department?.AssignedToId);

  if (!isLoaded) {
    return <IncidentSkeleton />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 overflow-x-auto">
      {incidents.map((incident: any) => (
        <IncidentItem
          key={`${incident.id}-${incident.assignedToId}`}
          incident={incident}
          currentUser={currentUser}
          users={users}
        />
      ))}
    </div>
  );
}
