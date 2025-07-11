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
import { EyeIcon, Loader2Icon } from "lucide-react";
import { textShorter } from "@/lib/textShorter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getBadgeVariantForStatus } from "@/lib/getBadgeVariantForStatus";

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
  const handleSubmitNote = async (
    note: string,
    incidentId: any,
    selectedStatus: any,
    userId: any
  ) => {
    try {
      console.log({ note, incidentId, selectedStatus, userId });
      startTransition(async () => {
        await axios.patch("/api/incidents", {
          id: incidentId,
          status: selectedStatus,
          note,
          userId,
        });
        router.refresh();
      });
    } catch (err) {
      console.error("Status change failed", err);
    }
  };

  return (
    <Card
      key={incident.id}
      className="relative rounded-2xl border border-muted bg-background shadow-sm hover:shadow-lg   transition-shadow pb-8"
    >
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          {textShorter(incident.title, 25)}
          <Badge
            variant={getBadgeVariantForStatus(incident.status)}
            className="px-4 py-2"
          >
            <span>{incident.status}</span>
            {currentUser?.publicMetadata.position === "higher" && (
              <Dropdown
                status={incident.status}
                handleSubmitNote={(note: string, selectedStatus: string) =>
                  handleSubmitNote(
                    note,
                    incident.id,
                    selectedStatus,
                    currentUser?.id
                  )
                }
              />
            )}
          </Badge>
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Reported {formatDistanceToNow(new Date(incident.createdAt))} ago{" "}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {incident.description && (
          <p className="text-sm">{textShorter(incident.description, 200)}</p>
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
            disabled={
              currentUser.publicMetadata.role === "admin" ||
              currentUser.publicMetadata.position !== "lower"
            }
          />
        )}
        <Link
          href={`/incidents/${incident.id}`}
          className="absolute bottom-3 right-3 "
        >
          <EyeIcon className=" stroke-muted-foreground hover:scale-120 transition-transform" />
        </Link>
      </CardContent>
      {isPending && (
        <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center bg-slate-200/30">
          {" "}
          <Loader2Icon className="animate-spin repeat-infinite" />
        </div>
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
