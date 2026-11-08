import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeStream } from './file-stream.js';

const port = Number(process.env.PORT) || 4172;
const repositoryRoot = fileURLToPath(new URL('..', import.meta.url));
const root = join(repositoryRoot, 'public');
const docsRoot = join(repositoryRoot, '..', 'docs');
const maximumBytes = 35 * 1024 * 1024;
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
};

function sendJson(response, status, body) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  });
  response.end(JSON.stringify(body));
}

async function analyzeUpload(request, response) {
  const contentLength = Number(request.headers['content-length'] || 0);
  if (!contentLength) {
    sendJson(response, 400, { error: 'El archivo está vacío.' });
    return;
  }
  if (contentLength > maximumBytes) {
    sendJson(response, 413, { error: 'El archivo supera el límite de 35 MB.' });
    return;
  }
  let receivedBytes = 0;
  request.on('data', (chunk) => {
    receivedBytes += chunk.length;
    if (receivedBytes > maximumBytes) request.destroy();
  });
  try {
    const result = await analyzeStream(request);
    sendJson(response, 200, {
      ...result,
      fileName: decodeURIComponent(request.headers['x-file-name'] || 'archivo'),
      mimeType: request.headers['content-type'] || 'application/octet-stream',
    });
  } catch (error) {
    if (!response.headersSent) {
      sendJson(response, 500, {
        error: error.code === 'ECONNRESET'
          ? 'La carga fue interrumpida.'
          : 'No fue posible procesar el archivo.',
      });
    }
  }
}

function serveStatic(request, response) {
  const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  const servesReport = pathname === '/informe' || pathname.startsWith('/docs/');
  const selectedRoot = servesReport ? docsRoot : root;
  const relativePath = pathname === '/'
    ? 'index.html'
    : pathname === '/informe'
      ? 'informe.html'
      : servesReport
        ? pathname.slice('/docs/'.length)
        : pathname.slice(1);
  const filePath = normalize(join(selectedRoot, relativePath));
  if (!filePath.startsWith(selectedRoot)) {
    response.writeHead(403).end('Acceso denegado');
    return;
  }
  try {
    if (!statSync(filePath).isFile()) throw new Error('Not found');
    response.writeHead(200, {
      'Content-Type': contentTypes[extname(filePath)] || 'application/octet-stream',
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Archivo no encontrado');
  }
}

createServer((request, response) => {
  if (request.method === 'POST' && request.url === '/api/analyze') {
    analyzeUpload(request, response);
    return;
  }
  if (request.method === 'GET') {
    serveStatic(request, response);
    return;
  }
  response.writeHead(405, { Allow: 'GET, POST' }).end('Método no permitido');
}).listen(port, () => console.log('StreamLab disponible en http://localhost:' + port));
