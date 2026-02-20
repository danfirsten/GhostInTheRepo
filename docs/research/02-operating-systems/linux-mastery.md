# Linux Mastery — The Complete Reference

> Linux is not just an OS. It's the foundation of the entire modern internet. Mastering it is mastering your craft.

---

## Linux Architecture

```
User Applications
     ↓
System Call Interface (glibc / syscall layer)
     ↓
Linux Kernel
  ├── Process Scheduler
  ├── Memory Manager (VM)
  ├── Virtual File System (VFS)
  ├── Network Stack
  ├── Device Drivers
  └── Architecture-specific code
     ↓
Hardware (CPU, RAM, Disk, NIC)
```

### Kernel Space vs User Space
- **User space**: processes run with restricted privileges (rings 3)
- **Kernel space**: OS kernel runs with full hardware access (ring 0)
- Transition: system call → CPU switches mode, saves context, enters kernel
- `syscall` instruction on x86-64

---

## Essential Commands Reference

### Navigation & Files
```bash
pwd                    # Print working directory
ls -la                 # List all (including hidden), long format
ls -lhS                # Sort by size, human-readable
cd -                   # Go to previous directory
pushd /path; popd      # Directory stack
find / -name "*.log" -mtime -7   # Files modified < 7 days ago
find . -type f -size +100M       # Files > 100MB
locate filename        # Fast indexed search (updatedb to refresh)
which python3          # Locate binary in PATH
whereis gcc            # Find binary, source, manual
type ls                # What is 'ls' (alias, builtin, etc.)
```

### File Operations
```bash
cp -av src/ dst/       # Copy with archive (preserve attrs) + verbose
mv -i file1 file2      # Move with interactive (ask before overwrite)
rm -rf dir/            # Remove recursively force (DANGEROUS)
ln -s /target /link    # Symbolic link
ln /hard/target /link  # Hard link (same inode)
touch file             # Create empty or update timestamp
stat file              # Detailed file metadata (inode, size, dates)
file binary            # Determine file type
```

### Permissions
```
-rwxr-xr--  1  owner  group  size  date  name
 ^^^         u  g  o
 |||
 ||└── other (world)
 |└─── group
 └──── user (owner)
```

Permission bits: r=4, w=2, x=1
```bash
chmod 755 file         # rwxr-xr-x
chmod u+x,g-w file     # Symbolic mode
chmod -R 644 dir/      # Recursive
chown user:group file  # Change owner
chown -R www-data:www-data /var/www
umask 022              # Default permissions mask (files = 644, dirs = 755)

# Special bits
chmod u+s binary       # SUID: runs as file owner (e.g., passwd)
chmod g+s dir/         # SGID: new files inherit group
chmod +t dir/          # Sticky bit: only owner can delete (e.g., /tmp)
```

### Process Management
```bash
ps aux                 # All processes (BSD syntax)
ps -ef                 # All processes (UNIX syntax)
pgrep nginx            # Find PID by name
pkill -HUP nginx       # Send signal by name
kill -9 PID            # SIGKILL — force kill
kill -15 PID           # SIGTERM — graceful shutdown
kill -1 PID            # SIGHUP — reload config
killall chrome         # Kill all by name

top                    # Real-time process viewer
htop                   # Better top (install separately)
iotop                  # I/O per process
atop                   # Advanced resource monitor

nice -n 10 command     # Start with lower priority (+19=lowest, -20=highest)
renice 10 -p PID       # Change priority of running process

nohup command &        # Immune to SIGHUP (terminal close)
disown %1              # Remove job from shell's job table
jobs                   # List background jobs
fg %1                  # Bring job to foreground
bg %1                  # Send to background
```

