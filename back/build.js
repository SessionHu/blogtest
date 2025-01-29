//@ts-check

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { render } from './ssg.js';
import { file2dist } from './router.js';

await (async () => {
  const fns = await fs.readdir("./front", {
    recursive: true,
    withFileTypes: true
  });
  fns.push(...await fs.readdir('./posts', {
    recursive: true,
    withFileTypes: true
  }));
  /** @type {SSGCache} */
  const cache = {};
  for (const fn of fns) {
    if (fn.isDirectory()) continue;
    const nam = path.join(fn.parentPath, fn.name);
    const targetname = file2dist(nam);
    if (targetname === "/dev/null") continue;
    try {
      await fs.mkdir(targetname.substring(0, targetname.lastIndexOf("/")), { recursive: true });
      await fs.writeFile(targetname, await render(nam, cache));
      console.log('[OK]', nam, '->', targetname);
    } catch (e) {
      console.error('[FAIL]', nam, '->', targetname, e);
    };
  }
})();
