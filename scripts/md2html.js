//@ts-check
"use strict";
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
        let out = "";
        let inCodeBlock = false;
        for (const c of text) {
            if (c === '`') {
                inCodeBlock = !inCodeBlock;
                out += inCodeBlock ? "<code>" : "</code>";
            } else {
                out += inCodeBlock ? "&#" + c.codePointAt(0) + ";" : c;
            }
        }
        if (inCodeBlock) {
            out += "</code>";
        }
        return out;
    }

    /**
     * @param {string} text
     */
    static img(text) {
        let out = "";
        const chars = Array.from(text);
        for (let i = 0; i < chars.length; i++) {
            if (chars[i] === '!') {
                if (++i >= chars.length) { // end of line?
                    out += '!';
                    break;
                } else if (chars[i] === '[') { // is img?
                    if (++i >= chars.length) { // end of line?
                        out += '![';
                        break;
                    } else {
                        let imgalt = "";
                        for (; chars[i] !== ']'; i++) {
                            if (i >= chars.length) { // end of line?
                                out += '![';
                                out += imgalt;
                                break;
                            } else { // alt
                                imgalt += chars[i];
                            }
                        }
                        if (++i >= chars.length) { // end of line?
                            out += '![';
                            out += imgalt;
                            out += ']';
                            break;
                        } else if (chars[i] === '(') { // is img?
                            if (++i >= chars.length) { // end of line?
                                out += '![';
                                out += imgalt;
                                out += '](';
                                break;
                            } else {
                                let imgsrc = "";
                                for (; chars[i] !== ')'; i++) {
                                    if (i >= chars.length) { // end of line?
                                        out += '![';
                                        out += imgalt;
                                        out += '](';
                                        out += imgsrc;
                                        break;
                                    } else { // src
                                        imgsrc += chars[i];
                                    }
                                }
                                // parse src
                                let imgsrcreal = "";
                                let imgsrctitle = "";
                                const srcchars = Array.from(imgsrc);
                                for (let j = 0; j < srcchars.length; j++) {
                                    if (srcchars[j] === ' ') { // is title?
                                        if (++j >= srcchars.length) { // end of line?
                                            break;
                                        } else {
                                            for (; j < srcchars.length; j++) {
                                                imgsrctitle += srcchars[j];
                                            }
                                            break;
                                        }
                                    } else {
                                        imgsrcreal += srcchars[j];
                                    }
                                }
                                // clip
                                if (imgsrctitle.startsWith('"')) {
                                    imgsrctitle = imgsrctitle.substring(1);
                                }
                                if (imgsrctitle.endsWith('"')) {
                                    imgsrctitle = imgsrctitle.substring(0, imgsrctitle.length - 1);
                                }
                                // add to out
                                out += `<div lay-on="post-img"><img lay-src="${imgsrcreal}" title="${imgsrctitle}" alt="${imgalt}"/></div>`;
                            }
                        } else { // not img
                            out += '![';
                            out += imgalt;
                            out += ']';
                            out += chars[i];
                            break;
                        }
                    }
                } else { // not img
                    out += '!';
                    out += chars[i];
                }
            } else { // not img
                out += chars[i];
            }
        }
        return out;
    }

    /**
     * @param {string} text
     */
    static link(text) {
        let out = "";
        const chars = Array.from(text);
        for (let i = 0; i < chars.length; i++) {
            if (chars[i] === '[') { // is link?
                if (++i >= chars.length) { // end of line? 
                    out += '[';
                    break;
                } else {
                    // link text
                    let linktext = "";
                    for (; chars[i] !== ']'; i++) {
                        if (i >= chars.length) { // end of line?
                            out += '[';
                            out += linktext;
                            break;
                        } else { // text
                            linktext += chars[i];
                        }
                    }
                    // link href
                    if (++i >= chars.length) { // end of line?
                        out += '[';
                        out += linktext;
                        out += ']';
                        break;
                    } else if (chars[i] === '(') { // is link?
                        if (++i >= chars.length) { // end of line?
                            out += '[';
                            out += linktext;
                            out += '](';
                            break;
                        } else {
                            let linkhreffull = "";
                            for (; chars[i] !== ')'; i++) {
                                if (i >= chars.length) { // end of line?
                                    out += '[';
                                    out += linktext;
                                    out += '](';
                                    out += linkhreffull;
                                    break;
                                } else { // href
                                    linkhreffull += chars[i];
                                }
                            }
                            // parse href
                            let linkhrefreal = "";
                            let linkhreftitle = "";
                            const hrefchars = Array.from(linkhreffull);
                            for (let j = 0; j < hrefchars.length; j++) {
                                if (hrefchars[j] === ' ') { // is title?
                                    if (++j >= hrefchars.length) { // end of line?
                                        break;
                                    } else {
                                        for (; j < hrefchars.length; j++) {
                                            linkhreftitle += hrefchars[j];
                                        }
                                        break;
                                    }
                                } else {
                                    linkhrefreal += hrefchars[j];
                                }
                            }
                            // clip
                            if (linkhreftitle.startsWith('"')) {
                                linkhreftitle = linkhreftitle.substring(1);
                            }
                            if (linkhreftitle.endsWith('"')) {
                                linkhreftitle = linkhreftitle.substring(0, linkhreftitle.length - 1);
                            }
                            // add to out
                            out += `<a href="${linkhrefreal}" title="${linkhreftitle}" target="_blank" rel="noopener">${linktext}</a>`;
                        }
                    } else { // not link
                        out += '[';
                        out += linktext;
                        out += ']';
                        out += chars[i];
                    }
                }
            } else { // not link
                out += chars[i];
            }
        }
        return out;
    }

}
