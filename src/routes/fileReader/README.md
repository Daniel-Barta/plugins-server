# File Reader Route

This route allows you to read the content of files from remote URLs.

## Endpoint

```
GET /api/file-reader/get-content
```

## Parameters

- `url` (required): The URL of the file to retrieve content from

## Headers

- `x-api-key` (required): API key for authentication

## Response

Returns a JSON object with the following structure:

```json
{
  "success": true,
  "message": "File content fetched successfully",
  "responseObject": {
    "data": "file content here...",
    "mime_type": "text/plain",
    "encoding": "utf-8",
    "size": 1234
  }
}
```

- `data`: The content of the file. For binary files (or `format=base64`), this is a base64 string.
- `mime_type`: The detected MIME type of the file.
- `encoding`: Either `utf-8` or `base64`, indicating how `data` is encoded.
- `size`: Size in bytes of the original content.

## Example Usage

```bash
# Auto (text file -> utf-8):
curl -X GET "http://localhost:3000/api/file-reader/get-content?url=https://example.com/sample.txt" \
  -H "x-api-key: your-api-key"

# Image (auto -> base64):
curl -X GET "http://localhost:3000/api/file-reader/get-content?url=https://example.com/image.png" \
  -H "x-api-key: your-api-key"
```

## Supported File Types

The route supports various file types including:

- Text files (.txt, .md, .csv, etc.)
- Web files (.html, .css, .js, .json, .xml)
- Office documents (.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx)
- And more

Binary files are automatically encoded as base64 in the response. You can construct a data URL for client consumption:

```
data:<mime_type>;base64,<data>
```

## Error Responses

- `400 Bad Request`: Invalid URL or missing parameters
- `401 Unauthorized`: Missing or invalid API key
- `500 Internal Server Error`: File fetch error or server error