### System Information
```bash
uname -a               # Kernel version, architecture
hostname               # System hostname
uptime                 # How long running + load average
lscpu                  # CPU details
lsmem                  # Memory details
lsblk                  # Block devices
lspci                  # PCI devices
lsusb                  # USB devices
df -h                  # Disk usage (human readable)
du -sh /var/log/       # Directory size
free -h                # Memory usage
vmstat 1               # Virtual memory stats every 1s
iostat -x 1            # I/O stats per device
ss -tlnp               # Socket stats (replacement for netstat)
netstat -tlnp          # Open ports (legacy)
ip addr show           # Network interfaces (replacement for ifconfig)
ip route show          # Routing table
```

### Text Processing Power Tools
```bash
grep -r "pattern" .         # Recursive grep
grep -E "regex+" file       # Extended regex
grep -v "exclude" file      # Invert match
grep -c "pattern" file      # Count matches
grep -n "pattern" file      # Show line numbers
grep -A3 -B3 "pattern" file # Context (3 lines after + before)

awk '{print $2}' file           # Print 2nd field
awk -F: '{print $1}' /etc/passwd # Custom delimiter
awk '/pattern/{sum+=$3} END{print sum}' file  # Sum column
awk 'NR==5' file                # Print line 5
awk 'NR>=5 && NR<=10' file      # Lines 5-10

sed 's/old/new/g' file          # Replace all
sed -i.bak 's/old/new/g' file   # In-place with backup
sed -n '5,10p' file             # Print lines 5-10
sed '/pattern/d' file           # Delete matching lines
sed 's/^/  /' file              # Indent all lines

sort -k2 -n file               # Sort by field 2 numerically
sort -u file                   # Sort and deduplicate
uniq -c                        # Count consecutive duplicates
wc -l file                     # Count lines
wc -w file                     # Count words
cut -d: -f1,7 /etc/passwd      # Cut fields 1 and 7
tr 'a-z' 'A-Z'                 # Translate (uppercase)
tr -d '\r'                     # Delete carriage returns
paste file1 file2              # Merge files side by side
join file1 file2               # Join on common field
```

### Compression & Archives
```bash
tar -czf archive.tar.gz dir/     # Create gzip tarball
tar -cjf archive.tar.bz2 dir/    # Create bzip2 tarball
tar -cJf archive.tar.xz dir/     # Create xz tarball (best ratio)
tar -xzf archive.tar.gz          # Extract gzip tarball
tar -xzf archive.tar.gz -C /tmp/ # Extract to specific dir
tar -tzf archive.tar.gz          # List contents

gzip file          # Compress (replaces file with .gz)
gzip -k file       # Compress, keep original
gunzip file.gz     # Decompress
zcat file.gz       # Read without decompressing

zip -r archive.zip dir/
unzip archive.zip
unzip -l archive.zip   # List contents

# One-liner: create encrypted zip
zip -er secret.zip sensitive/
```

### Networking Commands
```bash
curl -I https://example.com           # HTTP headers only
curl -L -o file.zip URL               # Follow redirects, save as file
curl -X POST -H "Content-Type: application/json" -d '{"key":"val"}' URL
wget -q -O - URL | grep something     # Quiet download, pipe to grep

ssh user@host                         # Basic SSH
ssh -p 2222 user@host                 # Custom port
ssh -i ~/.ssh/key.pem user@host       # Specify key
ssh -L 8080:localhost:80 user@host    # Local port forward
ssh -R 9090:localhost:3000 user@host  # Remote port forward
ssh -D 1080 user@host                 # SOCKS proxy
ssh -N -f -L 5432:db-host:5432 bastion  # Background tunnel

scp file.txt user@host:/remote/path   # Copy to remote
scp -r dir/ user@host:/remote/        # Recursive copy
rsync -avz --progress src/ user@host:dst/   # Sync with progress
rsync -avz --delete src/ dst/              # Mirror (delete extra)

ping -c 4 host                        # ICMP ping
traceroute host                       # Trace route (ICMP/UDP)
mtr host                              # Live traceroute (better)
nmap -p 1-65535 host                  # Port scan
nmap -sV host                         # Service version detection
dig example.com                       # DNS lookup
dig @8.8.8.8 example.com             # Specific DNS server
dig example.com MX                   # MX records
nslookup example.com                 # Simple DNS lookup
```

