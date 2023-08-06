# K0S Support Dual Stack Network

在上一篇 [k0s bootstrap in ubuntu](k0s-v1.26.3+k0s.0-bootstrap.md) 中，我们已经掌握了如何用 k0s 部署一个 kubernetes 集群。本文将继续探索 CNI 之双栈网络架构。

{% hint style="info" %}
在 k0s 中，双栈网络的部署需要使用 Calico CNI 或者自定义 CNI。
{% endhint %}

## 双栈配置

将 k0s.yaml 的网络配置做以下变更以支持双栈网络。该变更将网络提供者设置为 `calico` 且使用 `bird` 模式。

```diff
72c68,69
<     calico: null
---
>     calico:
>       mode: bird
74c71,74
<     dualStack: {}
---
>     dualStack:
>       enabled: true
>       IPv6podCIDR: "fd00::/108"
>       IPv6serviceCIDR: "fd01::/108"
104c104
<     provider: kuberouter
---
>     provider: calico
```

待更新好 k0s.yaml 后，我们启动集群。

## Troubleshooting

在运行 `k0s start` 之后，我的环境里 `calico-node` daemonset 没有成功运行。查看容器日志，发现有以下异常：

```log
unable to auto-detect an ipv6 address: no valid ipv6 addresses found on the host interfaces
```

查看本地网卡配置，发现网卡上已经存在有 ipv6 的地址，那问题究竟出在哪里呢？

```
// ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host
       valid_lft forever preferred_lft forever
2: ens5: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc pfifo_fast state UP group default qlen 1000
    link/ether 52:54:00:a6:a0:a0 brd ff:ff:ff:ff:ff:ff
    inet 192.168.121.135/24 metric 100 brd 192.168.121.255 scope global dynamic ens5
       valid_lft 1993sec preferred_lft 1993sec
    inet6 fe80::5054:ff:fea6:a0a0/64 scope link
       valid_lft forever preferred_lft forever
```

在没有任何线索的情况下，尝试更新 calico 的日志级别，让其打印更多的日志来看看是否能拿到有用的线索。更新 calico-node daemon，设置 `CALICO_STARTUP_LOGLEVEL` 为 **debug** 等级。

```yaml
// kubectl -n kube-system edit daemonset calico-node
- env:
  - name: CALICO_STARTUP_LOGLEVEL
    value: debug
  ...
```

发现问题就发生在 FilteredEnumeration 这个函数里。

<pre class="language-go" data-line-numbers><code class="lang-go">// related-link:
//   https://github.com/projectcalico/calico/blob/v3.26.1/node/pkg/lifecycle/startup/autodetection/filtered.go#L30-L54

func FilteredEnumeration(incl, excl []string, cidrs []net.IPNet, version int) (*Interface, *net.IPNet, error) {
	interfaces, err := GetInterfaces(gonet.Interfaces, incl, excl, version)
	if err != nil {
		return nil, nil, err
	}
	if len(interfaces) == 0 {
		return nil, nil, errors.New("no valid host interfaces found")
	}

	// Find the first interface with a valid matching IP address and network.
	// We initialise the IP with the first valid IP that we find just in
	// case we don't find an IP *and* network.
	for _, i := range interfaces {
		log.WithField("Name", i.Name).Debug("Check interface")
		for _, c := range i.Cidrs {
			log.WithField("CIDR", c).Debug("Check address")
<strong>			if c.IP.IsGlobalUnicast() &#x26;&#x26; matchCIDRs(c.IP, cidrs) {
</strong>				return &#x26;i, &#x26;c, nil
			}
		}
	}

	return nil, nil, fmt.Errorf("no valid IPv%d addresses found on the host interfaces", version)
}
</code></pre>

从函数的实现上不难理解，IP 为 `fe80::5054:ff:fea6:a0a0` 的 `c.IP.IsGlobalUnicast()` 函数返回了`false`。我们可以通过下面的测试程序来验证。

```go
package main

import (
	"fmt"
	"net"
)

func main() {
	var ip net.IP
	ip = net.ParseIP("fe80::5054:ff:fea6:a0a0")
	fmt.Println(ip.IsGlobalUnicast()) // will print: false
}
```

以上我们得知 calico-node 需要节点的网卡 IPv6 的类型为 [global unicast address](https://en.wikipedia.org/wiki/IPv6\_address)。那么我们设置一个该类型的地址试试看？

```bash
sudo ip -6 addr add 21DA:D3::/48 dev ens5
```

> 关于更多的 ipv6 地址配置方式，请参考 [https://tldp.org/HOWTO/Linux+IPv6-HOWTO/ch06.html](https://tldp.org/HOWTO/Linux+IPv6-HOWTO/ch06.html)。

待更新 ipv6 的地址后，calico-node 成功运行了，且 “ip 自动发现”相关日志如下：

<pre class="language-log"><code class="lang-log">...

2023-07-03 07:31:27.456 [INFO][9] startup/startup.go 485: Initialize BGP data
2023-07-03 07:31:27.457 [DEBUG][9] startup/interfaces.go 79: Querying interface addresses Interface="ens5"
2023-07-03 07:31:27.457 [DEBUG][9] startup/interfaces.go 99: Found valid IP address and network CIDR=192.168.121.135/24
2023-07-03 07:31:27.457 [DEBUG][9] startup/filtered.go 43: Check interface Name="ens5"
2023-07-03 07:31:27.457 [DEBUG][9] startup/filtered.go 45: Check address CIDR=192.168.121.135/24
2023-07-03 07:31:27.457 [INFO][9] startup/autodetection_methods.go 103: Using autodetected IPv4 address on interface ens5: 192.168.121.135/24
2023-07-03 07:31:27.458 [DEBUG][9] startup/interfaces.go 79: Querying interface addresses Interface="ens5"
2023-07-03 07:31:27.458 [DEBUG][9] startup/interfaces.go 99: Found valid IP address and network CIDR=21da:d3::/48
2023-07-03 07:31:27.458 [DEBUG][9] startup/interfaces.go 99: Found valid IP address and network CIDR=fe80::5054:ff:fea6:a0a0/64
2023-07-03 07:31:27.458 [DEBUG][9] startup/filtered.go 43: Check interface Name="ens5"
2023-07-03 07:31:27.458 [DEBUG][9] startup/filtered.go 45: Check address CIDR=21da:d3::/48
<strong>2023-07-03 07:31:27.458 [INFO][9] startup/autodetection_methods.go 103: Using autodetected IPv6 address on interface ens5: 21da:d3::/48
</strong>
...
</code></pre>
