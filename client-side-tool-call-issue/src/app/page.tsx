"use client";

import { useChat } from "@ai-sdk/react";
import {
  isToolUIPart,
  getToolName,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { useState } from "react";

export default function Chat() {
  const [input, setInput] = useState("");
  const { messages, sendMessage, status, addToolOutput } = useChat({
    // Automatically resubmit when all client-side tool results are filled
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,

    // Handle client-side tool calls (tools with no server-side execute)
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === "getUserLocation") {
        // Attempt to get real browser geolocation, fall back to a mock
        try {
          const position = await new Promise<GeolocationPosition>(
            (resolve, reject) =>
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                timeout: 5000,
              })
          );

          // Don't await addToolOutput inside onToolCall to avoid deadlocks
          addToolOutput({
            tool: "getUserLocation",
            toolCallId: toolCall.toolCallId,
            output: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              city: "Detected via browser geolocation",
            },
          });
        } catch {
          // Fallback: return a mock location
          addToolOutput({
            tool: "getUserLocation",
            toolCallId: toolCall.toolCallId,
            output: {
              latitude: 40.7128,
              longitude: -74.006,
              city: "New York",
              note: "Mock location (geolocation unavailable)",
            },
          });
        }
      }
    },
  });

  const isLoading = status === "streaming" || status === "submitted";

  return (
    <div className="flex flex-col w-full max-w-2xl mx-auto min-h-screen py-8 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">
        ✈️ Flight Booking Assistant
      </h1>
      <p className="text-sm text-gray-500 mb-4 text-center">
        Powered by a Durable AI Agent (Vercel Workflow DevKit)
      </p>

      <div className="flex-1 space-y-4 mb-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <p className="text-lg">Ask me about flights!</p>
            <p className="text-sm mt-2">
              Try: &quot;Search for flights from JFK to LAX on 2026-04-01&quot;
            </p>
            <p className="text-sm mt-1">
              Or: &quot;Find flights near me&quot; (uses client-side location
              tool)
            </p>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              }`}
            >
              {message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <div
                      key={`${message.id}-${i}`}
                      className="whitespace-pre-wrap"
                    >
                      {part.text}
                    </div>
                  );
                }
                if (isToolUIPart(part)) {
                  return (
                    <div
                      key={`${message.id}-${i}`}
                      className="text-xs mt-2 p-2 bg-gray-200 dark:bg-gray-700 rounded"
                    >
                      🔧 Tool: {getToolName(part)}
                      {part.state === "output-available" && (
                        <pre className="mt-1 overflow-x-auto">
                          {JSON.stringify(part.output, null, 2)}
                        </pre>
                      )}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim()) return;
          sendMessage({ text: input });
          setInput("");
        }}
        className="flex gap-2"
      >
        <input
          className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          placeholder="Ask about flights..."
          onChange={(e) => setInput(e.currentTarget.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send
        </button>
      </form>
    </div>
  );
}
