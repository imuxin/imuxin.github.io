# K0S bootstrap in ubuntu

## Prerequisite

1. Prepare an OS, here ubuntu-jammy is used.

2. Download k0s exec binary and airgap image bundle, here [release(v1.26.3+k0s.0)](https://github.com/k0sproject/k0s/releases/tag/v1.26.3%2Bk0s.0) is used.

3. Download `kubectl` client for operating kubernetes api, more details see [official doc](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/).

   ```bash
   curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
   ```

4. Install `vim` `tar` `bash-completion` tools.

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
   # handle airgap image file
   sudo mkdir -p /var/lib/k0s/images/
   sudo cp k0s-airgap-bundle-v1.26.3+k0s.0-amd64 /var/lib/k0s/images/bundle_file

   sudo mv k0s-v1.26.3+k0s.0-amd64 /usr/bin/k0s
   sudo mv kubectl /usr/local/bin/

   sudo chmod +x /usr/local/bin/kubectl
   sudo chmod +x /usr/bin/k0s
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

## Start k0s

use `sudo k0s config create` to output default config.

```bash
# install k0s controller
sudo k0s install controller -c k0s.yaml --enable-worker --single

# start service
sudo k0s start
```

After k0s started, generate kubeconfig into ~/.kube/config

```
# export kube config
mkdir ~/.kube
sudo k0s kubeconfig admin > ~/.kube/config
```

## Verify

Check **k0scontroller** systemd service status is **running** by using `systemctl status k0scontroller.service`.

```bash
kubectl get pod -A

>>> output is

NAMESPACE     NAME                              READY   STATUS    RESTARTS   AGE
kube-system   coredns-7bf57bcbd8-kp7r6          1/1     Running   0          103m
kube-system   kube-proxy-pp6sh                  1/1     Running   0          103m
kube-system   kube-router-bvhwt                 1/1     Running   0          103m
kube-system   metrics-server-7446cc488c-fsfwn   1/1     Running   0          103m
```
