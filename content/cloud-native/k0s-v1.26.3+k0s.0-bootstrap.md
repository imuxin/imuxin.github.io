# K0S bootstrap in ubuntu

## Prerequisite

1. Prepare an OS, here ubuntu-jammy is used.

2. Download k0s exec binary and airgap image bundle, here [release(v1.26.3+k0s.0)](https://github.com/k0sproject/k0s/releases/tag/v1.26.3%2Bk0s.0) is used.

3. Download `kubectl` client for operating kubernetes api, more details see [official doc](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/).

   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   ```

4. Install `vim` `tar` `bash-completion` tools.

   exec `sudo apt install vim tar bash-completion -y`


## Configure

### Step1: Move exec files to $PATH folder.

   ```bash
   # handle airgap image file
   sudo mkdir -p /var/lib/k0s/images/
   sudo cp k0s-airgap-bundle-v1.26.3+k0s.0-amd64.tar /var/lib/k0s/images/bundle_file

   sudo mv k0s-v1.26.3+k0s.0-amd64 /usr/bin/k0s
   sudo mv kubectl /usr/local/bin/

   sudo chmod +x /usr/local/bin/kubectl
   sudo chmod +x /usr/bin/k0s
   ```

### Step2: Command auto completion

   Copy the following script and append to ~/.bashrc file.

   ```bash
   # k0s auto-completion
   source <(sudo k0s completion bash)

   # kubectl auto-completion
   export KUBECONFIG=~/.kube/config
   source <(kubectl completion bash)
   alias k=kubectl
   complete -F __start_kubectl k

   alias nerdctl="sudo nerdctl"
   alias k0s="sudo k0s"
   ```

   Activate ".bashrc" by execute `. ~/.bashrc`

### Step3: Config nerdctl.toml

   Download nerdctl binary from github:[containerd/nerdctl](https://github.com/containerd/nerdctl/releases).

   ```bash
   sudo mkdir -p /etc/nerdctl/ && \
   sudo tee /etc/nerdctl/nerdctl.toml <<EOF
   debug             = false
   debug_full        = false
   address           = "unix:///run/k0s/containerd.sock"
   namespace         = "k8s.io"
   cgroup_manager    = "cgroupfs"
   insecure_registry = true
   EOF
   ```

### Step4: Setup https proxy for downloading images

⚠️ 注意：以下配置在 Istio Ambient 模式下会引起 Pod 无法运行，原因是 istio-cni 调用 kube-apiserver 请求会被代理劫持

```bash
sudo mkdir -p /etc/systemd/system/k0scontroller.service.d
sudo tee -a /etc/systemd/system/k0scontroller.service.d/http-proxy.conf <<EOF
[Service]
Environment=CONTAINERD_HTTPS_PROXY=http://10.0.0.1:1081
EOF
```

## Start master

use `sudo k0s config create` to output default config.

- (optional): custom your CNI configuration

   ```diff
   @@ -135,7 +97,7 @@ spec:
            konnectivityServerBindPort: 7132
         type: EnvoyProxy
      podCIDR: 10.244.0.0/16
   -    provider: kuberouter
   +    provider: custom
      serviceCIDR: 10.96.0.0/12
      scheduler: {}
      storage:
   ```

   > You can opt-out of having k0s manage the network setup and choose instead to use any network plugin that adheres to the CNI specification. To do so, configure custom as the network provider in the k0s configuration file (k0s.yaml). You can do this, for example, by pushing network provider manifests into **/var/lib/k0s/manifests**, from where k0s controllers will collect them for deployment into the cluster (for more information, refer to Manifest Deployer.
   >
   > Link to the official k0s doc: https://docs.k0sproject.io/

   As you can see the tutorial to deploy your custom cni, here give an example to deploy [kindnet](https://github.com/aojea/kindnet/tree/master) cni:

   ```bash
   # prepare kindnet manifests
   sudo mkdir -p /var/lib/k0s/manifests/kindnet
   sudo curl -L# https://raw.githubusercontent.com/aojea/kindnet/master/install-kindnet.yaml > /var/lib/k0s/manifests/kindnet/install-kindnet.yaml

   # download cni binaries in the folder `/opt/cni/bin/`
   export ARCH="amd64"
   export CNI_VERSION="v1.3.0"
   export CNI_TARBALL="${CNI_VERSION}/cni-plugins-linux-${ARCH}-${CNI_VERSION}.tgz"
   export CNI_URL="https://github.com/containernetworking/plugins/releases/download/${CNI_TARBALL}"
   curl -L# --retry 5 --output /tmp/cni.tgz "${CNI_URL}"
   mkdir -p /opt/cni/bin
   tar -C /opt/cni/bin -xzf /tmp/cni.tgz
   rm -rf /tmp/cni.tgz
   ```

- (*required): deploy k0s

   ```bash
   # install k0s controller
   sudo k0s install controller -c k0s.yaml --enable-worker --no-taints
   ## if you want to deploy single node, just append "--single" at the end

   # start service
   sudo k0s start
   ```

After k0s started, generate kubeconfig into ~/.kube/config

```bash
# export kube config
mkdir ~/.kube
sudo k0s kubeconfig admin > ~/.kube/config
```

## Start a worker node

```
sudo k0s token create --role=worker > token-file
sudo k0s install worker --token-file /path/to/token/file
sudo k0s start
```

## Verify

Check **k0scontroller** systemd service status is **running** by using `systemctl status k0scontroller.service`.

```bash
$ kubectl get pod -A (single node with default CNI)

>>> output is

NAMESPACE     NAME                              READY   STATUS    RESTARTS   AGE
kube-system   coredns-7bf57bcbd8-kp7r6          1/1     Running   0          103m
kube-system   kube-proxy-pp6sh                  1/1     Running   0          103m
kube-system   kube-router-bvhwt                 1/1     Running   0          103m
kube-system   metrics-server-7446cc488c-fsfwn   1/1     Running   0          103m

$ kubectl get node

>>> output is

NAME     STATUS   ROLES           AGE   VERSION
master   Ready    control-plane   47h   v1.26.3+k0s
node     Ready    <none>          83m   v1.26.3+k0s

$ kubectl get po -n kube-system

>>> output is

k get po -n kube-system
NAME                              READY   STATUS    RESTARTS      AGE
coredns-7bf57bcbd8-6s927          1/1     Running   2 (12h ago)   47h
coredns-7bf57bcbd8-qml76          1/1     Running   0             83m
kindnet-kd8gd                     1/1     Running   0             77m
kindnet-lzjrz                     1/1     Running   0             74m
konnectivity-agent-dlf95          1/1     Running   2 (12h ago)   47h
konnectivity-agent-l7725          1/1     Running   0             84m
kube-proxy-8648m                  1/1     Running   0             84m
kube-proxy-zxhpf                  1/1     Running   2 (12h ago)   47h
metrics-server-7446cc488c-bbl2f   1/1     Running   2 (12h ago)   47h
```
