# Istio 1-13 Bootstrap

## Prerequisite

1. Ensure kubernetes 1.23 installed.

## Install

```bash
istioctl operator init --revision 1-13
```

install `istio-1-13` istiooperator.

```yaml
apiVersion: install.istio.io/v1alpha1
kind: IstioOperator
metadata:
  namespace: istio-system
  name: istio-1-13
spec:
  meshConfig:
    enableTracing: true
    defaultConfig:
      tracing:
        sampling: 100.0
  profile: default
  revision: 1-13
  components:
    pilot:
      k8s:
        resources:
          requests:
            cpu: "0.2"
            memory: "512Mi"
          limits:
            cpu: "0.2"
            memory: "512Mi"
    egressGateways:
    - name: istio-egressgateway
      enabled: false
      k8s:
        resources:
          requests:
            cpu: "0.2"
            memory: "128Mi"
          limits:
            cpu: "0.2"
            memory: "128Mi"
```

install `zipkin` tracing server

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: zipkin
  namespace: istio-system
  labels:
    app: zipkin
spec:
  selector:
    matchLabels:
      app: zipkin
  template:
    metadata:
      labels:
        app: zipkin
      annotations:
        sidecar.istio.io/inject: "false"
    spec:
      containers:
        - name: zipkin
          image: openzipkin/zipkin-slim:2.23.14
          env:
            - name: STORAGE_METHOD
              value: "mem"
          readinessProbe:
            httpGet:
              path: /health
              port: 9411
            initialDelaySeconds: 5
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: tracing
  namespace: istio-system
  labels:
    app: zipkin
spec:
  type: ClusterIP
  ports:
    - name: http-query
      port: 80
      protocol: TCP
      targetPort: 9411
  selector:
    app: zipkin
---
apiVersion: v1
kind: Service
metadata:
  labels:
    name: zipkin
  name: zipkin
  namespace: istio-system
spec:
  type: NodePort
  ports:
    - port: 9411
      targetPort: 9411
      name: http-query
  selector:
    app: zipkin
```

## Verify

```
k8s@k8s:~$ k get pod -n istio-system
NAME                                    READY   STATUS    RESTARTS        AGE
istio-ingressgateway-56f77685cd-h574n   1/1     Running   1 (4m22s ago)   5h2m
istiod-1-13-76c4494d97-fg956            1/1     Running   1 (4m22s ago)   5h2m
zipkin-5f555d5498-tnj26                 1/1     Running   1 (4m22s ago)   4h49m
```

## Deploy sample apps

```bash
kubectl create ns foo
kubectl label namespace foo istio.io/rev=1-13
```

### Sleep app

```bash
kubectl create -n foo -f sleep.yaml
```

cat sleep.yaml:

```yaml
# Copyright Istio Authors
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

#################
# Sleep service #
#################
apiVersion: v1
kind: ServiceAccount
metadata:
  name: sleep
---
apiVersion: v1
kind: Service
metadata:
  name: sleep
  labels:
    app: sleep
    service: sleep
spec:
  ports:
  - port: 80
    name: http
  selector:
    app: sleep
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sleep
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sleep
  template:
    metadata:
      labels:
        app: sleep
    spec:
      terminationGracePeriodSeconds: 0
      serviceAccountName: sleep
      containers:
      - name: sleep
        image: curlimages/curl
        command: ["/bin/sleep", "3650d"]
        imagePullPolicy: IfNotPresent
        volumeMounts:
        - mountPath: /etc/sleep/tls
          name: secret-volume
      volumes:
      - name: secret-volume
        secret:
          secretName: sleep-secret
          optional: true
```

### Httpbin app

```bash
kubectl create -n foo -f httpbin.yaml
```

cat httpbin.yaml:

```yaml
# Copyright Istio Authors
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

###################
# httpbin service #
###################
apiVersion: v1
kind: ServiceAccount
metadata:
  name: httpbin
---
apiVersion: v1
kind: Service
metadata:
  name: httpbin
  labels:
    app: httpbin
    service: httpbin
spec:
  ports:
  - name: http
    port: 8080
    targetPort: 8080
  selector:
    app: httpbin
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: httpbin
spec:
  replicas: 1
  selector:
    matchLabels:
      app: httpbin
      version: v1
  template:
    metadata:
      labels:
        app: httpbin
        version: v1
    spec:
      serviceAccountName: httpbin
      containers:
      - image: docker.io/mccutchen/go-httpbin
        imagePullPolicy: IfNotPresent
        name: httpbin
        ports:
        - containerPort: 8080
```
