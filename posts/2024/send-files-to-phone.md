# 发送文件到手机的 N 种正确姿势

## 引言

- 随着国内众多互联网大厂的<s>恶劣行径</s>发展, 现在的年轻人逐渐失去了各种程度的文件传输能力

- 本文就是为了介绍各种方法, 使得您可以在不借助公网或第三方工具的帮助下, 进行无限制的文件传输📄

- 封面使用的所有图标来自 Debian 软件库的 kf6-breeze-icon-theme

## 环境

- 移动设备使用 Android 系统, 本文不面向 iOS🍎

- 桌面设备建议使用 Linux 的任意发行版, 本文使用 Debian GNU/Linux testing (trixie) 🍥, 使用 KDE 桌面环境, 理论上 Windows 也可以

- 若为手机向电脑传输文件, 可以安装 Termux, 就可以反客为主了

## 操作

### 使用 ADB 传输

- ADB, 即 Android Debug Bridge

- 首先需要确保安装 ADB 工具, 若无则运行 `sudo apt install adb` 以安装

- 连接手机与电脑, 打开终端, 输入 `adb devices` 以查看设备列表

- 若手机未开启 USB 调试, 则需要在手机上开启, 并授予 ADB 调试权限

- 对于暂时无法进行有线连接的设备, 可以在设置中开启无线调试, 确保设备处于同一局域网内, 使用 `adb connect <HOST>[:PORT]` 这样的格式的命令连接

- 使用 `adb push <local_file> <remote_file>` 这样格式的命令将本地文件推送到手机

- 比如 `adb push /home/sess/Desktop/2233.png /sdcard/Downloads/`

- 以下是 push 的命令帮助:

  ```text
  push [--sync] [-z ALGORITHM] [-Z] LOCAL... REMOTE
      copy local files/directories to device
      --sync: only push files that are newer on the host than the device
      -n: dry run: push files to device without storing to the filesystem
      -z: enable compression with a specified algorithm (any/none/brotli/lz4/zstd)
      -Z: disable compression
  ```

- 传输文件到电脑在电脑上用 pull 就可以了

### 使用 HTTP 传输

- 这是一种很高级的传输方式

- 首先需要确保存放有被传输文件的设备安装有 HTTP 服务器软件, 比如 Apache 或 Nginx, 当然使用 Python 也可以

- 若为 Python, 使用 `python3 -m http.server` 命令在当前目录开启 HTTP 服务器, 默认端口是 8000

- 如果使用 Apache 或 Nginx, 相信你应该知道怎么配置 (反正咱是不会啦)

- 使用 `ip addr` 或者 `ifconfig` 命令查看设备的 IP 地址, 示例输出如下

  ```text
  1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
      link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
      inet 127.0.0.1/8 scope host lo
         valid_lft forever preferred_lft forever
      inet6 ::1/128 scope host noprefixroute 
         valid_lft forever preferred_lft forever
  2: enp3s0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc mq state UP group default qlen 1000
      link/ether 00:13:74:00:00:00 brd ff:ff:ff:ff:ff:ff
      inet 192.168.1.4/24 brd 192.168.1.255 scope global dynamic enp3s0
         valid_lft 2810sec preferred_lft 2810sec
      inet6 fe80::213:74ff:fe00:0/64 scope link proto kernel_ll 
         valid_lft forever preferred_lft forever
  ```

- 因此只要访问 `http://192.168.1.4:8000/` 就可以下载 python 运行目录下的文件了

### 使用 SSH 传输

- 确保设备已开启 SSH 服务

- 若无则运行 `apt install openssh-server` 安装 SSH 服务器, Termux 安装的软件包是 `openssh`

- 使用 `sshd` 启动 SSH 服务器, 对于 Systemd 系统请使用 `systemctl start ssh`

- 使用 `sftp` 命令进行简单交互式文件传输, 使用 `sftp [<username>@]<device_ip> [-p <port>]` 然后输入密码登录

- 若使用 sshkey, 自行解决

### 使用 KDE Connect 传输

