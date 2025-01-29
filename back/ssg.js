//@ts-check
/// <reference path = "./sessx.d.ts" />

import * as fs from "node:fs/promises";
import * as path from 'node:path';
import { md2html } from './md2html.js';

/**
 * @param {string} fname
 * @param {SSGCache} cache
 */
export async function render(fname, cache = {}) {
  const extn = path.extname(fname).toLowerCase();
  if (extn === ".html") {
    return renderHTML(fname, cache);
  } else if (extn === ".md") {
    return renderMarkdown(fname, cache);
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
 * @param {SSGCache} cache
 */
async function renderHTML(fname, cache = {}) {
  const fc = readHTML(fname);
  return (cache.basehtml || (cache.basehtml = await readBaseHTML())).replace('MAIN-CONTENT', (await fc).toString());
}

/**
 * @param {string} fname
 * @param {SSGCache} cache
 */
async function renderMarkdown(fname, cache = {}) {
  const mdfc = await fs.readFile(fname, { encoding: "utf8" });
  // basic information
  const year = (fname.match(/\d{4,}/) || [])[0];
  const basename = path.basename(fname);
  let categoryName;
  let titleName;
  let datetime;
  let image;
  let tags = [""];
  // fill information
  /** @type {PostsIndexYearly[]} */
  const postsIndexJson = cache.postsindex || (cache.postsindex = JSON.parse(await fs.readFile("posts/index.json", 'utf8')));
  for (const aYearPosts of postsIndexJson) {
    if (aYearPosts.year === Number(year)) {
      for (const aPost of aYearPosts.posts) {
        if (aPost.fname === basename) {
          categoryName = aPost.category;
          titleName = aPost.title;
          datetime = new Date(aPost.time);
          image = aPost.image;
          tags = aPost.tags
          break;
        }
      }
      break;
    }
  }
  // colorful tags
  let colorfultags = "";
  const bgcolors = [
    "layui-bg-red", "layui-bg-orange", "layui-bg-green", "layui-bg-cyan",
    "layui-bg-blue", "layui-bg-purple", "layui-bg-black", "layui-bg-gray"
  ];
  let bgi = 0;
  for (const atag of tags) {
    colorfultags += `<code class="${bgcolors[bgi++ % bgcolors.length]}">${atag}</code> `;
  }
  // return
  return (cache.basehtml || (cache.basehtml = await readBaseHTML())).replace('MAIN-CONTENT', `
    <div class="layui-panel layui-card">
      <h1 id="main-title" class="layui-card-header">
        <span class="layui-breadcrumb" lay-separator=">" lay-filter="bc">
          <a href="/">首页</a>
          <a href="/category/">分类</a>
          <a href="/category/#${categoryName}">${categoryName}</a>
          <a><cite>${datetime ? datetime.toLocaleString().replace(/\:00$/, '') : void 0}</cite></a>
          <a><cite>${titleName}</cite></a>
        </span>
      </h1>
      <div class="layui-card-body" id="main">
        <div class="postcard layui-margin-2 layui-panel" id="latest-post-${datetime ? datetime.getTime() : void 0}">
          <div class="postcard-bg" style="background-image:url('${image}');"></div>
          <div class="postcard-desc layui-padding-2">
            <div class="postcard-title layui-font-32">${titleName}</div>
            <div class="postcard-sub" style="opacity:.84;">${colorfultags}</div>
          </div>
        </div>
        <div class="layui-text">
          ${md2html(mdfc).replace(new RegExp("<h1[^>]*>.*?</h1>", 'gi'), "")}
        </div>
      </div>
    </div>
 `);
}
