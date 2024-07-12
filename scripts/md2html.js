class Md2html {

    /**
     * @param {string} md
     */
    static md2html(md) {
        let out = "";
        const mdinline = md.split('\n');
        let incodeblock = false;
        let spacecount = 0;
        for (let line of mdinline) {
            if (line === "" && !incodeblock) continue;
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
                if (spacecount === 2) out += "</ul>"
                incodeblock = false;
            } else if (incodeblock) {
                out += line.replaceAll("<", "&lt;").replaceAll(">", "&gt;");
                out += "\n";
            } else if (line.startsWith("```")) {
                if (spacecount === 2) out += "<ul>"
                out += `<pre class="layui-code" lay-options="{lang:'${line.substring(3)}'}">`;
                incodeblock = true;
            } else if (line.startsWith('#')) {
                out += this.title(line);
            } else if (line.startsWith("> ")) {
                out += `<blockquote class="layui-elem-quote layui-quote-nm">
                    ${this.line(line.substring(2))}
                </blockquote>`;
            } else if (line.startsWith("- ") || line.startsWith("+ ")) {
                out += `<ul><li>${this.line(line.substring(2))}</li></ul>`;
            } else {
                if (spacecount === 2) out += "<ul>"
                out += this.line(line);
                if (spacecount === 2) out += "</ul>"
            }
        }
        return out.replaceAll("</li></ul><ul><li>", "</li><li>");
    }

    /**
     * @param {string} line
     */
    static title(line) {
        // check '#' counts
        let hashcount = 0;
        for (let i = 0; i < line.length; i++) {
            const c = line.charAt(i);
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
        let out = "";
        let symbolcount = 0;
        for (let i = 0; i < text.length; i++) {
            const c = text.charAt(i);
            if (c === '`') {
                symbolcount++;
                if (symbolcount % 2 === 1) {
                    out += `<code>`;
                } else {
                    out += "</code>";
                }
            } else {
                if (symbolcount % 2 === 1) {
                    out += c.replace("<", "&lt;").replace(">", "&gt;");
                } else {
                    out += c;
                }
            }
        }
        return out;
    }

    /**
     * @param {string} text
     */
    static img(text) {
        let out = "";
        // status
        let inimg = false;
        let inimgalt = false;
        let inimgsrc = false;
        let inimgtitle = false;
        // info
        let imgalt = "";
        let imgsrc = "";
        let imgtitle = "";
        // find
        for (let i = 0; i < text.length; i++) {
            const c = text.charAt(i);
            // mark status
            if (c === '!') { inimg = true; continue; }
            if (inimg && c === '[') { inimgalt = true; continue; }
            if (inimg && c === ']') { inimgalt = false; continue; }
            if (inimg && c === '(') { inimgsrc = true; continue; }
            if (inimg && c === ')') { inimg = inimgsrc = false; }
            if (inimg && c === ' ') { inimgsrc = false; continue; }
            if (inimg && c === '"' && !inimgtitle) { inimgtitle = true; continue; }
            if (inimg && c === '"' && inimgtitle) { inimgtitle = false; continue; }
            // add
            if (inimg && inimgalt) { imgalt += c; continue; }
            if (inimg && inimgsrc) { imgsrc += c; continue; }
            if (inimg && inimgtitle) { imgtitle += c; continue; }
            // else
            if (!inimg && imgalt !== "") {
                out += `<img src="${imgsrc}" title="${imgtitle}" alt="${imgalt}"/>`;
                imgalt = imgsrc = imgtitle = "";
                inimg = inimgalt = inimgsrc = inimgtitle = false;
                continue;
            }
            if (!inimg && imgalt === "" && imgsrc === "" && imgtitle === "") {
                out += c;
                continue;
            }
            // unexpect case
            if (inimg && !inimgalt && !inimgsrc && !inimgtitle) {
                out += `! `;
                imgalt = imgsrc = imgtitle = "";
                inimg = inimgalt = inimgsrc = inimgtitle = false;
            }
        }
        // not end
        if (inimg) {
            if (imgtitle !== "") {
                out += `![${imgalt}](${imgsrc} "${imgtitle})`;
            } else if (imgsrc !== "") {
                out += `![${imgalt}](${imgsrc}`;
            } else if (imgalt !== "") {
                out += `![${imgalt}`;
            } else {
                out += '!';
            }
        }
        return out;
    }

    /**
     * @param {string} text
     */
    static link(text) {
        let out = "";
        // status
        let inlink = false;
        let inlinktext = false;
        let inlinkhref = false;
        let inlinktitle = false;
        // info
        let linktext = "";
        let linkhref = "";
        let linktitle = "";
        // find
        for (let i = 0; i < text.length; i++) {
            const c = text.charAt(i);
            // mark status
            if (c === '[') { inlink = inlinktext = true; continue; }
            if (inlink && c === ']') { inlinktext = false; continue; }
            if (inlink && c === '(') { inlinkhref = true; continue; }
            if (inlink && c === ')') { inlink = inlinkhref = false; }
            if (inlink && c === ' ') { inlinkhref = false; continue; }
            if (inlink && c === '"' && !inlinktitle) { inlinktitle = true; continue; }
            if (inlink && c === '"' && inlinktitle) { inlinktitle = false; continue; }
            // add
            if (inlink && inlinktext) { linktext += c; continue; }
            if (inlink && inlinkhref) { linkhref += c; continue; }
            if (inlink && inlinktitle) { linktitle += c; continue; }
            // else
            if (!inlink && linktext !== "") {
                out += `<a href="${linkhref}" title="${linktitle}">${linktext}</a>`;
                linktext = linkhref = linktitle = "";
                inlink = inlinktext = inlinkhref = inlinktitle = false;
                continue;
            }
            if (!inlink && linktext === "" && linkhref === "" && linktitle === "") {
                out += c;
                continue;
            }
            // unexpect case
            if (inlink && !inlinktext && !inlinkhref && !inlinktitle) {
                out += `[${linktext}]`;
                linktext = linkhref = linktitle = "";
                inlink = inlinktext = inlinkhref = inlinktitle = false;
            }
        }
        return out;
    }

}
