"use strict";

// redirect
{
    if (window.location.pathname === "/index.html") {
        window.location.pathname = "/";
    } else if (window.location.pathname !== "/") {
        window.location.replace(
            window.location.protocol + "//" + window.location.host + "/#" +
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
    dark.href = "https://unpkg.com/layui-theme-dark@2.9.7/dist/layui-theme-dark.css";
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
            content: e.stack.replaceAll(" at", "<br />&nbsp;&nbsp;&nbsp;&nbsp;at"),
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
        const path = layui.url().hash.path;
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
     * @param {HTMLElement} navelem
     */
    static async loadMainContent(navelem = {id: null}) {
        // param
        let path = layui.url().hash.path;
        if (navelem.id !== null) path = [navelem.id.replace("nav-", "")];
        // request path
        let reqpath = "";
        if (navelem.id === "nav-index" || path.length < 1 || path[0] === "" || path[0] === "home") {
            reqpath = "/home.html";
        } else if (navelem.id === "nav-category" || path[0] === "category") {
            reqpath = "/category.html";
        } else if (navelem.id === "nav-about" || path[0] === "about") {
            reqpath = "/about.html";
        } else {
            for (const t of path) {
                reqpath += "/";
                reqpath += t;
            }
            reqpath += ".html";
        }
        // get HTML in #main
        const maincontainer = document.createElement("div");
        try {
            const response = await fetch(reqpath);
            if (response.ok) {
                maincontainer.innerHTML = await response.text();
            } else {
                throw new Error(`${response.status} ${response.statusText}`);
            }
        } catch (e) {
            Sess.openErrLayer(e);
        }
        if (maincontainer.innerHTML === "") maincontainer.innerHTML = `
            <h1 id="main-title">404 Not Found</h1>
            <div id="main">There is nothing you wanted...</div>
        `;
        document.getElementById("main-title").innerHTML = maincontainer.querySelector("#main-title").innerHTML;
        document.getElementById("main").innerHTML = maincontainer.querySelector("#main").innerHTML;
        // render
        this.renderBreadcrumb();
        this.renderCarousel();
        this.navthis();
    }

    /**
     * Main.
     */
    static async main() {
        // load UI
        this.navthis();
        this.sccrval();
        // load content
        await this.loadMainContent();
        layui.element.on("nav(nav-sess)", (elem) => this.loadMainContent(elem.context.parentElement));
        layui.util.on("lay-on", {
            "bc-home": () => Sess.loadMainContent({id: "nav-index"})
        });
        // show carousel photos
        const showCarouselPhotos = function () {
            layer.photos({
                photos: `div[lay-on=${this.getAttribute("lay-on")}]`
            });
        };
        layui.util.on("lay-on", {
            "carousel-profile-3d-contrib": showCarouselPhotos,
            "carousel-bing": showCarouselPhotos,
            "carousel-outer-space": showCarouselPhotos,
            "carousel-720x360-5": showCarouselPhotos
        });
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
                throw new Warnning("no place to show fortune");
            }
        } catch (e) {
            this.openErrLayer(e);
        }
    }

    static async pageview() {
        const elem = document.querySelector("#pageview");
        try {
            if (elem !== null) {
                elem.innerText = await (await fetch("https://api.xhustudio.eu.org/pv")).text();
            } else {
                throw new Warning("no place to show pageview");
            }
        } catch (e) {
            this.openErrLayer(e);
        }
    }

}

Sess.main().catch((e) => Sess.openErrLayer(e));