---

## File System Structure

```
/                   Root
├── bin/            Essential user commands (ls, cp, etc.)
├── sbin/           System admin commands (fdisk, iptables)
├── etc/            Configuration files
├── var/            Variable data (logs, spool, databases)
│   ├── log/        Log files
│   ├── www/        Web server files
│   └── lib/        Application state
├── tmp/            Temporary files (cleared on boot)
├── home/           User home directories
├── root/           Root user home
├── usr/            User programs (secondary hierarchy)
│   ├── bin/        Non-essential user commands
│   ├── lib/        Libraries
│   ├── local/      Locally compiled software
│   └── share/      Architecture-independent data
├── lib/            Essential shared libraries
├── proc/           Virtual FS — kernel/process info
├── sys/            Virtual FS — kernel & device info
├── dev/            Device files
│   ├── null        Null device (discard output)
│   ├── zero        Zero device (source of zeros)
│   ├── random      Random data (blocking)
│   ├── urandom     Random data (non-blocking)
│   ├── sda         First SCSI/SATA disk
│   └── tty         Terminal
├── mnt/            Mount points (manual)
├── media/          Auto-mount points (USB, CD)
├── opt/            Optional software packages
└── boot/           Kernel, bootloader files
```

### /proc Virtual File System
```bash
cat /proc/cpuinfo        # CPU details
cat /proc/meminfo        # Memory stats
cat /proc/loadavg        # Load averages + running processes
cat /proc/net/tcp        # TCP connections
cat /proc/version        # Kernel version
cat /proc/mounts         # Mounted filesystems
cat /proc/self/maps      # Current process memory map
cat /proc/$PID/cmdline   # Command of process
cat /proc/$PID/fd/       # Open file descriptors
ls -la /proc/$PID/fd/    # Show what files are open
```

### /sys Virtual File System
```bash
cat /sys/block/sda/size        # Disk size in 512-byte blocks
cat /sys/class/net/eth0/speed  # Network interface speed
echo 1 > /sys/block/sda/queue/rotational  # Mark disk as non-rotational
cat /sys/kernel/mm/transparent_hugepage/enabled
```

---

## Users, Groups & Authentication

```bash
# User management
useradd -m -s /bin/bash -G sudo username   # Create user
usermod -aG docker username                 # Add to group
userdel -r username                         # Delete + remove home
passwd username                             # Set password
chage -l username                           # Password aging info
id username                                 # UID, GID, groups
who                                         # Logged in users
w                                           # Detailed who + activity
last                                        # Login history
lastb                                       # Failed logins

# /etc/passwd format
username:x:UID:GID:comment:home:shell
root:x:0:0:root:/root:/bin/bash

# /etc/shadow: actual encrypted passwords
# /etc/group: group definitions

# sudo
sudo command                    # Run as root
sudo -u postgres psql           # Run as specific user
sudo -i                         # Root shell with env
visudo                          # Edit sudoers safely

# PAM (Pluggable Authentication Modules)
# /etc/pam.d/ — per-service auth config
# Enables 2FA, LDAP, etc.
```

---

## Systemd (Modern Init System)

