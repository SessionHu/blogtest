"use strict";

//#region redirect

if (location.pathname === '/index.html' || (document.referrer === 'https://shakaianee.top/' && location.hash === "#!/about")) {
  location.replace('/');
} else if (location.hash.startsWith('#!/')) {
  location.replace(/^#!(\/.*)(\.md)?$/.exec(location.hash)[1]);
}

//#endregion

if (!window.$) window.$ = layui.$;

//#region theme

layui.use(function () {

  var layelem = document.createElement('link');
  layelem.href = "https://unpkg.com/layui-theme-dark@2.9.21/dist/layui-theme-dark.css";
  layelem.rel = 'stylesheet';
  var fixelem = document.createElement('link');
  fixelem.href = "/styles/dark-fix.css";
  fixelem.rel = 'stylesheet';

  var themeSwitchBtn = $('#theme-switch > button');

  /**
   * @param {boolean} tips
   */
  function _todark(tips) {
    if (!layelem.parentNode) document.head.appendChild(layelem);
    if (!fixelem.parentNode) document.head.appendChild(fixelem);
    themeSwitchBtn.text("\ue6c2");
    if (tips) layer.tips('已启用深色模式', "#theme-switch", {
      tips: 3,
      time: 1600
    });
  }

  /**
   * @param {boolean} tips
   */
  function _tolight(tips) {
    if (layelem.parentNode) layelem.parentNode.removeChild(layelem);
    if (fixelem.parentNode) fixelem.parentNode.removeChild(fixelem);
    themeSwitchBtn.text("\ue748");
    if (tips) layer.tips('已启用浅色模式', "#theme-switch", {
      tips: [3, "#666"],
      time: 1600
    });
  }

  /**
   * @param {boolean} isclick
   * @param {boolean} isinit
   * @param {boolean} matches
   */
  function _switchTheme(isclick, isinit, matches) {
    var darksys = layui.data('sessblog').darksys || false;
    var darkusr = layui.data('sessblog').darkusr || false;
    if (!isclick && matches !== void 0 && darksys !== matches) {
      layui.data('sessblog', { key: 'darksys', value: (darksys = matches) });
      layui.data('sessblog', { key: 'darkusr', value: (darkusr = matches) });
    } else if (isclick) {
      layui.data('sessblog', { key: 'darkusr', value: (darkusr = !darkusr) });
    }
    if (darkusr) _todark(!isinit);
    else _tolight();
  }

  if (window.matchMedia) {
    var mql = window.matchMedia("(prefers-color-scheme: dark)");
    _switchTheme(false, true, mql.matches);
    mql.addEventListener("change", function (ev) {
      _switchTheme(false, false, ev.matches);
    });
  } else {
    _switchTheme(false, true);
  }

  themeSwitchBtn.on('click', layui.throttle(function () {
    _switchTheme(true, false);
  }, 3e2));

});

//#endregion

/** @class */
function Warning(message) {
  Error.call(this, message);
  this.name = 'Warning';
}
Warning.prototype = Object.create(Error.prototype);
Warning.prototype.constructor = Warning;

//#region UI

var Renderer = {

  /**
   * Open a dialog about the Error.
   * @param {Error} e
   * @param {any} options?
   */
  openErrLayer: function (e, options) {
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
  },

  /**
   * Render carousel.
   */
  carousel: function () {
    var e = $('.layui-carousel:has(div[carousel-item]:has(*))');
    if (e[0]) layui.carousel.render({
      elem: e,
      width: "auto"
    });
  },

  /**
   * Render breadcrumb.
   */
  breadcrumb: function () {
    layui.element.render('breadcrumb', $('.layui-breadcrumb'));
  },

  /**
   * Render something on scroll.
   */
  onscroll: function () {
    var sclY = window.scrollY || document.documentElement.scrollTop;
    var docH = document.documentElement.scrollHeight;
    var viuH = window.innerHeight || document.documentElement.clientHeight;
    var viuW = window.innerWidth || document.documentElement.clientWidth;
    // footer
    var footer = $('footer');
    $('#footer-placeholder').css('height', footer.outerHeight() + 2 + 'px');
    footer.css('bottom', sclY + viuH + 1 >= docH ? 0 : -footer.outerHeight() + 'px');
    // #post-index-container
    var pic = $('#post-index-container');
    if (viuW >= 992 && !pic.hasClass('layui-layer-wrap')) {
      var topn = sclY - pic.offsetParent().outerHeight() + pic.outerHeight();
      pic.css('top', topn > 0 ? topn + 'px' : 0);
    } else {
      pic.css('top', 0);
    }
  },

  /**
   * Load Socialist Core Values (社会主义核心价值观).
   */
  sccrval: function () {
    var scv = [
      '富强', '民主', '文明', '和谐',
      '自由', '平等', '公正', '法治',
      '爱国', '敬业', '诚信', '友善'
    ];
    var colors = [
      "layui-font-red", "layui-font-orange", "layui-font-green", "layui-font-cyan",
      "layui-font-blue", "layui-font-purple", "layui-font-black", "layui-font-gray"
    ];
    var i = 0;
    $(document).on('click', function (ev) {
      var scvt = $('<span></span>').text(scv[i % scv.length]);
      // basic style
      scvt.addClass(colors[i++ % colors.length]).css({
        top: (ev.clientY - 16) + 'px',
        left: ev.clientX + 'px',
        position: 'fixed',
        fontWeight: "bold",
        whiteSpace: "nowrap",
        userSelect: "none",
        transition: "none",
        opacity: "1",
        zIndex: "1145141919"
      });
      // show
      scvt.appendTo('body');
      // remove
      var k = 1;
      setTimeout(function cb() {
        scvt.css({
          opacity: parseFloat(scvt.css('opacity')) - .02,
          top: parseFloat(scvt.css('top').substring(0, scvt.css('top').length - 2)) - (k += .1) + 'px'
        });
        if (parseFloat(scvt.css('opacity')) <= 0) {
            scvt.remove();
        } else {
          setTimeout(cb, 20);
        }
      }, 20);
    });
  },

  /**
   * Add .layui-this.
   */
  nav: function () {
    var pg = location.pathname.split('/')[1];
    if (pg === 'posts') pg = 'category';
    else if (pg === 'index.html' || !pg) pg = 'index';
    $('ul[lay-filter=nav-sess]').children().each(function () {
      if (this.id === 'nav-' + pg) {
        this.classList.add('layui-this');
      } else {
        this.classList.remove('layui-this');
      }
    });
  },

  /**
   * @param {string} progress
   */
  progress: function (progress) {
    var el = $("*[lay-filter=pageload-progress]");
    layui.element.progress("pageload-progress", progress);
    if (progress === "100%") {
      new $.Deferred(function () {
        var that = this;
        window.setTimeout(function () {
          el.animate({
            top: '-2px',
            opacity: 0
          }, 2e2, 'linear', that.resolve);
        }, 1e3);
      }).then(function () {
        layui.element.progress("pageload-progress", '0%');
        window.setTimeout(function () {
          el.animate({
            top: 0,
            opacity: 1
          }, 2e2, 'linear');
        }, 2e2);
      });
    } else {
      el.css('top', 0);
    }
  }


};

//#endregion

class Sess {

    //#region public

    /**
     * Load #main content.
     * @param {string | URL} url
     */
    static async loadMainContent(url) {
        // param
        let path = window.location.pathname.replace("/", "").split("/");
        if (path[path.length - 1] === "") path.pop();
        // request
        if (url) {
          Renderer.progress("6%");
          await new Promise((resolve) => {
            $('#main-container').load(url + ' #main-container > *', function (_, textStatus) {
              if (textStatus === 'timeout' || textStatus === 'error' || textStatus === 'parsererror') {
                this.innerHTML = '\
                  <div class="layui-panel layui-card">\
                      <h1 class="layui-card-header" id="main-title">Failed to fetch</h1>\
                      <div class="layui-card-body" id="main">Please check your network connection and try again later...</div>\
                  </div>\
                ';
              }
              resolve();
            });
          });
          Renderer.progress("99%");
        }
        if (history.pushState) {
          /**
           * @param {Node} elem
           * @returns {HTMLAnchorElement | null}
           */
          function childoforanchor(elem) {
            if (elem instanceof HTMLAnchorElement) return elem;
            else if (!elem.parentNode) return null;
            else return childoforanchor(elem.parentNode);
          }
          document.querySelector('main').addEventListener('click', async function (ev) {
            var ac;
            if (!(ac = childoforanchor(ev.target)) || ac.host !== location.host || ac.href.match(/\.(json|ico|css|js|xml)$/)) return;
            ev.preventDefault();
            history.pushState({}, '', ac.href);
            try {
               await Sess.loadMainContent(ac.href);
            } catch (e) {
              Renderer.openErrLayer(e);
              Renderer.progress("0%");
            }
          });
        }
        // datetime
        $('time[datetime]').text(function () {
          return new Date(this.dateTime).toLocaleString().replace(/(\d{1,2})\:(\d{1,2})\:00/, '$1:$2');
        });
        // random
        this.randomChildren();
        // create post index
        this.createPostIndex(document.getElementById("main"), path);
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
                        area: [333 < document.documentElement.clientWidth ? '333px' : '100%', '100%'],
                        shade: .01,
                        shadeClose: true,
                        skin: "layui-layer-win10",
                        move: false,
                        content: postIndexContainerJQ,
                        title: "文章索引",
                        resize: false,
                        end: Renderer.onscroll
                    });
                    Renderer.onscroll();
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
        Renderer.breadcrumb();
        Renderer.carousel();
        layui.code({
            elem: ".layui-code",
            langMarker: true,
            wordWrap: false
        });
        Renderer.nav();
        Renderer.onscroll();
        Renderer.progress("100%");
    }

    /**
     * Main.
     */
    static async main() {
        // load UI
        Renderer.sccrval();
        window.addEventListener("resize", Renderer.onscroll);
        window.addEventListener("scroll", Renderer.onscroll);
        // load content
        /**
         * @param {string | URL} url
         */
        const loadMainAndCatch = async (url) => {
            try {
                await this.loadMainContent(url);
            } catch (e) {
                Renderer.openErrLayer(e);
                Renderer.progress("0%");
            }
        };
        await loadMainAndCatch();
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
        // pushstate
        if (history.pushState) {
          for (const e of [
            ...document.querySelectorAll('ul li a'),
            ...document.querySelectorAll('footer .layui-col-sm8 > a')
          ]) {
            e.addEventListener('click', function (ev) {
              if ((ev.target !== this && ev.target instanceof HTMLAnchorElement) || this.host !== location.host) return;
              ev.preventDefault();
              history.pushState({}, '', this.href);
              loadMainAndCatch(this.href);
            });
          }
        }
        // forune & pageview
        this.fortune().catch((e) => Renderer.openErrLayer(e));
        this.pageview().catch((e) => Renderer.openErrLayer(e));
        this.postscount().catch((e) => Renderer.openErrLayer(e));
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
                contentText.push(`<a href="${link.url.replace(".md", "/")}">${link.title}</a><br/>`);
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
     * @param {HTMLDivElement} main
     * @param {string[]} path
     */
    static createPostIndex(main, path) {
         if (!main) return;
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
        const mainContent = main.querySelector("div.layui-text");
        if (!mainContent) return;
        const mainContentCollection = mainContent.children;
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

layui.use(function () {
  Sess.main().catch((e) => {
    Renderer.openErrLayer(e);
    Renderer.progress("0%");
  });
});
