"use strict";

// redirect
{
    if (window.location.pathname === "/index.html") {
        window.location.pathname = "/";
    } else if (window.location.pathname !== "/") {
        window.location.replace(
            window.location.protocol + "//" + window.location.host + "/#!" +
            window.location.pathname.replace(".html", "") + "/" +
            window.location.search.substring(1) + window.location.hash
        );
    }
}

// theme
{

    const head = document.querySelector("head");
    const dark = document.createElement("link");
    dark.rel = "stylesheet";
    dark.href = "https://unpkg.com/layui-theme-dark@2.9.13/dist/layui-theme-dark.css";
    const darkFix = dark.cloneNode(true);
    darkFix.href = "/styles/dark-fix.css";
    const themeSwitchButton = document.querySelector("#theme-switch > button");

    /**
     * @param {{matches: boolean}} ev 
     */
    const handleTheme = (ev) => {
        if ((ev.matches || layui.data("sessblog").theme === "dark") && dark.parentElement === null) {
            head.appendChild(dark);
            head.appendChild(darkFix);
            layui.data("sessblog", { key: "theme", value: "dark" });
            themeSwitchButton.innerHTML = "&#xe6c2;";
            setDotlineColor("#f0f0f0");
            layer.tips('已启用深色模式', "#theme-switch", {
                tips: 3,
                time: 1600
            });
        } else if (dark.parentElement !== null) {
            head.removeChild(dark);
            head.removeChild(darkFix);
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
    handleTheme(mql);

    mql.addEventListener("change", handleTheme);

    layui.util.on("lay-on", {
        "theme-switch": layui.throttle(() => {
            handleTheme({
                matches: dark.parentElement === null
            });
        }, 256)
    });

}

class Warning extends Error {
    name = "Warning"
}

class Sess {

    /**
     * Open a dialog about the Error.
     * @param {Error | Warning} e
     * @param {any} options
     */
    static openErrLayer(e, options) {
        layer.open({
            type: 0,
            title: e.name,
            content: e.stack.replaceAll(" ", "&nbsp;").replaceAll("\n", "<br />"),
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
        const path = layui.url(window.location.href.replace("/#!","/#")).hash.path;
        if (path.length < 1 || path[0] === "" || path[0] === "home") {
            nav.querySelector("#nav-index").classList.add("layui-this");
        } else if (path[0] === "category") {
            nav.querySelector("#nav-category").classList.add("layui-this");
        } else if (path[0] === "about") {
            nav.querySelector("#nav-about").classList.add("layui-this");
        }
    }

    /**
     * Load #main content.
     */
    static async loadMainContent() {
        // param
        let path = layui.url(window.location.href.replace("/#!","/#")).hash.path;
        // request path
        this.setPageloadProgress("0%");
        document.querySelector("*[lay-filter=pageload-progress]").classList.remove("layui-hide");
        let reqpath = "";
        if (path.length < 1 || path[0] === "" || path[0] === "home") {
            reqpath = "/home.html";
        } else if (path[0] === "category") {
            reqpath = "/category.html";
        } else if (path[0] === "about") {
            reqpath = "/about.html";
        } else {
            for (const t of path) {
                reqpath += "/";
                reqpath += t;
            }
            if (path[0] !== "posts") reqpath += ".html";
        }
        // get HTML in #main
        this.setPageloadProgress("6%");
        const maincontainer = document.createElement("div");
        try {
            const response = await fetch(reqpath);
            this.setPageloadProgress("90%");
            if (response.ok) {
                maincontainer.innerHTML = await response.text();
            } else {
                throw new Error(`${response.status} ${response.statusText}`);
            }
        } catch (e) {
            Sess.openErrLayer(e);
        }
        this.setPageloadProgress("99%");
        if (maincontainer.innerHTML === "") {
            maincontainer.innerHTML = `
                <h1 id="main-title">404 Not Found</h1>
                <div id="main">There is nothing you wanted...</div>
            `;
        } else if (path.length > 0 && path[0] === "posts") {
            if (path.length === 3) maincontainer.innerHTML = await this.getPostHTML(maincontainer.innerHTML, path);
        }
        document.getElementById("main-title").innerHTML = maincontainer.querySelector("#main-title").innerHTML;
        document.getElementById("main").innerHTML = maincontainer.querySelector("#main").innerHTML;
        // fill home #latest-container
        await this.fillHomeLatest();
        // fill category #category-container
        await this.fillCategoryInfo();
        // render
        this.renderBreadcrumb();
        this.renderCarousel();
        this.navthis();
        this.setPageloadProgress("100%");
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
        this.navthis();
        this.sccrval();
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
        // show carousel photos
        layui.util.on("lay-on", {
            "carousel-img": function () {
            layer.photos({
                photos: `div[lay-on=${this.getAttribute("lay-on")}]`
            });
        }});
        // forune & pageview
        this.fortune().catch((e) => Sess.openErrLayer(e));
        this.pageview().catch((e) => Sess.openErrLayer(e));
    }

    static async fortune() {
        //const text = await (await (await fetch("https://v1.hitokoto.cn/")).json()).hitokoto;
        const elem = document.querySelector("#lunar-calendar-container > .layui-card-body > p");
        try {
            if (elem !== null) {
                elem.innerText = await (await fetch("https://v1.hitokoto.cn/?encode=text")).text();
            } else {
                throw new Warning("no place to show fortune");
            }
        } catch (e) {
            this.openErrLayer(e);
        }
    }

    static async pageview() {
        const elem = document.querySelector("#pageview");
        if (elem !== null) {
            let pvcount = 114514;
            try {
                pvcount = await (await fetch("https://api.xhustudio.eu.org/pv")).text();
            } catch (e) {
                this.openErrLayer(e);
            }
            elem.innerText = pvcount;
        } else {
            throw new Warning("no place to show pageview");
        }
    }

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
     * @param {any} postsList
     * @param {number} year
     */
    static getHomeLatestByYear(postsList, year) {
        const ls = [];
        for (const yearPosts of postsList) {
            if (yearPosts.year === year) {
                for (const aPost of yearPosts.posts) {
                    const url = `/#!/posts/${year}/${aPost.fname}`;
                    const datetime = new Date(aPost.time);
                    // div
                    ls.push(`
                        <a href="${url}" class="postcard layui-margin-2 layui-panel" id="latest-post-${datetime.getTime()}">
                            <div class="postcard-bg" style="background-image:url('${aPost.image}');"></div>
                            <div class="postcard-desc layui-padding-2">
                                <div class="postcard-title layui-font-18">${aPost.title}</div>
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

    static async fillCategoryInfo() {
        // check
        const container = document.querySelector("div#category-container");
        if (container === null) return;
        // div
        const collapseDiv = document.createElement("div");
        collapseDiv.className = "layui-collapse";
        collapseDiv.setAttribute("lay-filter", "cat-colla");
        // item
        const categoryInfo = await this.getCategoryInfo();
        for (const aCategoryName of Object.keys(categoryInfo)) {
            const itemDiv = document.createElement("div");
            itemDiv.className = "layui-colla-item";
            // title
            itemDiv.insertAdjacentHTML("afterbegin", `
                <div class="layui-colla-title">
                    ${aCategoryName} ${categoryInfo[aCategoryName].count}
                </div>
            `);
            // content
            const contentDiv = document.createElement("div");
            contentDiv.className = "layui-colla-content";
            if (collapseDiv.childElementCount === 0) contentDiv.classList.add("layui-show");
            const contentText = [];
            for (const link of categoryInfo[aCategoryName].links) {
                contentText.push(`<a href="${link.url}">${link.title}</a><br/>`);
            }
            contentDiv.innerHTML = contentText.join("");
            itemDiv.insertAdjacentElement("beforeend", contentDiv);
            collapseDiv.appendChild(itemDiv);
        }
        container.appendChild(collapseDiv);
        layui.element.render("collapse", "cat-colla");
    }

    static async getCategoryInfo() {
        // eg: {"cat":{"count":1,"links":["title":"iamtitle",url:"/#!/"]}}
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
                    "url": `/#!/posts/${yearPosts.year}/${aPost.fname}`
                });
            }
        }
        return categoryInfo;
    }

    /**
     * @param {string} raw
     * @param {string[]} path
     */
    static async getPostHTML(raw, path) {
        // basic information
        const year = parseInt(path[1]);
        const fname = path[2];
        let categoryName;
        let titleName;
        let datetime
        // fill information
        const postsIndexJson = await (await fetch("/posts/index.json")).json();
        for (const aYearPosts of postsIndexJson) {
            if (aYearPosts.year === year) {
                for (const aPost of aYearPosts.posts) {
                    if (aPost.fname === fname) {
                        categoryName = aPost.category;
                        titleName = aPost.title;
                        datetime = new Date(aPost.time);
                        break;
                    }
                }
                break;
            }
        }
        return `
            <h1 id="main-title">
                <span class="layui-breadcrumb" lay-separator=">" lay-filter="bc">
                    <a href="/#!/">首页</a>
                    <a href="/#!/category">分类</a>
                    <a href="/#!/category/${categoryName}">${categoryName}</a>
                    <a><cite>${datetime.toLocaleString().replace(":00", "")}</cite></a>
                    <a><cite>${titleName}</cite></a>
                </span>
            </h1>
            <div id="main"><pre>${raw}</pre></div>
        `;
    }

}

Sess.main().catch((e) => {
    Sess.openErrLayer(e);
    Sess.setPageloadProgress("0%");
});

// debug
//{
//    const disableDotline = () => {
//        if (dotLine) {
//            window.setTimeout(() => {
//                dotLine.ctx = null;
//                dotLine.move = () => {};
//                console.log("[sess] Dotline disabled");
//            }, 50);
//        } else {
//            window.setTimeout(() => disableDotline(), 50);
//        }
//    }
//    disableDotline();
//}
