import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getGroqClient } from "@/lib/ai";
import { logActivity } from "@/server/helpers/log-activity";
import { requireUserId } from "@/server/helpers/session";
import {
  AI_TYPES,
  buildMessages,
  loadProjectContext,
  type AiType,
} from "@/server/helpers/ai-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  projectId: z.string().min(1),
  prompt: z.string().min(1).max(5000),
  type: z.enum(AI_TYPES),
});

/**
 * Tokens are streamed straight through rather than returned in one blob.
 *
 * The previous build faked this by slicing a finished string every 10ms, which
 * made a fast model feel slow and a slow one feel broken. This is the real
 * thing, and it is the one place a route handler is warranted instead of a
 * server action.
 */
export async function POST(request: NextRequest) {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return NextResponse.json({ error: "Sign in to use AI features." }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "That request was malformed." }, { status: 400 });
  }

  const { projectId, prompt, type } = parsed.data;

  const context = await loadProjectContext(projectId, userId);
  if (!context) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  let stream;
  try {
    const groq = getGroqClient();
    stream = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: buildMessages(type as AiType, prompt, context),
      temperature: 0.7,
      max_tokens: 2048,
      stream: true,
    });
  } catch (error) {
    const missingKey = String(error).includes("GROQ_API_KEY");
    return NextResponse.json(
      {
        error: missingKey
          ? "AI is not configured on this deployment. Add GROQ_API_KEY to enable it."
          : "The AI service did not respond. Try again in a moment.",
      },
      { status: missingKey ? 503 : 502 }
    );
  }

  const encoder = new TextEncoder();
  let produced = "";

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content;
          if (!text) continue;
          produced += text;
          controller.enqueue(encoder.encode(text));
        }
        // Logged once the generation actually completed, not when it began.
        await logActivity({
          userId,
          action: "ai.generation",
          entityType: "project",
          entityId: projectId,
        });
      } catch {
        controller.enqueue(
          encoder.encode("\n\n_Generation stopped early. Try again._")
        );
      } finally {
        controller.close();
      }
    },
    cancel() {
      if (produced.length === 0) return;
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
