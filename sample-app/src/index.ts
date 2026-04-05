// [proj.sample.1.1]
import http from 'http';
import { URL } from 'url';

// [proj.sample.1.8] Recursive fibonacci (deliberately inefficient for profiling)
function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// [proj.sample.1.14] Bubble sort algorithm (deliberately inefficient)
function bubbleSort(arr: number[]): number[] {
  const sorted = [...arr];
  const n = sorted.length;
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (sorted[j] > sorted[j + 1]) {
        const temp = sorted[j];
        sorted[j] = sorted[j + 1];
        sorted[j + 1] = temp;
      }
    }
  }
  return sorted;
}

// [proj.sample.1.18] Naive matrix multiplication (O(n³) algorithm)
function multiplyMatrices(a: number[][], b: number[][]): number[][] {
  const n = a.length;
  const result: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      for (let k = 0; k < n; k++) {
        result[i][j] += a[i][k] * b[k][j];
      }
    }
  }

  return result;
}

// [proj.sample.1.1] Use Node.js built-in http module
const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const pathname = url.pathname;

  // [proj.sample.1.3] Set appropriate headers
  res.setHeader('Content-Type', 'application/json');

  try {
    // [proj.sample.1.4] Root route
    if (pathname === '/') {
      res.setHeader('Content-Type', 'text/html');
      res.statusCode = 200;
      // [proj.sample.1.5]
      // [proj.sample.1.6] Include navigation links to all test endpoints with descriptions
      res.end(`
<!DOCTYPE html>
<html>
<head>
  <title>code-heat Sample App</title>
  <style>
    body { font-family: sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #333; }
    .endpoint { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .endpoint h2 { margin-top: 0; color: #007acc; }
    code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }
    a { color: #007acc; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>code-heat Sample App</h1>
  <p>Test endpoints for profiling performance bottlenecks:</p>

  <div class="endpoint">
    <h2>Fibonacci</h2>
    <p>Recursive fibonacci computation (creates obvious hot spots)</p>
    <p><strong>Recommended:</strong> <a href="/fibonacci?n=40"><code>GET /fibonacci?n=40</code></a></p>
    <p>Returns: <code>{ result: number, n: number, computeTime: ms }</code></p>
  </div>

  <div class="endpoint">
    <h2>Bubble Sort</h2>
    <p>Sorts a random array using bubble sort algorithm</p>
    <p><strong>Recommended:</strong> <a href="/sort?size=10000"><code>GET /sort?size=10000</code></a></p>
    <p>Returns: <code>{ sorted: boolean, size: number, computeTime: ms }</code></p>
  </div>

  <div class="endpoint">
    <h2>Matrix Multiplication</h2>
    <p>Naive matrix multiplication (O(n³) complexity)</p>
    <p><strong>Recommended:</strong> <a href="/matrix?size=100"><code>GET /matrix?size=100</code></a></p>
    <p>Returns: <code>{ size: number, multiplied: boolean, computeTime: ms }</code></p>
  </div>
</body>
</html>
      `);
      return;
    }

    // [proj.sample.1.7] Fibonacci endpoint
    if (pathname === '/fibonacci') {
      const nParam = url.searchParams.get('n');
      // [proj.sample.1.9]
      // [proj.sample.1.10] Validate n is a positive number; test with n=40 for obvious hot spots
      if (!nParam || isNaN(Number(nParam)) || Number(nParam) < 0) {
        res.statusCode = 400;
        // [proj.sample.1.21]
        res.end(JSON.stringify({ error: 'Invalid parameter: n must be a positive number' }));
        return;
      }

      const n = Number(nParam);
      const start = Date.now();
      // [proj.sample.1.8] [proj.sample.1.10]
      const result = fibonacci(n);
      const computeTime = Date.now() - start;

      res.statusCode = 200;
      // [proj.sample.1.11]
      res.end(JSON.stringify({ result, n, computeTime }));
      return;
    }

    // [proj.sample.1.12] Sort endpoint
    if (pathname === '/sort') {
      const sizeParam = url.searchParams.get('size');
      if (!sizeParam || isNaN(Number(sizeParam)) || Number(sizeParam) <= 0) {
        res.statusCode = 400;
        // [proj.sample.1.20] [proj.sample.1.21]
        res.end(JSON.stringify({ error: 'Invalid parameter: size must be a positive number' }));
        return;
      }

      const size = Number(sizeParam);
      // [proj.sample.1.13] Create random array
      const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 1000));

      const start = Date.now();
      // [proj.sample.1.14] Bubble sort
      const sorted = bubbleSort(arr);
      const computeTime = Date.now() - start;

      res.statusCode = 200;
      // [proj.sample.1.15]
      res.end(JSON.stringify({ sorted: true, size, computeTime }));
      return;
    }

    // [proj.sample.1.16] Matrix multiplication endpoint
    if (pathname === '/matrix') {
      const sizeParam = url.searchParams.get('size');
      if (!sizeParam || isNaN(Number(sizeParam)) || Number(sizeParam) <= 0) {
        res.statusCode = 400;
        // [proj.sample.1.20] [proj.sample.1.21]
        res.end(JSON.stringify({ error: 'Invalid parameter: size must be a positive number' }));
        return;
      }

      const size = Number(sizeParam);
      // [proj.sample.1.17] Create two random N×N matrices
      const matrixA = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.random())
      );
      const matrixB = Array.from({ length: size }, () =>
        Array.from({ length: size }, () => Math.random())
      );

      const start = Date.now();
      // [proj.sample.1.18] Naive matrix multiplication
      const result = multiplyMatrices(matrixA, matrixB);
      const computeTime = Date.now() - start;

      res.statusCode = 200;
      // [proj.sample.1.19]
      res.end(JSON.stringify({ size, multiplied: true, computeTime }));
      return;
    }

    // [proj.sample.1.22] 404 for unknown routes
    res.statusCode = 404;
    res.end(JSON.stringify({ error: 'Not found' }));
  } catch (error: any) {
    // [proj.sample.1.20]
    res.statusCode = 500;
    res.end(JSON.stringify({ error: error.message || 'Internal server error' }));
  }
});

// [proj.sample.1.2] Listen on port 3000
// [proj.sample.1.23] Startup: node --inspect src/index.ts (enables DevTools debugger)
// [proj.sample.1.24]
// [proj.sample.1.25] Chrome DevTools Protocol debugger on port 9229; print listening messages on startup
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`✓ code-heat Sample App listening on http://localhost:${PORT}`);
  console.log(`✓ Node.js inspector enabled on ws://127.0.0.1:9229 (--inspect flag)`);
  console.log(`\nTest endpoints:`);
  console.log(`  • http://localhost:${PORT}/fibonacci?n=40`);
  console.log(`  • http://localhost:${PORT}/sort?size=10000`);
  console.log(`  • http://localhost:${PORT}/matrix?size=100`);
});
