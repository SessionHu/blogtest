"use strict";

//#region redirect

if (location.pathname === '/index.html' || (document.referrer === 'https://shakaianee.top/' && location.hash === "#!/about")) {
  location.replace('/');
} else if (location.hash.match(/^#!\/.*$/)) {
  location.replace(/^#!(\/.*?)(\.md)?$/.exec(location.hash)[1]);
}

//#endregion

if (!window.$) window.$ = layui.$;

//#region theme

(function () {

  var fragment = document.createDocumentFragment();
  var layelem = document.createElement('link');
  layelem.href = "https://unpkg.com/layui-theme-dark@2.9.21/dist/layui-theme-dark.css";
  layelem.rel = 'stylesheet';
  fragment.appendChild(layelem);
  var fixelem = document.createElement('link');
  fixelem.href = "/styles/dark-fix.css";
  fixelem.rel = 'stylesheet';
  fragment.appendChild(fixelem);

  var themeSwitchBtn = $('#theme-switch > button');

  /**
   * @param {boolean} tips
   */
  function _todark(tips) {
    document.head.appendChild(fragment);
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
    fragment.appendChild(layelem);
    fragment.appendChild(fixelem);
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
    mql.onchange = function (e) {
      _switchTheme(false, false, e.matches);
    };
  } else {
    _switchTheme(false, true);
  }

  themeSwitchBtn.on('click', layui.throttle(function () {
    _switchTheme(true, false);
  }, 3e2));

})();

//#endregion
//#region UI

var Renderer = {

  /**
   * Open a dialog about the Error.
   * @param {Error} e
   * @param {any} options?
   */
  openErrLayer: function (e, options) {
    var o = {
      type: 0,
      title: e.name,
      content: e.stack.replace(/ /g, "&nbsp;").replace(/\n/g, "<br />"),
      icon: 2,
      skin: "layui-layer-win10",
      shade: .01,
      shadeClose: true,
      resize: false,
    };
    if (options) {
      var ks = Object.keys(options);
      for (var i = 0; i < ks.length; i++) {
        o[ks[i]] = options[ks[i]];
      }
    }
    layer.open(o);
    console.error(e);
  },

  /**
   * Render carousel.
   */
  carousel: function () {
    var e = $('.layui-carousel:has(div[carousel-item]:has(*))');
    if (e[0]) layui.carousel.render({
      elem: e,
      width: "auto",
      height: 280
    });
  },

  collapse() {
    // render
    var elem = $('.layui-collapse');
    if (!elem[0]) return;
    $('.layui-colla-content', elem).removeClass('layui-show').filter(location.hash + ':first').addClass('layui-show');
    layui.element.render("collapse", elem);
    // prevent close
    var l = elem[0].getElementsByClassName('layui-colla-title');
    elem.on('click', function (ev) {
      if ($('.layui-colla-content.layui-show', elem)[0]) return;
      var i = Math.floor(l.length * Math.random());
      if (l[i].contains(ev.target)) {
        l[(i + 1) % l.length].click();
      } else {
        l[i].click();
      }
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
    var picp = $('.layui-container>div>.layui-col-md4');
    // #post-index-container
    var pic = picp.find('#post-index-container');
    if (!pic[0]) return picp.css('margin-bottom', 'unset');
    var picprect = picp[0].getBoundingClientRect();
    pic.css('width', picprect.width - 16);
    picp.css('margin-bottom', pic.outerHeight() + 5);
    if (window.innerWidth >= 992 && picprect.height + picprect.y < 8 + 64 && !pic.hasClass('layui-layer-wrap')) {
      pic.css({
        position: 'fixed',
        top: 64
      });
    } else {
      pic.css({
        position: 'absolute',
        top: 'unset'
      });
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
        zIndex: "1145141919"
      });
      // show
      scvt.appendTo('body');
      // remove
      scvt.fadeOut(1e3, 'linear', function () {
        scvt.remove();
        scvt.stop(true);
      }).animate({
        top: ev.clientY - 4.2e2 + 'px'
      }, {
        duration: 2.4e3,
        queue: false
      });
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
    var el = $('.layui-progress');
    layui.element.progress("pageload-progress", progress);
    if (progress === "100%") {
      new $.Deferred(function (df) {
        setTimeout(function () {
          el.hide(2e2, 'linear', df.resolve);
        }, 1e3);
      }).then(function () {
        layui.element.progress("pageload-progress", '0%');
        setTimeout(function () {
          el.show(2e2, 'linear');
        }, 2e2);
      });
    } else {
      el.show();
    }
  },

  datetime() {
    $('time[datetime]').text(function () {
      return new Date(this.getAttribute('datetime')).toLocaleString().replace(/(\d{1,2})\:(\d{1,2})\:00/, '$1:$2');
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

  code() {
    layui.code({
      elem: ".layui-code",
      langMarker: true,
      wordWrap: false
    });
  },

  friendLinkPage() {
    $('.friends-page-bg-link .layui-card-header').text(function (_, text) {
      return Sess.shufArray(Sess.friendLinkLangChooser(JSON.parse(layui.util.unescape(text)))).join(" / ");
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
      if (!url) return df.resolve();
      Renderer.progress("6%");
      $('#main-container').load(url + ' #main-container > *', function (_, textStatus) {
        if (textStatus.match(/^timeout|error|parsererror$/)) {
          this.innerHTML =
            '<div class="layui-panel layui-card radius">' +
              '<h1 class="layui-card-header" id="main-title">Failed to fetch</h1>' +
              '<div class="layui-card-body" id="main">Please check your network connection and try again later...</div>' +
            '</div>';
        }
        Renderer.progress("99%");
        df.resolve();
      });
    }).then(function () {
      // img
      document.querySelectorAll('img').forEach(function (el) {
        if (el.alt === 'face' || el.className.match('icon')) return;
        var cb = function () {
          el.src = ['https://picsum.photos', el.width, el.height, '?' + Math.random().toString().replace('.', '')].join('/');
        };
        if (el.complete && !el.naturalHeight && !el.naturalWidth) cb();
        else el.addEventListener('error', cb, { once: true });
      });
      // datetime
      Renderer.datetime();
      // random
      Sess.randomChildren();
      // create post index
      Sess.createPostIndex();
      // fill .friends-page-main
      Renderer.friendLinkPage();
      // title
      Renderer.pageTitle(document.querySelector("#main-title > span.layui-breadcrumb"));
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
              area: [333 < window.innerWidth ? '333px' : '100%', '100%'],
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
    window.addEventListener("resize", Renderer.onscroll);
    window.addEventListener("scroll", Renderer.onscroll);
    // load content
    /**
     * @param {string | URL} url
     */
    var loadMainAndCatch = (function f(url) {
      Sess.loadMainContent(url).fail(function (e) {
        Renderer.openErrLayer(e);
        Renderer.progress("0%");
      });
      return f;
    })();
    // show big photos
    layui.util.on("lay-on", {
      "carousel-img": function () {
        layer.photos({
          photos: 'div[lay-on=' + this.getAttribute("lay-on") + ']'
        });
      },
      "post-img": function () {
        layer.photos({
          photos: 'div[lay-on=' + this.getAttribute("lay-on") + ']'
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
      window.addEventListener('popstate', function () {
        loadMainAndCatch(location.href);
     });
    }
    // forune & pageview
    Renderer.fortune();
    Renderer.pageview();
  },

  //#endregion
  //#region posts

  createPostIndex() {
    var pic = document.getElementById("post-index-container") || document.createElement("div");
    if (!location.pathname.match(/\/(about|posts)/)) {
      if (pic.parentNode) pic.parentNode.removeChild(pic);
      return;
    }
    // element
    if (!pic.parentNode) {
      var col = document.querySelector(".layui-row > .layui-col-md4");
      pic.className = "layui-panel layui-card radius";
      pic.id = "post-index-container";
      pic.innerHTML =
        '<div class="layui-card-header">文章索引</div>' +
        '<div class="layui-card-body" id="post-index"></div>';
      col.appendChild(pic);
    }
    // index data tree
    var main = document.querySelector('main');
    var mainContent = main.querySelectorAll("div.layui-text > *");
    if (!mainContent.length) return;
    var mainTitleDiv = main.querySelector("div.postcard-title") || $('h1:last', main)[0];
    var roottreenode = {
      title: mainTitleDiv.textContent,
      id: "H1-root",
      children: [],
      spread: true
    };
    var lasttreenode = roottreenode;
    mainContent.forEach(function (elem) {
      if (elem.tagName.match(/^H/) && elem.tagName.length === 2 && elem.tagName !== "H1") {
        while (parseInt(elem.tagName.charAt(1)) <= parseInt(lasttreenode.id.charAt(1))) {
          lasttreenode = lasttreenode.parent;
        }
        var newtreenode = {
          title: elem.innerText,
          id: elem.tagName + '-' + elem.textContent,
          children: [],
          parent: lasttreenode
        };
        lasttreenode.children.push(newtreenode);
        lasttreenode = newtreenode;
      }
    });
    // render
    layui.tree.render({
      elem: "#post-index",
      data: [roottreenode],
      accordion: true,
      click: function (obj) {
        var idps = obj.data.id.split('-', 2);
        var elem = document.evaluate(
          '//' + idps[0].toLowerCase() + '[text()="' + idps[1] + '"]',
          main, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null
        ).singleNodeValue;
        (elem ? elem : mainTitleDiv).scrollIntoView({ behavior: "smooth" });
      }
    });
  },

  //#endregion
  //#region friends

  friendLinkFooter() {
    var friendlinks = document.getElementById("friend-links");
    if (!friendlinks) return;
    var json = JSON.parse(layui.util.unescape(friendlinks.textContent));
    Sess.shufArray(json.friends);
    Sess.shufArray(json.organizations);
    // 3 * friends + 8 * organizations
    var result = [];
    var len = json.friends.length;
    for (var i = 0; i < (len < 3 ? len : 3); i++) {
      var e = json.friends.pop();
      e.className = "personal-link";
      result.push(e);
    }
    len = json.organizations.length;
    for (var i = 0; i < (len < 8 ? len : 8); i++) {
      var e = json.organizations.pop();
      e.className = "layui-hide-xs";
      result.push(e);
    }
    result.push({
      "id": "more",
      "title": "…",
      "href": "/friends/",
        "name": {
        "en": ["More"],
        "zh": ["更多"],
      }
    });
    // fill
    for (var i = 0; i < result.length; i++) {
      var lnk = result[i];
      var names = Sess.friendLinkLangChooser(lnk.name);
      var a = $('<a class="ws-nowrap w-0"></a>').attr({
        href: lnk.href,
        title: names[Math.floor(Math.random() * names.length)]
      }).addClass(lnk.className).text(lnk.title);
      if (lnk.id !== 'more') {
        a.attr({
          target: '_blank',
          rel: 'noopener'
        });
      }
      a.appendTo(friendlinks);
    }
  },

  /**
   * @param {{zh:string[],en:string[]}} name
   */
  friendLinkLangChooser(name) {
    // by user language
    var langs = navigator.languages;
    for (var i = 0; langs.length > i; i++) {
      if (langs[i].match(/^zh/)) {
        if (name.zh.length > 0) return name.zh;
      } else if (langs[i].match(/^en/)) {
        if (name.en.length > 0) return name.en;
      }
    }
    // default
    if (name.zh.length > 0) return name.zh;
    if (name.en.length > 0) return name.en;
  },

  //#endregion
  //#region utils

  randomChildren() {
    var rnds = document.querySelectorAll(".random");
    for (var i = 0; i < rnds.length; i++) {
      var arr = [];
      for (var j = 0; j < rnds[i].childNodes.length; j++) {
        arr.push(rnds[i].childNodes[j]);
      }
      Sess.shufArray(arr).forEach(function (e) {
        rnds[i].appendChild(e);
      });
    }
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

try {
  Sess.main();
} catch (e) {
  Renderer.openErrLayer(e);
  Renderer.progress("0%");
}
