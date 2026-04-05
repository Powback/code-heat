**Type:** TypeScript Node.js HTTP Server
**Output:** sample-app/src/index.ts

# Sample Node.js HTTP Server for Profiling Tests

## Server Setup
[proj.sample.1.1] Use Node.js built-in `http` module (no framework dependencies)
[proj.sample.1.2] Listen on port 3000
[proj.sample.1.3] Respond with appropriate HTTP status and content-type headers for each route

## Root Route: GET /
[proj.sample.1.4] Serve HTML page with title "code-heat Sample App"
[proj.sample.1.5] Include navigation links to all test endpoints (/fibonacci, /sort, /matrix)
[proj.sample.1.6] HTML should display description of what each endpoint does and recommended query parameters

## Fibonacci Endpoint: GET /fibonacci?n=<N>
[proj.sample.1.7] Query parameter "n": number (e.g., 40)
[proj.sample.1.8] Implement recursive fibonacci function (deliberately inefficient for profiling)
[proj.sample.1.9] Validate n is a positive number; return error if invalid
[proj.sample.1.10] Recommended test value: n=40 (creates obvious hot spots in flame graph)
[proj.sample.1.11] Return JSON response: { result: number, n: number, computeTime: milliseconds }

## Sort Endpoint: GET /sort?size=<N>
[proj.sample.1.12] Query parameter "size": number (array size in elements)
[proj.sample.1.13] Create array of random numbers with specified size
[proj.sample.1.14] Implement bubble sort algorithm (deliberately inefficient)
[proj.sample.1.15] Return JSON response: { sorted: boolean, size: number, computeTime: milliseconds }

## Matrix Multiplication Endpoint: GET /matrix?size=<N>
[proj.sample.1.16] Query parameter "size": dimension N for N×N matrix multiplication
[proj.sample.1.17] Create two random N×N matrices
[proj.sample.1.18] Implement naive matrix multiplication (O(n³) algorithm)
[proj.sample.1.19] Return JSON response: { size: number, multiplied: boolean, computeTime: milliseconds }

## Error Handling
[proj.sample.1.20] All endpoints validate query parameters and return 400 Bad Request if invalid
[proj.sample.1.21] Include error message in response: { error: "message" }
[proj.sample.1.22] 404 response for unknown routes

## Startup
[proj.sample.1.23] Start with command: `node --inspect src/index.js`
[proj.sample.1.24] This enables the Chrome DevTools Protocol debugger on port 9229 (default)
[proj.sample.1.25] Print server listening message to console on startup