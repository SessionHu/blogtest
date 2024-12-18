"use strict";

//#region redirect

{
    if (window.location.pathname === "/index.html") {
        window.location.pathname = "/";
    } else if (window.location.hash.includes("#!/")) {
        window.location.replace(window.location.hash.replace(/#!?/, ""));
    } else if (document.referrer === "https://shakaianee.top/" && window.location.hash === "#!/about") {
        layer.alert("看起来您是从 shakaianee.top 过来的呢, 建议先来首页看看吧~", {
            skin: "layui-layer-win10",
            shade: .01,
            time: 5e3
        });
        window.location.replace("/");
    }
}

//#endregion
//#region theme

{

    const mixcss = new Promise((resolve, reject) => {
        const layrsp = fetch("https://unpkg.com/layui-theme-dark@2.9.13/dist/layui-theme-dark.css");
        const fixrsp = fetch("/styles/dark-fix.css");
        (async () => {
            const laycss = await (await layrsp).text();
            const fixcss = (await (await fixrsp).text());
            const blob = new Blob(['@charset "utf-8";\n', laycss, fixcss], {
                type: "text/css"
            });
            resolve(URL.createObjectURL(blob));
        })().catch(reject);
    });

    const themeSwitchButton = document.querySelector("#theme-switch > button");
    const dark = document.createElement("link");
    dark.rel = "stylesheet";
    dark.href = "about:blank";
    document.head.append(dark);

    /**
     * @param {{matches: boolean}} ev 
     */
    const handleTheme = async (ev) => {
        if ((ev.matches || layui.data("sessblog").theme === "dark") && dark.href === "about:blank") {
            dark.href = await mixcss;
            layui.data("sessblog", { key: "theme", value: "dark" });
            themeSwitchButton.innerHTML = "&#xe6c2;";
            setDotlineColor("#f0f0f0");
            layer.tips('已启用深色模式', "#theme-switch", {
                tips: 3,
                time: 1600
            });
        } else if (dark.href !== "about:blank") {
            dark.href = "about:blank";
            layui.data("sessblog", { key: "theme", value: "light" });
            themeSwitchButton.innerHTML = "&#xe748;";
            setDotlineColor("#000");
            layer.tips('已启用浅色模式', "#theme-switch", {
                tips: [3, "#666"],
                time: 1600
            });
        }
    }

    /**
     * @param {string} color 
     */
    const setDotlineColor = (color) => {
        if (dotLine && dotLine.color) {
            window.setTimeout(() => dotLine.color = color, 50);
        } else {
            window.setTimeout(() => setDotlineColor(color), 50);
        }
    }

    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    handleTheme(mql).catch((e) => window.alert(e.stack));
    mql.addEventListener("change", handleTheme);

    layui.util.on("lay-on", {
        "theme-switch": layui.throttle(() => {
            handleTheme({
                matches: dark.href === "about:blank"
            });
        }, 256)
    });

};

//#endregion

class Warning extends Error {
    name = "Warning"
}

class Sess {

    //#region UI

    /**
     * Open a dialog about the Error.
     * @param {Error | Warning} e
     * @param {any} options
     */
    static openErrLayer(e, options) {
        layer.open({
            type: 0,
            title: e.name,
            content: e.stack.replace(/ /g, "&nbsp;").replace(/\n/g, "<br />"),
            icon: e instanceof Warning ? 0 : 2,
            skin: "layui-layer-win10",
            shade: .01,
            shadeClose: true,
            resize: false,
            ...options // merge
        });
        console.error(e);
    }

    /**
     * Render carousel.
     */
    static renderCarousel() {
        if (document.querySelector(".layui-carousel > div[carousel-item] > *")) {
            layui.carousel.render({
                elem: ".layui-carousel",
                width: "auto"
            });
        }
    }

    /**
     * Render breadcrumb.
     */
    static renderBreadcrumb() {
        layui.element.render('breadcrumb', "bc");
    }

    /**
     * Render elements with scroll.
     */
    static renderElemWithScroll() {
        const scrollPosition = window.scrollY || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight;
        const viewportHeight = window.innerHeight;
        // footer
        const footer = document.getElementById("footer");
        const footerPlaceholder = document.getElementById("footer-placeholder");
        // set #footer-placeholder
        footerPlaceholder.style.height = `${footer.offsetHeight + 1}px`;
        // hide or show
        if (scrollPosition + viewportHeight >= documentHeight) {
            footer.style.bottom = "0";
        } else {
            footer.style.bottom = `-${footer.offsetHeight + 32}px`;
        }
        // #post-index-container
        const pic = document.getElementById("post-index-container");
        if (pic !== null && window.innerWidth >= 992 && pic.parentElement.className !== "layui-layer-content") {
            const topnum = scrollPosition - pic.parentElement.offsetHeight + pic.offsetHeight;
            if (topnum > 0) {
                pic.style.top = topnum + "px";
            } else {
                pic.style.top = 0;
            }
        } else if (pic !== null) {
            pic.style.top = 0;
        }
    }

    /**
     * Load Socialist Core Values.
     */
    static sccrval() {
        const scv = [
            "富强", "民主", "文明", "和谐",
            "自由", "平等", "公正", "法治",
            "爱国", "敬业", "诚信", "友善"
            // "功德 +1"
        ];
        const colors = [
            "layui-font-red", "layui-font-orange", "layui-font-green", "layui-font-cyan",
            "layui-font-blue", "layui-font-purple", "layui-font-black", "layui-font-gray"
        ];
        let scvi = 0;
        let colori = 0;
        window.addEventListener("click", (ev) => {
            const scvt = document.createElement("span");
            // basic style
            scvt.style.position = "fixed";
            scvt.style.top = `${ev.y - 16}px`;
            scvt.style.left = `${ev.x}px`;
            scvt.style.fontWeight = "bold";
            scvt.style.whiteSpace = "nowrap";
            scvt.style.userSelect = "none";
            scvt.style.transition = "none";
            scvt.style.opacity = "1";
            scvt.style.zIndex = "1145141919";
            // layui style
            scvt.className = colors[colori++];
            scvt.innerText = scv[scvi++];
            if (colori >= colors.length) colori = 0;
            if (scvi >= scv.length) scvi = 0;
            // show
            document.body.appendChild(scvt);
            // remove
            let k = 1;
            const itv = window.setInterval(() => {
                scvt.style.opacity = parseFloat(scvt.style.opacity) - .02;
                scvt.style.top = `${parseFloat(scvt.style.top.substring(0, scvt.style.top.length - 2)) - (k += .1)}px`;
                if (scvt.style.opacity <= 0) {
                    scvt.remove();
                    window.clearInterval(itv);
                }
            }, 20);
        });
    }

    /**
     * Add .layui-this.
     */
    static navthis() {
        // clear
        const nav = document.querySelector("ul[lay-filter=nav-sess]");
        for (const child of nav.children) {
            child.classList.remove("layui-this");
        }
        // add
        const path = window.location.pathname.replace("/", "").split("/");
        if (path.length < 1 || path[0] === "" || path[0] === "home") {
            nav.querySelector("#nav-index").classList.add("layui-this");
        } else if (path[0] === "category" || path[0] === "posts") {
            nav.querySelector("#nav-category").classList.add("layui-this");
        } else if (path[0] === "about") {
            nav.querySelector("#nav-about").classList.add("layui-this");
        } else if (path[0] === "friends") {
            nav.querySelector("#nav-friends").classList.add("layui-this");
        }
    }

    //#endregion
    //#region public

    /**
     * Load #main content.
     */
    static async loadMainContent() {
        // param
        let path = window.location.pathname.replace("/", "").split("/");
        if (path[path.length - 1] === "") path.pop();
        // request path
        this.setPageloadProgress("0%");
        document.querySelector("*[lay-filter=pageload-progress]").classList.remove("layui-hide");
        /*let reqpath = "";
        if (path.length < 1 || path[0] === "home") {
            reqpath = "/index.html";
        } else if (path[0] === "category") {
            reqpath = "/category/index.html";
        } else if (path[0] === "about") {
            reqpath = "/about/index.html";
        } else if (path[0] === "friends") {
            reqpath = "/friends/index.html";
        } else if (path[0] === "posts" && path.length < 3) {
            window.location.replace("/category");
            return;
        } else {
            for (const t of path) {
                reqpath += "/";
                reqpath += t.replace(/\.md$/, "/");
            }
        }
        // get HTML in #main
        this.setPageloadProgress("6%");
        const maincontainer = document.createElement("div");
        let responseRaw;
        try {
            const response = await fetch(reqpath);
            this.setPageloadProgress("90%");
            if (response.ok) {
                responseRaw = await response.text();
            } else {
                throw new Error(`${response.status} ${response.statusText}`);
            }
        } catch (e) {
            if (e.message === "Failed to fetch") {
                responseRaw = `
                    <main id="main-container">
                        <div class="layui-panel layui-card">
                            <h1 class="layui-card-header" id="main-title">Failed to fetch</h1>
                            <div class="layui-card-body" id="main">Please check your network connection and try again later...</div>
                        </div>
                    </div>
                `;
            } else {
                Sess.openErrLayer(e);
            }
        }
        this.setPageloadProgress("99%");
        if (!responseRaw || responseRaw === "") {
            maincontainer.innerHTML = `
                <main id="main-container">
                    <div class="layui-panel layui-card">
                        <h1 id="main-title">404 Not Found</h1>
                        <div id="main">There is nothing you wanted...</div>
                    </div>
                </div>
            `;
        } else if (path.length > 0 && path[0] === "posts") {
            if (path.length === 3) maincontainer.innerHTML = await this.getPostHTML(responseRaw, path);
        } else {
            maincontainer.innerHTML = responseRaw;
        }
        document.getElementById("main-container").innerHTML = maincontainer.querySelector("main#main-container").innerHTML;*/
        if (path.length === 3) document.getElementById("main-container").innerHTML = await this.getPostHTML(document.querySelector("pre.md-prerender").innerHTML, path);
        // random
        this.randomChildren();
        // create post index
        this.createPostIndex(document.getElementById("main"), path);
        // fill home #latest-container
        await this.fillHomeLatest();
        // fill category #category-container
        await this.fillCategoryInfo(path);
        // fill .friends-page-main
        await this.fillFriendLinkPage();
        // lazyimg
        layui.flow.lazyimg({
            elem: "img[lay-src]"
        });
        // title
        this.setPageTitle(document.querySelector("#main-title > span.layui-breadcrumb"));
        // top
        const postIndexContainerJQ = layui.$("#post-index-container");
        layui.util.fixbar({
            bgcolor: "rgba(166, 166, 166, 0.7)",
            bars: postIndexContainerJQ.length ? [{
                type: "post-index",
                icon: "layui-icon-list",
            }] : [],
            on: {
                click: type => {
                    if (type !== "post-index") {
                        return;
                    }
                    layer.open({
                        type: 1,
                        offset: 'r',
                        anim: 'slideLeft',
                        area: ['333px', '100%'],
                        shade: .01,
                        shadeClose: true,
                        skin: "layui-layer-win10",
                        move: false,
                        content: postIndexContainerJQ,
                        title: "文章索引",
                        resize: false,
                        end: () => this.renderElemWithScroll()
                    });
                    this.renderElemWithScroll();
                },
                mouseenter: function (type) {
                    layer.tips(type === "top" ? "回到顶部" : "文章索引", this, {
                      tips: [4, "#444d"],
                      fixed: true
                    });
                },
                mouseleave: () => {
                    layer.closeAll("tips");
                }
            }
        });
        // render
        this.renderBreadcrumb();
        this.renderCarousel();
        layui.code({
            elem: ".layui-code",
            langMarker: true,
            wordWrap: false
        });
        this.navthis();
        this.setPageloadProgress("100%");
        this.renderElemWithScroll();
    }

    /**
     * @param {string} progress
     */
    static setPageloadProgress(progress) {
        layui.element.progress("pageload-progress", progress);
        if (progress === "100%") {
            window.setTimeout(() => {
                document.querySelector("*[lay-filter=pageload-progress]").classList.add("layui-hide");
            }, 1000);
        } else if (progress === "0%") {
            document.querySelector("*[lay-filter=pageload-progress]").classList.remove("layui-hide");
        }
    }

    /**
     * Main.
     */
    static async main() {
        // load UI
        this.sccrval();
        window.addEventListener("resize", () => this.renderElemWithScroll());
        window.addEventListener("scroll", () => this.renderElemWithScroll());
        // load content
        const loadMainAndCatch = async () => {
            try {
                await this.loadMainContent();
            } catch (e) {
                this.openErrLayer(e);
                this.setPageloadProgress("0%");
            }
        };
        await loadMainAndCatch();
        // popstate
        window.addEventListener("popstate", loadMainAndCatch);
        // show big photos
        layui.util.on("lay-on", {
            "carousel-img": function () {
                layer.photos({
                    photos: `div[lay-on=${this.getAttribute("lay-on")}]`
                });
            },
            "post-img": function () {
                layer.photos({
                    photos: `div[lay-on=${this.getAttribute("lay-on")}]`
                });
            }
        });
        // friend link
        await this.friendLinkFooter();
        // forune & pageview
        this.fortune().catch((e) => Sess.openErrLayer(e));
        this.pageview().catch((e) => Sess.openErrLayer(e));
        this.postscount().catch((e) => Sess.openErrLayer(e));
    }

    /**
     * @param {HTMLSpanElement} breadcrumb
     */
    static setPageTitle(breadcrumb) {
        if(breadcrumb === null) return;
        const acites = breadcrumb.querySelectorAll("a > cite");
        const contentTitleText = acites.item(acites.length - 1).textContent;
        if (contentTitleText === "首页") {
            document.title = "SЕSSのB10GТЕ5Т";
        } else {
            document.title = contentTitleText + " - SЕSSのB10GТЕ5Т";
        }
    }

    //#endregion
    //#region extapi

    static async fortune() {
        //const text = await (await (await fetch("https://v1.hitokoto.cn/")).json()).hitokoto;
        const elem = document.querySelector("#lunar-calendar-container > .layui-card-body > p");
        if (elem !== null) {
            elem.innerText = await (await fetch("https://v1.hitokoto.cn/?encode=text")).text();
        } else {
            throw new Warning("no place to show fortune");
        }
    }

    static async pageview() {
        const elem = document.querySelector("#pageview");
        if (elem !== null) {
            elem.innerText = await (await fetch("https://api.xhustudio.eu.org/pv")).text();
        } else {
            throw new Warning("no place to show pageview");
        }
    }

    static async postscount() {
        const elem = document.querySelector("#postscount");
        if (elem === null) {
            throw new Warning("no place to show postscount");
        }
        let count = 0;
        const postsIndexJson = await (await fetch("/posts/index.json")).json();
        for (const yearPosts of postsIndexJson) {
            count += yearPosts.posts.length;
        }
        elem.innerText = count;
    }

    //#endregion
    //#region home

    static async fillHomeLatest() {
        const latestContainerDiv = document.querySelector("div#latest-container");
        if (latestContainerDiv === null) {
            return;
        }
        const postsIndexJson = await (await fetch("/posts/index.json")).json();
        const toyear = new Date().getFullYear();
        layui.flow.load({
            elem: "div#latest-container",
            end: "没有了喵",
            done: (page, next) => {
                const ls = this.getHomeLatestByYear(postsIndexJson, toyear - page + 1);
                next(ls.join(""), page < postsIndexJson.length);
            }
        });
    }

    /**
     * New posts should be added to the beginning of the list!
     * @param {any} postsList
     * @param {number} year
     */
    static getHomeLatestByYear(postsList, year) {
        const ls = [];
        for (const yearPosts of postsList) {
            if (yearPosts.year === year) {
                for (const aPost of yearPosts.posts) {
                    const url = `/posts/${year}/${aPost.fname}`;
                    const datetime = new Date(aPost.time);
                    // div
                    ls.push(`
                        <a href="${url.replace(".md", "")}" class="postcard layui-margin-2 layui-panel" id="latest-post-${datetime.getTime()}">
                            <div class="postcard-bg" style="background-image:url('${aPost.image}');"></div>
                            <div class="postcard-desc layui-padding-2">
                                <div class="postcard-title layui-font-20">${aPost.title}</div>
                                <div class="postcard-sub">
                                    ${aPost.category}&nbsp;&nbsp;${datetime.toLocaleString().replace(":00", "")}
                                </div>
                            </div>
                        </div>
                    `);
                }
                break;
            }
        }
        return ls;
    }

    //#endregion
    //#region category

    /**
     * @param {string[]} path
     */
    static async fillCategoryInfo(path) {
        // check
        const container = document.querySelector("div#category-container");
        if (container === null) return;
        // div
        const collapseDiv = document.createElement("div");
        collapseDiv.className = "layui-collapse";
        collapseDiv.setAttribute("lay-filter", "cat-colla");
        collapseDiv.setAttribute("lay-accordion", null);
        // item
        const categoryInfo = await this.getCategoryInfo();
        for (const aCategoryName of Object.keys(categoryInfo)) {
            const itemDiv = document.createElement("div");
            itemDiv.className = "layui-colla-item";
            // title
            itemDiv.insertAdjacentHTML("afterbegin", `
                <div class="layui-colla-title">
                    ${aCategoryName} <span style="float:right;">${categoryInfo[aCategoryName].count}</span>
                </div>
            `);
            // content
            const contentDiv = document.createElement("div");
            contentDiv.className = "layui-colla-content";
            if (path.length >= 2) {
                if (path[1] === aCategoryName) contentDiv.classList.add("layui-show");
            } else {
                if (collapseDiv.childElementCount === 0) contentDiv.classList.add("layui-show");
            }
            const contentText = [];
            for (const link of categoryInfo[aCategoryName].links) {
                contentText.push(`<a href="${link.url.replace(".md", "")}">${link.title}</a><br/>`);
            }
            contentDiv.innerHTML = contentText.join("");
            itemDiv.insertAdjacentElement("beforeend", contentDiv);
            collapseDiv.appendChild(itemDiv);
        }
        // ensure one colla-item open
        if (!collapseDiv.querySelector(".layui-show")) {
            collapseDiv.querySelector(".layui-colla-content").classList.add("layui-show");
        }
        // render
        container.appendChild(collapseDiv);
        layui.element.render("collapse", "cat-colla");
    }

    static async getCategoryInfo() {
        // eg: {"cat":{"count":1,"links":["title":"iamtitle",url:"/"]}}
        const categoryInfo = {};
        const postsIndexJson = await (await fetch("/posts/index.json")).json();
        for (const yearPosts of postsIndexJson) {
            for (const aPost of yearPosts.posts) {
                if (aPost.category in categoryInfo) {
                    categoryInfo[aPost.category].count++;
                } else {
                    categoryInfo[aPost.category] = {
                        count: 1,
                        links: []
                    };
                }
                categoryInfo[aPost.category].links.push({
                    "title": aPost.title,
                    "url": `/posts/${yearPosts.year}/${aPost.fname}`
                });
            }
        }
        return categoryInfo;
    }

    //#endregion
    //#region posts

    /**
     * @param {string} raw
     * @param {string[]} path
     */
    static async getPostHTML(raw, path) {
        // basic information
        const year = parseInt(path[1]);
        const fname = path[2] + ".md";
        let categoryName;
        let titleName;
        let datetime;
        let image;
        let tags = [""];
        // fill information
        const postsIndexJson = await (await fetch("/posts/index.json")).json();
        for (const aYearPosts of postsIndexJson) {
            if (aYearPosts.year === year) {
                for (const aPost of aYearPosts.posts) {
                    if (aPost.fname === fname) {
                        categoryName = aPost.category;
                        titleName = aPost.title;
                        datetime = new Date(aPost.time);
                        image = aPost.image;
                        tags = aPost.tags
                        break;
                    }
                }
                break;
            }
        }
        // colorful tags
        let colorfultags = "";
        const bgcolors = [
            "layui-bg-red", "layui-bg-orange", "layui-bg-green", "layui-bg-cyan",
            "layui-bg-blue", "layui-bg-purple", "layui-bg-black", "layui-bg-gray"
        ];
        let bgi = 0;
        for (const atag of tags) {
            colorfultags += `<code class="${bgcolors[bgi++]}">${atag}</code> `;
            if (bgi >= bgcolors.length) bgi = 0;
        }
        // return
        return `
            <div class="layui-panel layui-card">
                <h1 id="main-title" class="layui-card-header">
                    <span class="layui-breadcrumb" lay-separator=">" lay-filter="bc">
                        <a href="/">首页</a>
                        <a href="/category">分类</a>
                        <a href="/category/#${categoryName}">${categoryName}</a>
                        <a><cite>${datetime ? datetime.toLocaleString().replace(":00", "") : undefined}</cite></a>
                        <a><cite>${titleName}</cite></a>
                    </span>
                </h1>
                <div class="layui-card-body" id="main">
                    <div class="postcard layui-margin-2 layui-panel" id="latest-post-${datetime ? datetime.getTime() : undefined}">
                        <div class="postcard-bg" style="background-image:url('${image}');"></div>
                        <div class="postcard-desc layui-padding-2">
                            <div class="postcard-title layui-font-32">${titleName}</div>
                            <div class="postcard-sub" style="opacity:.84;">
                                ${colorfultags}
                            </div>
                        </div>
                    </div>
                    <div class="layui-text">
                        ${Md2html.md2html(raw).replace(new RegExp("<h1[^>]*>.*?</h1>", 'gi'), "")}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * @param {HTMLDivElement} main
     * @param {string[]} path
     */
    static createPostIndex(main, path) {
        const postIndexContainer = document.getElementById("post-index-container") || document.createElement("div");
        if (!((path.length === 1 && path[0] === "about") || (path.length === 3 && path[0] === "posts"))) {
            if (postIndexContainer.parentElement !== null) postIndexContainer.remove();
            return;
        }
        // element
        if (postIndexContainer.parentElement === null) {
            const col = document.querySelector(".layui-row > .layui-col-md4");
            const footer = col.querySelector("#footer");
            postIndexContainer.className = "layui-panel layui-card";
            postIndexContainer.id = "post-index-container";
            postIndexContainer.innerHTML = `
                <div class="layui-card-header">文章索引</div>
                <div class="layui-card-body" id="post-index"></div>
            `;
            col.insertBefore(postIndexContainer, footer);
        }
        // index data tree
        const mainTitleDiv = main.querySelector("div.postcard-title") || main.querySelector("h1");
        const mainContentCollection = main.querySelector("div.layui-text").children;
        const roottreenode = {
            title: mainTitleDiv.innerText,
            id: "H1-root",
            children: [],
            spread: true
        };
        let lasttreenode = roottreenode;
        for (const elem of mainContentCollection) {
            if (elem.tagName.startsWith('H') && elem.tagName.length === 2 && elem.tagName !== "H1") {
                while (parseInt(elem.tagName.charAt(1)) <= parseInt(lasttreenode.id.charAt(1))) {
                    lasttreenode = lasttreenode.parent;
                }
                const newtreenode = {
                    title: elem.innerText,
                    id: `${elem.tagName}-${elem.innerText}`,
                    children: [],
                    parent: lasttreenode
                };
                lasttreenode.children.push(newtreenode);
                lasttreenode = newtreenode;
            }
        }
        // render
        layui.tree.render({
            elem: "#post-index",
            data: [roottreenode],
            accordion: true,
            click: (obj) => {
                const idps = ["", ""];
                let overdash = false;
                for (const c of obj.data.id) {
                    if (!overdash) {
                        if (c === '-') {
                            overdash = true;
                        } else {
                            idps[0] += c;
                        }
                    } else {
                        idps[1] += c;
                    }
                }
                const elem = document.evaluate(
                    `//${idps[0].toLowerCase()}[text()='${idps[1]}']`, main, null,
                    XPathResult.FIRST_ORDERED_NODE_TYPE, null
                ).singleNodeValue;
                if (elem !== null) {
                    elem.scrollIntoView({ behavior: "smooth" });
                } else {
                    mainTitleDiv.scrollIntoView({ behavior: "smooth" });
                }
            }
        });
    }

    //#endregion
    //#region friends

    static async friendLinkFooter() {
        const json = await (await fetch("/friends.json")).json();
        // 3 * friends + 8 * organizations
        const result = [];
        const friendlenall = json.friends.length;
        for (let i = 0; i < (friendlenall < 3 ? friendlenall : 3); i++) {
            const e = json.friends.splice(Math.floor(Math.random() * json.friends.length), 1)[0];
            e.className = "personal-link";
            result.push(e);
        }
        const orglenall = json.organizations.length;
        for (let i = 0; i < (orglenall < 8 ? orglenall : 8); i++) {
            const e = json.organizations.splice(Math.floor(Math.random() * json.organizations.length), 1)[0];
            e.className = "layui-hide-xs";
            result.push(e);
        }
        result.push({
            "id": "more",
            "title": "...",
            "href": "/friends",
            "name": {
                "en": ["More"],
                "zh": ["更多"],
                "jp": ["もっと"]
            }
        });
        // fill
        const friendlinks = document.getElementById("friend-links");
        if (friendlinks !== null) {
            for (const lnk of result) {
                const names = this.friendLinkLangChooser(lnk.name);
                friendlinks.insertAdjacentHTML("beforeend", `
                    <a href="${lnk.href}" ${lnk.id === "more" ? "" : 'target="_blank" rel="noopener"'}
                        title="${names[Math.floor(Math.random() * names.length)]}"
                        class="${lnk.className}">${lnk.title}</a>
                `);
            }
        }
    }

    /**
     * @param {{zh:string[],en:string[],jp:string[]}} name 
     */
    static friendLinkLangChooser(name) {
        // by user language
        const langs = window.navigator.languages
        for (let i = 0; langs.length > i; i++) {
            if (langs[i].startsWith("zh")) {
                if (name.zh.length > 0) return name.zh;
            } else if (langs[i].startsWith("en")) {
                if (name.en.length > 0) return name.en;
            } else if (langs[i].startsWith("jp")) {
                if (name.jp.length > 0) return name.jp;
            }
        }
        // default
        if (name.zh.length > 0) return name.zh;
        if (name.en.length > 0) return name.en;
        if (name.jp.length > 0) return name.jp;
    }

    static async fillFriendLinkPage() {
        const mainelem = document.getElementById("friends-page-main");
        if (mainelem === null) return;
        const json = await (await fetch("/friends.json")).json();
        json.friends = this.randomArray(json.friends);
        json.organizations = this.randomArray(json.organizations);
        // friends
        const friendelem = mainelem.querySelector("#friends-page-friends")
        for (const f of json.friends) {
            this.fillFriendLinkElem(friendelem, f, false);
        }
        // organizations
        const orgselem = mainelem.querySelector("#friends-page-orgs");
        for (const o of json.organizations) {
            this.fillFriendLinkElem(orgselem, o, true);
        }
    }

    /**
     * @param {HTMLDivElement} elem
     * @param {any} link
     */
    static fillFriendLinkElem(elem, link, isorg) {
        const f = link;
        const names = this.randomArray(this.friendLinkLangChooser(f.name)).join(" / ");
        const title = f.title === names ? "" : f.title;
        elem.insertAdjacentHTML("beforeend", `
            <a class="layui-col-sm6" href="${f.href}" target="_blank" rel="noopener">
                <div class="layui-panel layui-card friends-page-bg-transp friends-page-bg-link">
                    <div class="layui-card-header">${names}</div>
                    <div class="layui-card-body">
                        <img alt="${f.id}" referrerpolicy="no-referrer"
                            src="${f.icon === "" ? f.href + "/favicon.ico" : f.icon}"
                            class="${isorg ? "friends-page-icon-org" : "layui-circle "}friends-page-icon" />
                        <div class="friends-page-desc">
                            ${title}${title !== "" && f.desc !== "" ? ": " : ""}${f.desc}
                        </div>
                    </div>
                </div>
            </a>
        `);
    }

    //#endregion
    //#region utils

    static randomChildren() {
        const elems = document.getElementsByClassName("random");
        for (const elem of elems) {
            let children = Array.from(elem.children);
            for (let t = 0; t <= Math.random() * 12; t++) {
                for (let i = children.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [children[i], children[j]] = [children[j], children[i]];
                }
            }
            for (const child of children) {
                elem.appendChild(child);
            }
        }
    }

    /**
     * @param {any[]} arr 
     */
    static randomArray(arr) {
        const result = [];
        const lenall = arr.length;
        for (let i = 0; i < lenall; i++) {
            result.push(arr.splice(Math.floor(Math.random() * arr.length), 1)[0]);
        }
        return result;
    }

    //#endregion

}

window.addEventListener("load", () => {
    Sess.main().catch((e) => {
        Sess.openErrLayer(e);
        Sess.setPageloadProgress("0%");
    });
});

//#region debug

// {
//     const disableDotline = () => {
//         if (dotLine) {
//             window.setTimeout(() => {
//                 dotLine.ctx = null;
//                 dotLine.move = () => {};
//                 console.log("[sess] Dotline disabled");
//             }, 50);
//         } else {
//             window.setTimeout(() => disableDotline(), 50);
//         }
//     }
//     disableDotline();
// }

//#endregion
