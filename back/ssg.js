import * as fs from "node:fs";

/**
 * @param {string} fname
 */
export function render(fname) {
    const suffix = fname.substring(fname.lastIndexOf(".") + 1).toLowerCase();
    if (suffix === "html") {
        return renderHtml(fname);
    } else if (suffix === "md") {
        return renderMd(fname);
    } else {
        return fs.readFileSync(fname);
    }
}

const basehtml = (() => {
    const fc = fs.readFileSync("./front/index.html", {
        encoding: "utf8"
    });
    return fc.replace(/\s+/g, " "); // merge all whitespace to one
})();

/**
 * @param {string} fname
 */
function renderHtml(fname) {
    const fc = fs.readFileSync(fname, { encoding: "utf8" });
    const rgx = /(^.*?<main\s[^>]*id=\"main-container\"[^>]*>)(.*)(<\/main>.*$)/;
    return basehtml.replace(rgx, `$1${fc}$3`);
}

/**
 * @param {string} fname
 */
function renderMd(fname) {
    const mdc = fs.readFileSync(fname, { encoding: "utf8" });
    const rgx = /^(.*?<main\s[^>]*id=\"main-container\"[^>]*>)(.*)(<\/main>.*)$/;
    return basehtml.replace(rgx, `$1
        <div class="layui-panel layui-card">
            <div class="layui-card-header"><!--breadcrumb--></div>
            <div class="layui-card-body">
                <pre class="md-prerender">${mdc}</pre>
            </div>
        </div>
    $3`);
}

/**
 * @param {string} fname
 */
function routerDist(fname) {
    fname = fname.replace(/\\/g, "/");
    if (fname.match(/(^$)|(^(\/|\.{2,}))|(\/$)|(\/\/)/)) {
        return "/dev/null" // ignore abs, parent, invalid path and dir
    } else if (!fname.startsWith("./")) {
        fname = "./" + fname;
    }
    const p = fname.split("/");
    if (p.length === 3 && p[1] === "front") {
        if (p[2] === "index.html" || p[2].startsWith(".")) {
            return "/dev/null"; // not output base html or hidden file
        } else if (p[2] === "home.html") {
            return "./dist/index.html";
        } else if ((p[2] === "404.html" || !p[2].endsWith(".html")) && p[2].includes(".")) {
            return "./dist/" + p[2];
        } else if (p[2].toLowerCase().endsWith(".html")) {
            return `./dist/${p[2].substring(0, p[2].length - 5)}/index.html`;
        } else {
            return "/dev/null"; // do not output
        }
    } else if (fname === "./front/posts/index.json") {
        return "./dist/posts/index.json";
    } else if (fname.match(/^\.\/front\/posts\/\d{4,}\/.+\.md$/)) {
        return `./dist/posts/${p[3]}/${p[4].substring(0, p[4].length - 3)}/index.html`;
    } else if (p[1] === "front" && p[p.length - 1].includes(".")) {
        return "./dist/" + fname.substring(8);
    } else {
        return "/dev/null";
    }
}

function buildPages() {
    const fns = fs.readdirSync("./front", {
        recursive: true
    });
    for (const fn of fns) {
        const targetname = routerDist("./front/" + fn);
        console.log(`./front/${fn} -> ${targetname}`);
        if (targetname === "/dev/null") continue;
        fs.mkdirSync(targetname.substring(0, targetname.lastIndexOf("/")), { recursive: true });
        fs.writeFile(targetname, render("./front/" + fn), (e) => {
            if (e) console.error(`Write ./front/${fn} failed`, e);
        });
    }
}

buildPages();
