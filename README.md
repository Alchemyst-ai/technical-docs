# Context API Documentation

A RESTful API for managing context data including adding, searching, deleting, and viewing context information with user and organization-level access control.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
  - [Add Context](#add-context)
  - [Search Context](#search-context)
  - [Delete Context](#delete-context)
  - [View Context](#view-context)
  - [View Documents](#view-documents)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Authentication

All endpoints require Bearer token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-token>
```

## Base URL

```
/api/v1/context
```

## Endpoints

### Add Context

**POST** `/api/v1/context/add`

Adds context data to the context processor for further handling.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | No | Unique identifier of the user |
| `organization_id` | string | No | Organization ID (nullable) |
| `documents` | array | No | Array of document objects with content and metadata |
| `source` | string | No | Source of the context data |
| `context_type` | string | No | Type: `resource`, `conversation`, or `instruction` |
| `scope` | string | No | Scope: `internal` or `external` (default: `internal`) |
| `metadata` | object | No | Additional metadata (default: `{}`) |

#### Document Object Structure

```json
{
  "content": "string",
  "additionalProperties": "string"
}
```

#### Responses

| Status | Description |
|--------|-------------|
| `201` | Context added successfully |
| `400` | Invalid or missing context data |
| `401` | User not authenticated |
| `500` | Internal server error |

---

### Search Context

**POST** `/api/v1/context/search`

Searches for context data based on similarity thresholds and query parameters.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `user_id` | string | No | ID of the user making the request |
| `query` | string | **Yes** | Search query string |
| `similarity_threshold` | number | **Yes** | Maximum similarity threshold (0-1) |
| `minimum_similarity_threshold` | number | **Yes** | Minimum similarity threshold (0-1) |
| `scope` | string | No | Search scope: `internal` or `external` (default: `internal`) |
| `metadata` | object | No | Additional search metadata (default: `{}`) |

#### Responses

| Status | Description |
|--------|-------------|
| `202` | Search request processed successfully |
| `400` | Invalid or missing search parameters |
| `500` | Internal server error |

#### Response Format (202)

```json
{
  "results": [
    {
      "contextId": "string",
      "contextData": "string"
    }
  ]
}
```

---

### Delete Context

**POST** `/api/v1/context/delete`

Deletes context data based on specified parameters.

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `source` | string | No | Source identifier for the context |
| `user_id` | string | No | User ID (nullable) |
| `organization_id` | string | No | Organization ID (nullable) |
| `by_doc` | boolean | No | Delete by document (default: `true`) |
| `by_id` | boolean | No | Delete by ID (default: `false`) |

#### Responses

| Status | Description |
|--------|-------------|
| `204` | Successfully deleted context |
| `400` | Invalid request parameters |
| `401` | User not authenticated |
| `403` | User lacks required permissions |
| `500` | Internal server error |

---

### View Context

**GET** `/api/v1/context/view`

Retrieves context information for the authenticated user.

#### Responses

| Status | Description |
|--------|-------------|
| `200` | Successfully retrieved context |
| `401` | User not authenticated |
| `403` | User lacks required scope |
| `500` | Internal server error |

#### Response Format (200)

```json
{
  "context": [
    // Array of context items
  ]
}
```

---

### View Documents

**GET** `/api/v1/context/view/docs`

Retrieves documents view for the authenticated user with optional organization context.

#### Responses

| Status | Description |
|--------|-------------|
| `200` | Successfully retrieved documents view |
| `401` | User not authenticated |
| `402` | Invalid user |
| `403` | User lacks required scope |
| `default` | Unexpected error from context processor |

---

## Error Handling

### Common Error Response Format

```json
{
  "response": "Error message with details",
  "error": "Error type"
}
```

### HTTP Status Codes

- **200**: Success
- **201**: Created successfully
- **202**: Accepted and processed
- **204**: Successfully deleted (no content)
- **400**: Bad Request - Invalid parameters
- **401**: Unauthorized - Authentication required
- **402**: Invalid user
- **403**: Forbidden - Insufficient permissions
- **500**: Internal Server Error

---

## Examples

### Adding Context

```bash
curl -X POST /api/v1/context/add \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "documents": [
      {
        "content": "User preferences for AI interactions"
      }
    ],
    "source": "user_settings",
    "context_type": "resource",
    "scope": "internal"
  }'
```

### Searching Context

```bash
curl -X POST /api/v1/context/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "query": "user preferences",
    "similarity_threshold": 0.8,
    "minimum_similarity_threshold": 0.5,
    "scope": "internal"
  }'
```

### Deleting Context

```bash
curl -X POST /api/v1/context/delete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "user_settings",
    "user_id": "user123",
    "by_doc": true
  }'
```

### Viewing Context

```bash
curl -X GET /api/v1/context/view \
  -H "Authorization: Bearer <token>"
```

### Viewing Documents

```bash
curl -X GET /api/v1/context/view/docs \
  -H "Authorization: Bearer <token>"
```

---

## Notes

- All endpoints require proper authentication via Bearer tokens
- Similarity thresholds must be between 0 and 1, with `similarity_threshold` >= `minimum_similarity_threshold`
- Context types are limited to: `resource`, `conversation`, `instruction`
- Scope options are: `internal`, `external`
- Organization-level access control is supported where applicable

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

# Context Proxy API Documentation

An OpenAI-compatible proxy API that provides intelligent context filtering and chat completion capabilities with enhanced message relevance processing.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoint](#endpoint)
- [Features](#features)
- [Request Format](#request-format)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Implementation Details](#implementation-details)

## Overview

The Context Proxy API acts as an intelligent middleware between your application and OpenAI-compatible language models. It automatically filters chat history for relevance, processes context data, and forwards optimized requests to the underlying AI service.

### Key Benefits

- **Intelligent Context Filtering**: Automatically removes irrelevant messages from chat history
- **OpenAI Compatibility**: Drop-in replacement for OpenAI's chat completions API
- **Relevance Processing**: Uses AI to determine message relevance with configurable strictness
- **Optimized Performance**: Reduces token usage by filtering unnecessary context

## Authentication

The endpoint requires Bearer token authentication:

```
Authorization: Bearer <your-token>
```

## Base URL

```
/api/v1/proxy
```

## Endpoint

### Chat Completions

**POST** `/api/v1/proxy/{proxyUrl}/{OpenAIAPIKey}/chat/completions`

Provides OpenAI-compatible chat completions with intelligent context processing.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `proxyUrl` | string | The base URL of the target OpenAI-compatible API |
| `OpenAIAPIKey` | string | API key for the target service |

#### URL Structure Example
```
/api/v1/proxy/https://api.openai.com/v1/sk-your-api-key-here/chat/completions
```

## Features

### Intelligent Message Filtering

The API automatically processes chat history to:

1. **Remove Duplicate Messages**: Filters out repeated user queries and responses
2. **Relevance Analysis**: Uses AI to determine if historical messages are relevant to the current query
3. **Context Optimization**: Maintains conversation flow while reducing token usage
4. **Role Alternation**: Ensures proper alternation between user and assistant messages

### Relevance Detection Modes

- **Very Strict** (default): Minimal false positives, conservative relevance matching
- **Strict**: Balanced approach with moderate relevance threshold  
- **Lax**: More inclusive relevance matching

## Request Format

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `model` | string | **Yes** | Model identifier for completion |
| `messages` | array | **Yes** | Array of message objects |
| `max_tokens` | number | No | Maximum tokens in response |
| `temperature` | number | No | Sampling temperature (0-2) |
| `top_p` | number | No | Nucleus sampling parameter |
| `frequency_penalty` | number | No | Frequency penalty (-2 to 2) |
| `presence_penalty` | number | No | Presence penalty (-2 to 2) |
| `stream` | boolean | No | Whether to stream responses |

### Message Object Structure

```json
{
  "role": "user|assistant|system",
  "content": "string"
}
```

#### Supported Roles

- `system`: System instructions and context
- `user`: User messages and queries  
- `assistant`: AI assistant responses

### Complete Request Example

```json
{
  "model": "gpt-3.5-turbo",
  "messages": [
    {
      "role": "system",
      "content": "You are a helpful assistant."
    },
    {
      "role": "user", 
      "content": "What is machine learning?"
    },
    {
      "role": "assistant",
      "content": "Machine learning is a subset of artificial intelligence..."
    },
    {
      "role": "user",
      "content": "Can you explain neural networks?"
    }
  ],
  "max_tokens": 150,
  "temperature": 0.7
}
```

## Response Format

### Success Response (200)

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1677858242,
  "model": "gpt-3.5-turbo",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Neural networks are computing systems inspired by biological neural networks..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 56,
    "completion_tokens": 31,
    "total_tokens": 87
  }
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier for the completion |
| `object` | string | Object type (always "chat.completion") |
| `created` | number | Unix timestamp of creation |
| `model` | string | Model used for completion |
| `choices` | array | Array of completion choices |
| `usage` | object | Token usage statistics |

## Error Handling

### Error Response Format

```json
{
  "error": {
    "message": "Error description",
    "type": "error_type",
    "code": "error_code"
  }
}
```

### HTTP Status Codes

| Status | Description | Error Type |
|--------|-------------|------------|
| `200` | Success | - |
| `400` | Bad Request | `invalid_request_error` |
| `401` | Unauthorized | `authentication_error` |
| `500` | Internal Server Error | `server_error` |

### Common Error Codes

- `invalid_request`: Malformed request body
- `invalid_messages`: Missing or invalid messages array
- `internal_error`: Server processing error

## Examples

### Basic Chat Completion

```bash
curl -X POST "/api/v1/proxy/https://api.openai.com/v1/sk-your-key/chat/completions" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "user",
        "content": "Hello, how are you?"
      }
    ]
  }'
