# A Brief Guide to Gateway API

## Introduction

Gateway API 是一个声明性配置 API，它提供了一种标准化方法来管理和公开 Kubernetes 集群中的服务。它旨在简化基于微服务的应用程序的网络流量路由和负载平衡的管理。

## API Overview

![gateway api model](./img/gateway-api-model.png)

### 面向角色的分工设计

从应用的部署到可以被集群外部访问这一系列流程是比较长的，如果把这一整个作业交给一个角色，那这个角色得清楚应用的访问信息，网关的部署和配置，以及选择哪个 GatewayClass 提供者。很显然这个角色承担的太多。Gateway API 很聪明，将这一过程拆成多个角色来分工协作完成。

基础设施提供商提供 Gateway API 的实现，即 GatewayClass 的管理。
平台管理员负责网关的创建和分配，即 Gateway 资源的配置。
开发人员根据应用的配置路由，并做好网关关联。

![gateway roles](./img/gateway-roles.png)

### 资源模型

#### Gateway Class

GatewayClasses formalize types of load balancing implementations. These classes make it easy and explicit for users to understand what kind of capabilities are available via the Kubernetes resource model.

#### Gateway

Shared Gateways and cross-Namespace support - They allow the sharing of load balancers and VIPs by permitting independent Route resources to attach to the same Gateway. This allows teams (even across Namespaces) to share infrastructure safely without direct coordination.

#### Route

Typed Routes and typed backends - The Gateway API supports typed Route resources and also different types of backends. This allows the API to be flexible in supporting various protocols (like HTTP and gRPC) and various backend targets (like Kubernetes Services, storage buckets, or functions).

   - HTTPRoute
   - TLSRoute
   - TCPRoute
   - UDPRoute
   - GRPCRoute

## vs. Ingress

## Implementaion

作为“挟天子以令诸侯”(笔者调侃)的 Gateway API，不乏一些集成者。其中就包括 Istio，Cilium 等。[See more](https://gateway-api.sigs.k8s.io/implementations/#envoy-gateway).

### istio

站在流量治理的角度上看，Gateway API 和 Istio API 有很多相似的设计，比如 `Gateway` 和 `VirtualService` Gateway API 作为一个中立的 API 标准，从很多 Ingress 项目吸取了很多经验，其中就包括 Istio 的 API 设计。下面将介绍 Kubernetes Gateway API 和 Istio API 的不同点。

1. Istio `Gateway` 资源仅对已经部署的网关负载(Deployment/Service)配置；而在 Gateway API 中， `Gateway` 设计中还包括对网关进行部署。
2. Istio `VirtualService` 可以将不同协议的流量配置在同一个文件中；而在 Gateway API 中，不同的协议都有自己的资源，比如 `HTTPRoute` `GRPCRoute` `TCPRoute` 等。
3. 尽管 Gateway API 很多丰富的路由等流量治理功能，但至今仍未 100% 覆盖 istio 的特性。Istio 正在努力扩展 Gateway API 来更好的公开 istio 的功能。毕竟 Istio 未来是要将 Gateway API 作为其流量治理的[默认 API](https://istio.io/latest/blog/2022/gateway-api-beta/) 的。

#### Support

https://github.com/kubernetes-sigs/gateway-api/tree/main#status

The latest supported version is v1beta1 as released by the v0.7.0 release of this project.

This version of the API is has beta level support for the following resources:

- v1beta1.GatewayClass
- v1beta1.Gateway
- v1beta1.HTTPRoute
- v1beta1.ReferenceGrant
For all other APIs we provide alpha level support.


https://istio.io/latest/docs/tasks/traffic-management/ingress/gateway-api/#setup

```bash
kubectl get crd gateways.gateway.networking.k8s.io &> /dev/null || \
  { kubectl kustomize "github.com/kubernetes-sigs/gateway-api/config/crd?ref=v0.6.2" | kubectl apply -f -; }
```

istio 只支持 v1beta1 的资源。


#### Deep Dive

Istiod 会默认创建一个 `GatewayClass`，YAML 描述文件如下：

```yaml
apiVersion: gateway.networking.k8s.io/v1beta1
kind: GatewayClass
metadata:
  name: istio
spec:
  controllerName: istio.io/gateway-controller
  description: The default Istio GatewayClass
status:
  conditions:
  - lastTransitionTime: "2023-06-19T03:00:38Z"
    message: Handled by Istio controller
    observedGeneration: 1
    reason: Accepted
    status: "True"
    type: Accepted
```

通过 Gateway API `Gateway` 创建一个网关，以及声明一些监听的信息

```bash
kubectl create namespace istio-ingress
kubectl apply -f - <<EOF
apiVersion: gateway.networking.k8s.io/v1beta1
kind: Gateway
metadata:
  name: gateway
  namespace: istio-ingress
spec:
  gatewayClassName: istio
  listeners:
  - name: default
    hostname: "*.example.com"
    port: 80
    protocol: HTTP
    allowedRoutes:
      namespaces:
        from: All
EOF
```

| Automated Resouces |     NAME     |  NAMESPACE  | Type         | LabelSelector                 |
| ------------------ | :----------: | :---------: | ------------ | ----------------------------- |
| deployment         | {name}-istio | {namespace} |              |                               |
| service            | {name}-istio | {namespace} | LoadBalancer | istio.io/gateway-name: {name} |
| gateway (istio)    |      -       |      -      |              |                               |

> debug/configz
> ...

## References

1. https://istio.io/latest/docs/tasks/traffic-management/ingress/gateway-api/