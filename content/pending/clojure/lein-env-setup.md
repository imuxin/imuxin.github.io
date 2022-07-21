# lein Environment Setup

This post will show you how to solve that packages cannot be downloaded from clojars repository.

## Solution1: Repository Proxy

If you use macos, you can put this in `~/.profile`:
```
http_proxy=http://host.docker.internal:1081
https_proxy=http://host.docker.internal:1081
```

If you use Linux/Unix, you can put this in `~/.profile`:
```
http_proxy=http://172.17.0.1:1081
https_proxy=http://172.17.0.1:1081
```

## Solution2: Use Domestic Repository

```shell
sed -i "s@http://deb.debian.org@https://repo.huaweicloud.com@g" /etc/apt/sources.list
sed -i "s@http://ftp.debian.org@https://repo.huaweicloud.com@g" /etc/apt/sources.list
sed -i "s@http://security.debian.org@https://repo.huaweicloud.com@g" /etc/apt/sources.list
apt update && apt install -y vim
```

put this in `~/.lein/profiles.clj`:

```clojure
{:user {:repositories [["clojars" {:url "https://mirrors.ustc.edu.cn/clojars/"}]]
        ; other :user profile settings...
       }
}
```

or

```clojure
{:user {:repositories [["clojars" {:url "https://mirrors.tuna.tsinghua.edu.cn/clojars/"}]]
        ; other :user profile settings...
       }
}
```

```clojure
{:user {:plugin-repositories ^:replace [["tsing-clojars-pl" "https://mirrors.tuna.tsinghua.edu.cn/clojars"
                                         "hw-central-pl" "https://mirrors.huaweicloud.com/repository/maven/"]]
        :mirrors {"central" {:name "hw-central"
                             :url "https://mirrors.huaweicloud.com/repository/maven/"}
                  #"clojars" {:name "tsinghua-clojars"
                              :url "https://mirrors.tuna.tsinghua.edu.cn/clojars"}}}}
```

## References

1. [leiningen/doc/PROFILES.md](https://github.com/technomancy/leiningen/blob/master/doc/PROFILES.md)
1. [leiningen/sample.project.clj](https://github.com/technomancy/leiningen/blob/master/sample.project.clj)
1. [lein http proxies doc](https://github.com/technomancy/leiningen/wiki/HTTP-Proxies)
1. [clojars-web mirrors doc](https://github.com/clojars/clojars-web/wiki/Mirrors)
1. [github issue: Mirror repository configured in user profile is not picked up when resolving plugins](https://github.com/technomancy/leiningen/issues/1722)
