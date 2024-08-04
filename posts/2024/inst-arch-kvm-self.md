# KVM 徒手安装 Arch Linux

> 观前提示: 本文是本人在一次次亲自试错中总结出来的, 可能不是最佳方案, 欢迎在下方评论区讨论 (可能有吧)

> 本教程除 KVM (QEMU) 以外还适用于所有使用 BIOS 方式引导的使用有线网卡的位于中国大陆的计算机, 其她情况根据实际自行调整即可

## 环境

```text
❯ kvm --version
QEMU emulator version 8.2.4 (Debian 1:8.2.4+ds-1)
Copyright (c) 2003-2023 Fabrice Bellard and the QEMU Project developers
```

## 启动

- 从 [mirrors.ustc.edu.cn](https://mirrors.ustc.edu.cn/archlinux/iso/latest/) 或其她 [你喜欢的地方](https://archlinux.org/download/) 下载得到安装映像💿

- 假设您已经将安装映像存放于文件 `/media/sess/sess-aigo/for-pc-build/sysimg/archlinux-2024.08.01-x86_64.iso` 且已校验文件 HASH

- 进入到您喜欢的目录中, 运行 `qemu-img create -f raw arch.raw 12G`, 这将在当然工作目录下生成一个名为 `arch.raw` 的大小为 `12884901888` 字节的文件. 您也可以使用别的您喜欢的格式或文件名

- 运行以下命令, 其中 `arch.raw` 替换为你的磁盘文件名, `raw` 替换为你的磁盘文件格式, `1024M` 是您的客户机内存大小, `-smp` 后面的是客户机 CPU 配置, `-cdrom` 后面的是安装映像

  ```shell
  kvm --enable-kvm -drive file=arch.raw,format=raw \
    -m 1024M -smp sockets=1,cores=1,threads=2 \
    -cdrom /media/sess/sess-aigo/for-pc-build/sysimg/archlinux-2024.08.01-x86_64.iso
  ```

- 最大化弹出的 `QEMU` 窗口, 在菜单栏 `视图(V)` 中选中 `缩放以适应大小(F)` 与取消选中 `显示菜单栏`

- 如果您的桌面环境为 KDE Plasma, 还可以设置 无标题栏和边框🪟

## 磁盘分区

- 启动后, 您应该可以看到以下这个界面, 通过键盘上的箭头键使得列表的第一个选项为高亮状态, 然后按下回车键 (Enter↩️)

  ![Screenshot_20240804_172204.png](https://static.xhustudio.eu.org/posts/2024/inst-arch-kvm-self/Screenshot_20240804_172204.png)

- 启动到 live 环境后, 您应该能够注意到一条彩带, 下面一行是 <code><span style="color:red;">root</span>@archiso ~ #</code> 提示符

- 使用 `fdisk -l` 命令查看所有分区, 假设您要安装到 `/dev/sda`, 运行 `fdisk /dev/sda` 以开始编辑磁盘💾

- 依次操作
  - `o` 回车 (create a new MBR (DOS) partition table)
  - `F` 回车 (list free unpartitioned space)
  - <i>根据屏幕上输出的可用空间自行判断如何分区</i>
  - `n` 回车 (add a new partition)
  - 回车 (primary), 回车 (1 (`sda1`)), 回车 (2048)
  - `-2G` 回车 (磁盘尾部预留 2GiB 未格式化空间)
  - `n` 回车 (add a new partition)
  - 按四次回车 (将剩下的空间分给 `sda2`)
  - `t` 回车 (change a partition type)
  - 回车 (2 (`sda2`))
  - `swap` 回车
  - `a` 回车 (toggle a bootable flag)
  - `1` 回车 (1 (`sda1`))
  - `w` 回车 (write table to disk and exit)

- 运行以下命令

  ```shell
  mkfs.ext4 /dev/sda1   # 格式化 sda1 为 ext4
  mkswap /dev/sda2      # 初始化 sda2 为 交换空间
  swapon /dev/sda2      # 启用交换空间 sda2
  mount /dev/sda1 /mnt  # 挂载 sda1 到 /mnt
  ```

## 安装系统

- 运行 `reflctor --country cn --protocol https --save /etc/pacman.d/mirrorlist` 选择镜像站列表 <s>(如果你愿意, 可以在 `cn` 后面加上 `,hk,tw --f 20`)</s>

- 运行 `pacstrap -K /mnt base linux linux-firmware`. 如果您使用虚拟机或容器, 也可以去掉 `linux-firmware`

- 运行 `genfstab -U /mnt >> /mnt/etc/fstab` 以生成 fstab 文件. 强烈建议在执行完以上命令后，检查一下生成的 /mnt/etc/fstab 文件是否正确

- 运行 `arch-chroot /mnt` 进入新系统

- 恭喜🎉, 安装成功✌

## 配置系统

- 运行 `ln -sf /usr/share/zoneinfo/Asia/Hong_Kong /etc/localtime`. 这将设置 `Asia/Hong_Kong` (UTC+8) 为您的时区, 当然也可以为 `Asia/Shanghai` 或者别的

- 运行 `hwclock --systohc` 以生成 `/etc/adjtime`, 这个命令假定已设置硬件时间为 UTC 时间.

- 运行 `pacman -S vim` 以安装 vim 作为终端下的文本编辑器, 当然你如果不会用 vim 也可以换成 nano 啦

- 编辑 `/etc/locale.gen`, 取消 `en_US.UTF-8 UTF-8` `zh_CN.UTF-8 UTF-8` `zh_HK.UTF-8 UTF-8` `zh_TW.UTF-8 UTF-8` 的注释 (这样就能避免不支持简体但是却显示英文的情况了)

- 运行 `locale-gen`

- 运行 `echo "LANG=en_US.UTF-8 > /etc/locale.conf"`

- 护眼配置: `pacman -S terminus-font && setfont ter-h16b && echo "FONT=ter-h16b" > /etc/vconsole.conf`, 若您使用高分屏则可能需要使用更大的数字

- 运行 `echo "localhost" > /etc/hostname` 以设置您的主机名为 `localhost` (不过真有人会用 `localhost` 而不是别的以避免混淆吗). 你也可以看看 [RFC 1178](https://datatracker.ietf.org/doc/html/rfc1178) 来 Choosing a Name for Your Computer

- 运行 `passwd` 以设置 root 密码🔑. 永远不要设置如 `114514` 一类的弱密码!

- 运行 `pacman -S grub && grub-install /dev/sda && grub-mkconfig -o /boot/grub/grub/cfg` 以安装 GRUB 到 `/dev/sda`

- 按下 `Ctrl+D` 然后运行 `umount -R /mnt` 以退出 chroot 环境和卸载分区

- 恭喜🎉, 你已经成功安装好了一个基本的 Arch Linux, 运行 `reboot` 重启进入新系统吧 <(≧▽≦)>

## 配置网络

- 输入账号密码以登入系统

- 接着, 你想 `pacman -S neofetch && neofetch` 然后发现没网, 于是你开始徒手配置网络🛜

- 关于为什么泽生要把配置网络放在这里讲, 是因为这样就不会受到 live 环境自动配置网络的影响, 而且这里不只有网络配置还有别的一些 systemd 组件配置

- 当然了, 这样你就只有 systemd-networkd 一种选择了 (゜∀。)

- 运行 `ip link` 查看所有网络接口, 可能的输出如下, 其中 `ens3` 是物理网络接口, 别名为 `enp0s3`

  ![Screenshot_20240804_185343.png](https://static.xhustudio.eu.org/posts/2024/inst-arch-kvm-self/Screenshot_20240804_185343.png)

- 编辑 `/etc/systemd/network/20-wired.network` 为以下内容, 假设您使用的有限适配器为 `ens3`, 且所在网络支持 DHCP (比如 KVM)

  ```toml
  [Match]
  Name=ens3

  [Network]
  DHCP=yes
  ```

- 编辑 `/etc/systemd/resolved.conf`, 取消注释 `DNS=` 并在后面追加 `8.8.8.8`, 在刚刚输入的下面继续追加 `FallbackDNS=114.114.114.114`, 就像下面这样, 以避免被网关污染 DNS

  ```toml
  [Resolve]
  DNS=8.8.8.8
  FallbackDNS=114.114.114.114
  ```

- 运行 `systemctl enable systemd-networkd.service systemd-resolved.service` 以启用

- 运行 `systemctl start systemd-networkd.service systemd-resolved.service` 以启动

- 运行 `ln -sf /run/systemd/Resolve/resolv.conf /etc/resolv.conf` 以确保 DHCP 客户端不会乱修改 DNS 配置

- 运行 `ping xhustudio.eu.org` 以验证网络连通性, 若不通再试试 `ping bilibili.com`

- 运行 `systemctl enable systemd-timesyncd && systemctl start systemd-timesyncd` 以启用并运行时间同步

## 图形界面

- 现在您可以安装并运行 `neofetch` 了

  ![Screenshot_20240804_210956.png](https://static.xhustudio.eu.org/posts/2024/inst-arch-kvm-self/Screenshot_20240804_210956.png)

- 图形界面不是本文的重点, `pacman -S plasma` 即可安装完整的 KDE Plasma

## 参见

- [安装指南 - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/%E5%AE%89%E8%A3%85%E6%8C%87%E5%8D%97)

- [Linux 控制台 - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/Linux_%E6%8E%A7%E5%88%B6%E5%8F%B0#%E5%AD%97%E4%BD%93)

- [网络配置 - Arch Linux 中文维基](https://wiki.archlinuxcn.org/wiki/%E7%BD%91%E7%BB%9C%E9%85%8D%E7%BD%AE)
