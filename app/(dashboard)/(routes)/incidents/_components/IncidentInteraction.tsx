"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Incident, User } from "@prisma/client";
import { IncidentStatus } from "@prisma/client";
import { updateIncidentAction } from "@/app/lib/actions";

const AssigneeSchema = z.object({
  assigneeId: z.string().nullable(),
});

interface IncidentInteractionProps {
  incident: Incident;
  departmentUsers: Partial<User>[];
}

export default function IncidentInteraction({
  incident,
  departmentUsers,
}: IncidentInteractionProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<IncidentStatus | null>(null);
  const [statusNote, setStatusNote] = useState("");

  const form = useForm<z.infer<typeof AssigneeSchema>>({
    resolver: zodResolver(AssigneeSchema),
    defaultValues: {
      assigneeId: incident.assigneeId,
    },
  });

  const handleStatusChange = (selectedStatus: IncidentStatus) => {
    if (selectedStatus !== incident.status) {
      setNewStatus(selectedStatus);
      setIsDialogOpen(true);
    }
  };

  const handleConfirmStatusChange = () => {
    if (!newStatus || !statusNote) {
      toast.error("A note is required to change the status.");
      return;
    }
    startTransition(async () => {
      try {
        await updateIncidentAction({
          id: incident.id,
          status: newStatus,
          note: statusNote,
        });
        toast.success("Status updated successfully!");
        setIsDialogOpen(false);
        setNewStatus(null);
        setStatusNote("");
      } catch (error) {
        toast.error("Failed to update status.");
      }
    });
  };

  function onAssigneeSubmit(values: z.infer<typeof AssigneeSchema>) {
    startTransition(async () => {
      try {
        const payload = { ...values };
        if (payload.assigneeId === "UNASSIGNED") {
          payload.assigneeId = null;
        }
        await updateIncidentAction({ id: incident.id, ...payload });
        toast.success("Assignee updated successfully!");
      } catch (error) {
        toast.error("Failed to update assignee.");
      }
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Changer */}
          <div>
            <label className="text-sm font-medium">Status</label>
            <Select onValueChange={handleStatusChange} value={incident.status}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Set a new status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(IncidentStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace("_", " ").toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee Form */}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onAssigneeSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to a user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="UNASSIGNED">Unassigned</SelectItem>
                        {departmentUsers.map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id!}
                            disabled={user.position === "low"}
                          >
                            {user.username || user.email}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Saving..." : "Save Assignee"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add a note for status change</DialogTitle>
            <DialogDescription>
              You are changing the status to{" "}
              <span className="font-bold capitalize">
                {newStatus?.replace("_", " ").toLowerCase() || ""}
              </span>
              . Please provide a reason or update.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Type your note here..."
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmStatusChange}
              disabled={isPending || !statusNote}
            >
              {isPending ? "Confirming..." : "Confirm Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