```bash
# Service management
systemctl start nginx
systemctl stop nginx
systemctl restart nginx
systemctl reload nginx         # Reload config without downtime
systemctl status nginx
systemctl enable nginx         # Auto-start on boot
systemctl disable nginx
systemctl is-active nginx
systemctl is-enabled nginx

# System control
systemctl list-units --type=service
systemctl list-units --failed
systemctl daemon-reload        # Reload unit files
systemctl reboot
systemctl poweroff
systemctl rescue               # Single-user mode
systemctl emergency

# Journalctl — log viewing
journalctl -u nginx            # Logs for nginx service
journalctl -u nginx -f         # Follow (tail)
journalctl -u nginx --since "1 hour ago"
journalctl -p err              # Only errors
journalctl -b                  # Logs since last boot
journalctl --disk-usage
journalctl --vacuum-time=7d    # Clean old logs

# Unit file example
cat > /etc/systemd/system/myapp.service << EOF
[Unit]
Description=My Application
After=network.target

[Service]
Type=simple
User=myuser
WorkingDirectory=/opt/myapp
ExecStart=/opt/myapp/bin/server
Restart=on-failure
RestartSec=5s
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

---

## Package Management

### Debian/Ubuntu (APT)
```bash
apt update                          # Refresh package lists
apt upgrade                         # Upgrade all packages
apt full-upgrade                    # Also remove obsolete packages
apt install package
apt remove package                  # Keep config files
apt purge package                   # Remove config too
apt autoremove                      # Remove unused dependencies
apt search keyword
apt show package                    # Package details
apt list --installed
apt list --upgradeable
dpkg -l                             # List installed packages
dpkg -i package.deb                 # Install .deb file
dpkg -L package                     # List installed files
dpkg -S /usr/bin/ls                 # Which package owns a file
```

### RHEL/CentOS/Fedora (DNF/YUM)
```bash
dnf update
dnf install package
dnf remove package
dnf search keyword
dnf info package
dnf list installed
rpm -qa                             # List all installed RPMs
rpm -qi package                     # Package info
rpm -ql package                     # Package file list
rpm -qf /usr/bin/ls                 # Which package owns file
```

### Arch Linux (Pacman)
```bash
pacman -Syu                         # Update system
pacman -S package                   # Install
pacman -R package                   # Remove
pacman -Rs package                  # Remove with dependencies
pacman -Ss keyword                  # Search
pacman -Qi package                  # Package info
pacman -Ql package                  # Package files
```

---

## Disk Management

```bash
# Partitioning
fdisk -l                     # List disks
fdisk /dev/sdb               # Partition disk
parted /dev/sdb              # More features (GPT support)
gdisk /dev/sdb               # GPT partitioner

# Filesystems
mkfs.ext4 /dev/sdb1          # Create ext4
mkfs.xfs /dev/sdb1           # Create XFS
mkfs.btrfs /dev/sdb1         # Create Btrfs
tune2fs -l /dev/sdb1         # Filesystem info
e2fsck /dev/sdb1             # Check/repair ext4

# Mounting
mount /dev/sdb1 /mnt/data    # Mount
umount /mnt/data             # Unmount
mount | column -t            # Show mounts formatted
findmnt                      # Tree view of mounts

# /etc/fstab
UUID=xxx /mnt/data ext4 defaults,nofail 0 2

# LVM (Logical Volume Manager)
pvcreate /dev/sdb            # Physical volume
vgcreate vg_data /dev/sdb    # Volume group
lvcreate -L 50G -n lv_home vg_data  # Logical volume
mkfs.ext4 /dev/vg_data/lv_home
# Resize:
lvextend -L +10G /dev/vg_data/lv_home
resize2fs /dev/vg_data/lv_home

# Monitoring
iotop -o              # Active I/O only
iostat -x 1           # Extended I/O stats
hdparm -t /dev/sda    # Disk read speed test
dd if=/dev/zero of=/tmp/test bs=1M count=1000 # Write speed test
```

---

## Networking Configuration

```bash
# Modern: iproute2
ip link show                    # Network interfaces
ip addr add 192.168.1.10/24 dev eth0  # Add IP
ip route add default via 192.168.1.1  # Default gateway
ip route show
ip neigh show                   # ARP table

# Firewall (nftables / iptables)
iptables -L -v -n               # List rules verbose
iptables -A INPUT -p tcp --dport 22 -j ACCEPT  # Allow SSH
iptables -A INPUT -j DROP       # Drop everything else
iptables-save > /etc/iptables/rules.v4    # Persist

