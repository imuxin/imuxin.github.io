# Useful commands

## Exec an network namespace
```bash
nsenter --net=/var/run/docker/netns/060b5164348d bash
# or
nsenter -n -t{pid}
```

## Show some process full command
```bash
ps auxww
```

## Lookup a domain's ip address at a specific dns server.
```bash
dig sleep.foo.svc.cluster.local @10.244.0.53
```

## Docker networking namespace not visible in ip netns list
```bash
# (as root)
pid=$(docker inspect -f '{{.State.Pid}}' ${container_id})
mkdir -p /var/run/netns/
ln -sfT /proc/$pid/ns/net /var/run/netns/$container_id

# e.g. show stats about eth0 inside the container
ip netns exec "${container_id}" ip -s link show eth0
```

## Check /etc/fstab working correctly
```
sudo mount -a
```

## Listing all resources in a namespace
```bash
kubectl api-resources --verbs=list --namespaced -o name \
   | xargs -n 1 kubectl get --show-kind --ignore-not-found -n {namespace}
```

## Find package which provides a particular binary file or library file

```bash
# debian, ubuntu
dpkg -S [file name]

# centos
rpm -qf --whatprovides [file name]
## or
yum whatprovides [file name]
```

## Finding file and libraries provided by a particular package

```
dpkg -L [package name]

rpm -ql [package name]
```

## Find all symbols exported from a shared object

```
readelf -Ws --dyn-syms /path/to/libxxx.so
```

## Git compare

1.12→1.13 commits:
```
git log --topo-order --oneline --decorate --stat --abbrev-commit origin/release-1.12..origin/release-1.13
```
或者使用github自带的compare功能
https://github.com/istio/istio/compare/1.12.6...1.13.3

## Sed 系列

删除 {n} 到 {m} 行

```bash
sed -i '{n},{m}d' file
```

在第 {n} 行插入

```bash
sed -i '{n} i content' file
```

## Docker 系列

ubuntu zfs 系统下删除容器报错

```bash
docker ps -a | grep Removal | cut -f1 -d' ' | xargs -rt docker rm  2>&1 >/dev/null | grep "dataset does not exist" |  awk '{print $(NF-4)}' | sed "s/'//g" | cut -f1 -d':' |  xargs -L1 sh -c 'for arg do sudo zfs destroy -R "$arg"; sudo zfs destroy -R "$arg"-init ; sudo zfs create "$arg" ; sudo zfs create "$arg"-init ; ...; done' _ ; docker ps -a | grep Removal | cut -f1 -d' ' | xargs -rt docker rm 2>&1 >/dev/null
```
## openssl 生成自签证书

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 365 # 生成 RootCA Key: key.pem
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -sha256 -days 3650 -nodes -subj "/C=CN/ST=Jiangsu/L=Nanjing/O=fn-matrix/OU=IT/CN=rootca.imuxin.org" # 生成 RootCA Cert: cert.pem

openssl genrsa -out tls.key 4096 # 生成私钥: tls.key

openssl rsa -in tls.key -pubout > tls.pub # 生成公钥: tls.pub

openssl req -new -key tls.key -out tls.csr -subj "/C=CN/ST=Jiangsu/L=Nanjing/O=fn-matrix/OU=IT/CN=*.example.org" # 生成 csr: tls.csr

openssl x509 -req -in tls.csr -CA cert.pem -CAkey key.pem -out tls.crt -days 365 -sha256 -CAcreateserial -CAserial cert.seq # 生成证书: tls.crt
```
