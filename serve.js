// Zero-dependency static file server. Run with `npm start` and open http://localhost:8080
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 8080;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

http.createServer(async (req, res) => {
  try {
    let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (urlPath.endsWith('/')) urlPath += 'index.html';
    const file = path.normalize(path.join(root, urlPath));
    if (!file.startsWith(root)) throw new Error('forbidden');
    const info = await stat(file);
    if (info.isDirectory()) {
      res.writeHead(302, { Location: urlPath + '/' });
      return res.end();
    }
    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': types[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(body);
  } catch (err) {
    res.writeHead(err.message === 'forbidden' ? 403 : 404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
}).listen(port, () => {
  console.log(`TAOCP math tutor running at http://localhost:${port}`);
});
