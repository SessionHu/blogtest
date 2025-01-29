//@ts-check

import http from "node:http";
import * as path from 'node:path';
import * as ssg from "./ssg.js";
import { req2file } from './router.js';

const suffix2mime = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    js: "text/javascript",
    json: "application/json",
    ico: "image/vnd.microsoft.icon",
    html: "text/html",
    css: "text/css"
};

/**
 * @param {string} fname
 */
function guessMime(fname) {
    const suffix = path.extname(fname).substring(1).toLowerCase();
    return suffix2mime[suffix];
}

http.createServer((request, response) => {
    if (request.method !== "GET") {
        response.writeHead(405, {
            "Content-Type": "text/plain"
        });
        response.end("Method Not Allowed");
        return;
    }
    try {
        const target = req2file(`http://${request.headers.host || "0.0.0.0"}${request.url}`);
        const content = ssg.render(target);
        const code = target.includes("404.html") ? 404 : 200;
        response.writeHead(code, {
            "Content-Type": guessMime(target) || ""
        });
        response.end(content);
        console.log(`${request.socket.localAddress}:${request.socket.localPort} - ${code} - ${request.url}`);
    } catch (e) {
        const code = e.code === "ENOENT" ? 404 : 500;
        response.writeHead(code, {
            "Content-Type": "application/json"
        });
        response.end(JSON.stringify(e));
        console.log(`${request.socket.localAddress}:${request.socket.localPort} - ${code} - ${request.url}`);
        console.error(e);
    }
}).listen(8000);

console.log("Server running at http://localhost:8000/");
