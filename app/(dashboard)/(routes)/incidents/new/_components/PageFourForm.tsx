"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useMemo, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { useIncidentFormStore, useIncidentUIForm } from "./IncidentFormStore";
import { Step4Schema } from "@/lib/validation/incidents";

// Correctly type the props
interface Step4FormProps {
  departments: { id: string; name: string }[];
  users: {
    id: string;
    name: string;
    position: string | null;
    departmentId: string | null;
  }[];
}

export default function PageFourForm({ departments, users }: Step4FormProps) {
  const router = useRouter();
  const { data, setData } = useIncidentFormStore();
  const { setUiData } = useIncidentUIForm();

  const defaultValues: z.infer<typeof Step4Schema> = {
    departmentId: data.departmentId || "",
    assigneeId: data.assigneeId || undefined,
  };

  const form = useForm<z.infer<typeof Step4Schema>>({
    resolver: zodResolver(Step4Schema),
    defaultValues,
  });

  const { formState: { isSubmitting } } = form;

  const watchedDepartmentId = form.watch("departmentId");

  const assignableUsers = useMemo(() => {
    if (!watchedDepartmentId) return [];
    return users.filter((user) => user.departmentId === watchedDepartmentId);
  }, [watchedDepartmentId, users]);

  // When the department changes, check if there are any valid users to assign.
  // If not, clear the assigneeId field.
  useEffect(() => {
    if (watchedDepartmentId) {
      const hasAssignableUsers = assignableUsers.some(
        (user) => user.position !== "low"
      );
      if (!hasAssignableUsers) {
        form.setValue("assigneeId", undefined);
      }
    }
  }, [watchedDepartmentId, assignableUsers, form]);

  async function onSubmit(values: z.infer<typeof Step4Schema>) {
    await new Promise((resolve) => setTimeout(resolve, 500)); // 500ms delay
    const departmentName = departments.find(
      (dep) => dep.id === values.departmentId
    )?.name;
    const assigneeName = users.find(
      (user) => user.id === values.assigneeId
    )?.name;

    setData(values);
    setUiData({ departmentName, assigneeName });
    router.push("/incidents/new/review");
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto pt8"
    >
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
          <div className="bg-blue-600 h-1.5 rounded-full w-full"></div>
        </div>
        <p className="text-sm text-gray-500">Step 4 of 4: Assignment</p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Department & Assignee</CardTitle>
          <CardDescription>
            Assign the incident to the correct department and optionally to a
            specific user.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="departmentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assign To (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      disabled={!watchedDepartmentId} // Disable if no department is selected
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a user to assign" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {assignableUsers.map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id}
                            disabled={user.position === "lower"}
                          >
                            {user.name} (Position: {user.position || "N/A"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-between items-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.back()}
                >
                  Back
                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Review Incident"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
