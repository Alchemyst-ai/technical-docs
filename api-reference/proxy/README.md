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

### Default Route (No OpenAI API Required)

**POST** `/api/v1/proxy/default/chat/completions`

For users who don't have an OpenAI API key, this route provides chat completions using our own infrastructure without requiring external API keys.

> **Note:** When using the default route, you must set the `model` field to `alchemyst-ai/alchemyst-c1`.

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

> **Note:** If you are using the default route (`/api/v1/proxy/default/chat/completions`), you must set `"model": "alchemyst-ai/alchemyst-c1"` instead of `"gpt-3.5-turbo"`.

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
