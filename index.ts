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

const PROMPT_FORMAT_TOOL: Tool = {
  name: "format_cursor_prompt",
  description: "Formats prompts to get the best results from Cursor AI.",
  inputSchema: {
    type: "object",
    properties: {
      prompt: {
        type: "string",
        description: "The raw prompt that needs formatting"
      },
      task_type: {
        type: "string",
        description: "Type of task (code generation, debugging, refactoring, etc.)",
        enum: ["code_generation", "debugging", "refactoring", "explanation", "other"],
        default: "code_generation"
      },
      language: {
        type: "string",
        description: "Target programming language",
        default: "typescript"
      }
    },
    required: ["prompt"],
    title: "format_cursor_promptArguments"
  }
};

// Server implementation
const server = new Server(
  {
    name: "cursor-prompt-formatter",
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
  task_type?: string;
  language?: string;
} {
  return (
    typeof args === "object" &&
    args !== null &&
    "prompt" in args &&
    typeof (args as { prompt: string }).prompt === "string"
  );
}

async function formatCursorPrompt(prompt: string, language: string = "typescript") {
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
  tools: [PROMPT_FORMAT_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    switch (name) {
      case "format_cursor_prompt": {
        if (!isPromptFormatArgs(args)) {
          throw new Error("Invalid arguments for format_cursor_prompt");
        }
        const { prompt, task_type = "code_generation", language = "typescript" } = args;
        const formattedPrompt = await formatCursorPrompt(prompt, language);
        return {
          content: [{ type: "text", text: formattedPrompt }],
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
