import http from "node:http";
import * as ssg from "./ssg.js";

/**
 * @param {string} url
 */
function routerFront(url) {
    const path = new URL(url).pathname;
    if (path === "/") { // /
        return "./front/home.html";
    } else if (path.match(/^\/posts\/\d{4,}\/.+$/)) { // /posts/YYYY/xxx
        return "./front" + path.replace(/(\/|)$/, ".md");
    } else if (path.match(/^[^\.]+$/)) { // /xxxxx/xx/
        return "./front" + path.replace(/(\/|)$/, ".html");
    } else if (path.match(/^\/[^\.]+\..+$/)) { // /xxx/xx.xx
        return "./front" + path;
    } else { // /???
        return "./front/404.html";
    }
}

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
    const suffix = fname.substring(fname.lastIndexOf(".") + 1);
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
        const target = routerFront(`http://${request.headers.host || "0.0.0.0"}${request.url}`);
        const content = ssg.render(target);
        const code = target === "./front/404.html" ? 404 : 200;
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
