"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useIncidentFormStore } from "./IncidentFormStore";
import { Step3Schema } from "@/lib/validation/incidents";
import logger from "@/app/lib/logger";

export default function Step3Form() {
  const router = useRouter();
  const { data, setData } = useIncidentFormStore();

  const defaultValues: z.infer<typeof Step3Schema> = {
    locationAddress: data.locationAddress || "",
    locationLatitude: data.locationLatitude,
    locationLongitude: data.locationLongitude,
    affectedServices: data.affectedServices || [],
  };

  const form = useForm<z.infer<typeof Step3Schema>>({
    resolver: zodResolver(Step3Schema),
    defaultValues,
  });

  const {
    formState: { isSubmitting },
  } = form;

  const handleGetCurrentLocation = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          form.setValue("locationLatitude", position.coords.latitude);
          form.setValue("locationLongitude", position.coords.longitude);
          toast.success("Location captured successfully!");
        },
        (error) => {
          logger.error({ error }, "Geolocation error:");
          toast.error(`Error: ${error.message}`);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  async function onSubmit(values: z.infer<typeof Step3Schema>) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // 500ms delay
    setData(values);
    router.push("/incidents/new/step-4");
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl mx-auto p-6"
    >
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
          <div className="bg-blue-600 h-1.5 rounded-full w-3/4"></div>
        </div>
        <p className="text-sm text-gray-500">Step 3 of 4: Location Details</p>
      </div>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Location & Affected Services</CardTitle>
          <CardDescription>
            Specify where the incident occurred. You can use your current
            location or type an address manually.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="locationAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location / Address</FormLabel>
                    <div className="flex items-center gap-2">
                      <FormControl>
                        <Input
                          placeholder="e.g., Studio B, 5th Floor"
                          {...field}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleGetCurrentLocation}
                      >
                        Use Current Location
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="affectedServices"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Affected Services</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Website, iOS App, Live Broadcast Feed"
                        {...{
                          ...field,
                          value: Array.isArray(field.value)
                            ? field.value.join(", ")
                            : field.value,
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      A comma-separated list of services or systems.
                    </FormDescription>
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
                    "Next Step"
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
