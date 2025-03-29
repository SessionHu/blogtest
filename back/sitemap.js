import { spawnSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { Document, Element } from './sdom.js';

const BASE_URL = 'https://sess.xhustudio.eu.org/';

/**
 * @param {string} fname
 * @returns {Date}
 */
function getFileLastModified(fname) {
  return new Date(spawnSync(`git --no-pager log --pretty=format:%aI --max-count=1 -- ${fname}`, {
    shell: 'sh',
    encoding: 'utf8'
  }).stdout);
}

/**
 * @param {string} fname
 * @returns {{
 *   changefreq: string,
 *   priority: number
 * }}
 */
function getChangefreqAndPriority(fname) {
  if (fname.includes('posts/')) {
    let /** @type {string} */ f;
    const thisyear = new Date().getUTCFullYear();
    if (fname.includes('/' + thisyear + '/')) f = 'monthly';
    else if (fname.includes('/' + (thisyear - 1) + '/')) f = 'yearly';
    else f = 'never';
    return {
      changefreq: f,
      priority: .9
    };
  } else if (fname.includes('category.html')) return {
    changefreq: 'weekly',
    priority: .7
  };
  else if (fname.includes('about.html')) return {
    changefreq: 'monthly',
    priority: .8
  };
  else if (fname.includes('home.html')) return {
    changefreq: 'weekly',
    priority: 1
  };
  else return {
    changefreq: 'weekly',
    priority: .5
  };
}

/**
 * @returns {Promise<Document>}
 */
export async function getSitemap() {
  const htmls = (async () => {
    const friendsjsonlastmod = getFileLastModified('./front/friends.json');
    const postsjsonlastmod = getFileLastModified('./posts/index.json');
    return (await readdir('./front', {
      withFileTypes: true,
      encoding: 'utf8'
    })).filter((d) => 
      path.extname(d.name).match(/^\.html?$/) &&
      !d.name.match(/^(index\.html)|(404\.html)$/)
    ).map((d) => {
      const name = path.parse(d.name).name;
      const fname = path.join(d.parentPath, d.name);
      const lastmod = getFileLastModified(fname);
      return {
        fname: fname,
        lastmod: name.match(/^(home|category)$/) ?
            lastmod > postsjsonlastmod ? lastmod : postsjsonlastmod
          :
            name === 'friends' ?
              lastmod > friendsjsonlastmod ? lastmod : friendsjsonlastmod
            :
              lastmod
        ,
        url: new URL(name === 'home' ? '/' : name + '/', BASE_URL),
      };
    });
  })();
  const /** @type {Promise<PostsIndexYearly[]>} */ postsjson = readFile('./posts/index.json', 'utf8').then(JSON.parse);
  // document
  const document = new Document();
  const urlset = Element.new('urlset');
  urlset.setAttribute('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9');
  document.appendChild(urlset);
  // front
  for (const ht of await htmls) {
    // url
    const urlElem = Element.new('url');
    urlset.appendChild(urlElem);
    // loc
    const locElem = Element.new('loc', [ht.url.toString()]);
    urlElem.appendChild(locElem);
    // lastmod
    const lastmodElem = Element.new('lastmod', [ht.lastmod.toISOString()]);
    urlElem.appendChild(lastmodElem);
    // changefreq & priority
    const changefreqElem = Element.new('changefreq');
    const priorityElem = Element.new('priority');
    const cap = getChangefreqAndPriority(ht.fname);
    changefreqElem.textContent = cap.changefreq;
    priorityElem.textContent = cap.priority.toString();
    urlElem.append(changefreqElem, priorityElem);
  }
  // posts
  for (const piy of await postsjson) {
    for (const pii of piy.posts) {
      const fname = `posts/${piy.year}/${pii.fname}`;
      // loc
      const locElem = Element.new('loc');
      locElem.textContent = new URL(fname.replace(/\.md$/, '/'), BASE_URL).toString();
      // lastmod
      const lastmodElem = Element.new('lastmod', [getFileLastModified(fname).toISOString()]);
      // changefreq & priority
      const changefreqElem = Element.new('changefreq');
      const priorityElem = Element.new('priority');
      const cap = getChangefreqAndPriority(fname);
      changefreqElem.textContent = cap.changefreq;
      priorityElem.textContent = cap.priority.toString();
      // append
      urlset.appendChild(Element.new('url', [
        locElem, lastmodElem, changefreqElem, priorityElem
      ]));
    }
  }
  return document;
}

/**
 * @returns {Promise<Document>}
 */
export async function getFeed() {
  const /** @type {Promise<PostsIndexYearly[]>} */ postsjson = readFile('./posts/index.json', 'utf8').then(JSON.parse);
  const document = new Document();
  const rssElem = Element.new('rss');
  rssElem.setAttribute('version', '2.0');
  rssElem.setAttribute("xmlns:atom", "http://www.w3.org/2005/Atom");
  document.appendChild(rssElem);
  const channelElem = Element.new('channel');
  rssElem.appendChild(channelElem);
  for (const [k, v] of [
    ['title', 'SЕSSのB10GТЕ5Т'],
    ['link', BASE_URL],
    ['description', 'Session 的个人博客, 这里有各种类型的有趣的文章内容, 网站使用纯 JavaScript 构建'],
    ['language', 'zh-CN'],
   ['copyright', '2024-' + new Date().getUTCFullYear() + ' SessionHu'],
  ]) {
    channelElem.appendChild(Element.new(k, [v]));
  }
  const atomlinkElem = Element.new('atom:link');
  atomlinkElem.setAttribute('href', BASE_URL + 'feed.xml');
  atomlinkElem.setAttribute('rel', 'self');
  channelElem.appendChild(atomlinkElem);
  for (const piy of await postsjson) {
    for (const pii of piy.posts) {
      const fname = `posts/${piy.year}/${pii.fname}`;
      // item
      const itemElem = Element.new('item');
      channelElem.appendChild(itemElem);
      // link / guid
      const linkElem = Element.new('link');
      linkElem.textContent = new URL(fname.replace(/\.md$/, '/'), BASE_URL).toString();
      const guidElem = Element.new('guid', [linkElem.textContent]);
      itemElem.append(linkElem, guidElem);
      const pubDateElem = Element.new('pubDate', [new Date(pii.time).toUTCString()]);
      itemElem.append(pubDateElem);
      const titleElem = Element.new('title', [pii.title]);
      itemElem.appendChild(titleElem);
    }
  }
  return document;
}
