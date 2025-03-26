#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { ChatAnthropic } from "@langchain/anthropic";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";

// Using explicit declaration for Node.js process with environment variables
declare const process: {
  exit: (code: number) => never;
  stderr: { write: (message: string) => void };
  env: Record<string, string | undefined>;
};

const REWRITE_CODING_PROMPT_TOOL: Tool = {
  name: "rewrite_coding_prompt",
  description: "Rewrites user's coding prompts before passing to AI IDE (e.g. Cursor AI) to get the best results from AI IDE.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "The raw user's prompt that needs rewriting"
      }
    },
    required: ["prompt"],
    title: "rewrite_coding_promptArguments"
  }
};

// Server implementation
const server = new Server(
  {
    name: "coding-prompt-engineer",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

function isPromptFormatArgs(args: unknown): args is { 
  prompt: string; 
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "prompt" in args &&
    typeof (args as { prompt: string }).prompt === "string"
  );
}

async function rewriteCodingPrompt(prompt: string, language: string = "typescript") {
  // Check if API key is available
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set. Using fallback formatting.");
  }
  
  // Initialize Anthropic model
  const model = new ChatAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    temperature: 0.2, // Low temperature for more consistent, structured output
    modelName: "claude-3-7-sonnet-20250219", // Using a fast, cost-effective model
  });
  
  // Create the system prompt for Claude
  const systemPromptText = `You are an expert prompt engineer specializing in creating optimal prompts for code-related AI tasks.
Your job is to take a user's raw Cursor AI's prompt and transform it into a well-structured, detailed prompt that will get the best results from Cursor AI.

Your output should ONLY be the edited prompt that will get the best results from Cursor AI or any IDEwith no additional commentary, explanations, or metadata.`;

  // Create message objects
  const systemMessage = new SystemMessage(systemPromptText);
  const userMessage = new HumanMessage(`Here is my raw prompt: \n\n${prompt}\n\nPlease format this into an optimal prompt for Cursor AI.`);
  
  // Call the model with the messages
  const response = await model.invoke([systemMessage, userMessage]);
  
  // Ensure we have a valid response
  if (!response || typeof response.content !== 'string') {
    throw new Error('Invalid response from Claude API');
  }

  // Return the formatted prompt
  return response.content;
}

// Tool handlers
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [REWRITE_CODING_PROMPT_TOOL],  
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    switch (name) {
      case "rewrite_coding_prompt": {
        if (!isPromptFormatArgs(args)) {
          throw new Error("Invalid arguments for rewrite_coding_prompt");
        }
        const { prompt } = args;
        const rewrittenPrompt = await rewriteCodingPrompt(prompt);
        return {
          content: [{ type: "text", text: rewrittenPrompt }],
          isError: false,
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Cursor Prompt Formatter MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
