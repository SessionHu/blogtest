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
    const themeSwitchButton = document.querySelector("#theme-switch > button");

    /**
     * @param {{matches: boolean}} ev 
     */
    const handleTheme = (ev) => {
        if ((ev.matches || layui.data("sessblog").theme === "dark") && dark.parentElement === null) {
            head.appendChild(dark);
            layui.data("sessblog", { key: "theme", value: "dark" });
            themeSwitchButton.innerHTML = "&#xe6c2;";
            layer.tips('已启用深色模式', "#theme-switch", {
                tips: 3,
                time: 1600
            });
        } else if (dark.parentElement !== null) {
            head.removeChild(dark);
            layui.data("sessblog", { key: "theme", value: "light" });
            themeSwitchButton.innerHTML = "&#xe748;";
            layer.tips('已启用浅色模式', "#theme-switch", {
                tips: [3, "#666"],
                time: 1600
            });
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

class Sess {

    /**
     * Open a dialog about the Error.
     * @param {Error} e 
     */
    static openErrLayer(e) {
        layer.open({
            type: 0,
            title: e.name,
            content: e.stack.replaceAll(" at", "<br />&nbsp;&nbsp;&nbsp;&nbsp;at"),
            icon: 2,
            skin: "layui-layer-win10",
            shade: .01,
            shadeClose: true
        })
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
     * Main.
     */
    static async main() {

        /**
         * Add .layui-this.
         */
        const navthis = () => {
            const path = layui.url().hash.path;
            if (path.length < 1 || path[0] === "") {
                document.getElementById("nav-index").classList.add("layui-this");
                return;
            }
            switch (path[0]) {
                case "home":
                    document.getElementById("nav-index").classList.add("layui-this");
                    break;
                case "category":
                    document.getElementById("nav-category").classList.add("layui-this");
                    break;
                case "about":
                    document.getElementById("nav-about").classList.add("layui-this");
                    break;
                default:
                // nothing here...
            }
        };
        navthis();

        /**
         * Load Socialist Core Values.
         */
        const sccrval = () => {
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
        };
        sccrval();

        /**
         * Load #main content.
         * @param {JQuery} elem
         */
        const loadMainContent = async (elem = { context: { parentElement: { id: null } } }) => {
            // param
            let path = layui.url().hash.path;
            if (elem.context.parentElement.id !== null) path = [null];
            // request path
            let reqpath = "";
            if (elem.context.parentElement.id === "nav-index" || path.length < 1 || path[0] === "" || path[0] === "home") {
                reqpath = "/home.html";
            } else if (elem.context.parentElement.id === "nav-category" || path[0] === "category") {
                reqpath = "/category.html";
            } else if (elem.context.parentElement.id === "nav-about" || path[0] === "about") {
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
        };
        await loadMainContent();
        layui.element.on("nav(nav-sess)", (elem) => loadMainContent(elem));

        /**
         * @param {HTMLElement} this
         */
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

        await this.fortune();

        // debug
        // window.addEventListener("resize", () => {
        //     layer.msg("w:" + window.innerWidth + "<br>h:" + window.innerHeight);
        // });

    }

    static async fortune() {
        const text = await (await fetch("https://v1.hitokoto.cn/?encode=text")).text();
        const elem = document.querySelector("#lunar-calendar-container > .layui-card-body > p"); 
        elem.innerText = text;
    }

}

Sess.main().catch((e) => Sess.openErrLayer(e));
