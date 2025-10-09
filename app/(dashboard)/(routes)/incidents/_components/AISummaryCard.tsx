"use client";

import * as React from "react";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AISummaryCardProps {
  incidentId: string;
}

export function AISummaryCard({ incidentId }: AISummaryCardProps) {
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  const handleSummarize = async () => {
    setIsSummarizing(true);
    setAiSummary(null); // Clear previous summary
    try {
      const response = await fetch(
        `/api/incidents/${incidentId}/summarize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate summary. Please try again.");
      }

      const result = await response.json();
      setAiSummary(result.summary);
      toast.success("AI summary generated successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "An unknown error occurred."
      );
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">AI Summary</CardTitle>
        <Button
          onClick={handleSummarize}
          disabled={isSummarizing}
          size="sm"
          variant="outline"
        >
          {isSummarizing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Summary
        </Button>
      </CardHeader>
      <CardContent>
        {aiSummary ? (
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {aiSummary}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Click &apos;Generate Summary&apos; to get an AI-powered overview of this
            incident.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
