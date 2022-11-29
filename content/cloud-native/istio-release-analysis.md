# istio release analysis

## 1.15

### **Fixed** an issue where updating split `DestinationRules` did not take effect if the RDS/CDS/EDS cache was enabled. ([Issue #39726](https://github.com/istio/istio/issues/39726))

当 subset 配置分散到多个 dr 资源里的时候，istio 在合并的时候，缓存里是以 dr 的 namespace/name 作为 key 来存储的，这样会导致某些 dr 的更新并不会导致 xds 的下发。

### **Fixed** an issue where Istio would send traffic to unready pods when `PILOT_SEND_UNHEALTHY_ENDPOINTS` was enabled. ([Issue #39825](https://github.com/istio/istio/issues/39825))

1.14.1 中默认开启了 PILOT_SEND_UNHEALTHY_ENDPOINTS 这个参数。开启这个 feature 会下发 unhealthy 的 pod 的 ep。这样 envoy 在 lb 的策略下会将流量发送到 unready 的pod里，这违反了 k8s 的约定。所以在 istio 1.15 中默认关闭了这个 feature。另外如果用户需要开启该 feature，则需要关闭 envoy 的 `panic threshold` 这样 envoy 就不会将流量发送到 unhealthy/non-ready 的 pod 了。

### **Fixed** an issue causing rejected configuration when using `STATIC` `ServiceEntries` with `PASSTHROUGH` `DestinationRules`. ([Issue #39736](https://github.com/istio/istio/issues/39736))

在 dr 中给 STATIC 类型的 se 配置 PASSTHROUGH 的 lb 策略时，应该将 LoadAssignment 置为 nil，否则 envoy 会拒绝该配置。

### **Fixed** an issue causing Envoy clusters to be stuck initializing, blocking configuration updates or proxy startup. ([Issue #38709](https://github.com/istio/istio/issues/38709))

### **Fixed** an issue causing traffic not to match (and return a `404`) when using wildcard domain names and including an unexpected port in the `Host` header.

### **Fixed** an issue causing traffic to match an unexpected route when using wildcard domain names and including a port in the `Host` header.

### **Fixed** a potential memory leak triggered by updating `ServiceEntry` hostname.

### **Fixed** any issue that can cause xDS configuration updates to be blocked during high traffic. ([Issue #39209](https://github.com/istio/istio/issues/39209))

## 1.16

### **Improved** sidecar `Host` header matching to ignore port numbers by default. This can be controlled by the `SIDECAR_IGNORE_PORT_IN_HOST_MATCH` environment variable. ([Issue #36627](https://github.com/istio/istio/issues/36627))

### **Updated** `meshConfig.discoverySelectors` to dynamically restrict the set of namespaces where istiod creates the `istio-ca-root-cert` configmap if the `ENABLE_ENHANCED_RESOURCE_SCOPING` feature flag is enabled.

### **Updated** `meshConfig.discoverySelectors` to dynamically restrict the set of namespaces where istiod discovers Custom Resource configurations (like Gateway, VirtualService, DestinationRule, Ingress, etc.) if the `ENABLE_ENHANCED_RESOURCE_SCOPING` feature flag is enabled. ([Issue #36627](https://github.com/istio/istio/issues/36627))

### **Updated** the gateway-api integration to read `v1beta1` resources for `HTTPRoute`, `Gateway`, and `GatewayClass`. Users of the gateway-api must be on version 0.5.0+ before upgrading Istio.

### **Added** support for MAGLEV load balancing algorithm for consistent hashing.

### **Added** the creation of inbound listeners for service ports and sidecar and ingress listener both using environment variable `PILOT_ALLOW_SIDECAR_SERVICE_INBOUND_LISTENER_MERGE`. Using this, the traffic for a service port is not sent via passthrough TCP even though it is regular HTTP traffic when sidecar ingress listener is defined. In case the same port number is defined in both sidecar ingress and service, sidecar always takes precedence. ([Issue #40919](https://github.com/istio/istio/issues/40919))

### **Fixed** `LocalityLoadBalancerSetting.failoverPriority` not working properly if xDS cache is enabled. ([Issue #40198](https://github.com/istio/istio/issues/40198))

### **Fixed** some memory/CPU cost issues by temporarily disabling `PILOT_ENABLE_CONFIG_DISTRIBUTION_TRACKING`.

### **Fixed** an issue where Remote JWKS URI’s without a host port fail to parse into their host and port components.

### **Fixed** the ordering of RBAC and metadata exchange filters while generating HTTP/network filters. ([Issue #41066](https://github.com/istio/istio/issues/41066))

### **Fixed** an issue causing traffic to not match (and return a `404`) when using wildcard domain names and including an unexpected port in the `Host` header.

### **Fixed** an issue causing traffic to match an unexpected route when using wildcard domain names and including an port in the `Host` header.