```

### Multi-turn Conversation

```bash
curl -X POST "/api/v1/proxy/https://api.openai.com/v1/sk-your-key/chat/completions" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-3.5-turbo",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful coding assistant."
      },
      {
        "role": "user",
        "content": "How do I create a Python list?"
      },
      {
        "role": "assistant", 
        "content": "You can create a Python list using square brackets: my_list = [1, 2, 3]"
      },
      {
        "role": "user",
        "content": "How do I add items to this list?"
      }
    ],
    "temperature": 0.3,
    "max_tokens": 100
  }'
```

### With Custom Parameters

```bash
curl -X POST "/api/v1/proxy/https://api.custom-ai.com/v1/custom-key/chat/completions" \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "custom-model-v1",
    "messages": [
      {
        "role": "user",
        "content": "Explain quantum computing"
      }
    ],
    "temperature": 0.8,
    "top_p": 0.9,
    "max_tokens": 200,
    "frequency_penalty": 0.1,
    "presence_penalty": 0.1
  }'
```

## Implementation Details

### Context Processing Algorithm

1. **Message Validation**: Validates request format and required fields
2. **History Processing**: Removes duplicate and irrelevant messages
3. **Relevance Analysis**: Uses AI to score message relevance to current query
4. **Role Alternation**: Ensures proper conversation structure
5. **API Forwarding**: Sends optimized request to target API
6. **Response Handling**: Returns standard OpenAI-compatible response

### Relevance Scoring

The system uses an internal AI model to evaluate message relevance:

```typescript
checkIfTwoMessagesAreRelevant(
  originalQuery: string,
  message: string, 
  mode: "lax" | "strict" | "very strict" = "very strict"
)
```

### Performance Optimizations

- **Parallel Processing**: Relevance checks run concurrently
- **Smart Filtering**: Removes consecutive messages from same role
- **Token Optimization**: Reduces context size while preserving meaning
- **Caching**: Internal caching for repeated relevance checks

### Supported AI Providers

The proxy works with any OpenAI-compatible API including:
- OpenAI GPT models
- Anthropic Claude (via compatibility layers)
- Custom fine-tuned models
- Local AI deployments
- Other LLM providers with OpenAI-compatible endpoints

## Notes and Best Practices

- **Message Order**: Maintain proper chronological order in message arrays
- **Context Length**: Be mindful of model context limits; the proxy helps optimize but doesn't eliminate limits
- **API Keys**: Ensure API keys have appropriate permissions for the target service
- **Rate Limiting**: Respect rate limits of the underlying AI service
- **Error Handling**: Implement proper error handling for production use
- **Monitoring**: Monitor token usage and costs as the proxy may affect usage patterns

## Security Considerations

- **API Key Protection**: API keys are passed in the URL path - ensure secure transmission
- **Authentication**: Always use HTTPS and proper authentication
- **Input Validation**: The system validates inputs but additional validation is recommended
- **Logging**: Be cautious about logging sensitive conversation data