# nftables (modern replacement)
nft list ruleset
nft add rule inet filter input tcp dport 443 accept

# ufw (Ubuntu Firewall — iptables frontend)
ufw status
ufw allow 22
ufw allow 80/tcp
ufw deny 23
ufw enable

# Network namespaces (used by Docker/containers)
ip netns add myns
ip netns exec myns ip link show
ip netns list
```

---

## Performance Tuning

### Kernel Parameters (sysctl)
```bash
sysctl -a | grep net.core           # View all net params
sysctl net.ipv4.ip_forward          # Check IP forwarding
sysctl -w net.ipv4.ip_forward=1     # Enable temporarily
# Persist in /etc/sysctl.d/99-custom.conf

# Key networking parameters
net.core.somaxconn = 65535          # Max connection backlog
net.ipv4.tcp_max_syn_backlog = 65535
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.ip_local_port_range = 10000 65535

# Memory
vm.swappiness = 10                  # Less aggressive swapping
vm.dirty_ratio = 15                 # % memory for dirty pages
vm.overcommit_memory = 1            # Allow memory overcommit

# File descriptors
fs.file-max = 2097152               # System-wide fd limit
ulimit -n 65535                     # Per-process fd limit (shell)
# Persist in /etc/security/limits.conf
```

### CPU Performance
```bash
# CPU frequency scaling
cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor
echo performance > /sys/devices/system/cpu/cpu0/cpufreq/scaling_governor

# CPU affinity
taskset -c 0,1 command    # Pin to CPUs 0 and 1
taskset -p 0x3 PID        # Set affinity by mask

# Interrupt affinity
cat /proc/interrupts
echo 0 > /proc/irq/24/smp_affinity  # Pin IRQ to CPU 0

# Disable NUMA balancing for latency-sensitive apps
echo 0 > /proc/sys/kernel/numa_balancing
```

---

## Security Hardening

```bash
# SSH hardening (/etc/ssh/sshd_config)
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
Port 2222                   # Non-standard port
AllowUsers alice bob
MaxAuthTries 3

# Generate SSH key pair
ssh-keygen -t ed25519 -C "user@host"   # Ed25519 (modern)
ssh-keygen -t rsa -b 4096              # RSA 4096-bit

# Fail2ban (auto-ban IPs with failed logins)
fail2ban-client status
fail2ban-client status sshd
fail2ban-client set sshd unbanip IP

# SELinux (RHEL/CentOS)
getenforce                    # Enforcing/Permissive/Disabled
setenforce 1                  # Enable enforcement
sestatus                      # Full status
ausearch -m avc -ts recent    # Recent denials

# AppArmor (Ubuntu)
aa-status
aa-enforce /etc/apparmor.d/usr.bin.nginx
aa-complain /etc/apparmor.d/usr.bin.nginx

# Audit
auditctl -l                   # List rules
auditctl -w /etc/passwd -p wa -k passwd_changes
ausearch -k passwd_changes
```

---

## Cron & Scheduling

```bash
crontab -l               # List current user's cron jobs
crontab -e               # Edit cron jobs
crontab -u user -l       # List another user's crons

# Cron syntax: min hour dom mon dow command
# * = any, */5 = every 5, 1-5 = range, 1,3,5 = list
0 * * * *     /path/script.sh     # Every hour
0 0 * * *     /path/script.sh     # Daily at midnight
0 0 * * 0     /path/script.sh     # Every Sunday
*/5 * * * *   /path/script.sh     # Every 5 minutes
@reboot       /path/script.sh     # On boot
@daily        /path/script.sh     # Same as 0 0 * * *

# System cron
/etc/cron.d/          # Drop-in cron files
/etc/cron.daily/      # Daily scripts
/etc/cron.hourly/     # Hourly scripts
/etc/cron.weekly/
/etc/cron.monthly/

# Systemd timers (modern alternative)
# myapp.timer + myapp.service
```

---

*Linux is a superpower. Every hour spent here compounds forever.*
