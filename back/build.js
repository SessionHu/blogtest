//@ts-check

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { render } from './ssg.js';
import { file2dist } from './router.js';

async function buildPages() {
  const fns = await fs.readdir("./front", {
    recursive: true,
    withFileTypes: true
  });
  fns.push(...await fs.readdir('./posts', {
    recursive: true,
    withFileTypes: true
  }));
  for (const fn of fns) {
    if (fn.isDirectory()) continue;
    const nam = path.join(fn.parentPath, fn.name);
    const targetname = file2dist(nam);
    console.log(`${nam} -> ${targetname}`);
    if (targetname === "/dev/null") continue;
    await fs.mkdir(targetname.substring(0, targetname.lastIndexOf("/")), { recursive: true });
    await fs.writeFile(targetname, await render(nam)).catch( (e) => {
      if (e) console.error(`Write ./front/${fn} failed`, e);
    });
  }
}

await buildPages();
