# 窗口宽度不能超过 16384

## 朝花

- 几年前在 B 站上看到一个视频, 讲了特别大的屏幕, 就是把几块显示器拼在一起作为一个屏幕使用. 里面有一段是游戏不支持那么宽的屏幕全屏显示, 于是尝试窗口化到屏幕大小, 结果游戏崩溃, 查询得知 Windows 屏幕或窗口的宽度只支持到 `16384`, 否则崩给你看. 泽生一直这么相信.

> 后面在问 BingAI 时好像找到了这个视频的后续 [BV1Sw411z7LJ](https://www.bilibili.com/video/BV1Sw411z7LJ), 还上了[微软社区](https://answers.microsoft.com/zh-hans/windows/forum/all/%E4%BD%BF%E7%94%A8%E6%98%BE%E5%8D%A1%E7%9A%84/a5e7b62e-a3f6-4178-a4d3-7f69c95f4f6a).

## 夕拾

- 最近在写响应式布局, 为了测试兼容性, 把浏览器窗口拉到各种尺寸做测试.

- 然后突然想到若是把窗口拉到很大很大, 会崩吗?

- 于是就把打开着 `http://[::]:8000/` 的 Edge 的侧面拉了起来

## 环境

```text
       _,met$$$$$gg.          sess@xhu-i5420
    ,g$$$$$$$$$$$$$$$P.       --------------
  ,g$$P"     """Y$$.".        OS: Debian GNU/Linux 12 (bookworm) x86_64
 ,$$P'              `$$$.     Host: Inspiron 5420
',$$P       ,ggs.     `$$b:   Kernel: 6.9.5-sessx
`d$$'     ,$P"'   .    $$$    Uptime: 54 mins
 $$P      d$'     ,    $$P    Packages: 2450 (dpkg)
 $$:      $$.   -    ,d$$'    Shell: zsh 5.9
 $$;      Y$b._   _,d$P'      Resolution: 1366x768
 Y$$.    `.`"Y$$$$P"'         DE: Plasma 5.27.5
 `$$b      "-.__              WM: KWin
  `Y$$                        Theme: [Plasma], Breeze [GTK2/3]
   `Y$$.                      Icons: [Plasma], breeze [GTK2/3]
     `$$b.                    Terminal: konsole
       `Y$$b.                 CPU: Intel i3-3110M (4) @ 2.400GHz
          `"Y$b._             GPU: NVIDIA GeForce GT 620M/630M/635M/640M LE
              `"""            GPU: Intel 3rd Gen Core processor Graphics Controller
                              Memory: 2983MiB / 3781MiB
```

## 过程

### 粗中有细

- 先是按照上面说的把窗口不停的横向拉动, 同时开着 DevTools 观察 Viewport 的 变化.

- 由于网页使用了今年早些时候写的 [`DotLine`](https://github.com/SessionHu/xhu-index/blob/main/scripts/dotLine.ts) 于是就看着 `canvas#dotLine` 的 `width` 当作是窗口大小了.

- 就在 `canvas` 的 `width` 达到约 `16XXX` 的时候, 泽生成功注意到了, 再一拉动窗口, Edge 的窗口消失了.

- 以为是崩溃了, 但看任务栏上 `Microsoft Edge (dev)` 底下还有个加号, 也就是说, 窗口还在!

- 十分惊喜, 把鼠标指针移到图标上一看, 果然还有一个又细又长的窗口, 不过怎么是黑白的半透明色带呢?

- 点开一看, 画面不忍直视, 一直在诡异的闪烁, 变形, 等等. 下面有张复原图.

  ![Screenshot_20240702_083736.png](https://netdisk.xhustudio.eu.org/posts/2024/win-size-never-greater-than-16384/Screenshot_20240702_083736.png)

- 即使没有崩溃, 窗口也算是废了. 尝试把窗口恢复成原来的样子, 一切又再次恢复正常, 所有功能不受影响.

- 想要知道临界点究竟是不是 `16384` 这个精确数, 于是开始逐个像素拉动窗口, 结果在 `canvas` 的 `width` 还没有到 `16384` 的时候, 再次崩坏.

### 测量工具

- 不过这次知道, 实验是有误差的. 毕竟窗口和视口的大小又不一样, 窗口也有自己的边缘. 便去问 BingAI 如何获取 Linux 下窗口大小.

- 可能是因为代理的问题吧, 用不了 GPT4, 回答的答案跟没回答一样, 告诉泽生的是如何获取终端行列数, 环境变量和 C 两种方法. 但泽生说的是 X11 窗口!

- 再次询问, 这次说的是 X11 + KDE 结果这次告诉的真的就是废话.

- 自己尝试, 先是 `kwin --help` 没有什么有用的信息, 然后想起之前折腾 [QQNT](https://github.com/mo-jinran/More-Materials/pull/3) 的时候用过的 `wmctrl`, 也许有用.

- 尽管 `wmctrl` 命令的帮助信息是纯英文的, 泽生的英语水平大约只有初中水平 <span class="hidden">(两个月后就是高一水平了)</span>, 但还是看懂了个大概. 你问为啥不用谷歌? 呵呵.

- 探究得出调整窗口大小的命令是 `wmctrl -i <WIN> <DESK> <MVARG>`. 其中 `<WIN>` 是窗口 ID, `<DESK>` 是桌面 ID, 可以通过 `wmctrl -l` 获得. 窗口 ID 是 以 `0x` 开头的 16 进制数, 桌面 ID 对于泽生这种用户来讲一般都是 `0`. `<MVARG>` 是窗口的 `Gravity`, 位置, 宽和高. 下面是部分有用的原文.

  ```text
  ...

  -l                   List windows managed by the window manager.

  ...

  -i                   Interpret <WIN> as a numerical window ID.

  ...

  <MVARG>              Specifies a change to the position and size
                       of the window. The format of the argument is:

                       <G>,<X>,<Y>,<W>,<H>

                       <G>: Gravity specified as a number. The numbers are
                          defined in the EWMH specification. The value of
                          zero is particularly useful, it means "use the
                          default gravity of the window".
                       <X>,<Y>: Coordinates of new position of the window.
                       <W>,<H>: New width and height of the window.

                       The value of -1 may appear in place of
                       any of the <X>, <Y>, <W> and <H> properties
                       to left the property unchanged.

  ...

  The format of the window list:

    <window ID> <desktop ID> <client machine> <window title>
  ```

- 通过 `wmctrl -i 0x05a00004 0 0,-1,-1,16380,-1` 调整窗口宽度为 `16380`, 返回 `0`. DevTools 显示 `canvas` 的 `width` 为 `16311`, 说明窗口边框为 `34.5`? 怎么不是整数?

- 好吧, `wmctrl` 好像对 Edge 不起作用.

- 试试 `xprop`, 也许就可以了. 使用 `xprop -id <WIN>` 就可以获取 X11 窗口信息了.

- 执行 `xprop -id 0x05a00004` 返回 `0`. 打印的一张 `128 x 128` 的图标把泽生吓了一大跳, 同时发现 `_NET_WM_OPAQUE_REGION` 可能有点用, 其行为:
  `_NET_WM_OPAQUE_REGION(CARDINAL) = 24, 10, 16330, 8, 16, 18, 16346, 580`

- 于是使用 `xprop -id 0x05a00004 | grep  _NET_WM_OPAQUE_REGION` 免得精神污染.

- 可惜在值为 `24, 10, 16346, 8, 16, 18, 16362, 580` 的时候又崩坏了. 怀疑可能这里的数字要加一下.

- 于是改成了 `xprop -id 0x05a00004 | grep =` 顺便查询了一下[文档](https://specifications.freedesktop.org/wm-spec/latest/). 发现有两个选项与本次探究主题最相关, `_NET_FRAME_EXTENTS` 和 `_NET_WM_OPAQUE_REGION`.

  ```
  _NET_FRAME_EXTENTS, left, right, top, bottom, CARDINAL[4]/32
  _NET_WM_OPAQUE_REGION, x, y, width, height, CARDINAL[][4]/32
  ```

- 文档还是英文的, 只能求助于 AI, 这次代理似乎正常了, 使用 GPT4. AI 给出公式:

  ```text
  窗口宽度 = 左边界 + 不透明区域宽度 + 右边界
  窗口高度 = 上边界 + 不透明区域高度 + 下边界
  ```

- 按照

  ```text
  _GTK_FRAME_EXTENTS(CARDINAL) = 16, 16, 10, 32
  _NET_WM_OPAQUE_REGION(CARDINAL) = 24, 10, 16316, 8, 16, 18, 16332, 585
  ```

  计算结果为:

  ```text
  窗口宽度 = 16 + 16332 + 16 = 16364
  窗口高度 = 10 + 585 + 32 = 628
  ```

### 万事俱备, 只欠东风

- 最后的命令 `xprop -id 0x05a00004 | grep '_GTK_FRAME_EXTENTS\|_NET_WM_OPAQUE_REGION'`

- 经过不断微调, 窗口开始闪烁, 崩坏. 窗口宽度刚好是 `16385`.

  ![Screenshot_20240702_095838.png](https://netdisk.xhustudio.eu.org/posts/2024/win-size-never-greater-than-16384/Screenshot_20240702_095838.png)

  ```text
  ❯ xprop -id 0x05a00004 | grep '_GTK_FRAME_EXTENTS\|_NET_WM_OPAQUE_REGION'
  _GTK_FRAME_EXTENTS(CARDINAL) = 16, 16, 10, 32
  _NET_WM_OPAQUE_REGION(CARDINAL) = 24, 10, 16337, 8, 16, 18, 16353, 585
  ```

- 再次调整, 窗口宽度来到 `16384` 整, 一切正常. 此时 `canvas` 的 `width` 为 `16329`, 按照最大的不透明矩形, 水平方向的窗口边框为 `3.5`, 好!

  ![Screenshot_20240702_100916.png](https://netdisk.xhustudio.eu.org/posts/2024/win-size-never-greater-than-16384/Screenshot_20240702_100916.png)

- 多次经过多次验证, 确实临界值是 `16384`, 不能再大了, 否则就会出现显示异常, 但是实际还能够正常操作.

  ![Screenshot_20240702_101435.png](https://netdisk.xhustudio.eu.org/posts/2024/win-size-never-greater-than-16384/Screenshot_20240702_101435.png)

### 多次实验寻找普遍规律

- 尝试使用 `xprop -id 0x05a00004 -f _NET_WM_OPAQUE_REGION 32c -set _NET_WM_OPAQUE_REGION "24, 10, 1000, 8 16, 18, 1000, 585"` 这样的命令手动更改窗口大小, 可能是要改的不止这一个, 所以没有成功.

- 把 Edge 恢复到屏幕大小后, 打开了 Firefox ESR, 结果也是如此.

- 但是发现, 对于其她原生的 KDE 应用好像这种方法并不适用, 她们没有设定 `_NET_WM_OPAQUE_REGION`.

### 寻找更优解

- 再次询问 BingAI 这次给出的命令是 `xwininfo -id $(xprop -root | grep "_NET_ACTIVE_WINDOW(WINDOW)"`, 当然也给出了 C 的解决方案. 运行命令发现有活动窗口的长, 宽, 大小, 等, 返回 `0`. 而且这个结果不用二次手工计算.

- 改进命令以实时获取.

  ```shell
  while true; do xwininfo -id $(xprop -root | grep "_NET_ACTIVE_WINDOW(WINDOW)" | cut -d ' ' -f 5);sleep 0.1s;echo -e "\e[f"; done
  ```

- 这次可以测试所有窗口了吧.

### 原生的不同表现

- 在尝试 Dolphin 时出现了意外, 当 `Width` 为 `16254` 时就到了动态调整窗口位置大小显示预览的极限, 而静态显示窗口的极限才是 `16384`. 泽生认为可能这与崩坏状态下拖动窗口时外面出现的一层边框有关.

- 不过泽生并没有止步于此, 尝试调整垂直方向的窗口大小. 然后由于设备性能问题, 屏幕卡死. 被迫 `Ctrl+Alt-F2` 切换到 tty2 登录杀死了 `dolphin` 进程.

- 这次试试 KWrite, <span class="hidden">不用 Kate 是因为在写本文</span>. 不过本次关闭了 `窗口惯性晃动` `窗口透明度` 以减小性能造成的影响, 开启了 `显示每秒帧数` 确定实际性能表现. 结果在 `15000x10000` 左右的窗口下, FPS 最低降到了 1, 而且可能由于计算精度的原因, 拖动窗口大小变得异常困难, 最终在 `8742x15232` 停止了实验.

- 最后还是试试 系统设置, `Height` 为 `16230` 时开始预览崩坏, 约 `16360` 窗口内容消失, `16384` 窗口崩坏停止显示. 然后系统彻底卡死, 强行断电重启.

## 总结

- 目前, 无论是 Windows 还是 Linux X11 KWin, 对于窗口或屏幕, 长度及宽度的极限为 `16384`, 即大小极限为 `16384 x 16384`.

## 原因

- `2^14 = 16384`. 另外, 上文也提到了, 性能.
