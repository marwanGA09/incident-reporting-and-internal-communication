"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useIncidentFormStore } from "../_components/IncidentFormStore";
import { Step1Schema } from "@/lib/validation/incidents";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Step1() {
  const router = useRouter();
  const { data, setData } = useIncidentFormStore();

  const form = useForm<z.infer<typeof Step1Schema>>({
    resolver: zodResolver(Step1Schema),
    defaultValues: {
      title: data.title || "",
      description: data.description || "",
      occurredAt: data.occurredAt || new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof Step1Schema>) {
    setData(values);
    router.push("/incidents/new/step-2");
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto"
    >
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
          <div className="bg-blue-600 h-1.5 rounded-full w-1/4"></div>
        </div>
        <p className="text-sm text-gray-500">Step 1 of 4: Basic Info</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
          <CardDescription>
            Start by describing what happened and when.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Main website is down"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a detailed description of the incident..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occurredAt"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date and Time of Occurrence</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP HH:mm")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            if (!date) return;
                            const hours = field.value?.getHours() || 0;
                            const minutes = field.value?.getMinutes() || 0;
                            date.setHours(hours);
                            date.setMinutes(minutes);
                            field.onChange(date);
                          }}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                        />
                        <div className="p-2 border-t border-border">
                          <p className="text-sm text-muted-foreground mb-2">
                            Time
                          </p>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              max="23"
                              value={format(field.value, "HH")}
                              onChange={(e) => {
                                const newDate = new Date(field.value);
                                newDate.setHours(parseInt(e.target.value, 10));
                                field.onChange(newDate);
                              }}
                              className="w-16"
                            />
                            <span>:</span>
                            <Input
                              type="number"
                              min="0"
                              max="59"
                              value={format(field.value, "mm")}
                              onChange={(e) => {
                                const newDate = new Date(field.value);
                                newDate.setMinutes(
                                  parseInt(e.target.value, 10)
                                );
                                field.onChange(newDate);
                              }}
                              className="w-16"
                            />
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end">
                <Button type="submit">Next Step</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