- 首先需要确保各设备均已安装 KDE Connect 应用, 并拥有适当的权限, 处于同一局域网内, 然后在手机端与电脑端进行配对

- 对于 KDE 桌面, 在 Dolphin 文件管理器中右键需要传输的文件, 选择 `分享 -> 发送到设备`, 选择设备然后点击 `发送`

- 对于 Android 系统, 在原生的分享活动中应该会有 `通过 KDE Connect 发送` 之类的选项, 点击后选择设备发送. 当然 KDE Connect 应用内也有专门的发送文件

### 通过 USB 使用 MTP 协议

- 使用 USB 线缆将 Android 设备与计算机连接

- 在 Android 设备端设置连接方式为 `传输文件(MTP)`

- 现在在计算机上的文件管理器内就可以看到 Android 设备了

### 通过 USB 使用可移动存储器

- 将 USB 可移动存储器插入计算机的任意 USB 接口, 该可移动存储器可以是移动硬盘或 USB 闪存盘

- 最好确保 USB 接口协议版本对应, 比如 `USB 3.0` (即 `USB 3.1 Gen1` 或 `USB 3.2 Gen1`) 插到 `USB 2.0` (即 `USB 2.0 High-Speed`) 上就是一个很糟糕的操作

- 按需挂载分区, 然后就可以像使用普通硬盘一样使用该可移动存储器了

- 传输到 USB 存储器后, 卸载分区 (在 Windows 下叫做 `弹出`⏏), 然后拔出 USB 存储器

- 使用 OTG 转接头将 USB 存储器的 USB-A 口连接至 Android 设备的 USB-C (Type-C) 口, 当然如果 USB 存储器本身就支持 Type-C 接口则更好

- 现在就可以在 Android 设备的文件管理器内看到 USB 存储器了, 就像是操作内置存储的文件一样进行操作即可

- 使用完成后一定要记得卸载分区再物理拔出 USB 存储器, 否则可能会导致数据丢失

### 通过 QR 码传输

- 对文件进行压缩与 Base64 编码, 然后生成 QR 码

- 在手机上打开任意 QR 码扫描应用, 扫描生成的 QR 码

- 复制扫描出的文本, 然后解码 Base64 与解压缩得到文件内容

- 以上过程可能需要一些技巧, 但总体来说是可行的, 且理论上可以实现光速传输 (不过对镜头和设备性能的要求极高)

- <i>ps: 压缩与 Base64 编码不是必须的, 但这有助于 QR 码扫描应用处理负载</i>

### 直接通过 TCP 协议传输

- 使用 `socat` 命令, 运用一点点 Shell 技巧, 直接进行裸 TCP 传输

- 可以套上一层 SSL/TLS 以进行加密传输

- 具体方法自行研究, 因为咱不会u( >﹏<。)～

### 通过大脑传输

- 直接将文件内容记忆到传输操作者的大脑, 然后在接收端输出

- 这种方法理论上可行, 但效率极低, 错误率较高, 对于体积在 32 字节以内的纯文本文件最为合适

- 每个人的实现方法不同, 主要应用场景为保密程度极高的密钥等

### 通过纸张传输

- 在纸上手抄二进制或十六进制编码的文本内容, 然后手工编码或解码

- 这种方法理论上可行, 但效率极低, 且容易遗漏或错别字, 且不便于阅读

- 主要应用场景为临时传输或交换少量数据

## 总结

- 推荐使用 KDE Connect, 这种方法最省事, 而且功能强大, 不只有文件传输

- 在没有 KDE Connect 的情况下, 建议使用 HTTP, 毕竟不是每个人都会用命令行

- ADB 与 SSH 基本类似, 实际更推荐 SSH

- QR 码传输方法过于先进, 面向未来, 等待有人探索

- 裸 TCP 传输方法较为原始, 建议换 HTTP

- USB 存储器方法可行性受限于移动设备的文件系统支持, 易导致文件系统损坏

- 大脑与纸张传输方法过于原始, 错误率高, 但在学校等背书环境常用

- FTP 此处没有提到, 因为 FTP 协议本身就存在安全问题 (而且咱也不会), 建议不要使用
