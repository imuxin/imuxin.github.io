# istio release analysis

## 1.15

### 概览

- 支持 arm64
- 修复了一个可能会死锁的bug
- rds 中 domain 不再默认匹配端口了
- tunnel over http CONNECT or POST，为 ambient mesh 打下了基础
- ... 其他好像没有什么重要的更新了

### 分析

> Improved the number of pushes to gateway proxies by not pushing when services are not visible from the gateway. (Issue #39110)

当 se 的变动出发 xds 下发前的时候，增加一个判断：当该 se 对当前下发 xds 的网关不可见时，应该取消下发动作。

feature：PILOT_FILTER_GATEWAY_CLUSTER_CONFIG，当开启这个 feature，istio 只会下发 gateway vs 里涉及的 cds

在 istio 1.15，修复了与网关无关的 se 变动导致的多余的下发。

> Updated istiod to allow unknown flags for backward-compatibility. If an unknown flag is passed, no warning or error will be logged.

为了向后兼容，Istiod 将对未知的命令后参数不再报错。

> Added a validation warning when protocol is unset and address is also unset. (Issue #27990)

在 se 的端口配置中的 addresses 为 []string:
端口 protocol 为空
端口协议为 TCP 时
这种情况下，istio会建立 0.0.0.0_port，会处理所有访问该端口的请求，而不管它的 域名或ip 是什么。

验证：在开启 istio DNS 的环境中，所测试到的 LDS 里都没有 0.0.0.0_port 的情况，而是 auto_allocate_ip。如
240.240.0.2_2379

> Added support for configuring internal addresses for the mesh. This can be enabled by setting ENABLE_HCM_INTERNAL_NETWORKS to true.

增加`内部网络`的配置 ENABLE_HCM_INTERNAL_NETWORKS，开启该配置会使用 mesh config 里配置的 network CIDR。在 CIDR 范围内的请求视为内部流量。外部流量在 envoy 里会 清理一些保留 header。参考：https://www.envoyproxy.io/docs/envoy/latest/configuration/http/http_conn_man/header_sanitizing#config-http-conn-man-header-sanitizing

> Added sidecar traffic.sidecar.istio.io/excludeInterfaces annotation. (Issue #39404)

使用 traffic.sidecar.istio.io/excludeInterfaces 来声明不被 sidecar 拦截的 nic。
原理：就是修改 istio-init 的运行参数。

> Added support for configuring max_connection_duration in DestinationRule.

在 dr 里增加 `max_connection_duration` 配置。


> Added support for sending parallel DNS queries to all nameservers in the Istio agent. This feature is disabled by default and can be enabled by setting the istio-agent environment variable DNS_FORWARD_PARALLEL=true. (Issue #39598)

istio-agent 并发执行 DNS 查询。

> Added support for tunneling outbound traffic via external HTTP forward proxies using HTTP CONNECT or POST methods. Tunnel settings can be applied only to TCP and TLS listeners, HTTP listeners are not supported for now.

通过 HTTP CONNECT 或者 Post 方法创建一个 TCP或TLS 的**隧道**，在 ambient mesh 里会用到这个功能。比如 ztunnel 之间的通信用的就是该方式打开的隧道来支持 mtls 的功能。

> Added an option for sidecar Host header matching to ignore port numbers. This can be controlled by the SIDECAR_IGNORE_PORT_IN_HOST_MATCH environment variable.

Host 匹配忽略端口，下面也有相关的说明。

> **Fixed** an issue where some `ServiceEntry` hostnames could cause non-deterministic Envoy routes. ([Issue #38678](https://github.com/istio/istio/issues/38678))

当 `serviceentry` 或 k8s 的 `Service` 的 hostname 是类似 foo.default.svc.cluster.* 的格式的时候，istio 会生成一些备用服务名: foo, foo.default, foo.default.svc 等等。这样会存在冲突的情况。

修复pr：https://github.com/istio/istio/pull/38713/files
思路：条件更为苛刻，只筛选**本地** k8s 服务

> **Fixed** an issue when network gateway names could not be properly resolved in some cases. ([Issue #38689](https://github.com/istio/istio/issues/38689))

修复pr：https://github.com/istio/istio/pull/38781/files
思路：DNS查询中通过用记录类型 `A` 和 `AAAA` 取代 `ANY`

> **Fixed** an issue where updating split `DestinationRules` did not take effect if the RDS/CDS/EDS cache was enabled. ([Issue #39726](https://github.com/istio/istio/issues/39726))

当 subset 配置分散到多个 dr 资源里的时候，istio 在合并的时候，缓存里是以 dr 的 namespace/name 作为 key 来存储的，这样会导致某些 dr 的更新并不会导致 xds 的下发。

> **Fixed** an issue where Istio would send traffic to unready pods when `PILOT_SEND_UNHEALTHY_ENDPOINTS` was enabled. ([Issue #39825](https://github.com/istio/istio/issues/39825))

1.14.1 中默认开启了 PILOT_SEND_UNHEALTHY_ENDPOINTS 这个参数。开启这个 feature 会下发 unhealthy 的 pod 的 ep。这样 envoy 在 lb 的策略下会将流量发送到 unready 的pod里，这违反了 k8s 的约定。所以在 istio 1.15 中默认关闭了这个 feature。另外如果用户需要开启该 feature，则需要关闭 envoy 的 `panic threshold` 这样 envoy 就不会将流量发送到 unhealthy/non-ready 的 pod 了。

> **Fixed** an issue causing rejected configuration when using `STATIC` `ServiceEntries` with `PASSTHROUGH` `DestinationRules`. ([Issue #39736](https://github.com/istio/istio/issues/39736))

在 dr 中给 STATIC 类型的 se 配置 PASSTHROUGH 的 lb 策略时，应该将 LoadAssignment 置为 nil，否则 envoy 会拒绝该配置。

> **Fixed** an issue causing Envoy clusters to be stuck initializing, blocking configuration updates or proxy startup. ([Issue #38709](https://github.com/istio/istio/issues/38709))

在 istiod 推送 CDS 响应后，envoy 发起 EDS 请求，这时 istiod 无法区分这个 EDS 请求是 ACK 还是一个 REQEUST，然后 istiod 就没下发，导致 envoy 没拿到 EDS 响应。

相关链接：[xds: Consistency while handling CDS updates and EDS](https://github.com/envoyproxy/envoy/issues/13009)
pr：https://github.com/istio/istio/commit/04456c8899d00a8f1bbac53993aa4c6547cd0408

> **Fixed** an issue causing traffic not to match (and return a `404`) when using wildcard domain names and including an unexpected port in the `Host` header.

同下一条分析

> **Fixed** an issue causing traffic to match an unexpected route when using wildcard domain names and including a port in the `Host` header.

忽略 RDS 中 domain 里的端口匹配。也就是默认情况下 RDS 里的 domain 将不再包含端口条目。

pr：https://github.com/istio/istio/pull/40475/files

> **Fixed** any issue that can cause xDS configuration updates to be blocked during high traffic. ([Issue #39209](https://github.com/istio/istio/issues/39209))

XdsProxy 和 istiod 都尝试调用 Send()，由于 grpc 收背压（istio的 channel提供）的影响，如果接收端 Recv() 阻塞了，则 Send() 也会被阻塞。XdsProxy 的 Recv() 可能会被 envoy 的 req 和 istiod 的 push 造成阻塞。
这里的修复方式是在 XdsProxy 测做了一个没有边界的 channel，这样不会阻塞 XdsProxy 测的 Recv()。

commit：c3a4d1b9296e928d5a14900e3f818d07b83713ce


## 1.16

### 概览

- `External Authorization` 提升到 beta
- K8S `Gateway API` 提升到 beta
- `JWT` Claim Based Routing 提升到 alpha
- `HBONE` for Sidecars and Ingress (实验阶段)
- `MAGLEV Load Balancing` 支持

### 分析

> **Improved** sidecar `Host` header matching to ignore port numbers by default. This can be controlled by the `SIDECAR_IGNORE_PORT_IN_HOST_MATCH` environment variable. ([Issue #36627](https://github.com/istio/istio/issues/36627))

1.15 中已经有该条的分析了。

> **Updated** `meshConfig.discoverySelectors` to dynamically restrict the set of namespaces where istiod creates the `istio-ca-root-cert` configmap if the `ENABLE_ENHANCED_RESOURCE_SCOPING` feature flag is enabled.

> **Updated** `meshConfig.discoverySelectors` to dynamically restrict the set of namespaces where istiod discovers Custom Resource configurations (like Gateway, VirtualService, DestinationRule, Ingress, etc.) if the `ENABLE_ENHANCED_RESOURCE_SCOPING` feature flag is enabled. ([Issue #36627](https://github.com/istio/istio/issues/36627))

通过设置 `meshConfig.discoverySelectors` 来让 istiod 只发现该 selector 所关联命名空间下的配置。(like Gateway, VirtualService, DestinationRule, Ingress, etc.)

> **Updated** the gateway-api integration to read `v1beta1` resources for `HTTPRoute`, `Gateway`, and `GatewayClass`. Users of the gateway-api must be on version 0.5.0+ before upgrading Istio.

istio 开始支持 gateway-api v1beta1。其实 istio 支持 gateway-api 的原理是将其 crd （`HTTPRoute`, `Gateway`）资源  转换成 vs 和 gw。

> **Added** support for MAGLEV load balancing algorithm for consistent hashing.

支持 MAGLEV lb。该配置在 dr 资源里配置，相关链接参考：https://preliminary.istio.io/latest/docs/reference/config/networking/destination-rule/#LoadBalancerSettings-ConsistentHashLB

https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#maglev

> **Added** the creation of inbound listeners for service ports and sidecar and ingress listener both using environment variable `PILOT_ALLOW_SIDECAR_SERVICE_INBOUND_LISTENER_MERGE`. Using this, the traffic for a service port is not sent via passthrough TCP even though it is regular HTTP traffic when sidecar ingress listener is defined. In case the same port number is defined in both sidecar ingress and service, sidecar always takes precedence. ([Issue #40919](https://github.com/istio/istio/issues/40919))

问题场景：
svc: 80 -> 80
pod: 80

lds:
```
0.0.0.0      15006 Trans: tls; App: istio-http/1.0,istio-http/1.1,istio-h2; Addr: 0.0.0.0/0                      InboundPassthroughClusterIpv4
0.0.0.0      15006 Trans: raw_buffer; App: HTTP; Addr: 0.0.0.0/0                                                 InboundPassthroughClusterIpv4
0.0.0.0      15006 Trans: tls; App: TCP TLS; Addr: 0.0.0.0/0                                                     InboundPassthroughClusterIpv4
0.0.0.0      15006 Trans: raw_buffer; Addr: 0.0.0.0/0                                                            InboundPassthroughClusterIpv4
0.0.0.0      15006 Trans: tls; Addr: 0.0.0.0/0                                                                   InboundPassthroughClusterIpv4
0.0.0.0      15006 Trans: tls; App: istio,istio-peer-exchange,istio-http/1.0,istio-http/1.1,istio-h2; Addr: *:80 Cluster: inbound|80||
0.0.0.0      15006 Trans: raw_buffer; Addr: *:80                                                                 Cluster: inbound|80||
```

当创建一个 Sidecar ingress 资源
```yaml
apiVersion: networking.istio.io/v1alpha3
kind: Sidecar
metadata:
  name: default
  namespace: ql-ovn
spec:
  workloadSelector:
    labels:
      app: svc
  ingress:
  > port:
      number: 81
      protocol: HTTP
      name: test
    defaultEndpoint: 0.0.0.0:81
```

lds:
```
0.0.0.0         15006 Trans: tls; App: istio-http/1.0,istio-http/1.1,istio-h2; Addr: 0.0.0.0/0                      InboundPassthroughClusterIpv4
0.0.0.0         15006 Trans: raw_buffer; App: HTTP; Addr: 0.0.0.0/0                                                 InboundPassthroughClusterIpv4
0.0.0.0         15006 Trans: tls; App: TCP TLS; Addr: 0.0.0.0/0                                                     InboundPassthroughClusterIpv4
0.0.0.0         15006 Trans: raw_buffer; Addr: 0.0.0.0/0                                                            InboundPassthroughClusterIpv4
0.0.0.0         15006 Trans: tls; Addr: 0.0.0.0/0                                                                   InboundPassthroughClusterIpv4
0.0.0.0         15006 Trans: tls; App: istio,istio-peer-exchange,istio-http/1.0,istio-http/1.1,istio-h2; Addr: *:81 Cluster: inbound|81||
0.0.0.0         15006 Trans: raw_buffer; Addr: *:81                                                                 Cluster: inbound|81||
```
可以看到 80 已经被挤到 PassthroughCluster 了。

> **Fixed** `LocalityLoadBalancerSetting.failoverPriority` not working properly if xDS cache is enabled. ([Issue #40198](https://github.com/istio/istio/issues/40198))

> **Fixed** some memory/CPU cost issues by temporarily disabling `PILOT_ENABLE_CONFIG_DISTRIBUTION_TRACKING`.

仅仅是将 `PILOT_ENABLE_CONFIG_DISTRIBUTION_TRACKING` 默认值改成了 false。

> **Fixed** an issue where Remote JWKS URI’s without a host port fail to parse into their host and port components.

> **Fixed** the ordering of RBAC and metadata exchange filters while generating HTTP/network filters. ([Issue #41066](https://github.com/istio/istio/issues/41066))

将 metadata exchange filters 放置在 RBAC filter 之前。
原因是因为在有些使用 OAP 的 metadata exchange filter，需要在 rbac 之前。

> **Fixed** an issue causing traffic to not match (and return a `404`) when using wildcard domain names and including an unexpected port in the `Host` header.

1.15 中已经有该条的分析了。

> **Fixed** an issue causing traffic to match an unexpected route when using wildcard domain names and including an port in the `Host` header.

1.15 中已经有该条的分析了。
