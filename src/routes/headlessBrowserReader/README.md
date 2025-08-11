# Headless Browser Reader

This router provides a headless browser-based web page content extraction service that uses Puppeteer to fetch and extract content from web pages. This is more robust than the regular web page reader as it can handle JavaScript-rendered content and bypass certain bot detection mechanisms.

## Features

- **JavaScript Support**: Can extract content from pages that require JavaScript to render
- **Bot Detection Avoidance**: Uses realistic user agents and browser settings
- **Flexible Waiting**: Can wait for specific selectors to appear before extracting content
- **Timeout Control**: Configurable timeout for page loading
- **Content Cleaning**: Automatically removes ads, navigation, and other unwanted elements
- **Browser Instance Reuse**: Reuses browser instances for better performance

## API Endpoints

### GET `/api/headless-browser-reader/get-content`

Extracts content from a web page using a headless browser.

**Query Parameters:**

- `url` (string, required): The URL of the web page to read
- `waitForSelector` (string, optional): CSS selector to wait for before extracting content
- `timeout` (number, optional): Timeout in milliseconds (1000-30000, default: 10000)

**Headers:**

- `x-api-key`: Required API key for authentication

**Response:**

```json
{
  "success": true,
  "message": "Content fetched successfully using headless browser",
  "responseObject": {
    "title": "Page Title",
    "content": "Extracted text content...",
    "url": "https://example.com"
  }
}
```

### POST `/api/headless-browser-reader/cleanup`

Manually cleanup the browser instance (useful for resource management).

**Headers:**

- `x-api-key`: Required API key for authentication

**Response:**

```json
{
  "success": true,
  "message": "Browser instance cleaned up successfully",
  "responseObject": null
}
```

## Usage Examples

### Basic Usage

```bash
curl -X GET "http://localhost:3000/api/headless-browser-reader/get-content?url=https://example.com" \
  -H "x-api-key: your-api-key"
```

### With Wait Selector

```bash
curl -X GET "http://localhost:3000/api/headless-browser-reader/get-content?url=https://example.com&waitForSelector=.main-content" \
  -H "x-api-key: your-api-key"
```

### With Custom Timeout

```bash
curl -X GET "http://localhost:3000/api/headless-browser-reader/get-content?url=https://example.com&timeout=15000" \
  -H "x-api-key: your-api-key"
```

### JavaScript Usage

```javascript
const response = await fetch('/api/headless-browser-reader/get-content?url=https://example.com', {
  headers: {
    'x-api-key': 'your-api-key',
  },
});

const data = await response.json();
console.log(data.responseObject.content);
```

## Differences from Regular Web Page Reader

| Feature              | Web Page Reader | Headless Browser Reader |
| -------------------- | --------------- | ----------------------- |
| JavaScript Support   | ❌ No           | ✅ Yes                  |
| Performance          | ⚡ Fast         | 🐌 Slower               |
| Resource Usage       | 💾 Low          | 💾 High                 |
| Bot Detection Bypass | ❌ Limited      | ✅ Better               |
| Wait for Content     | ❌ No           | ✅ Yes                  |

## Performance Considerations

- The headless browser reader is more resource-intensive than the regular web page reader
- Browser instances are reused to improve performance
- Consider using cleanup endpoint periodically to free resources
- Set appropriate timeouts to avoid hanging requests
- Use this router only when JavaScript rendering is required

## Error Handling

The router handles various error scenarios:

- Invalid URLs
- Timeout errors
- Browser launch failures
- Page navigation errors
- Network connectivity issues

All errors are returned with appropriate HTTP status codes and descriptive messages.

## Security

- Requires API key authentication
- Browser runs in secure mode with restricted permissions
- No file system access from the browser context
- Automatic cleanup on process termination
