# 【记录】 macbook 上安装 ubuntu

待业在家，公司 macbook 也还了，手头上还有台 2015 年的 macbook pro，但是用来作为生产力工具还是有点拉跨。在考虑重新为其装个 Linux 来换个血还是上 M2。思考再三还是决定不换新 macbook 了。所以有了这篇记录日志。

**令我每想到的是，macbook 的 touchpad 在 ubuntu 系统上还是很丝滑的，一些常用的二指和三指都能使用。**

## 制作 ubuntu U 盘启动盘

下载 ubuntu 22.04 iSO 镜像
选用 balenaEther 软件对 iSO 镜像进行烧录

## macbook 安装前准备工作

为待安装的系统分配一个磁盘分区，磁盘格式选用 MS-DOS（FAT）

## 安装系统

插上 U 盘，重启 macbook，长按 `option` 键，出现磁盘选择界面，此时选择 EFI Boot 进行安装。
后续步骤和以往 ubuntu 系统安装步骤一致，不再赘述。

## 激活 camera 设备

源于使用腾讯会议的时候，打开摄像头失败，原因是系统并为识别到摄像头设备。经过实践，将步骤记录如下：

0. 执行以下命令，安装固件和驱动程序

```bash
git clone https://github.com/patjak/facetimehd-firmware.git
cd facetimehd-firmware
make
make install
```

```bash
git clone https://github.com/patjak/bcwc_pcie.git
cd bcwc_pcie
make
make install
```

1. 从 Apple 官网下载 macbook camera 驱动程序 https://support.apple.com/kb/DL1837
2. unzip 解压
3. cd BootCamp/Drivers/Apple/ && unrar x AppleCamera64.exe

在 ./BootCamp/Drivers/Apple 目录下会看到 AppleCamera.sys 文件，

4. 执行以下命令生存 dat 文件
```bash
dd bs=1 skip=1663920 count=33060 if=AppleCamera.sys of=9112_01XX.dat
dd bs=1 skip=1644880 count=19040 if=AppleCamera.sys of=1771_01XX.dat
dd bs=1 skip=1606800 count=19040 if=AppleCamera.sys of=1871_01XX.dat
dd bs=1 skip=1625840 count=19040 if=AppleCamera.sys of=1874_01XX.dat
```
5. 将这些 .dat 文件拷贝到 facetimehd firmware 目录下 (eg. /lib/firmware/facetimehd/)

6. 激活摄像头内核驱动模块
```
depmod # Run depmod for the kernel to be able to find and load it
modprobe facetimehd # Load kernel module
```
## Reboot

## 参考链接

1. https://github.com/patjak/facetimehd/wiki/Installation
2. https://github.com/patjak/facetimehd/wiki/Get-Started#firmware-extraction
3. https://github.com/patjak/facetimehd/wiki/Extracting-the-sensor-calibration-files
