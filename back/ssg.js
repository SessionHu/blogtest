//@ts-check

import * as fs from "node:fs/promises";
import * as path from 'node:path';

/**
 * @param {string} fname
 */
export async function render(fname) {
  const extn = path.extname(fname).toLowerCase();
  if (extn === ".html") {
    return renderHtml(fname);
  } else if (extn === ".md") {
    return renderMd(fname);
  } else {
    return fs.readFile(fname);
  }
}

/**
 * @param {string} fname
 * @param {any} options
 * @returns {Promise<string | Buffer<ArrayBufferLike>>}
 */
async function readHTML(fname, options = void 0) {
  return fs.readFile(fname, {
    encoding: 'utf8',
    ...options
  }).then((res) => {
    if (res instanceof String && res.match(/(\<script\>)|(\<pre.*?\>)/)) {
      return res.replace(/\s+/g, ' ');
    } else {
      return res;
    }
  });
}

/**
 * @returns {Promise<string>}
 */
async function readBaseHTML() {
  return (await readHTML('./front/index.html')).toString();
}

/**
 * @param {string} fname
 */
async function renderHtml(fname) {
    const fc = readHTML(fname);
    return (await readBaseHTML()).replace('MAIN-CONTENT', (await fc).toString());
}

/**
 * @param {string} fname
 */
async function renderMd(fname) {
    const mdc = await fs.readFile(fname, { encoding: "utf8" });
    return (await readBaseHTML()).replace('MAIN-CONTENT', `
        <div class="layui-panel layui-card">
            <div class="layui-card-header"><!--breadcrumb--></div>
            <div class="layui-card-body">
                <pre class="md-prerender">${mdc}</pre>
            </div>
        </div>
    `);
}
