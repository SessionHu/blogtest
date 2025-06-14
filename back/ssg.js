/// <reference path = "./sessx.d.ts" />

import fs from "node:fs/promises";
import path from 'node:path';
import { md2html } from './md2html.js';
import { Element, encodeXML } from './sdom.js';
import { getSitemap, getFeed } from './sitemap.js';
import friendEg from './friendeg.json' with { type: "json" };

/**
 * @param {string} fname
 * @param {SSGCache} cache
 */
export async function render(fname, cache = {}) {
  if (fname.startsWith('?')) {
    return (await (
      fname === '?sitemap.xml' ? getSitemap() : getFeed()
    )).toXML();
  }
  const extn = path.extname(fname = path.normalize(fname)).toLowerCase();
  if (extn === ".html") {
    if (fname === 'front/home.html') return renderHomeHTML(cache);
    else if (fname === 'front/category.html') return renderCategoryHTML(cache);
    else if (fname === 'front/friends.html') return renderFriendHTML(cache);
    else return renderHTML(readHTML(fname).then((res) => res.toString()), cache, fname === 'front/about.html' ? '关于 - SESSのB10GTEST' : void 0);
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
 * @param {SSGCache} [cache]
 * @param {string} [title]
 * @returns {Promise<string>}
 */
async function readBaseHTML(cache = {}, title = 'SESSのB10GTEST') {
  /** @type {FriendsJson} */
  const fj = cache.friends || (cache.friends = JSON.parse(await fs.readFile('front/friends.json', 'utf8')));
  shufArray(fj.friends);
  shufArray(fj.organizations);
  if (!cache.basehtml)
    cache.basehtml = (await readHTML('./front/index.html')).toString();
  return cache.basehtml
    .replace('{{FRIENDS-JSON}}', '<script>var __FRIENDS_JSON__ = ' + JSON.stringify(fj) + ';</script>')
    .replace('{{POSTS-COUNT}}', ((await getPostsCount(cache)).toString()))
    .replace('{{PAGE-TITLE}}', title);
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
 * @param {SSGCache} cache
 * @returns {Promise<number>}
 */
async function getPostsCount(cache = {}) {
  const pij = readPostsIndex(cache);
  let count = 0;
  for (const i of await pij) {
    count += i.posts.length;
  }
  return count;
}

/**
 * @param {string | Promise<string>} content
 * @param {SSGCache} [cache]
 * @param {string} [title]
 */
async function renderHTML(content, cache = {}, title) {
  return (await readBaseHTML(cache, title))
    .replace('{{MAIN-CONTENT}}', (await content).toString());
}

/**
 * Generate random integer.
 * @returns {number}
 */
function randomInt() {
  return parseInt(Math.random().toString().replace(/^0\./, ''));
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
  lp: for (const aYearPosts of postsIndexJson) {
    if (aYearPosts.year === Number(year)) {
      for (const aPost of aYearPosts.posts) {
        if (aPost.fname === basename) {
          categoryName = aPost.category;
          titleName = aPost.title;
          date = new Date(aPost.time);
          image = aPost.image;
          tags = aPost.tags
          break lp;
        }
      }
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
  return (await readBaseHTML(cache, titleName + ' - SESSのB10GTEST')).replace('{{MAIN-CONTENT}}', `
    <div class="layui-panel layui-card radius">
      <h1 id="main-title" class="layui-card-header">
        <span class="layui-breadcrumb ws-nowrap" lay-separator=">">
          <a href="/">首页</a>
          <a href="/category/">分类</a>
          <a href="/category/#${categoryName}">${categoryName}</a>
          <a><cite><time datetime="${date.toISOString()}">${date.toLocaleString('zh').replace(/\:00$/, "")}</time></cite></a>
          <a><cite>${titleName}</cite></a>
        </span>
      </h1>
      <div class="layui-card-body" id="main">
        <div class="postcard layui-margin-2 layui-panel">
          <div class="postcard-bg"><img src="${image}" loading="lazy" ${image.includes('hdslb.com') ? 'referrerpolicy="no-referrer"' : " "}/></div>
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
          <div class="postcard-bg"><img src="${p.image}" loading="lazy" ${p.image.includes('hdslb.com') ? 'referrerpolicy="no-referrer"' : " "}/></div>
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
  return renderHTML((await homehtml).toString().replace('{{HOME-CONTENT}}', ls.join('')), cache);
}

/**
 * @param {SSGCache} cache
 * @returns {Promise<string>}
 */
async function renderCategoryHTML(cache = {}) {
  const posts = readPostsIndex(cache).then((a) => {
    return a.map((y) => y.posts).flat();
  });
  const catehtml = readHTML('front/category.html');
  // div
  const colladiv = Element.new('div');
  colladiv.setAttribute('class', 'layui-collapse radius margin-t16 margin-b8 layui-panel');
  colladiv.setAttribute('lay-accordion', '');
  // item
  const /** @type {Map<string, Element>} */ collaitems = new Map();
  for (const postitem of await posts) {
    let elem = collaitems.get(postitem.category);
    if (!elem) {
      collaitems.set(postitem.category, elem = Element.new('div'));
      elem.setAttribute('class', 'layui-colla-item');
      // title
      const title = Element.new('div');
      title.setAttribute('class', 'layui-colla-title');
      title.textContent = postitem.category;
      const count = Element.new('span');
      count.setAttribute('style', 'float:right;');
      count.textContent = '0';
      title.appendChild(count);
      elem.appendChild(title);
      // content
      const content = Element.new('div');
      content.setAttribute('class', 'layui-colla-content layui-show');
      content.setAttribute('id', postitem.category);
      elem.appendChild(content);
      colladiv.appendChild(elem);
    }
    const count = elem.childNodes[0].childNodes[1];
    count.textContent = (parseInt(count.textContent) + 1).toString();
    const anchor = Element.new('a');
    anchor.setAttribute('href', `/posts/${new Date(postitem.time).getUTCFullYear()}/${postitem.fname.replace(/\.md$/, '/')}`);
    anchor.textContent = postitem.title;
    elem.childNodes[1].appendChild(anchor);
    elem.childNodes[1].appendChild(Element.new('br'));
  }
  return renderHTML(
    (await catehtml)
      .toString()
      .replace('{{CATEGORY-CONTENT}}', colladiv.toXML()),
    cache,
    '分类 - SESSのB10GTEST'
  );
}

/**
 * @param {SSGCache} cache
 * @returns {Promise<string>}
 */
async function renderFriendHTML(cache = {}) {
  const frndhtml = readHTML('front/friends.html');
  /** @type {FriendsJson} */
  const fj = cache.friends || (cache.friends = JSON.parse(await fs.readFile('front/friends.json', 'utf8')));
  shufArray(fj.friends);
  shufArray(fj.organizations);
  /**
   * @param {ContactItem} item
   * @param {boolean} isorg
   * @return {Element}
   */
  const genFriendLinkElem = (item, isorg) => {
    const a = Element.new('a');
    a.setAttribute('class', 'layui-col-sm6');
    a.setAttribute('href', item.href);
    a.setAttribute('target', '_blank');
    a.setAttribute('rel', 'noopener');
    const panel = Element.new('div');
    panel.setAttribute('class', 'layui-panel layui-card friends-page-bg-transp friends-page-bg-link radius');
    a.appendChild(panel);
    const header = Element.new('div');
    header.setAttribute('class', 'layui-card-header text-ellipsis');
    header.textContent = btoa(encodeURIComponent(JSON.stringify(item.name)));  // parse at frontend
    panel.appendChild(header);
    const bodyr = Element.new('div');
    bodyr.setAttribute('class', 'layui-card-body flex h-64');
    panel.appendChild(bodyr);
    const img = Element.new('img');
    img.setAttribute('alt', item.id);
    img.setAttribute('referrerpolicy', 'no-referrer');
    img.setAttribute('src', item.icon ? item.icon : item.href + '/favicon.ico');
    img.setAttribute('class', `${isorg ? "" : "layui-circle "}friends-page-icon h-64 w-64`);
    img.setAttribute('loading', 'lazy');
    bodyr.appendChild(img);
    const desc = Element.new('div');
    desc.setAttribute('class', 'friends-page-desc layui-font-14 pad-l8');
    desc.textContent = item.title + (item.title && item.desc ? ": " : "") + item.desc;
    bodyr.appendChild(desc);
    return a;
  };
  const frs = fj.friends.map((f) => genFriendLinkElem(f, false).toXML()).join('');
  const ogs = fj.organizations.map((f) => genFriendLinkElem(f, true).toXML()).join('');
  const egpre = Element.new('pre');
  egpre.setAttribute('class', 'layui-code');
  egpre.setAttribute('lay-options', '{lang:"json"}');
  egpre.textContent = JSON.stringify(friendEg, void 0, 2);
  return (await readBaseHTML(cache, '友链 - SESSのB10GTEST'))
    .replace(
      '{{MAIN-CONTENT}}',
      (await frndhtml)
        .toString()
        .replace('{{FRIENDS-REAL}}', frs)
        .replace('{{FRIENDS-ORGS}}', ogs)
        .replace('{{FRIENDS-EGPRE}}', egpre.toXML())
    );
}

/**
 * @param {any[]} arr
 * @returns {any[]}
 */
function shufArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
