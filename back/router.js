import { normalize } from 'node:path';

const routerPatterns = [
  ['/', 'front/home.html'],
  ['/about/', 'front/about.html'],
  ['/favicon.ico', 'front/favicon.ico'],
  ['/friends.json', 'front/friends.json'],
  ['/category/', 'front/category.html'],
  ['/friends/', 'front/friends.html'],
  ['/404.html', 'front/404.html']
];

const rgxUrl2pathname = /^(https?:\/\/[a-zA-z\.0-9:]+?)?(\/.*?)(\?.*)?(#.*)?$/;

/**
 * @param {string} uri
 * @returns {string}
 */
export function req2file(uri) {
  const pn = rgxUrl2pathname.exec(uri)[2];
  // router patterns
  for (const [k, v] of routerPatterns) {
    if ((k === pn) ||
      (k !== '/' && k.endsWith('/') && new RegExp(`^${k}?(index\.html)?$`).test(uri))) {
      return v;
    }
  }
  // static resources
  if (pn.startsWith('/styles/') || pn.startsWith('/scripts/')) {
    return 'front' + pn;
  }
  // posts
  let rema;
  if (pn === '/posts/index.json') {
    return '.' + pn;
  } else if (rema = pn.match(/^(\/posts\/\d{4,}\/.+?)(\/|\/index\.html)?$/)) {
    return '.' + rema[1] + '.md';
  }
  // else
  return 'front/404.html';
}

/**
 * @param {string} fname
 * @returns {string}
 */
export function file2dist(fname) {
  fname = normalize(fname);
  // router patterns
  for (const [k, v] of routerPatterns) {
    if (fname !== v) continue;
    if (k.endsWith('/')) {
      return `dist${k}index.html`;
    } else {
      return 'dist' + k;
    }
  }
  // static resources
  let rema;
  if (rema = fname.match(/^front\/(styles|scripts)\/(.+)$/)) {
    return `dist/${rema[1]}/${rema[2]}`;
  }
  // posts
  if (fname === 'posts/index.json') {
    return 'dist/posts/index.json';
  } else if (rema = fname.match(/^(posts\/\d{4,}\/.+)\.md$/)) {
    return `dist/${rema[1]}/index.html`;
  }
  // else
  return '/dev/null';
}
