# 一个拼写错误是如何让整个互联网一起犯错的
## 引言
* 在 Web 领域, 有一个重要的协议, 超文本传输协议 (Hypertext Transfer Protocol, HTTP), 这个协议规定了在互联网上的网页等内容的基本的传输方式, 是一个应用层协议 🤝
* 如果你接触互联网, 那你一定使用了这个协议, 你现在浏览的网页或视频, 就是通过 HTTP 或者套了一层 SSL/TLS 加密的 HTTPS 传输的 🔒. 不信, 看一眼上面的地址栏或点击分享复制链接, 一定是 `https://` 开头的内容
  ![浏览器地址栏](https://i0.hdslb.com/bfs/archive/34e5a033c2d8f7135ff84628a88b52462be612e3.png)
* 众所周知, 世界是一个巨大的草台班子 🌿, 在 HTTP 最初的规范 [RFC 1945](https://datatracker.ietf.org/doc/html/rfc1945) 中, 一个『明显』的拼写错误, 就被写入了正式的规范中, 并由于『历史原因』流传至今
  ![RFC 1945](https://i1.hdslb.com/bfs/archive/7d562ac71455084ae08698c36406eeba6a085285.jpg)
## 只有请求标头有错的 `Referer`
* 这个拼写错误存在于最常见的请求标头中, 叫做 `Referer`, 很明显正确应拼写为 `Referrer`, 但事实是就这么拼错了
  ![文档中的 Referer](https://i1.hdslb.com/bfs/archive/816d950782f28ab7baa89aa3edfa4f9879dc120f.jpg)
* 一个常规的 HTTP 请求可能是下面这样
```http
GET / HTTP/1.1
Accept: */*
Host: space.bilibili.com
User-Agent: Mozilla/5.0 (X11; Linux x86_64)
Referer: https://www.bilibili.com/
```
* 根据文档定义和浏览器的实际行为, `Referer` 代表这次请求的引用来源. 默认为上一个网页的 URL, 当然这也可以被 Referrer Policy 或浏览器设置缩短或移除, 注意这个拼写是正确的
## 别人却又都是对的
* 同样是 Web 的一部分, 实际上只有 HTTP 的 `Referer`, 是拼写错误的, 而别处却又都正确了
  ![维基百科截图](https://i0.hdslb.com/bfs/archive/8d675e04be4081083e2ffa9bd41d622d6c544477.jpg)
* 如 JavaScript Web API 中的 DOM API, `document.referrer`, 这里是对的
  ![MDN document.referrer](https://i1.hdslb.com/bfs/archive/71e7093601267109904e25a91d66e4150efb193e.jpg)
* 如 HTML 中, 像 `<a>` `<img>` 这些元素, 有属性 `referrerpolicy`, 也是正确的
  ![MDN a referrerpolicy](https://i1.hdslb.com/bfs/archive/2ba3319aec54f00c8da52325a96fef5544015b7e.jpg)
## 你的错大家共担
* 有趣的是, 在 cURL 中, HTTP 的 `--referer` 选项为了『符合标准』, 也『故意』拼错了
  ![cURL 中的 --referrer](https://i0.hdslb.com/bfs/archive/747ecea118d7a917a562406aeccb954f4dad728b.jpg)
* 对于一个英语或非英语者, 人难免会犯错, 改不了就将错就错, 大家要开放包容嘛
* 如今 Web 自 HTTP 和 WWW 以来已经走过了 30 余年, 技术虽更新换代但核心未变, 这是十分可贵的, 值得我们每一个用户和开发者共同珍惜和维护
## 参考资料
> 这文章好水
* [RFC 1945 - Hypertext Transfer Protocol -- HTTP/1.0](https://datatracker.ietf.org/doc/html/rfc1945)
* [HTTP来源地址 - 维基百科，自由的百科全书](https://zh.m.wikipedia.org/zh-cn/HTTP參照位址)
* [Document.referrer - Web API | MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/referrer)
* [&lt;a&gt;：锚 元素 - HTML（超文本标记语言） | MDN](https://developer.mozilla.org/zh-CN/docs/Web/HTML/Reference/Elements/a#referrerpolicy)
