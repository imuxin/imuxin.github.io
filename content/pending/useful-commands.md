# Useful commands

Exec an network namespace.
```bash
nsenter --net=/var/run/docker/netns/060b5164348d bash
```

Lookup a domain's ip address at a specific dns server.
```bash
dig sleep.foo.svc.cluster.local @10.244.0.53
```

Docker networking namespace not visible in ip netns list
```bash
# (as root)
pid=$(docker inspect -f '{{.State.Pid}}' ${container_id})
mkdir -p /var/run/netns/
ln -sfT /proc/$pid/ns/net /var/run/netns/$container_id

# e.g. show stats about eth0 inside the container
ip netns exec "${container_id}" ip -s link show eth0
```
