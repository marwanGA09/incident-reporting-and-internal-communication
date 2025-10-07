import { prisma } from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import { OpenAI } from "openai";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ incidentId: string }> }
) {
  try {
    const { incidentId } = await params;

    if (!incidentId) {
      return new NextResponse("Incident ID is required", {
        status: 400,
      });
    }

    const incident = await prisma.incident.findUnique({
      where: {
        id: incidentId,
      },
      include: {
        reporter: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        assignee: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        category: {
          select: {
            name: true,
          },
        },
        department: {
          select: {
            name: true,
          },
        },
        statusNotes: {
          orderBy: {
            changedAt: "asc",
          },
        },
      },
    });

    if (!incident) {
      return new NextResponse("Incident not found", {
        status: 404,
      });
    }

    // Construct a comprehensive text for the AI to summarize
    let incidentText = `Incident Report: ${incident.title}\n`;
    incidentText += `Description: ${incident.description || "N/A"}\n`;
    incidentText += `Status: ${incident.status}\n`;
    incidentText += `Severity: ${incident.severity}\n`;
    incidentText += `Priority: ${incident.priority}\n`;
    incidentText += `Category: ${incident.category?.name || "N/A"}\n`;
    incidentText += `Department: ${incident.department?.name || "N/A"}\n`;
    incidentText += `Reported by: ${incident.reporter?.firstName || ""} ${
      incident.reporter?.lastName || ""
    }\n`;
    if (incident.assignee) {
      incidentText += `Assigned to: ${incident.assignee?.firstName || ""} ${
        incident.assignee?.lastName || ""
      }\n`;
    }
    incidentText += `Occurred At: ${incident.occurredAt.toLocaleString()}\n`;

    if (incident.statusNotes && incident.statusNotes.length > 0) {
      incidentText += "\nStatus Updates:\n";
      incident.statusNotes.forEach((note) => {
        incidentText += `- [${note.changedAt.toLocaleString()}] Status changed to ${
          note.status
        }: ${note.note}\n`;
      });
    }

    const systemPrompt = `
      You are an expert incident summarization agent. Your task is to provide a concise, professional, and informative summary of the provided incident report.
      Highlight the key details, current status, and any significant updates or resolutions.
      Keep the summary to a maximum of 200 words.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo", // Using a more capable model for summarization
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: incidentText,
        },
      ],
    });

    const summary = response.choices[0].message?.content;

    if (!summary) {
      return new NextResponse("Failed to generate summary", {
        status: 500,
      });
    }

    return NextResponse.json({
      summary,
    });
  } catch (error) {
    console.error("[INCIDENT_SUMMARIZE_ERROR]", error);
    return new NextResponse("Internal Server Error", {
      status: 500,
    });
  }
}
