#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

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

async function formatCursorPrompt(prompt: string, taskType: string = "code_generation", language: string = "typescript") {
  console.error(`Formatting prompt for task type: ${taskType} in ${language}`);
  
  // Begin with a standard structure
  let formattedPrompt = "";
  
  // Add task-specific formatting
  switch (taskType) {
    case "code_generation":
      formattedPrompt = `# Task: Generate Code
## Language: ${language}
## Requirements:
${prompt}

## Expected Output:
- Clean, well-structured ${language} code
- Include appropriate error handling
- Follow best practices for ${language}`;
      break;
      
    case "debugging":
      formattedPrompt = `# Task: Debug Code Issue
## Language: ${language}
## Problem Description:
${prompt}

## Expected Output:
- Identify the root cause of the bug
- Provide a working solution
- Explain why the bug occurred`;
      break;
      
    case "refactoring":
      formattedPrompt = `# Task: Refactor Code
## Language: ${language}
## Current Code and Refactoring Goals:
${prompt}

## Expected Output:
- Refactored version that improves:
  - Readability
  - Performance
  - Maintainability
- Brief explanation of key improvements`;
      break;
      
    case "explanation":
      formattedPrompt = `# Task: Explain Code
## Language: ${language}
## Code to Explain:
${prompt}

## Expected Output:
- Clear explanation of code functionality
- Breakdown of complex parts
- Any potential issues or optimization opportunities`;
      break;
      
    default:
      // General formatting for other types
      formattedPrompt = `# Task: ${taskType.charAt(0).toUpperCase() + taskType.slice(1)}
## Language: ${language}
## Details:
${prompt}

## Expected Output:
- Comprehensive solution
- Well-structured response
- Focus on quality and correctness`;
  }
  
  return formattedPrompt;
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
        const formattedPrompt = await formatCursorPrompt(prompt, task_type, language);
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

// Using explicit declaration for Node.js process
declare const process: {
  exit: (code: number) => never;
  stderr: { write: (message: string) => void };
};

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
