# 如何在 docker 里容器间共享网络空间

## Background

当我们需要在运行的容器里抓包，按照以往的方式是在该容器里安装一些调试的软件，或者使用系统提供 `nsenter` 程序来进入容器的网络空间，从而使用宿主机的抓包软件。无论是安装软件还是使用 `nsenter` （宿主机上安装软件），都需要我们在环境里安装好调试软件。其实在 **kubernetes** 里，`kubectl` 提供了 debug 命令来给 **Pod** 注入一个 ephemeral container，这样 ephemeral container 就和我们要调试的目标容器在一个 Pod 里了（我们知道 [pod 里的容器之间的网络就是共享的](https://kubernetes.io/docs/concepts/workloads/pods/#how-pods-manage-multiple-containers)。所以我们可以用一个集成了网络调试工具的镜像来启动这个 ephemeral contrainer，从而我们就有了网络调试的环境了，这样我们就不需要单独安装各种软件了。

> 提问：既然 kubernetes 有 kubectl debug，那本地的 docker 里有类似的功能吗？

## How

使用 `docker cli` 创建容器，且让该容器共享另一个容器的网络空间。

举例：

```bash
docker run -d --name=nginx nginx
docker run -ti --network=container:nginx nicolaka/netshoot bash
```

当然除了使用 docker cli 来处理，还可以在 Docker Compose 的时候来完成共享网络空间。比如下面使用 `docker-compose.yml` 创建了两个 service “nginx” 和 “netshoot”。其中在 netshoot 服务配置里增加了一个属性 `network_mode`，值的格式是 service:[service-name]。

```yaml
version: "3.7"
services:
  nginx:
    image: nginx
  alpine:
    image: nicolaka/netshoot
    command: bash
    network_mode: service:nginx
```

## References

1. [Sharing Network Namespaces in Docker](https://blog.mikesir87.io/2019/03/sharing-network-namespaces-in-docker/)
2. [Pods natively provide two kinds of shared resources for their constituent containers: networking and storage.](https://kubernetes.io/docs/concepts/workloads/pods/#how-pods-manage-multiple-containers)
