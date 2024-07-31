# Debian 之 KDE 与 Wayland 调教指北

## 引言

- KDE 是重量级桌面, 但泽生在使用之初却并不知道, 但是用了就改不掉了 <(=－︿－=)>

- 虽然 Wayland 是一种很新的东西, 虽然名义上面说是性能好, 但实测确实是漏洞百出...

- 本指北将向您介绍如何在 Debian 下调教您的 KDE Plasma 与 Wayland 使得能够按照您的预期工作

## 环境

```text
       _,met$$$$$gg.          sess@xhu-i5420
    ,g$$$$$$$$$$$$$$$P.       --------------
  ,g$$P"     """Y$$.".        OS: Debian GNU/Linux 12 (bookworm) x86_64
 ,$$P'              `$$$.     Host: Inspiron 5420
',$$P       ,ggs.     `$$b:   Kernel: 6.9.7+bpo-amd64
`d$$'     ,$P"'   .    $$$    Uptime: 11 days, 7 hours, 15 mins
 $$P      d$'     ,    $$P    Packages: 2464 (dpkg)
 $$:      $$.   -    ,d$$'    Shell: zsh 5.9
 $$;      Y$b._   _,d$P'      Resolution: 1366x768
 Y$$.    `.`"Y$$$$P"'         DE: Plasma 5.27.5
 `$$b      "-.__              WM: kwin
  `Y$$                        Theme: [Plasma], Breeze [GTK2/3]
   `Y$$.                      Icons: [Plasma], breeze [GTK2/3]
     `$$b.                    Terminal: konsole
       `Y$$b.                 CPU: Intel i3-3110M (4) @ 2.400GHz
          `"Y$b._             GPU: Intel 3rd Gen Core processor Graphics Controller
              `"""            GPU: NVIDIA GeForce GT 620M/630M/635M/640M LE
                              Memory: 2232MiB / 3781MiB
```

## 调教

### 更新软件包

- 在所有操作之前, 请确认您的计算姬上面安装的软件包全都是最新的! 不然可能会有安全风险!

- 这是泽生的 `sources.list`:

  ```debsources
  #deb cdrom:[Debian GNU/Linux 12.5.0 _Bookworm_ - Official amd64 DVD Binary-1 with firmware 20240210-11:28]/ bookworm contrib main non-free-firmware

  deb https://mirrors.ustc.edu.cn/debian/ stable main #non-free-firmware
  #deb-src https://mirrors.ustc.edu.cn/debian/ stable main #non-free-firmware

  deb https://mirrors.ustc.edu.cn/debian-security stable-security main #non-free-firmware
  #deb-src https://mirrors.ustc.edu.cn/debian-security stable-security main #non-free-firmware

  deb https://mirrors.ustc.edu.cn/debian/ stable-backports main #non-free-firmware

  # bookworm-updates, to get updates before a point release is made;
  # see https://www.debian.org/doc/manuals/debian-reference/ch02.en.html#_updates_and_backports
  deb https://mirrors.ustc.edu.cn/debian/ stable-updates main #non-free-firmware
  #deb-src https://mirrors.ustc.edu.cn/debian/ stable-updates main #non-free-firmware
  ```

- 也就是简简单单的 `sudo apt update && sudo apt upgrade` 一下子, 咱又不是用移动数据, 很快的 <(≧▽≦)>

### 不会有人还不会输入汉字吧

- 作为一个合格的中国人🇨🇳 <span class="hidden">(你说为什么咱不用"中国公民")</span>, 肯定得先安装个中文输入法吧<s>(虽然但是重装了一次后输入法甚至大半个月才装上)</s>

- 由于泽生安装 Debian 时没有安装桌面环境, 后面手动安装的时候也就装的东西少一点, 输入法什么的一个都没有的了

- 如果您在 `apt list --installed` 时发现了 `fcitx` `ibus` 之类长得像输入法的东西, 最好全都卸载干净, 不然后面可能会很麻烦的

- 然后简简单单 `sudo apt install fcitx5-pinyin` 大概不用安装什么别的东西, 但泽生开始是用 `aptitude` 装的所以可能和你们不太一样

- `应用程序启动器 -> 设置 -> 输入法` 或者 `/usr/bin/im-config` 有一个可以执行的文件(其实她们俩是同一个啦), 运行她, 依次点击 `确定(O)` `是(Y)` `启用小企鹅输入法v5 (fcitx5) @!` `确定(O)` `确定(O)`

- 如果是 X11 到这应该就没了吧, 但如果登录会话(不是泽生啊)时没有自启就在 `系统设置 -> 开机与关机 -> 自动启动` 里面把 `fcitx5` 加上

- 接下来是 Wayland 时间! 参考 [Using Fcitx 5 on Wayland - Fcitx](https://fcitx-im.org/wiki/Using_Fcitx_5_on_Wayland)

- 还是 `im-config` 这次选择 `do not set any IM from im-config and use desktop default`, 但是如果因故您需要经常切换 X11 和 Wayland 那就保持上面说的不变

- 前往 `系统设置 -> 输入设备 -> 虚拟键盘`, 看见那只抱着支笔的小企鹅了没? 点一下, 然后应用更改, 以后登录到 Wayland 会话时就会自动启动 Fcitx5 了

- 然后如果你发现, 打开 Qt 应用, 比如 Kate 什么的都能打字, 结果打算写点大型项目的代码了, 发现 VSCode 这个 electron 的玩意 `Ctrl+Shift` 按坏了也不出来输入法 ε=<(=o｀ω′)/

- 怎么办捏? 只需要加上这样一串神奇的咒语在命令行后面 `--enable-features=UseOzonePlatform --ozone-platform=wayland --enable-wayland-ime` 就可以了! 而且对基于 chromium 的应用程序都有用哦~

- 但咱又不是什么都要从终端打开吧, 那么大一个启动器里面也是有的时候要点的, 所以只要在 `Chromium` 和 `Visual Code Studio` 进行 `编辑应用程序...`, 在 `应用程序(A)` 里面的 `参数:` 的原本内容的后面追加 `--enable-features=UseOzonePlatform --ozone-platform=wayland --enable-wayland-ime` (记得空格!), 然后 `确定(O)`

- 不过我一般用 Firefox, Chromium 一般就用英文所以就不管了

- 接下来你就会发现, 其余的那些 X11 应用程序(具体有哪些就不清楚了)不能正常使用输入法, 只需要在 `~/.config/environment.d/` 下面随便一个 `.conf` 文件里面写上 `XMODIFIERS=@im=fcitx` 就可以了. 但其实, 只要做了这一步, 上面的 chromium 之类的就没必要加参数了, 但都设置了也没有关系的

- 设置完成记得注销重新登陆哦 <(=*^-^)ρ

### OBS Studio

- 上次在 Wayland 里面尝试录屏发现屏幕一片漆黑, 去群里问了一下决定换回 X11, 现在问了一下 BingAI 成功解决

- 执行 `apt install pipewire` 即可

- 如果重新打开 OBS Studio 还是没法录制屏幕, 执行 `systemctl --user start pipewire` 或重新登录会话即可

### Java

- 这里只讨论 Wayland, X11 仅供参考

- 泽生只在 OpenJDK 8 运行 HMCL (JavaFX) 的时候发现了这个问题, 输出如下(不过不是说核心转储禁用结果却核心已转储?). 但是换成 OpenJDK 11 就没问题了...

  ```text
  (java:655057): Gdk-CRITICAL **: 18:05:47.325: gdk_x11_display_set_window_scale: assertion 'GDK_IS_X11_DISPLAY (display)' failed

  (java:655057): GLib-GObject-WARNING **: 18:05:47.325: invalid cast from 'GdkWaylandDisplay' to 'GdkX11Display'
  #
  # A fatal error has been detected by the Java Runtime Environment:
  #
  #  SIGSEGV (0xb) at pc=0x00007f337ebeca9b, pid=655057, tid=0x00007f33763ff6c0
  #
  # JRE version: OpenJDK Runtime Environment (8.0_422-b06) (build 1.8.0_422-b06)
  # Java VM: OpenJDK 64-Bit Server VM (25.422-b06 mixed mode linux-amd64 compressed oops)
  # Problematic frame:
  # C  [libX11.so.6+0x2ea9b]  XInternAtom+0x3b
  #
  # Failed to write core dump. Core dumps have been disabled. To enable core dumping, try "ulimit -c unlimited" before starting Java again
  #
  # An error report file with more information is saved as:
  # /home/sess/minecraft/hs_err_pid655057.log
  #
  # If you would like to submit a bug report, please visit:
  #   https://bell-sw.com/support
  # The crash happened outside the Java Virtual Machine in native code.
  # See problematic frame for where to report the bug.
  #
  [1]    655057 IOT instruction (core dumped)  java -jar HMCL-3.5.8.249.jar
  ```

- 在运行 Minecraft 的时候发现, Java 8 (1.12.2) 不能正常使用输入法, 而 Java 21 (1.20.6) 就没有问题了. 是否是因为环境变量设置而导致的, 不得而知...

### 日历

- 这里为什么要讨论日历呢? 因为中国古代有种历法叫做农历

- KDE Plasma 于 5.26 终于正式加入了对于 备选日历 的支持! 在此之前, 泽生一直使用 [Pineapple Calendar](https://github.com/BLumia/pineapple-calendar) 看农历. 当然了, 本站右侧也有个农历.

- 但对于手动安装的桌面环境的 数字时钟 组件却没有 备选日历 与 天文事件 插件, 如何解决? 执行 `sudo apt install plasma-calendar-addons` 即可, 不过为什么没人推荐安装她呢?

- 接下来就能看见 备选日历 里面的 中国农历 了

### Emoji 🍥 与 颜文字 <( >﹏<。=)>

- 首先希望您的计算姬中安装了足够的字体以显示这些内容, 一般来讲正常情况下 `Noto Sans CJK SC` `Noto Color Emoji` 会随 KDE 一起安装

- 但是咱也可以直接下个 [HarmonyOS Sans SC](https://developer.huawei.com/consumer/cn/design/resource-V1/), 虽然支持的字符不多, 但耐不住比 Google 的 Noto Sans 好看

- 当然了, 咱也可以从 Google Fonts 下点别的字体, 就比如这个 [ZCOOL KuaiLe](https://github.com/googlefonts/zcool-kuaile/tree/main), 挺好看捏, 不过目前只设定为了输入法和虚拟机的字体

- 等距字体推荐使用 [JetBrains Mono](https://www.jetbrains.com/lp/mono/), 主要是连字特性用的很妙, 如果要用 Powerlevel10k, 选择 [MesloLGS NF](https://github.com/romkatv/powerlevel10k?tab=readme-ov-file#meslo-nerd-font-patched-for-powerlevel10k)

- 字体下完了, 直接右键就可以安装了, 然后 `系统设置 -> 外观 -> 全局主题 -> 字体` 就可以调整字体了

- 选择 Emoji 只需要按下 `Meta+句点` 或者运行 `/usr/bin/plasma-emojier` 就可以了 (Meta 就是 Windows 徽标键), 真的 KDE 什么都有, 不过

- 关于颜文字的列表可以看看 [这个存储库](https://github.com/rainlime/fcitx-quick-phrase-emoji) 和 [这个 Google 输入法的插件](https://github.com/tisyang/kaos)

- 但由于咱用的是 Fcitx5, 那个存储库提供的使用方法需要改改, 运行一下下面的命令, 最多重启一下 Fcitx5, 然后就可以用颜文字了 <(=ｏ^_^)o

  ```shell
  mkdir -p "$HOME/.local/share/fcitx5/data/quickphrase.d"
  curl -sLG "https://github.com/rainlime/fcitx-quick-phrase-emoji/raw/master/QuickPhrase.mb" > "$HOME/.local/share/fcitx5/data/quickphrase.d/rainlime.mb"
  curl -sLG "https://github.com/tisyang/kaos/raw/master/dict.txt" | grep -v "^#" > "$HOME/.local/share/fcitx5/data/quickphrase.d/tisyang.mb"
  ```

## 完工!

- 大概就这些内容了吧, 不过 stable 的软件包还是有点旧了, 目前已经给虚拟机装上了 unstable, 未来咱会试试的 (=^_^=)
