# All things Linux containers

> Copied from http://containerz.info, [source code](https://github.com/mhausenblas/containerz.info).

A container a day keeps the pager away!

This little website here is dedicated to the documentation of Linux containers. As mentioned [elsewhere](https://articles.microservices.com/containers-are-a-lie-2521afda1f81), in a sense there are no containers per se, but Linux kernel features such as namespaces and cgroups that are bundled and used in different ways to provide an abstraction we call `container`. Examples of this bundling are Docker, CoreOS [appc](https://github.com/appc/spec/), OCI [runc](https://runc.io/), Canonical [LXC/LXD](https://linuxcontainers.org/), and [OpenVZ](https://openvz.org/).

## Terminology

Conceptually, a Linux container is made up of three things:

- [namespaces](http://containerz.info/#namespaces)  for providing compute isolation
- [cgroups](http://containerz.info/#cgroups)  for resource consumption throttling and resource consumption accounting
- copy-on-write  [filesystems](http://containerz.info/#filesystems)  for state

A container's core is a process (group). The ER diagram for namespaces, cgroups and process (groups) looks as follows:

![](n-p-c.png)

Read above ER diagram as: a process (group) can be in one or more namespaces and can be controlled by one or more cgroups

## Linux namespaces

[namespaces](http://man7.org/linux/man-pages/man7/namespaces.7.html):

- [Mount](http://man7.org/linux/man-pages/man7/mount_namespaces.7.html)/`CLONE_NEWNS`  (since Linux 2.4.19) via  `/proc/$PID/mounts`: filesystem mount points
- [UTS](https://lwn.net/Articles/179345/)/`CLONE_NEWUTS`  (since Linux 2.6.19) via  `uname -n`,  `hostname -f`  : nodename/hostname and (NIS) domain name
- [IPC](https://lwn.net/Articles/187274/)/`CLONE_NEWIPC`  (since Linux 2.6.19) via  `/proc/sys/fs/mqueue`,  `/proc/sys/kernel`,  `/proc/sysvipc`: interprocess communication resource isolation: System V IPC objects, POSIX message queues
- [PID](https://lwn.net/Articles/259217/)/`CLONE_NEWPID`  (since Linux 2.6.24) via  `/proc/$PID/status`: process ID number space isolation: PID inside/PID outside the namespace; PID namespaces can be nested
- [Network](https://lwn.net/Articles/219794/)/`CLONE_NEWNET`  (completed in Linux 2.6.29) via  `ip netns list`,  `/proc/net`,  `/sys/class/net`: network system resources: network devices, IP addresses, IP routing tables, port numbers, etc.
- [User](https://lwn.net/Articles/528078/)/`CLONE_NEWUSER`  (completed in Linux 3.8) via  `id`,  `/proc/$PID/uid_map`,  `/proc/$PID/gid_map`: user and group ID number space isolation. UID+GIDs inside/outside the namespace
- [Cgroup](http://man7.org/linux/man-pages/man7/cgroup_namespaces.7.html)/`CLONE_NEWCGROUP`  (since Linux 4.6) via  `/sys/fs/cgroup/`,  `/proc/cgroups`,  `/proc/$PID/cgroup`: cgroups

## Linux cgroups

[cgroups](http://man7.org/linux/man-pages/man7/cgroups.7.html):

- [cpu](https://www.kernel.org/doc/Documentation/scheduler/sched-bwc.txt)/`CONFIG_CGROUP_SCHED`  (since Linux 2.6.24)
- [cpuacct](https://www.kernel.org/doc/Documentation/cgroup-v1/cpuacct.txt)/`CONFIG_CGROUP_CPUACCT`  (since Linux 2.6.24)
- [cpuset](https://www.kernel.org/doc/Documentation/cgroup-v1/cpusets.txt)/`CONFIG_CPUSETS`  (since Linux 2.6.24)
- [memory](https://www.kernel.org/doc/Documentation/cgroup-v1/memory.txt)/`CONFIG_MEMCG`  (since Linux 2.6.25)
- [devices](https://www.kernel.org/doc/Documentation/cgroup-v1/devices.txt)/`CONFIG_CGROUP_DEVICE`  (since Linux 2.6.26)
- [freezer](https://www.kernel.org/doc/Documentation/cgroup-v1/freezer-subsystem.txt)/`CONFIG_CGROUP_FREEZER`  (since Linux 2.6.28)
- [net_cls](https://www.kernel.org/doc/Documentation/cgroup-v1/net_cls.txt)/`CONFIG_CGROUP_NET_CLASSID`  (since Linux 2.6.29)
- [blkio](https://www.kernel.org/doc/Documentation/cgroup-v1/blkio-controller.txt)/`CONFIG_BLK_CGROUP`  (since Linux 2.6.33)
- [perf_event](https://git.kernel.org/cgit/linux/kernel/git/torvalds/linux.git/plain/tools/perf/Documentation/perf-record.txt)/`CONFIG_CGROUP_PERF`  (since Linux 2.6.39)
- [net_prio](https://www.kernel.org/doc/Documentation/cgroup-v1/net_prio.txt)/`CONFIG_CGROUP_NET_PRIO`  (since Linux 3.3)
- [hugetlb](https://www.kernel.org/doc/Documentation/cgroup-v1/hugetlb.txt)/`CONFIG_CGROUP_HUGETLB`  (since Linux 3.5)
- [pids](https://www.kernel.org/doc/Documentation/cgroup-v1/pids.txt)/`CONFIG_CGROUP_PIDS`  (since Linux 4.3)

## COW filesystems

- [AUFS](http://aufs.sourceforge.net/)
- [btrfs](https://btrfs.wiki.kernel.org/)
- [Overlay Filesystem](https://www.kernel.org/doc/Documentation/filesystems/overlayfs.txt)
- [Unionfs](http://unionfs.filesystems.org/)
- [ZFS](http://zfsonlinux.org/) on Linux

## Tooling

### namespaces and cgroups

- [cinf](https://github.com/mhausenblas/cinf)
- [nsenter](http://man7.org/linux/man-pages/man1/nsenter.1.html)
- [unshare](http://man7.org/linux/man-pages/man1/unshare.1.html)
- [man lsns](http://man7.org/linux/man-pages/man8/lsns.8.html)  (also: announcement  [lsns](http://karelzak.blogspot.ie/2015/12/lsns8-new-command-to-list-linux.html))
- systemd-[cgtop](https://www.freedesktop.org/software/systemd/man/systemd-cgtop.html)
- [cgroup-utils](https://github.com/peo3/cgroup-utils)
- [yadutaf/ctop](https://github.com/yadutaf/ctop)

## See also …

### namespaces and cgroups

- [The Unofficial Linux Perf Events Web-Page](http://web.eece.maine.edu/~vweaver/projects/perf_events/index.html)
- [Netdev 1.1 - Namespaces and CGroups, the basis of Linux containers](https://www.youtube.com/watch?v=zMJD8PJKoYQ), Rami Rosen, video (2016)
- [Hands on Linux sandbox with namespaces and cgroups](https://blogs.rdoproject.org/7761/hands-on-linux-sandbox-with-namespaces-and-cgroups), Tristan Cacqueray (2015)
- Namespaces in operation  [part 2: the namespaces API](https://lwn.net/Articles/531381/), Michael Kerrisk (2013)
- Namespaces in operation  [part 1: namespaces overview](https://lwn.net/Articles/531114/), Michael Kerrisk (2013)
- [Resource management: Linux kernel Namespaces and cgroups](http://www.haifux.org/lectures/299/netLec7.pdf), Rami Rosen (2013)
- [The Linux Programming Interface](http://man7.org/tlpi/), Michael Kerrisk (2010)

### filesystems

- [Docker storage drivers](https://docs.docker.com/engine/userguide/storagedriver/), Docker docs
- [Deep dive into Docker storage drivers](http://jpetazzo.github.io/assets/2015-07-01-deep-dive-into-docker-storage-drivers.html), Jérôme Petazzoni (2015)
- [THE /proc FILESYSTEM](https://www.mjmwired.net/kernel/Documentation/filesystems/proc.txt), Terrehon Bowden et al (1999 - 2009)
- [Unioning file systems: Architecture, features, and design choices](http://lwn.net/Articles/324291/), Valerie Aurora, (2009)
- [Copy-On-Write 101 – Part 1: What Is It?](http://hackerboss.com/copy-on-write-101-part-1-what-is-it/), Ville Laurikari, (2009)
