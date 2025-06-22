# API Documentation

Welcome to the comprehensive API documentation for our suite of AI-powered services. This documentation covers three main APIs that work together to provide intelligent context management and chat functionality.

## 📚 API Documentation

### Context API
**See More**: [Api documentation](./api-reference/context/README.md)

RESTful API for managing context data including adding, searching, deleting, and viewing context information with user and organization-level access control.

**Key Features:**
- Add and manage context data
- Semantic search with similarity thresholds
- User and organization-level access control
- Document management

### Chat API
**See More**: [Api documentation](./api-reference/chat/README.md)

Streaming chat functionality with AI-generated responses, thinking steps, and metadata using Server-Sent Events (SSE).

**Key Features:**
- Real-time streaming responses
- AI thinking process visibility
- Persona-based interactions
- Session management

### Context Proxy API
**See More**: [Api documentation](./api-reference/proxy/README.md)

OpenAI-compatible proxy API that provides intelligent context filtering and chat completion capabilities with enhanced message relevance processing.

**Key Features:**
- OpenAI-compatible interface
- Intelligent context filtering
- Message relevance analysis
- Drop-in replacement for OpenAI API

## 🚀 Quick Start

1. **Authentication**: All APIs require Bearer token authentication
   ```
   Authorization: Bearer <your-token>
   ```

2. **Base URLs**:
   - Context API: `/api/v1/context`
   - Chat API: `/api/v1`
   - Context Proxy API: `/api/v1/proxy`

3. **Common Response Codes**:
   - `200/201/202`: Success
   - `400`: Bad Request
   - `401`: Unauthorized
   - `403`: Forbidden
   - `500`: Internal Server Error

## 📖 Additional Resources

<!-- - [Authentication Guide](./docs/authentication.md) -->
- [Error Handling](./api-reference/error-handling.md)
<!-- - [Examples & Tutorials](./docs/examples.md) -->
<!-- - [API Reference](./docs/api-reference.md) -->

<!-- ## 🔧 Development

### Testing
```bash
# Run tests for all APIs
npm test

# Run specific API tests
npm test context
npm test chat
npm test proxy
``` -->
<!-- 
### Environment Setup
```bash
# Copy environment template
cp .env.example .env

# Install dependencies
npm install

# Start development server
npm run dev
``` -->

<!-- ## 📞 Support

For questions, issues, or feature requests:
- 📧 Email: support@your-domain.com
- 🐛 Issues: [GitHub Issues](https://github.com/your-org/your-repo/issues)
- 📖 Documentation: [API Docs](https://docs.your-domain.com) -->

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
