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
| `chained`  | boolean | No | To be chained or not |

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
    "documents": [
      {
        "content": "User preferences for AI interactions"
      }
    ],
    "source": "platform/maya/smart-settings.upload",
    "context_type": "resource",
    "chained": "false"
    "scope": "internal"
  }'
```

### Searching Context

```bash
curl -X POST /api/v1/context/search \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "user preferences",
    "similarity_threshold": 0.8,
    "minimum_similarity_threshold": 0.5,
    "scope": "internal",
    "metadata": {}
  }'
```

### Deleting Context

```bash
curl -X POST /api/v1/context/delete \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "source": "file Name",
    "by_doc": true,
    "by_id" : false
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
