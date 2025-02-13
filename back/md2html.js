class Md2html {

    /**
     * @param {string} md
     */
    static md2html(md) {
        let out = "";
        const mdinline = md.split(/\r?\n/);
        let incodeblock = false;
        let spacecount = 0;
        for (let line of mdinline) {
            if (!line && !incodeblock) continue;
            if (!incodeblock) {
                if (line.startsWith(' ')) {
                    spacecount = line.length - line.trimStart().length;
                } else {
                    spacecount = 0;
                }
            }
            line = line.substring(spacecount);
            if (incodeblock && line === "```") {
                out += "</pre>";
                for (let left = spacecount; left > 0; left -= 2) {
                    out += "</ul>";
                }
                incodeblock = false;
            } else if (incodeblock) {
                for (const c of line) {
                    out += "&#" + c.codePointAt(0) + ";";
                }
                out += "\n";
            } else if (line.startsWith("```")) {
                for (let left = spacecount; left > 0; left -= 2) {
                    out += "<ul>";
                }
                out += `<pre class="layui-code" lay-options="{lang:'${line.substring(3)}'}">`;
                incodeblock = true;
            } else if (line.startsWith('#')) {
                out += this.title(line);
            } else if (line.startsWith("> ")) {
                out += `<blockquote class="layui-elem-quote layui-quote-nm">
                    ${this.line(line.substring(2))}
                </blockquote>`;
            } else {
                for (let left = spacecount; left > 0; left -= 2) {
                    out += "<ul>";
                }
                if (line.startsWith("- ") || line.startsWith("+ ")) {
                    out += `<ul><li>${this.line(line.substring(2))}</li></ul>`;
                } else {
                    out += this.line(line);
                }
                for (let left = spacecount; left > 0; left -= 2) {
                    out += "</ul>";
                }
            }
        }
        // remove extra
        while (true) {
            const rawlen = out.length;
            out = out.replace(/<\/ul><ul>/g, "");
            if (rawlen === out.length) break;
        }
        return out;
    }

    /**
     * @param {string} line
     */
    static title(line) {
        // check '#' counts
        let hashcount = 0;
        for (const c of line) {
            if (c === '#') {
                hashcount++;
            } else {
                break;
            }
        }
        // return
        return `<h${hashcount}>${line.substring(hashcount + 1)}</h${hashcount}>`
    }

    /**
     * @param {string} text
     */
    static line(text) {
        text = this.img(text);
        text = this.link(text);
        text = this.code(text);
        return text;
    }

    /**
     * @param {string} text
     */
    static code(text) {
        const rgx = /`(.+?)`/g;
        return text.replace(rgx, (_, /** @type {string} */p) => {
          p = Array.from(p).map((c) => `&#${c.codePointAt(0)};`).join('');
          return `<code>${p}</code>`;
        });
    }

    /**
     * @param {string} text
     */
    static img(text) {
        const rgx = /!\[(.*?)\]\((.*?)\)/g;
        return text.replace(rgx, (_, p1, p2) => {
            const [src, title] = p2.split(' ');
            const html = `<div lay-on="post-img"><img lay-src="${src}" title=${title ? title : '""'} alt="${p1}" /></div>`;
            return html;
        });
    }


    /**
     * @param {string} text
     */
    static link(text) {
        const rgx = /\[(.+?)\]\((.+?)\)/g;
        return text.replace(rgx, (_, p1, p2) => {
            const [href, title] = p2.split(' ');
            return `<a href="${href}" title=${title ? title : '""'} target="_blank" rel="noopener">${p1}</a>`;
        });
    }

}

/**
 * @param {string} md
 */
export function md2html(md) {
  return Md2html.md2html(md);
}
