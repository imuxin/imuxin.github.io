# How to bootstrap a kubernetes by using k0s

## Prerequisite

1. Prepare an OS, here centos is used.
2. Disable firewall [required]

   ```sh
   sudo systemctl stop firewalld
   sudo systemctl disable firewalld
   ```

3. Download k0s exec binary and airgap image bundle, here [v1.23.5+k0s.0](https://github.com/k0sproject/k0s/releases/tag/v1.23.5%2Bk0s.0) is used.
4. Download `nerdctl` client for operating containerd, here [v1.18.0](https://github.com/containerd/nerdctl/releases/tag/v0.18.0) is used.
5. Download `kubectl` client for operating kubernetes api, more details see [official doc](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/).

   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   ```
6. Please **disable** selinux, which may cause *permission denied* error.

   step1: `sudo setenforce 0`

   step2: edit `/etc/selinux/config` to set "SELINUX=~~enforcing~~disabled"

7. Install `vim` `tar` `bash-completion` tools.

   exec `yum install vim tar bash-completion -y`


## Configure

### Step1: Command auto completion

   Copy the following script and append to ~/.bashrc file.
   ```bash
   # k0s auto-completion
   source <(k0s completion bash)

   # kubectl auto-completion
   export KUBECONFIG=~/.kube/config
   source <(kubectl completion bash)
   alias k=kubectl
   complete -F __start_kubectl k
   ```

### Step2: Move exec files to $PATH folder.

   ```bash
   mv k0s-v1.23.5+k0s.0-amd64 /usr/bin/k0s

   # handle airgap image file
   mkdir -p /var/lib/k0s/images/
   cp k0s-airgap-bundle-v1.23.5+k0s.0-amd64 /var/lib/k0s/images/bundle_file

   chmod +x nerdctl && mv nerdctl /usr/local/bin/
   chmod +x kubectl && mv kubectl /usr/local/bin/
   ```

### Step3: Config nerdctl.toml

   ```bash
   mkdir -p /etc/nerdctl/ && \
   tee /etc/nerdctl/nerdctl.toml <<EOF
   debug          = false
   debug_full     = false
   address        = "unix:///run/k0s/containerd.sock"
   namespace      = "k8s.io"
   cgroup_manager = "cgroupfs"
   EOF
   ```

### Step4: Load iptable_nat kernal module

```bash
modprobe br_netfilter ; modprobe nf_nat ; modprobe xt_REDIRECT ; modprobe xt_owner; modprobe iptable_nat; modprobe iptable_mangle; modprobe iptable_filter
```

## Start k0s

```bash
k0s install controller -c k0s.yaml --enable-worker --single

k0s start
```

After k0s started, generate kubeconfig into ~/.kube/config

```
# export kube config
mkdir ~/.kube
k0s kubeconfig admin > ~/.kube/config
```

## Verify

Check **k0scontroller** systemd service status is **running** by using `systemctl status k0scontroller.service`.

```bash
kubectl get pod -A

>>> output is

NAMESPACE     NAME                       READY   STATUS    RESTARTS   AGE
kube-system   coredns-8565977d9b-hq9bm   1/1     Running   0          45m
kube-system   konnectivity-agent-f7jbl   1/1     Running   0          45m
kube-system   kube-proxy-c9kp8           1/1     Running   0          45m
kube-system   kube-router-rb82x          1/1     Running   0          45m
```

> ps. I have deleted metrics-server deployment and service here.

## Appendix

sample k0s.yaml file:

```yaml
apiVersion: k0s.k0sproject.io/v1beta1
kind: ClusterConfig
metadata:
  creationTimestamp: null
  name: k0s
spec:
  api:
    address: 10.0.2.15
    k0sApiPort: 9443
    port: 6443
    sans:
    - 10.0.2.15
    - fe80::a00:27ff:fefc:727c
    - fe80::a00:27ff:fed9:229a
    tunneledNetworkingMode: false
  controllerManager: {}
  extensions:
    helm:
      charts: null
      repositories: null
    storage:
      create_default_storage_class: false
      type: external_storage
  images:
    calico:
      cni:
        image: docker.io/calico/cni
        version: v3.21.2
      kubecontrollers:
        image: docker.io/calico/kube-controllers
        version: v3.21.2
      node:
        image: docker.io/calico/node
        version: v3.21.2
    coredns:
      image: k8s.gcr.io/coredns/coredns
      version: v1.7.0
    default_pull_policy: IfNotPresent
    konnectivity:
      image: quay.io/k0sproject/apiserver-network-proxy-agent
      version: 0.0.30-k0s
    kubeproxy:
      image: k8s.gcr.io/kube-proxy
      version: v1.23.5
    kuberouter:
      cni:
        image: docker.io/cloudnativelabs/kube-router
        version: v1.3.2
      cniInstaller:
        image: quay.io/k0sproject/cni-node
        version: 0.1.0
    metricsserver:
      image: k8s.gcr.io/metrics-server/metrics-server
      version: v0.5.2
  installConfig:
    users:
      etcdUser: etcd
      kineUser: kube-apiserver
      konnectivityUser: konnectivity-server
      kubeAPIserverUser: kube-apiserver
      kubeSchedulerUser: kube-scheduler
  konnectivity:
    adminPort: 8133
    agentPort: 8132
  network:
    calico:
      mode: vxlan
      vxlanPort: 4789
      vxlanVNI: 4096
      mtu: 1450
      wireguard: false
      flexVolumeDriverPath: /usr/libexec/k0s/kubelet-plugins/volume/exec/nodeagent~uds
      withWindowsNodes: false
      overlay: Always
    dualStack: {}
    kubeProxy:
      mode: iptables
    kuberouter: null
    podCIDR: 10.244.0.0/16
    provider: calico
    serviceCIDR: 10.96.0.0/12
  podSecurityPolicy:
    defaultPolicy: 00-k0s-privileged
  scheduler: {}
  storage:
    etcd:
      externalCluster: null
      peerAddress: 10.0.2.15
    type: etcd
  telemetry:
    enabled: true
status: {}
```
