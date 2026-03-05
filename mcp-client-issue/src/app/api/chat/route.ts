import type { UIMessage } from "ai";
import { convertToModelMessages, createUIMessageStreamResponse } from "ai";
import { start } from "workflow/api";
import { createMCPClient } from "@ai-sdk/mcp";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { chatWorkflow } from "@/workflows/chat/workflow";
import { flightBookingTools } from "@/workflows/chat/steps/tools";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const modelMessages = await convertToModelMessages(messages);

  // Create an MCP client using StreamableHTTPClientTransport
  const mcpClient = await createMCPClient({
    transport: new StreamableHTTPClientTransport(
      new URL("https://mcp.context7.com/mcp"), {
        requestInit: {
            headers: {
                CONTEXT7_API_KEY: 'ctx7sk-82e42b89-5d51-4d6c-b942-27a628870804'
            }
        }
      }
    ),
  });

  try {
    // Fetch tools exposed by the remote MCP server
    const mcpTools = await mcpClient.tools();

    // Merge local flight-booking tools with MCP-provided tools
    const allTools = { ...flightBookingTools, ...mcpTools };

    const run = await start(chatWorkflow, [modelMessages, allTools]);

    // Close the MCP client once the stream is consumed
    const stream = run.readable;
    const [s1, s2] = stream.tee();

    // Consume s2 in the background to detect when the stream ends
    (async () => {
      const reader = s2.getReader();
      try {
        while (true) {
          const { done } = await reader.read();
          if (done) break;
        }
      } finally {
        await mcpClient.close();
      }
    })();

    return createUIMessageStreamResponse({
      stream: s1,
    });
  } catch (error) {
    await mcpClient.close();
    throw error;
  }
}
