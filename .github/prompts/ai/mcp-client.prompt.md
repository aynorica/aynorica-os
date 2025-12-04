---
mode: agent
description: Implement MCP HTTP client for tool calls in NestJS
---

# MCP HTTP Protocol Client Prompt

Implement Model Context Protocol client for external tool integration.

## Protocol Overview

MCP uses JSON-RPC 2.0 over HTTP. Single endpoint handles all operations.

### Request Format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/call",
  "params": {
    "name": "get_events",
    "arguments": {
      "user_google_email": "user@example.com",
      "time_min": "2025-12-01",
      "time_max": "2025-12-07"
    }
  }
}
```

### Response Format

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      { "type": "text", "text": "Successfully retrieved 3 events..." }
    ]
  }
}
```

## NestJS MCP Service

```typescript
// mcp.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export class McpError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly data?: unknown,
  ) {
    super(message);
    this.name = 'McpError';
  }
}

@Injectable()
export class McpService implements OnModuleInit {
  private readonly logger = new Logger(McpService.name);
  private readonly mcpUrl: string;
  private sessionId: string | null = null;

  constructor(private readonly configService: ConfigService) {
    this.mcpUrl = this.configService.get<string>('MCP_URL', 'http://localhost:8100');
  }

  async onModuleInit() {
    try {
      await this.initialize();
    } catch {
      this.logger.warn('MCP not available at startup');
    }
  }

  async initialize(): Promise<void> {
    const response = await fetch(`${this.mcpUrl}/mcp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'initialize',
        params: {
          protocolVersion: '2025-06-18',
          capabilities: {},
          clientInfo: { name: 'aynorica', version: '1.0.0' },
        },
      }),
    });

    const sessionId = response.headers.get('Mcp-Session-Id');
    if (sessionId) {
      this.sessionId = sessionId;
      this.logger.log(`MCP session initialized`);
    }
  }

  async callTool(toolName: string, args: Record<string, unknown>): Promise<string> {
    const response = await fetch(`${this.mcpUrl}/mcp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name: toolName, arguments: args },
      }),
    });

    if (!response.ok) {
      throw new Error(`MCP HTTP error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.error) {
      throw new McpError(result.error.code, result.error.message, result.error.data);
    }

    // Extract text from content array
    const content = result.result?.content;
    if (Array.isArray(content)) {
      return content
        .filter((c) => c.type === 'text')
        .map((c) => c.text)
        .join('\n');
    }

    return JSON.stringify(result.result);
  }

  async listTools(): Promise<Array<{ name: string; description: string }>> {
    const response = await fetch(`${this.mcpUrl}/mcp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/list',
        params: {},
      }),
    });

    const result = await response.json();
    if (result.error) throw new Error(result.error.message);
    return result.result?.tools || [];
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2025-06-18',
    };

    if (this.sessionId) {
      headers['Mcp-Session-Id'] = this.sessionId;
    }

    return headers;
  }
}
```

## Error Handling

```typescript
async callToolSafe(
  toolName: string,
  args: Record<string, unknown>,
): Promise<string> {
  try {
    return await this.callTool(toolName, args);
  } catch (error) {
    if (error instanceof McpError) {
      switch (error.code) {
        case -32601: return `Unknown tool: ${toolName}`;
        case -32602: return `Invalid params: ${error.message}`;
        case -32603: return `Server error: ${error.message}`;
        default: return `MCP error (${error.code}): ${error.message}`;
      }
    }

    if (error.message?.includes('fetch')) {
      return 'MCP server unavailable';
    }

    return 'Unexpected error';
  }
}
```

## Timeout Handling

```typescript
async callToolWithTimeout(
  toolName: string,
  args: Record<string, unknown>,
  timeoutMs = 30000,
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${this.mcpUrl}/mcp`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: Date.now(),
        method: 'tools/call',
        params: { name: toolName, arguments: args },
      }),
      signal: controller.signal,
    });
    
    // ... handle response
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Timeout after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}
```

## Session Recovery

```typescript
async callToolWithSessionRecovery(
  toolName: string,
  args: Record<string, unknown>,
): Promise<string> {
  const response = await fetch(`${this.mcpUrl}/mcp`, {
    method: 'POST',
    headers: this.getHeaders(),
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: { name: toolName, arguments: args },
    }),
  });

  // Session expired - reinitialize
  if (response.status === 404 && this.sessionId) {
    this.sessionId = null;
    await this.initialize();
    return this.callTool(toolName, args);
  }

  // ... handle response
}
```

## Required Headers

| Header | Value |
|--------|-------|
| `Content-Type` | `application/json` |
| `Accept` | `application/json, text/event-stream` |
| `MCP-Protocol-Version` | `2025-06-18` |
| `Mcp-Session-Id` | `<session-id>` (if provided) |

## JSON-RPC Methods

| Method | Purpose |
|--------|---------|
| `initialize` | Start session |
| `tools/list` | List available tools |
| `tools/call` | Execute a tool |

## JSON-RPC Error Codes

| Code | Meaning |
|------|---------|
| `-32700` | Parse error |
| `-32600` | Invalid Request |
| `-32601` | Method not found |
| `-32602` | Invalid params |
| `-32603` | Internal error |

## Anti-Patterns

- ❌ Hardcoding tool arguments (use config)
- ❌ Ignoring error responses
- ❌ Creating new connections per request
- ❌ Blocking startup on MCP availability
