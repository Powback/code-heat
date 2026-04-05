**Type:** Astro API endpoint (GET)  
**Output:** packages/dashboard/src/pages/api/file.ts

## GET /api/file Endpoint

### Request Handling [api.file.request.1]
- Accept GET request with query parameter: ?url={encodedPath}
- Decode URL parameter: decodeURIComponent(url)

### Path Validation [api.file.validation.1]
- Reject paths containing ".." or leading "/" (security check)
- Accept relative paths from project root
- Optional: maintain whitelist of allowed directories

### File Reading [api.file.read.1]
- Use fs.readFileSync() or Deno.readTextFile() to load source
- If not found: return 404 with {error: "File not found"}
- If directory: return 400 with {error: "Not a file"}
- If permission denied: return 403 with {error: "Access denied"}

### Language Detection [api.file.language.1]
- Map file extension to Monaco language mode:
  - .ts, .tsx → typescript
  - .js, .jsx → javascript
  - .py → python
  - .go → go
  - .rs → rust
  - .json → json
  - .yml, .yaml → yaml
  - .md → markdown
  - default → plaintext

### Response Format [api.file.response.1]
- Content-Type: application/json
- Body: {content: string, language: string}
- Content is raw file text (may contain newlines, special chars)

### Error Responses [api.file.errors.1]
- 400: invalid path (missing url parameter, ".." detected)
- 404: file not found
- 403: permission denied
- 500: unexpected read error

### Caching [api.file.cache.1]
- Set Cache-Control: max-age=3600 (cache 1 hour for static files)