# Cursor Prompt Formatter MCP Server

This Model Context Protocol (MCP) server provides a tool to format prompts for optimal results with Cursor AI, using Claude by Anthropic.

## Installation

```bash
npm install
```

### Install via Smithery

You can install this MCP server directly through Smithery by visiting:
https://smithery.ai/server/@hireshBrem/prompt-engineer-mcp-server

## Usage

### Setting Environment Variables

The server requires an Anthropic API key to use Claude for formatting. Set it as an environment variable:

```bash
export ANTHROPIC_API_KEY=your_anthropic_api_key
```

If no API key is provided, the server will fall back to a basic formatting template.

### Running the Server

```bash
npm start
```

Or with MCP Inspector:
```bash
npx @modelcontextprotocol/inspector npm start
```

## Tool: format_cursor_prompt

This tool takes a raw prompt and formats it for optimal results with Cursor AI.

### Parameters

- `prompt` (required): The raw prompt text that needs formatting
- `task_type` (optional): Type of task (code_generation, debugging, refactoring, explanation, other)
- `language` (optional): Target programming language (default: typescript)

### Example Usage

```json
{
  "name": "format_cursor_prompt",
  "arguments": {
    "prompt": "Create a function to convert temperature between Celsius and Fahrenheit",
    "task_type": "code_generation",
    "language": "typescript"
  }
}
```

## How It Works

The server uses Claude by Anthropic via LangChain to intelligently reformat your prompt for better results. It enhances your prompt by:

1. Adding clear structure with appropriate headers
2. Specifying expected outputs and requirements
3. Including language-specific best practices
4. Clarifying context and constraints

If no Anthropic API key is available, it falls back to a simple template-based formatter.

## Features

- **Structured Prompt Engineering**: Automatically structures prompts for optimal results
- **Task-Specific Templates**: Specialized formats for code generation, debugging, refactoring, and explanations
- **Language-Aware**: Customizes prompts based on target programming language
- **Easy Integration**: Works seamlessly with Cursor and Claude Desktop

## Tools

- **format_cursor_prompt**
  - Engineers raw prompts into structured templates for better results
  - Inputs:
    - `prompt` (string): The raw prompt that needs engineering
    - `task_type` (string, optional): Type of task (code_generation, debugging, refactoring, explanation, other)
    - `language` (string, optional): Target programming language

## Configuration

### Usage with Claude Desktop
Add this to your `claude_desktop_config.json`:

### NPX

```json
{
  "mcpServers": {
    "cursor-prompt-engineer": {
      "command": "npx",
      "args": [
        "-y",
        "cursor-prompt-engineer"
      ]
    }
  }
}
```

### Local Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cursor-prompt-engineer.git
cd cursor-prompt-engineer

# Install dependencies
npm install

# Run the server
node index.js
```

## Example

Input:
```
Create a function that sorts an array of objects by a specific property
```

Output:
```
# Task: Generate Code
## Language: typescript
## Requirements:
Create a function that sorts an array of objects by a specific property

## Expected Output:
- Clean, well-structured typescript code
- Include appropriate error handling
- Follow best practices for typescript
```

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
