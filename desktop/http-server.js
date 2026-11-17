'use strict';
// A plain HTTP wrapper around the backend. The desktop app does not use it (it serves the same
// handler through its own app:// scheme with no open port); the parity and backend tests do.
const http = require('http');
const { createBackend } = require('./backend');

function startHttpServer({ dataRoot, appRoot, port = 0 }) {
  const backend = createBackend({ dataRoot, appRoot });
  const server = http.createServer((req, res) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end', () => {
      const out = backend.handle(req.method, req.url, Buffer.concat(chunks));
      res.writeHead(out.status, { ...out.headers, 'Content-Length': out.body.length });
      res.end(out.body);
    });
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve({ server, backend, port: server.address().port, close: () => new Promise(r => server.close(r)) })));
}
module.exports = { startHttpServer };
