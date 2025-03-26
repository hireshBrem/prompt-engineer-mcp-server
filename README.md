# Coding Prompt Engineer MCP Server

This Model Context Protocol (MCP) server provides a tool to rewrite coding prompts for optimal results with Cursor AI and other AI IDEs, using Claude by Anthropic.

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

If no API key is provided, the server will throw an error indicating the missing API key.

### Running the Server

```bash
npm start
```

Or with MCP Inspector:
```bash
npx @modelcontextprotocol/inspector npm start
```

## Tool: rewrite_coding_prompt

This tool takes a raw prompt and rewrites it for optimal results with Cursor AI and other AI IDEs.

### Parameters

- `prompt` (required): The raw user's prompt that needs rewriting
- `language` (required): The programming language of the code

### Example Usage

```json
{
  "name": "rewrite_coding_prompt",
  "arguments": {
    "prompt": "Create a function to convert temperature between Celsius and Fahrenheit",
    "language": "typescript"
  }
}
```

## How It Works

The server uses Claude 3 Sonnet by Anthropic to intelligently rewrite your prompts for better results. It enhances your prompt by:

1. Adding clear structure and context
2. Specifying requirements and expectations
3. Including language-specific considerations
4. Optimizing for AI IDE understanding

## Features

- **Intelligent Prompt Engineering**: Uses Claude 3 Sonnet to rewrite prompts for optimal results
- **Language-Aware**: Customizes prompts based on target programming language
- **Easy Integration**: Works seamlessly with Cursor and other AI IDEs
- **Low Temperature Setting**: Uses 0.2 temperature for consistent, structured output

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

With arguments:
```json
{
  "prompt": "Create a function that sorts an array of objects by a specific property",
  "language": "typescript"
}
```

The tool will rewrite the prompt to be more structured and detailed for optimal results with your AI IDE.

## License

This MCP server is licensed under the MIT License. This means you are free to use, modify, and distribute the software, subject to the terms and conditions of the MIT License. For more details, please see the LICENSE file in the project repository.
