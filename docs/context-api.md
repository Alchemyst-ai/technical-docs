# Context API Documentation

A RESTful API for managing context data including adding, searching, deleting, and viewing context information with user and organization-level access control.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Endpoints](#endpoints)
- [Error Handling](#error-handling)
- [Examples](#examples)

## Overview

The Context API provides comprehensive context management capabilities with:
- **Semantic Search**: Find relevant context using similarity thresholds
- **Access Control**: User and organization-level permissions
- **Document Management**: Handle multiple document types and metadata
- **Flexible Scoping**: Internal and external context separation

## Authentication

All endpoints require Bearer token authentication:

```http
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

- `201`: Context added successfully
- `400`: Invalid or missing context data
- `401`: User not authenticated
- `500`: Internal server error

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

- `204`: Successfully deleted context
- `400`: Invalid request parameters
- `401`: User not authenticated
- `403`: User lacks required permissions
- `500`: Internal server error

---

### View Context

**GET** `/api/v1/context/view`

Retrieves context information for the authenticated user.

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

- `200`: Successfully retrieved documents view
- `401`: User not authenticated
- `402`: Invalid user
- `403`: User lacks required scope

## Error Handling

### Common Error Response Format

```json
{
  "response": "Error message with details",
  "error": "Error type"
}
```

See [Error Handling Guide](./error-handling.md) for complete error reference.

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

For more examples, see [Examples & Tutorials](./examples.md).

## Notes

- Similarity thresholds must be between 0 and 1, with `similarity_threshold` >= `minimum_similarity_threshold`
- Context types are limited to: `resource`, `conversation`, `instruction`
- Scope options are: `internal`, `external`
- Organization-level access control is supported where applicable

---

**Related Documentation:**
- [Main README](../README.md)
- [Chat API](./chat-api.md)
- [Context Proxy API](./context-proxy-api.md)
- [Authentication Guide](./authentication.md)