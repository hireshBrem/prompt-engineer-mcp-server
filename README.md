# Cursor Prompt Engineer MCP Server

An MCP server implementation that engineers prompts to get better results from Cursor AI.

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
