"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";

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
import {
  IncidentPriorityEnum,
  IncidentSeverityEnum,
  Step2Schema,
} from "@/lib/validation/incidents";

interface PageTwoFormProps {
  categories: { id: string; name: string }[];
}

export default function PageTwoForm({ categories }: PageTwoFormProps) {
  const router = useRouter();
  const { data, setData } = useIncidentFormStore();
  const { setUiData } = useIncidentUIForm();

  const defaultValues: z.infer<typeof Step2Schema> = {
    severity: data.severity || "MEDIUM",
    priority: data.priority || "NORMAL",
    categoryId: data.categoryId || "",
  };

  const form = useForm<z.infer<typeof Step2Schema>>({
    resolver: zodResolver(Step2Schema),
    defaultValues,
  });

  function onSubmit(values: z.infer<typeof Step2Schema>) {
    const categoryName = categories.find(
      (cat) => cat.id === values.categoryId
    )?.name;

    setData(values);
    setUiData({ categoryName });
    router.push("/incidents/new/step-3");
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto pt-8"
    >
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
          <div className="bg-blue-600 h-1.5 rounded-full w-2/4"></div>
        </div>
        <p className="text-sm text-gray-500">Step 2 of 4: Classification</p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Classify Incident</CardTitle>
          <CardDescription>
            Help us route this incident by classifying its nature and urgency.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="severity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Severity</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the incident severity" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {IncidentSeverityEnum.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
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
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select the incident priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {IncidentPriorityEnum.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an incident category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
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
                <Button type="submit">Next Step</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
