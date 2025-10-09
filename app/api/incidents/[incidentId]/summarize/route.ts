// import { prisma } from "@/app/lib/prisma";
// import { NextResponse } from "next/server";
// import { auth } from "@clerk/nextjs/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY as string);

// export async function POST(
//   req: Request,
//   { params }: { params: Promise<{ incidentId: string }> }
// ) {
//   try {
//     const { userId } = await auth();
//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }
//     const { incidentId } = await params;

//     if (!incidentId) {
//       return new NextResponse("Incident ID is required", {
//         status: 400,
//       });
//     }

//     const incident = await prisma.incident.findUnique({
//       where: {
//         id: incidentId,
//       },
//       include: {
//         reporter: {
//           select: {
//             firstName: true,
//             lastName: true,
//           },
//         },
//         assignee: {
//           select: {
//             firstName: true,
//             lastName: true,
//           },
//         },
//         category: {
//           select: {
//             name: true,
//           },
//         },
//         department: {
//           select: {
//             name: true,
//           },
//         },
//         statusNotes: {
//           orderBy: {
//             changedAt: "asc",
//           },
//         },
//       },
//     });

//     if (!incident) {
//       return new NextResponse("Incident not found", {
//         status: 404,
//       });
//     }

//     // Construct a comprehensive text for the AI to summarize
//     let incidentText = `Incident Report: ${incident.title}\n`;
//     incidentText += `Description: ${incident.description || "N/A"}\n`;
//     incidentText += `Status: ${incident.status}\n`;
//     incidentText += `Severity: ${incident.severity}\n`;
//     incidentText += `Priority: ${incident.priority}\n`;
//     incidentText += `Category: ${incident.category?.name || "N/A"}\n`;
//     incidentText += `Department: ${incident.department?.name || "N/A"}\n`;
//     incidentText += `Reported by: ${incident.reporter?.firstName || ""} ${
//       incident.reporter?.lastName || ""
//     }\n`;
//     if (incident.assignee) {
//       incidentText += `Assigned to: ${incident.assignee?.firstName || ""} ${
//         incident.assignee?.lastName || ""
//       }\n`;
//     }
//     incidentText += `Occurred At: ${incident.occurredAt.toLocaleString()}\n`;

//     if (incident.statusNotes && incident.statusNotes.length > 0) {
//       incidentText += "\nStatus Updates:\n";
//       incident.statusNotes.forEach((note) => {
//         incidentText += `- [${note.changedAt.toLocaleString()}] Status changed to ${
//           note.status
//         }: ${note.note}\n`;
//       });
//     }

//     const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

//     const prompt = `
//       You are an expert incident summarization agent. Your task is to provide a concise, professional, and informative summary of the provided incident report.
//       Highlight the key details, current status, and any significant updates or resolutions.
//       Keep the summary to a maximum of 200 words.
//       Here is the incident report:
//       ${incidentText}
//     `;

//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     const summary = response.text();

//     if (!summary) {
//       return new NextResponse("Failed to generate summary", {
//         status: 500,
//       });
//     }

//     return NextResponse.json({
//       summary,
//     });
//   } catch (error) {
//     console.error("[INCIDENT_SUMMARIZE_ERROR]", error);
//     return new NextResponse("Internal Server Error", {
//       status: 500,
//     });
//   }
// }

import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
} from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import logger from "@/app/lib/logger";

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error("Missing GOOGLE_API_KEY environment variable");
}

const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// Define a type for the dynamic route parameter

export async function POST(
  req: Request,
  { params }: { params: Promise<{ incidentId: string }> }
) {
  try {
    // 1. Authentication and Authorization
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { incidentId } = await params;
    if (!incidentId) {
      return new NextResponse("Incident ID is required", { status: 400 });
    }

    // 2. Fetch data from Prisma
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        reporter: true, // Prisma includes types automatically
        assignee: true,
        category: true,
        department: true,
        statusNotes: {
          orderBy: { changedAt: "asc" },
        },
      },
    });

    if (!incident) {
      return new NextResponse("Incident not found", { status: 404 });
    }

    // 3. Construct a comprehensive text for the AI
    const incidentText = `
      **Incident Report: ${incident.title}**
      **Description:** ${incident.description || "N/A"}
      **Status:** ${incident.status}
      **Severity:** ${incident.severity}
      **Priority:** ${incident.priority}
      **Category:** ${incident.category?.name || "N/A"}
      **Department:** ${incident.department?.name || "N/A"}
      **Reported by:** ${incident.reporter?.firstName || "N/A"} ${
      incident.reporter?.lastName || "N/A"
    }
      ${
        incident.assignee
          ? `**Assigned to:** ${incident.assignee.firstName} ${incident.assignee.lastName}`
          : ""
      }
      **Occurred At:** ${incident.occurredAt.toLocaleString()}
      ${incident.statusNotes?.length ? "**Status Updates:**" : ""}
      ${incident.statusNotes
        ?.map(
          (note) =>
            `- [${note.changedAt.toLocaleString()}] Status changed to ${
              note.status
            }: ${note.note}`
        )
        .join("\n")}
    `;

    // 4. Initialize the Gemini 1.5 Flash model
    // const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
      You are an expert incident summarization agent. Your task is to provide a concise, professional, and informative summary of the provided incident report.
      Highlight the key details, current status, and any significant updates or resolutions.
      Keep the summary to a maximum of 200 words.
      Here is the incident report:
      ${incidentText}
    `;

    // 5. Generate content from the model
    const result = await model.generateContent(prompt);
    const summary = result.response.text();

    if (!summary) {
      // Handle cases where the model response is empty
      return new NextResponse(
        "Failed to generate summary: Empty response from AI",
        { status: 500 }
      );
    }

    // 6. Return the summary in the response
    return NextResponse.json({ summary });
  } catch (error) {
    // 7. Robust Error Handling
    logger.error({ error }, "[INCIDENT_SUMMARIZE_ERROR]");

    if (error instanceof GoogleGenerativeAIError) {
      // Handle specific Gemini API errors
      return new NextResponse(`Gemini API Error: ${error.message}`, {
        status: 500,
      });
    }

    // General server error
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
