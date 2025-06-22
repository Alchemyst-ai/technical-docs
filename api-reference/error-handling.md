# Error Handling Guide

Comprehensive guide to handling errors across all API endpoints.

## Table of Contents

- [Overview](#overview)
- [HTTP Status Codes](#http-status-codes)
- [Error Response Formats](#error-response-formats)
- [API-Specific Errors](#api-specific-errors)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

All APIs use consistent HTTP status codes and error response formats to provide clear feedback about request failures. Understanding these patterns will help you implement robust error handling in your applications.

## HTTP Status Codes

### Success Codes
| Code | Description | Usage |
|------|-------------|-------|
| `200` | OK | Successful GET requests |
| `201` | Created | Successful POST requests that create resources |
| `202` | Accepted | Request accepted for processing (async operations) |
| `204` | No Content | Successful DELETE requests |

### Client Error Codes
| Code | Description | Common Causes |
|------|-------------|---------------|
| `400` | Bad Request | Invalid request format, missing required fields |
| `401` | Unauthorized | Missing or invalid authentication token |
| `402` | Payment Required | Invalid user (Context API specific) |
| `403` | Forbidden | Insufficient permissions for the requested resource |
| `404` | Not Found | Resource or endpoint does not exist |
| `422` | Unprocessable Entity | Request format is valid but contains semantic errors |
| `429` | Too Many Requests | Rate limit exceeded |

### Server Error Codes
| Code | Description | Action |
|------|-------------|--------|
| `500` | Internal Server Error | Server-side error, retry with exponential backoff |
| `502` | Bad Gateway | Proxy or upstream server error |
| `503` | Service Unavailable | Service temporarily unavailable |
| `504` | Gateway Timeout | Request timeout, consider retrying |

## Error Response Formats

### Standard Error Format

Most APIs return errors in this format:

```json
{
  "response": "Error message with details",
  "error": "Error type"
}
```

### OpenAI-Compatible Format (Context Proxy API)

```json
{
  "error": {
    "message": "Error description",
    "type": "error_type",
    "code": "error_code"
  }
}
```

### Streaming Error Format (Chat API)

For Server-Sent Events streams:

```
data: {"content":null,"error":{"message":"Internal server error"}}
```

## API-Specific Errors

### Context API Errors
