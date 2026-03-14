# 自制简易蜜罐: 从愿者上钩到世界地图

## 引言

今年年初, 泽生接入了 [dn42](https://dn42.dev/), 一个逻辑上独立于 iana 的另一个
inet. 在网络运营过程中, 咱发现了一些有趣的东西. 如今的 iana inet 就是黑暗森林,
若不做好防火墙等措施, 随时都可能带来严重的后果.

## 从公共 DNS 说起

咱在咱的一个服务器上开了个公共递归 DNS 解析器, 但好景不长, 就收到了来自全球各地的恶意查询请求.
这些请求绝大多数都是向咱的 UDP 53 查询 `paypal.com.` 和 `dhl.com.` 的 `ANY` 记录,
显然是在用咱提供的公益资源进行滥用和反射攻击.

对于简单的反射利用, 我们对策很简单, 在 nftables 中, `ip saddr xxx udp dport 53
counter drop`, 直接在内核里就被 netfilter 干掉了. 为应对新的攻击, 为减少反射倍率,
我们对 BIND9 的配置进行了一点点小的调整. 速率限制, 和 DNS "污染". 现在如果你
`dig dhl.com. ANY` 我们的服务器, 那么大概会看到以下情形, 真就, **攻击性不大,
侮辱性极强**!

```bindzone
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 34515
;; flags: qr aa rd ra; QUERY: 1, ANSWER: 2, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1232
; COOKIE: aa3b6bf8877202740100000069b50c99318be5b2e9ed8c2d (good)
;; QUESTION SECTION:
;dhl.com.			IN	ANY

;; ANSWER SECTION:
dhl.com.		666	IN	SOA	localhost. baka.sess.dn42. 114514 1919 810 22 33
dhl.com.		666	IN	NS	localhost.

;; Query time: 0 msec
;; SERVER: 127.0.0.1#53(127.0.0.1) (TCP)
;; WHEN: Sat Mar 14 07:22:01 UTC 2026
;; MSG SIZE  rcvd: 137
```

但这么做还远远不够, 面对排山倒海的僵尸网络或伪造源地址攻击, 还是不太行. 那天,
咱随手 `tcpdump` 了一下 UDP 53, 又被吓了一跳, 一大波查 `dhl.com. ANY` 的请求,
个个源地址不同, 但一查都是来自拉丁美洲的 IP 地址, 刚封完一个 `/8` 又是下一个
`/8`. 于是我做了一个巨大的~~历史性的~~决定, drop 掉几乎**所有**源地址在拉丁美洲的
`/8` 目标为 UDP 53 的请求. 现在 nftables 的配置文件如下.

```nftables
table inet filter {
	set dns_attackers {
		type ipv4_addr;
		flags interval;
		elements = {
			20.2.0.0/16, 33.44.22.33, 35.212.61.0/24, 50.63.0.0/16,
			60.251.162.0/24, 94.128.0.0/9, 104.247.162.0/24, 110.175.8.136,
			143.92.63.185, 162.128.0.0/9, 172.67.0.0/16,
			199.247.30.0/24, 212.41.0.0/16
		};
	}
	set dns_attackers_latinamerica  {
		type ipv4_addr;
		flags interval;
		elements = {
			45.0.0.0/8, 131.0.0.0/8, 138.0.0.0/8, 164.160.0.0/12, 168.128.0.0/9, 170.0.0.0/8, 177.0.0.0/8, 179.0.0.0/8, 181.0.0.0/8, 186.0.0.0/7, 189.0.0.0/8, 190.0.0.0/8, 191.0.0.0/8, 200.0.0.0/7
		};
	}
	chain input {
		type filter hook input priority filter;
		# pre
		iifname "lo" accept;
		ct state established,related accept;
		ct state invalid drop;
		# udp 53 (dns) filter
		ip saddr @dns_attackers udp dport 53 limit rate 1/minute burst 1 packets counter reject with icmp port-unreachable;
		ip saddr @dns_attackers udp dport 53 counter drop;
		ip saddr @dns_attackers_latinamerica udp dport 53 limit rate 1/minute burst 1 packets counter reject with icmp port-unreachable;
		ip saddr @dns_attackers_latinamerica udp dport 53 counter drop;
		udp dport 53 limit rate 100/second counter accept;
		iifname "ens4" udp dport 53 counter drop;
	}
	chain forward {
		type filter hook forward priority filter;
	}
	chain output {
		type filter hook output priority filter;
	}
}
```

是的, 为在内核层面限流咱还加了个每秒 100 的速率限制, 还加了个每分钟一个的 ICMP
Port Unreachable. 这种**御敌于国门之外**的配置, 既防止了资源滥用, 又调戏了新来的
"玩家". 另外咱还会不定期 `tcpdump` 看看有没有新人.

## HTTP 402 我很可爱请给我钱

书接上回 [HTTP 响应标头 Referer](https://b23.tv/BV1Tp7UzCEgZ) 和 [HTCPCP 响应码
418](https://b23.tv/BV1kGcGzdExh), 咱这次将用了 HTTP 的一个很少见的响应码 402
Payment Required. 在此之前咱对于 80 和 8443 端口的默认响应是, 除了按默认配置返回
Nginx 默认欢迎页外, 所有 not found 都被 302 到 YouTube 上的 [Never Gonna Give
You Up](https://youtu.be/dQw4w9WgXcQ), 在响应头还顺带了个 `Referrer-Policy:
no-referrer`. 8443 是 HTTPS 端口, 用的是 Nginx 的 snakeoil 的自签证书, 不用 443
是因为已经被 BIND9 的 DoH 用掉了, 而该版本的 Nginx 不支持 HTTP2 的反代, 另外 DoH
和 DoT 是 Let's Encrypt 的证书, 非默认站点 8443 是 Kioubit CA 的证书. 此外咱所有
Nginx 的 `Server` 响应标头都是 `closedssh`.

后面咱觉得默认的 Nginx 欢迎页不好玩, 于是 `dd if=/dev/zero of=/var/www/html/index.html
bs=1 count=1`, 于是默认的欢迎页变为了一个 `\0` 字符. 这样用 cURL 请求会打印一大段警告说二进制数据会弄脏你的终端,
但强行 `-o-` 后便会发现啥也不打印, 有趣.

观察 Nginx 的访问日志可知, 大多数访客访问的并非根, 而是 `/.env` 这样的奇奇怪怪的路径,
于是咱结合一些考虑, 把默认站点的所有页都改为了 402 Payment Required 而内容则为新写的
`index.html`, 内含 Bitcoin, Ethereum(-like), Solana, Tron 各种地址, 咱还用
FFmpeg 的 `-vf` 的 scaler 的 lanczos 来压了下咱微信赞赏码和支付宝收款码, 并 data
URL 放在了页面内的 `<img>` 中. 现在若请求咱的蜜罐将是以下场景.

```text
$ curl https://0:8443 -Ik
HTTP/1.1 402 Payment Required
Date: Sat, 14 Mar 2026 08:15:00 GMT
Content-Type: text/html
Content-Length: 12102
Connection: keep-alive
ETag: "69a65929-2f46"
Server: closedssh
```

## GNU inetutils inetd

GNU inetutils inetd, 描述为 GNU Network Utilities internet superserver. Inetd,
这个来自上个世纪的东西, 自称超级服务器. 工作原理很简单, 大概就是当有人连接其监听的某端口时,
accept 连接, 然后 fork 自己, 在子进程里把套接字 dup2 到 stdio, 随后 execv 替换进程.

在这里, 这简直是最适合我们的需求的最简单的搭建简易多端口蜜罐的方式了. 我们监听一堆端口,
然后连上后以极慢的速度发送垃圾数据, 这样就可以低成本牵制大量低质量常见扫描器.
咱在自己本地实测, `socat TCP-LISTEN:6666,fork,reuseaddr SYSTEM:"pv -L 4
/dev/urandom"` 后让 `nmap 127.0.0.1 -vv -A -T4 -p6666`, 将会永远卡在进度条的最后,
我估计一辈子也扫不完这一个端口, 除非连接意外断开告诉你这是 Time Protocol (不是
NTP). 不过 socat 也有局限性就是个小工具适合理论验证, 不如 inetd 更强大.

于是这是 `/etc/inetd.conf` 配置文件, 咱监听了一堆从 `/etc/services` 精挑细选的东西,
从上古的 UNIX 服务到现代的 SQL 服务器, 无奇不有. 甚至为此还把 Exim4 卸载了. 另外,
`chaos_4b` 其实是 `exec pv -qL 4 /dev/urandom` 的使用 `/bin/sh` 的 Shebang 脚本,
这里封装一下也是为了以后方便修改.

```conf
# <service_name> <sock_type> <proto> <flags> <user> <server_path> <args>
ftp     stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
fax     stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
nfs     stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
svn     stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
git     stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
x11     stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
telnet  stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
smtp    stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
ircd    stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
finger  stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
whois   stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
login   stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
sunrpc  stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
printer stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
submission stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
pop3    stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
time    stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
mysql   stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
redis   stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
postgresql stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
ms-sql-s stream  tcp  nowait  www-data  /usr/local/bin/chaos_4b  chaos_4b
```

然后, `sudo systemctl enable --now inetd` 即可启动! 很快就有了一堆来自全球各地的小可爱来连接
TCP 23, 即 Telnet 端口. 查看当前有哪些连接也很简单, `sudo ss -tp | grep pv | sed
-E 's/\s+/\t/g'`, 我帮你甚至重新格式化了下. 如果想要长时间看就在 `sudo` 后面加个
`watch` 并把 `ss` 到末尾所有内容用单引号 (双引号也行) 包起来, 不过这样如果连接太多没法翻页.
如果想要看单独某个进程信息, 我推荐 GitHub 上前段时间一个比较受欢迎的 CLI 工具,
[witr](https://github.com/pranshuparmar/witr), 你只需要执行 `sudo witr --pid
<pid>` 就可以看到那个进程的详细了, 比如我这里随便挑的一个, 已经坚持快一周了

```text
$ sudo witr --pid 729892
Target      : pv

Process     : pv (pid 729892) {forked}
User        : www-data
Command     : pv -qL 4 /dev/urandom
Started     : 6 days ago (Sat 2026-03-07 23:10:27 +00:00)

Why It Exists :
  systemd (pid 1) → inetutils-inetd (pid 727684) → pv (pid 729892)

Source      : systemd
Description : GNU Network Utilities internet superserver
Unit File   : /usr/lib/systemd/system/inetutils-inetd.service

Working Dir : /
Listening   : 10.138.0.2:23

Warnings    :
  • Process is running from a suspicious working directory: /
```

## 哦什么? OSM!

盯着黑漆漆的终端看没啥意思, 而且不太直观, 感受不出来自全球各地的扫描器的气势,
于是便是~~领导们~~最喜欢的数据可视化环节! 正好咱有算参与过 [OpenStreetMap](https://www.openstreetmap.org/),
那何不用一幅地图来展示蜜罐🍯与扫描器们的连接?

底图来自 OSM, 但是官方的瓦片饱和度太高看着不太合适, 加上为了节约官方的资源,
我们选择了 CARTO 的 Voyager 瓦片. 然后渲染使用 Leaflet.js, 而曲线连线使用了 NPM
上的 `@elfalem/leaflet-curve`. 在简单的与哈基米进行 Vibe Coding 后, 克服了地球居然是圆的这个令人费解的问题后,
前端的地图完成了. 后面咱又自己动手改了下, 审查了下代码, 感觉没啥大问题.

后端我们仍然采用经典的 CGI 模型, 使用 Nginx + FastCGI 驱动, 而 CGI 二进制使用~~比
C艹 还要好的~~的 D 进行编写. 获取进程和网络数据直接从 Linux 的 `/proc` 伪文件系统拿,
不过有些部分还是用了来自 `core.sys.posix.unistd` 的 `sysconf`. 而地理数据就要靠调
API 了, 为了省事我们直接调用群友的 `ip.shakaianee.top`, 数据来源好像是 IPIP,
对于大陆的 IP 的地理数据还是比 IPinfo 啥的准的, 至于为啥不用 B 站的接口, 因为懒得处理风控.
然后考虑到网络连接速度和并发性能, 实现了一个在 `$TMPDIR/honeypot-viewer` 下的简易
IP 数据缓存, 文件名是 IP 地址, 内容是 JSON 数据. 然后还对 Nginx 和浏览器端均进行了一点缓存控制.
但在编译部署时遇到了问题, 我设备是 aarch64, 默认编译的 native 的东西在 x86\_64
的服务器跑不起来, 我也不想费力在我的设备直接装 amd64 的包来原生交叉编译. 于是乎容器技术派上了用场,
直接 Podman 像 `--platform linux/amd64` 这样起个容器, 利用 qemu-user 的跨架构转译缓慢的跑起来了,
然后里面 `apt install` 和 `ldc2` 最终是编译完成了, 然后 `scp` 到服务器, 然后
`setcap` 使得 www-data 用户不提权也能正常运行. 至于为啥不在服务器编译, 因为服务器性能使然.
D 作为 Native 语言的一种, LLM 的 Vibe Coding 的水平也是不行, 一些奇奇怪怪的问题还是自己解决了.

最后这个 pv 的自定义蜜罐, 我是放在 <https://honeypot-viewer.sess.dn42:8443/> 的,
用 Cloudflared 在 iana inet 的 <https://honeypot-viewer.xhustudio.eu.org/> 亦可访问.
代码? 那肯定是自由的 GPLv3, 这次没有使用 AGPL, 见 <https://github.com/SessionHu/honeypot-viewer>.
记得 star 喵~

## 尾声

简易蜜罐大概就这些内容, 还是挺有意思的, 也感谢各位在网络运营和服务搭建过程中提供的帮助~
