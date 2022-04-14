const url = require('url');
const http = require('http');
const path = require('path');
const fs = require('fs');

const server = new http.Server();

const getFilepath = (req) => new URL(req.url, `http://${req.headers.host}`).pathname.slice(1);
const isNested = (pathname) => pathname.split(path.sep).length > 1;
const createReadStream = (pathname) => fs.createReadStream(path.join(__dirname, 'files', pathname));

async function handleGET(req, res) {
  const pathname = getFilepath(req);
  if (isNested(pathname)) {
    res.statusCode = 400;
    return res.end('Unsupported nested file path');
  }

  const readFileStream = createReadStream(pathname);

  req.on('close', () => {
    readFileStream.close();
  });

  return readFileStream
      .on('error', (e) => {
        if (e.code === 'ENOENT') {
          res.statusCode = 404;
        } else {
          res.statusCode = 500;
        }
        res.end();
        readFileStream.close();
      })
      .pipe(res);
}

server.on('request', (req, res) => {
  switch (req.method) {
    case 'GET':
      return handleGET(req, res);

    default:
      res.statusCode = 501;
      return res.end('Not implemented');
  }
});

module.exports = server;
