import type { APIRoute } from 'astro';

// [api.sessions.request.1]
export const GET: APIRoute = async ({ request }) => {
  const profilerHttpUrl = import.meta.env.PUBLIC_PROFILER_HTTP_URL || 'http://localhost:7701';

  try {
    // [api.sessions.fetch.1]
    const response = await fetch(`${profilerHttpUrl}/api/sessions`);

    if (!response.ok) {
      // [api.sessions.errors.1]
      console.error('[api/sessions] Backend returned error:', response.statusText);
      return new Response(
        JSON.stringify({ error: 'Backend unavailable' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();

    // [api.sessions.response.1]
    // [api.sessions.cache.1]
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=5',
      },
    });
  } catch (error) {
    // [api.sessions.errors.1]
    console.error('[api/sessions] Error fetching sessions:', error);

    // Return mock data on error
    const mockData = [
      {
        id: 'mock-session-1',
        target: 'example-app',
        status: 'active',
        startTime: Date.now() - 60000,
        totalSamples: 1234,
        topFile: 'src/index.ts',
        maxScore: 0.75,
        topFunctions: [
          { name: 'processData', heat: 45.2 },
          { name: 'renderUI', heat: 32.1 },
        ],
      },
    ];

    return new Response(JSON.stringify(mockData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=5',
      },
    });
  }
};
