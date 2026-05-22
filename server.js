const http = require('http');
const { parse } = require('url');
const next = require('next');

const dev     = process.env.NODE_ENV !== 'production';
const hostname= '127.0.0.1';
const port    = parseInt(process.env.PORT, 10) || 3000;

const app     = next({ dev, hostname, port });
const handle  = app.getRequestHandler();

app.prepare().then(() => {
  http.createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, err => {
    if (err) throw err;
    console.log(`> Next.js server running at http://${hostname}:${port}`);
  });
});
