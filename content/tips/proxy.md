# Proxy Usages in Common Softwares

## brew

```bash
export ALL_PROXY=http://user:password@ip:port
```

## apt
```bash
$ vim /etc/apt/apt.conf
Acquire::http::Proxy "http://USERNAME:PASSWORD@SERVER:PORT";
Acquire::https::Proxy "https://USERNAME:PASSWORD@SERVER:PORT";
```

## wget
```bash
vim ~/.wgetrc
use_proxy=yes
http_proxy=http://user:password@ip:port
https_proxy=https://user:password@ip:port
```

## Docker

```bash
# setting your proxy config
sudo mkdir -p /etc/systemd/system/docker.service.d
sudo tee /etc/systemd/system/docker.service.d/http-proxy.conf <<EOF
[Service]
Environment="HTTP_PROXY=http://localhost:1081"
Environment="HTTPS_PROXY=http://localhost:1081"
Environment="NO_PROXY=localhost,127.0.0.1,docker-registry.example.com,.corp"
EOF

# Flush changes and restart Docker
sudo systemctl daemon-reload
sudo systemctl restart docker
```
see [official doc](https://docs.docker.com/config/daemon/systemd/#httphttps-proxy).
