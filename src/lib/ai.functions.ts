import { createServerFn } from "@tanstack/react-start";
import { generateText, generateObject } from "ai";
import { z } from "zod";
import { DEFAULT_MODEL, getGateway } from "./ai-gateway.server";
import {
  buildEmailPrompt,
  buildPlanPrompt,
  CHAT_SYSTEM_PROMPT,
  type EmailInput,
  type PlanInput,
} from "./prompts";

const emailSchema = z.object({
  jobTitle: z.string().default(""),
  company: z.string().default(""),
  context: z.string().min(1),
  audience: z.string().min(1),
  tone: z.string().min(1),
  notes: z.string().optional(),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => emailSchema.parse(data) as EmailInput)
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const model = gateway(DEFAULT_MODEL);
    const { text } = await generateText({
      model,
      prompt: buildEmailPrompt(data),
    });
    return { text };
  });

const planSchema = z.object({
  goal: z.string().min(1),
  deadline: z.string().default(""),
  hoursPerDay: z.number().min(1).max(24).default(2),
  priority: z.string().default("medium"),
});

const planOutputSchema = z.object({
  summary: z.string(),
  tasks: z.array(
    z.object({
      name: z.string(),
      deadline: z.string(),
      priority: z.enum(["low", "medium", "high"]),
      estimatedDuration: z.string(),
      notes: z.string(),
    }),
  ),
});

export type GeneratedPlan = z.infer<typeof planOutputSchema>;

export const generatePlan = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => planSchema.parse(data) as PlanInput)
  .handler(async ({ data }) => {
    const gateway = getGateway({ structuredOutputs: true });
    const model = gateway(DEFAULT_MODEL);
    const { object } = await generateObject({
      model,
      schema: planOutputSchema,
      prompt: buildPlanPrompt(data),
    });
    return object;
  });

const chatSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => chatSchema.parse(data))
  .handler(async ({ data }) => {
    const gateway = getGateway();
    const model = gateway(DEFAULT_MODEL);
    const { text } = await generateText({
      model,
      system: CHAT_SYSTEM_PROMPT,
      messages: data.messages,
    });
    return { text };
  });
