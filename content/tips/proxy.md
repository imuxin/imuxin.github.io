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

