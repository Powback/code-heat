**Type:** Astro API endpoint (GET)  
**Output:** packages/dashboard/src/pages/api/sessions.ts

## GET /api/sessions Endpoint

### Request Handling [api.sessions.request.1]
- Accept GET request to /api/sessions
- No query parameters required

### Backend Fetch [api.sessions.fetch.1]
- Fetch from environment variable PROFILER_HTTP_URL (e.g., http://localhost:7701)
- Endpoint: `/api/sessions`
- Fallback on error: return mock data or empty array

### Response Format [api.sessions.response.1]
- Content-Type: application/json
- Body: JSON array of SessionSummary objects:
  ```
  [
    {
      id: string,
      target: string,
      status: 'active' | 'stopped',
      startTime: number (timestamp),
      totalSamples: number,
      topFile: string,
      maxScore: number (0-1),
      topFunctions: [{name: string, heat: number}]
    }
  ]
  ```

### Error Handling [api.sessions.errors.1]
- If PROFILER_HTTP_URL not set: log warning, return mock data
- Network error: return 500 with {error: "Backend unavailable"}
- Parse error: return 500 with {error: "Invalid backend response"}

### Caching [api.sessions.cache.1]
- Optional: cache for 5s to reduce backend load
- Set response headers: Cache-Control: max-age=5