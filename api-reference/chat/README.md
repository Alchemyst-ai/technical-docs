# Chat API Documentation

## Overview

This API provides streaming chat functionality with AI-generated responses, thinking steps, and metadata. The endpoint processes user messages and returns real-time streaming responses.

## Base URL

```
/api/v1
```

## Authentication

All endpoints require Bearer token authentication.

```http
Authorization: Bearer <your-token>
```

## Endpoints

### Generate Streaming Chat Response

**Endpoint:** `POST /api/v1/chat/generate/stream`

Processes user messages and streams back AI-generated responses with thinking steps and metadata in real-time.

#### Request Body

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chatId` | string | No | ID of the chat session. If not provided, a new session will be created. |
| `chat_history` | array | Yes | Array of chat messages containing the conversation history. |
| `persona` | string | No | Persona to use for response generation (default: "maya"). |
| `scope` | string | No | Scope of the conversation (default: "internal"). |
| `tools` | array | No | Optional tools available for the chat. |

#### Chat Message Object

Each message in `chat_history` should contain:

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `content` | string | Yes | The message content. |
| `role` | string | Yes | Message role: `user`, `assistant`, or `system`. |
| `id` | string | No | Unique identifier for the message. |

#### Example Request

```json
{
  "chatId": "60d21b4667d0d8992e610c85",
  "chat_history": [
    {
      "content": "Hello, how are you?",
      "role": "user",
      "id": "msg_001"
    },
    {
      "content": "Hello! I'm doing well, thank you for asking. How can I help you today?",
      "role": "assistant",
      "id": "msg_002"
    },
    {
      "content": "Can you explain artificial intelligence?",
      "role": "user",
      "id": "msg_003"
    }
  ],
  "persona": "maya",
  "scope": "internal",
  "tools": []
}
```

#### Response

The endpoint returns a **Server-Sent Events (SSE)** stream with `Content-Type: text/event-stream`.

##### Stream Event Types

1. **thinking_update** - Shows the AI's reasoning process
2. **final_response** - Contains the final generated response
3. **metadata** - Provides session information and metadata
4. **[DONE]** - Indicates the end of the stream

##### Example Response Stream

```
data: {"type":"thinking_update","content":"Planning response"}

data: {"type":"thinking_update","content":"Analyzing user request"}

data: {"type":"final_response","content":"Here's your answer...","json":{}}

data: {"type":"metadata","content":{"chatId":"60d21b4667d0d8992e610c85","title":"Discussion about AI ethics","replaySessionID":"60d21b4667d0d8992e610c86"}}

data: [DONE]
```

## Response Codes

| Code | Description |
|------|-------------|
| `200` | Success - Streaming response with thinking steps and final results |
| `400` | Bad Request - Invalid request parameters |
| `401` | Unauthorized - User not authenticated |
| `403` | Forbidden - User lacks required scope |
| `500` | Internal Server Error - Server error during processing |

## Error Responses

### Standard Error Format

```json
{
  "message": "Error description"
}
```

### Stream Error Format

For streaming errors (500 status):

```
data: {"content":null,"error":{"message":"Internal server error"}}
```

## Usage Examples

### cURL Example

```bash
curl -X POST "https://your-api-domain.com/api/v1/chat/generate/stream" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token-here" \
  -d '{
    "chat_history": [
      {
        "content": "What is machine learning?",
        "role": "user"
      }
    ],
    "persona": "maya"
  }'
```

### JavaScript Example

```javascript
const response = await fetch('/api/v1/chat/generate/stream', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-token-here'
  },
  body: JSON.stringify({
    chat_history: [
      {
        content: 'Explain quantum computing',
        role: 'user'
      }
    ],
    persona: 'maya'
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { value, done } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') {
        console.log('Stream completed');
        return;
      }
      
      try {
        const parsed = JSON.parse(data);
        console.log('Received:', parsed);
      } catch (e) {
        // Handle parsing errors
      }
    }
  }
}
```

## Notes

- The API uses Server-Sent Events (SSE) for real-time streaming
- Keep connections open to receive the complete streaming response
- Handle network interruptions gracefully by implementing reconnection logic
- The `chatId` is automatically generated if not provided
- Thinking steps provide insight into the AI's reasoning process

## Support

For questions or issues regarding this API, please contact the development team.
