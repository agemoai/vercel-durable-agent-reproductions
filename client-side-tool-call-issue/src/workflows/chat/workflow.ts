import { DurableAgent } from "@workflow/ai/agent";
import { getWritable } from "workflow";
import { openai } from "@workflow/ai/openai";
import { flightBookingTools } from "./steps/tools";
import type { ModelMessage, UIMessageChunk } from "ai";

const FLIGHT_ASSISTANT_PROMPT = `You are a helpful flight booking assistant. You can help users:
- Search for flights between airports
- Check flight status
- Get airport information
- Book flights
- Check baggage allowance

Always be polite and provide clear, concise information. When searching for flights, 
ask for the origin, destination, and date if not provided. When booking, confirm the 
details with the user before proceeding.`;

export async function chatWorkflow(messages: ModelMessage[]) {
  "use workflow";

  const writable = getWritable<UIMessageChunk>();

  const agent = new DurableAgent({
    model: openai("gpt-4o-mini"),
    system: FLIGHT_ASSISTANT_PROMPT,
    tools: flightBookingTools,
  });

  await agent.stream({
    messages,
    writable,
  });
}
