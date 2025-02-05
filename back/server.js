//@ts-check

import http from "node:http";
import net from 'node:net';
import path from "node:path";
import { render } from "./ssg.js";
import { req2file } from './router.js';

const mimeTypes = new Map([
  ['png', "image/png"],
  ['jpg', "image/jpeg"],
  ['jpeg', "image/jpeg"],
  ['js', "text/javascript"],
  ['json', "application/json"],
  ['ico', "image/vnd.microsoft.icon"],
  ['html', "text/html"],
  ['css', "text/css"],
  ['md', 'text/html'] // rendered
]);

/**
 * @param {http.ServerResponse} res
 * @param {any} err
 */
async function sendNotFound(res, err = void 0) {
  const [content, type] = await (async () => {
    try {
      return [await render('front/404.html'), 'text/html'];
    } catch (e) {
      return [JSON.stringify(err || e), 'application/json'];
    }
  })();
  res.writeHead(404, { 'content-type': type });
  res.end(content);
}

/**
 * @param {net.Socket} socket
 */
function socketRemoteAddr(socket) {
  if (socket.remoteFamily === 'IPv6') {
    return `[${socket.remoteAddress}]:${socket.remotePort}`;
  } else {
    return socket.remoteAddress + ':' + socket.remotePort;
  }
}

/**
 * @param {string} fname
 * @return {string}
 */
function guessMimeType(fname) {
  const extn = path.extname(fname).substring(1).toLowerCase();
  return mimeTypes.get(extn) || 'application/octet-stream';
}

http.createServer(async (request, response) => {
  if (request.method !== "GET") {
    response.writeHead(405, {
      "content-type": "text/plain",
      'cache-control': 'max-age=0'
    });
    return response.end("Method Not Allowed");
  }
  const target = req2file(request.url || '/');
  if (target.includes('front/404.html')) {
    await sendNotFound(response);
    console.log(socketRemoteAddr(request.socket), 404, request.url);
    return;
  }
  try {
    const content = await render(target);
    response.writeHead(200, {
      "content-type": guessMimeType(target),
      'cache-control': 'max-age=0'
    });
    response.end(content);
    console.log(socketRemoteAddr(request.socket), 200, request.url);
  } catch (/** @type {any} */e) {
    if (e.code && e.code === "ENOENT") {
      await sendNotFound(response, e);
      console.warn(socketRemoteAddr(request.socket), 404, request.url, e);
      return;
    }
    response.writeHead(500, {
      "content-type": "application/json",
      'cache-control': 'max-age=0'
    });
    response.end(JSON.stringify(e));
    console.error(socketRemoteAddr(request.socket), 500, request.url, e);
  }
}).listen(8000);

console.log("Server running at http://localhost:8000/");
