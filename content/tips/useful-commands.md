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
