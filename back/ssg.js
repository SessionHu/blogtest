//@ts-check
/// <reference path = "./sessx.d.ts" />

import fs from "node:fs/promises";
import path from 'node:path';
import { md2html } from './md2html.js';

/**
 * @param {string} fname
 * @param {SSGCache} cache
 */
export async function render(fname, cache = {}) {
  const extn = path.extname(fname = path.normalize(fname)).toLowerCase();
  if (extn === ".html") {
    if (fname === 'front/home.html') return renderHomeHTML(cache);
    else return renderHTML(readHTML(fname).then((res) => res.toString()), cache);
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
  }).then(/** @param {any} res */(res) => {
    if (typeof res === 'string' && !res.match(/(\<script\>)|(\<pre.*?\>)/)) {
      return res.replace(/\s+/g, ' ');
    } else {
      return res;
    }
  });
}

/**
 * @param {SSGCache} cache
 * @returns {Promise<string>}
 */
async function readBaseHTML(cache = {}) {
  return cache.basehtml || (cache.basehtml = (await readHTML('./front/index.html')).toString());
}

/**
 * @param {SSGCache} cache
 * @returns {Promise<PostsIndexYearly[]>}
 */
async function readPostsIndex(cache = {}) {
  if (cache.postsindex) return cache.postsindex;
  /** @type {PostsIndexYearly[]} */
  const piya = JSON.parse(await fs.readFile("posts/index.json", 'utf8'));
  piya.sort((a, b) => b.year - a.year);
  for (let i = 0; i < piya.length; i++) {
    piya[i].posts.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
  }
  return cache.postsindex = piya;
}

/**
 * @param {string | Promise<string>} content
 * @param {SSGCache} cache
 */
async function renderHTML(content, cache = {}) {
  return (await readBaseHTML(cache)).replace('MAIN-CONTENT', (await content).toString());
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
  let date;
  let image;
  let tags = [""];
  // fill information
  /** @type {PostsIndexYearly[]} */
  const postsIndexJson = await readPostsIndex(cache);
  for (const aYearPosts of postsIndexJson) {
    if (aYearPosts.year === Number(year)) {
      for (const aPost of aYearPosts.posts) {
        if (aPost.fname === basename) {
          categoryName = aPost.category;
          titleName = aPost.title;
          date = new Date(aPost.time);
          image = aPost.image;
          tags = aPost.tags
          break;
        }
      }
      break;
    }
  }
  // colorful tags
  const colorfultags = [];
  const bgcolors = [
    "layui-bg-red", "layui-bg-orange", "layui-bg-green", "layui-bg-cyan",
    "layui-bg-blue", "layui-bg-purple", "layui-bg-black", "layui-bg-gray"
  ];
  for (let i = 0; i < tags.length; i++) {
    colorfultags.push(`<code class="${bgcolors[i % bgcolors.length]}">${tags[i]}</code>`);
  }
  // return
  if (!date) date = new Date(0);
  return (await readBaseHTML(cache)).replace('MAIN-CONTENT', `
    <div class="layui-panel layui-card">
      <h1 id="main-title" class="layui-card-header">
        <span class="layui-breadcrumb" lay-separator=">">
          <a href="/">首页</a>
          <a href="/category/">分类</a>
          <a href="/category/#${categoryName}">${categoryName}</a>
          <a><cite><time datetime="${date.toISOString()}">${date.toLocaleString('zh').replace(/\:00$/, "")}</time></cite></a>
          <a><cite>${titleName}</cite></a>
        </span>
      </h1>
      <div class="layui-card-body" id="main">
        <div class="postcard layui-margin-2 layui-panel">
          <div class="postcard-bg"><img src="https://picsum.photos/400/300?${Math.random()}" lay-src="${image}" /></div>
          <div class="postcard-desc layui-padding-2">
            <div class="postcard-title layui-font-32">${titleName}</div>
            <div class="postcard-sub" style="opacity:.84;">${colorfultags.join(' ')}</div>
          </div>
        </div>
        <div class="layui-text">
          ${md2html(mdfc).replace(new RegExp("<h1[^>]*>.*?</h1>", 'gi'), "")}
        </div>
      </div>
    </div>
 `);
}

/**
 * @param {SSGCache} cache
 * @returns {Promise<string>}
 */
async function renderHomeHTML(cache = {}) {
  const jsop = readPostsIndex(cache);
  const homehtml = readHTML('front/home.html');
  const ls = [];
  for (const y of await jsop) {
    for (const p of y.posts) {
      const date = new Date(p.time);
      ls.push(`
        <a href="/posts/${y.year}/${p.fname.replace(/\.md$/, '/')}" class="postcard layui-margin-2 layui-panel">
          <div class="postcard-bg"><img src="https://picsum.photos/400/300?${Math.random()}" lay-src="${p.image}" /></div>
          <div class="postcard-desc layui-padding-2">
            <div class="postcard-title layui-font-20">${p.title}</div>
            <div class="postcard-sub">
              ${p.category}&nbsp;&nbsp;<time datetime="${date.toISOString()}">${date.toLocaleString('zh').replace(/\:00$/, "")}</time>
            </div>
          </div>
        </a>
      `.replace(/\s+/g, ' '));
    }
  }
  return renderHTML((await homehtml).toString().replace('HOME-CONTENT', ls.join('')), cache);
}
