# How to bootstrap a kubernetes by using k0s

## Prerequisite

1. Prepare an OS, here centos is used.
1. Download k0s exec binary and airgap image bundle, here [v1.23.5+k0s.0](https://github.com/k0sproject/k0s/releases/tag/v1.23.5%2Bk0s.0) is used.
1. Download `nerdctl` client for operating containerd, here [v1.18.0](https://github.com/containerd/nerdctl/releases/tag/v0.18.0) is used.
1. Download `kubectl` client for operating kubernetes api, here [official doc](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/) used.

   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   ```
1. Please **disable** selinux, which may cause *permission denied* error.

   step1: `sudo setenforce 0`

   step2: edit `/etc/selinux/config` to set "SELINUX=~~enforcing~~disabled"

1. Install `vim` `tar` `bash-completion` tools.

   exec `yum install vim tar bash-completion -y`


## Configure

1. Auto completion

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

1. Move exec files to $PATH folder.

   ```bash
   mv k0s-v1.23.5+k0s.0-amd64 /usr/bin/k0s

   # handle airgap image file
   mkdir /var/lib/k0s/images/bundle_file
   cp k0s-airgap-bundle-v1.23.5+k0s.0-amd64 /var/lib/k0s/images/bundle_file

   mv nerdctl /usr/local/bin/

   # export kube config
   k0s kubeconfig admin > ~/.kube/config
   mv kubectl /usr/local/bin/
   ```

## Start k0s

```bash
k0s install controller -c k0s.yaml --enable-worker --single
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
