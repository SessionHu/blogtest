"use strict";

//#region redirect

if (location.pathname === '/index.html' || (document.referrer === 'https://shakaianee.top/' && location.hash === "#!/about")) {
  location.replace('/');
} else if (location.hash.startsWith('#!/')) {
  location.replace(/^#!(\/.*?)(\.md)?$/.exec(location.hash)[1]);
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
      icon: 2,
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

  collapse() {
    var elem = $('.layui-collapse');
    if (elem[0]) {
      layui.element.render("collapse", elem);
      $('.layui-colla-content' + location.hash + ':first', elem).addClass('layui-show');
    }
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
    $('ul[lay-filter=nav-sess] > *').each(function () {
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
  },

  datetime() {
    $('time[datetime]').text(function () {
      return new Date(this.dateTime).toLocaleString().replace(/(\d{1,2})\:(\d{1,2})\:00/, '$1:$2');
    });
  },

  /**
   * @param {HTMLElement} bc
   */
  pageTitle(bc) {
    if (!bc) return;
    var ctx = $("a > cite:last").text();
    document.title = ctx === "首页" ? "SЕSSのB10GТЕ5Т" : ctx + " - SЕSSのB10GТЕ5Т";
  },

  fortune() {
    $.get('https://v1.hitokoto.cn/?encode=text', function (res) {
      $('#lunar-calendar-container > .layui-card-body > p').text(res);
    });
  },

  pageview() {
    $.get('https://api.xhustudio.eu.org/pv', function (res) {
      $('#pageview').text(res);
    });
  },

  postscount() {
    var count = 0;
    $.getJSON('/posts/index.json', function (res) {
      res.forEach(function (e) {
          count += e.posts.length;
      });
      $('#postscount').text(count);
    });
  },

  code() {
    layui.code({
      elem: ".layui-code",
      langMarker: true,
      wordWrap: false
    });
  },

  lazyimg() {
    layui.flow.lazyimg({
      elem: "img[lay-src]"
    });
  }

};

//#endregion

var Sess = {

  //#region public

  /**
   * Load #main content.
   * @param {string | URL} url
   * @returns {JQuery.Deferred}
   */
  loadMainContent(url) {
    return new $.Deferred(function (df) {
      // request
      if (url) {
        Renderer.progress("6%");
        $('#main-container').load(url + ' #main-container > *', function (_, textStatus) {
          if (textStatus === 'timeout' || textStatus === 'error' || textStatus === 'parsererror') {
            this.innerHTML = '\
              <div class="layui-panel layui-card">\
                  <h1 class="layui-card-header" id="main-title">Failed to fetch</h1>\
                  <div class="layui-card-body" id="main">Please check your network connection and try again later...</div>\
              </div>\
            ';
          }
          Renderer.progress("99%");
          df.resolve();
        });
      } else {
        df.resolve();
      }
    }).then(function () {
      // datetime
      Renderer.datetime();
      // random
      Sess.randomChildren();
      // create post index
      Sess.createPostIndex(document.getElementById("main"));
      // fill .friends-page-main
      return Sess.fillFriendLinkPage();
    }).then(function () {
      // title
      Renderer.pageTitle(document.querySelector("#main-title > span.layui-breadcrumb"));
      // lazyimg
      Renderer.lazyimg();
      // top
      var picjq = $("#post-index-container");
      layui.util.fixbar({
        bgcolor: "rgba(166, 166, 166, 0.7)",
        bars: picjq.length ? [{
          type: "post-index",
          icon: "layui-icon-list",
        }] : [],
        on: {
          click: function (type) {
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
              content: picjq,
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
          mouseleave: function () {
            layer.closeAll("tips");
          }
        }
      });
      // render
      Renderer.breadcrumb();
      Renderer.carousel();
      Renderer.collapse();
      Renderer.nav();
      Renderer.code();
      Renderer.onscroll();
      Renderer.progress("100%");
    });
  },

  /**
   * Main.
   */
  main() {
    // load UI
    Renderer.sccrval();
    $(window).on("resize", Renderer.onscroll);
    $(window).on("scroll", Renderer.onscroll);
    // load content
    /**
     * @param {string | URL} url
     */
    function loadMainAndCatch(url) {
      return Sess.loadMainContent(url).fail(function (e) {
        Renderer.openErrLayer(e);
        Renderer.progress("0%");
      });
    };
    loadMainAndCatch();
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
    this.friendLinkFooter();
    // pushstate
    if (history.pushState) {
      /**
       * @param {JQuery.ClickEvent} ev
       */
      function _onclick(ev) {
        var ac = ev.target;
        while (true) {
          if (!ac) break;
          else if (ac instanceof HTMLAnchorElement) break;
          else ac = ac.parentNode;
        }
        if (!ac || ac.host !== location.host || ac.href.match(/\.(json|ico|css|js|xml)$/)) return;
        ev.preventDefault();
        history.pushState({}, '', ac.href);
        loadMainAndCatch(ac.href);
      }
      $('ul.layui-nav li a').on('click', _onclick);
      $('footer .layui-col-sm8 > a').on('click', _onclick);
      $('main').on('click', _onclick);
    }
    // forune & pageview
    Renderer.fortune();
    Renderer.pageview();
    Renderer.postscount();
  },

    //#endregion
    //#region posts

    /**
     * @param {HTMLDivElement} main
     */
    createPostIndex(main) {
         if (!main) return;
        const postIndexContainer = document.getElementById("post-index-container") || document.createElement("div");
        if (!location.pathname.match(/\/(about|posts)/)) {
            if (postIndexContainer.parentElement) postIndexContainer.remove();
            return;
        }
        // element
        if (!postIndexContainer.parentElement) {
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
    },

    //#endregion
    //#region friends

    async friendLinkFooter() {
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
    },

    /**
     * @param {{zh:string[],en:string[],jp:string[]}} name 
     */
    friendLinkLangChooser(name) {
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
    },

    async fillFriendLinkPage() {
        const mainelem = document.getElementById("friends-page-main");
        if (mainelem === null) return;
        const json = await (await fetch("/friends.json")).json();
        json.friends = this.shufArray(json.friends);
        json.organizations = this.shufArray(json.organizations);
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
    },

    /**
     * @param {HTMLDivElement} elem
     * @param {any} link
     */
    fillFriendLinkElem(elem, link, isorg) {
        const f = link;
        const names = this.shufArray(this.friendLinkLangChooser(f.name)).join(" / ");
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
    },

    //#endregion
    //#region utils

    randomChildren() {
      Array.from(document.getElementsByClassName("random")).forEach(function (elem) {
        Sess.shufArray(Array.from(elem.childNodes)).forEach(function (e) {
          elem.appendChild(e);
        });
      });
    },

    /**
     * @param {any[]} arr 
     */
    shufArray(arr) {
      for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * i);
        var t = arr[j];
        arr[j] = arr[i];
        arr[i] = t;
      }
      return arr;
    }

    //#endregion

}

layui.use(function () {
  Sess.main().catch((e) => {
    Renderer.openErrLayer(e);
    Renderer.progress("0%");
  });
});
