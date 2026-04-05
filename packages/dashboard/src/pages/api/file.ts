import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

// [api.file.request.1]
export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const filePathParam = url.searchParams.get('url');

  // [api.file.errors.1]
  if (!filePathParam) {
    return new Response(
      JSON.stringify({ error: 'Missing url parameter' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // [api.file.request.1]
  const decodedPath = decodeURIComponent(filePathParam);

  // [api.file.validation.1]
  if (decodedPath.includes('..') || decodedPath.startsWith('/')) {
    return new Response(
      JSON.stringify({ error: 'Invalid path' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    // [api.file.read.1]
    const absolutePath = path.resolve(process.cwd(), decodedPath);

    // Additional security check
    if (!absolutePath.startsWith(process.cwd())) {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
      return new Response(
        JSON.stringify({ error: 'File not found' }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if it's a file (not a directory)
    const stats = fs.statSync(absolutePath);
    if (!stats.isFile()) {
      return new Response(
        JSON.stringify({ error: 'Not a file' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Read file content
    const content = fs.readFileSync(absolutePath, 'utf-8');

    // [api.file.language.1]
    const ext = path.extname(absolutePath).toLowerCase();
    const languageMap: Record<string, string> = {
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.py': 'python',
      '.go': 'go',
      '.rs': 'rust',
      '.json': 'json',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.md': 'markdown',
      '.html': 'html',
      '.css': 'css',
      '.scss': 'scss',
      '.less': 'less',
      '.c': 'c',
      '.cpp': 'cpp',
      '.h': 'c',
      '.hpp': 'cpp',
      '.java': 'java',
      '.rb': 'ruby',
      '.php': 'php',
      '.sh': 'shell',
      '.bash': 'shell',
      '.zsh': 'shell',
    };

    const language = languageMap[ext] || 'plaintext';

    // [api.file.response.1]
    // [api.file.cache.1]
    return new Response(
      JSON.stringify({ content, language }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'max-age=3600',
        },
      }
    );
  } catch (error: any) {
    // [api.file.errors.1]
    console.error('[api/file] Error reading file:', error);

    if (error.code === 'EACCES') {
      return new Response(
        JSON.stringify({ error: 'Access denied' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
