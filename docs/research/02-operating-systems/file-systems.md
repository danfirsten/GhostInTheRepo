# File Systems — Complete Reference

> File systems are the interface between persistent storage and the rest of the OS. Understanding them explains I/O performance, crash safety, and why `fsync()` matters.

---

## File System Concepts

### What a File System Does
```
File system: organizes data on storage into files and directories

Responsibilities:
  Namespace management:  path → file mapping
  Data storage:          store file content (extents/blocks)
  Metadata:              permissions, timestamps, ownership, size
  Free space tracking:   which blocks are available
  Crash consistency:     stay valid after unexpected shutdown
  Concurrency:           safe concurrent access

Storage → Block device → File system → VFS → System calls (open/read/write)
                                        ↓
                              (ext4, btrfs, xfs, NTFS, APFS...)
```

### Key Abstractions
```
Inode: metadata for a file (NOT the filename!)
  - File type (regular, directory, symlink, socket, device)
  - Permissions (rwxrwxrwx)
  - Owner (UID, GID)
  - Size in bytes
  - Timestamps: atime (access), mtime (modify), ctime (metadata change)
  - Hard link count
  - Pointers to data blocks

  # View inode details
  stat filename
  ls -i filename       # Show inode number
  df -i                # Inode usage (can run out of inodes!)

Directory: special file that maps filenames → inode numbers
  (filename, inode_number) pairs
  "." = inode of this directory
  ".." = inode of parent

Hard link: multiple directory entries pointing to same inode
  Same inode number → same file content
  Deleting one link doesn't remove file (until link count = 0)
  Cannot hard-link across file systems

Symlink: special file containing a path string
  Can cross file systems
  Broken if target deleted
  ln -s target linkname

File descriptor: process-level handle for open file
  Index into process's file descriptor table
  Points to open file description (offset, flags, inode)
  Multiple FDs can share one open file description (dup2, fork)
```

---

## ext4 — The Standard Linux File System

### Structure
```
Superblock: global FS metadata
  Total blocks, free blocks, inode count, block size, mount count, UUID

Block groups: divide disk into groups
  Each group: superblock backup | block bitmap | inode bitmap | inode table | data blocks
  Localize: keep inode and its data blocks in same group

Extents (ext4):
  Old ext3: block-mapped (list of block pointers — bad for large files)
  ext4: extents = contiguous ranges of blocks
    Inode → extent tree (B+ tree)
    Each extent: (logical_block, physical_block, length)
    Max extent: 128 MB (32K blocks × 4KB)
    Reduces metadata, improves sequential I/O

Block sizes: 1, 2, 4 KB (default 4 KB)
  Larger blocks: fewer metadata, better for large files
  Smaller blocks: less waste for many small files
```

### Journaling
```
Problem: crash during multi-step update corrupts FS
  Example: allocate block → update inode → update bitmap
  If crash after step 1 but before steps 2-3: inconsistency

Journal (write-ahead log):
  Write intent to journal first
  If crash: replay journal on next mount → consistent state
  Journal ensures all-or-nothing for metadata updates

ext4 journal modes:
  writeback: journal metadata only, data can be written out of order
             Fastest, but might show old data in newly allocated blocks after crash
  ordered:   journal metadata, but flush data before committing metadata
             Default in ext4 — good balance
  journal:   journal both data and metadata
             Safest, but data written twice → slower

# Check journal mode
tune2fs -l /dev/sda1 | grep "Default mount options"

# Mount options for ext4
mount -o data=ordered /dev/sda1 /mnt
mount -o noatime /dev/sda1 /mnt   # Skip atime updates (faster reads)
mount -o barrier=1 /dev/sda1 /mnt  # Ensure write ordering (default)
```

### File System Tools
```bash
# Create
mkfs.ext4 /dev/sdb1
mkfs.ext4 -b 4096 -L "mydisk" /dev/sdb1

# Mount/unmount
mount /dev/sdb1 /mnt
umount /mnt

# Check and repair
fsck.ext4 /dev/sdb1         # Unmount first!
fsck.ext4 -f /dev/sdb1      # Force check
e2fsck -p /dev/sdb1         # Auto-fix

# Tune
tune2fs -l /dev/sdb1        # Show superblock info
tune2fs -c 30 /dev/sdb1     # Check every 30 mounts
tune2fs -e remount-ro /dev/sdb1  # Remount RO on errors

# Resize
resize2fs /dev/sdb1         # Resize to fill partition
resize2fs /dev/sdb1 10G     # Shrink to 10G (unmount first)

# Debug
debugfs /dev/sdb1           # Interactive FS debugger
debugfs -R "stat <2>" /dev/sdb1   # Show inode 2 (root directory)
```

---

## btrfs — The Modern Linux File System

### Features
```
Copy-on-Write (COW):
  Writes never overwrite existing data — write new blocks, update pointers
  Crash-safe by design (old version always intact)
  Enables snapshots: O(1) time and space

B-tree everything:
  All metadata (extents, inodes, dirs) in B-trees
  Self-describing: can reconstruct metadata from data

Built-in features:
  Snapshots: point-in-time copies (fast, efficient)
  Subvolumes: independent filesystem namespaces
  RAID: RAID-0, 1, 5, 6, 10 without mdadm
  Checksums: metadata and data checksummed (detects corruption)
  Compression: zlib, lzo, zstd inline compression
  Deduplication: share identical blocks
  Multiple device support
  Online resize and defrag
```

### Common btrfs Operations
```bash
# Create btrfs filesystem
mkfs.btrfs /dev/sdb1
mkfs.btrfs -d raid1 -m raid1 /dev/sdb1 /dev/sdc1  # RAID 1 across two disks

# Mount
mount /dev/sdb1 /mnt -o compress=zstd  # Enable compression

# Subvolumes (like nested filesystems)
btrfs subvolume create /mnt/home
btrfs subvolume create /mnt/root
btrfs subvolume list /mnt

# Snapshots (instant, space-efficient)
btrfs subvolume snapshot /mnt/home /mnt/home-backup-2024

# Read-only snapshot (for backups)
btrfs subvolume snapshot -r /mnt/home /mnt/home-snapshot

# Delete subvolume/snapshot
btrfs subvolume delete /mnt/home-backup-2024

# Check and repair
btrfs check /dev/sdb1            # Check filesystem
btrfs scrub start /mnt           # Verify all checksums
btrfs scrub status /mnt

# Balance (redistribute data across devices)
btrfs balance start /mnt
btrfs balance status /mnt

# Stats
btrfs filesystem df /mnt         # Space usage
btrfs filesystem show /mnt       # Device info
btrfs device stats /mnt          # Error counters

# Defragment
btrfs filesystem defragment -r /mnt  # Recursive
btrfs filesystem defragment -czstd /mnt  # Defrag + compress
```

---

## ZFS — The Enterprise File System

### ZFS Concepts
```
Pool (zpool): one or more devices
  Stripe (RAID-0), Mirror (RAID-1), RAIDZ-1/2/3, dRAID

Dataset: like subvolume in btrfs
  Filesystem: mounted at a path
  Volume (zvol): block device (for VMs, databases)
  Snapshot: read-only point-in-time
  Clone: writable snapshot

ARC (Adaptive Replacement Cache):
  RAM-based read cache
  L2ARC: optional SSD layer between RAM and disk

ZIL (ZFS Intent Log):
  Write log for crash consistency
  SLOG: dedicated fast SSD for ZIL (dramatically improves sync write performance)

Key properties:
  Copy-on-write (COW)
  End-to-end checksumming (detects silent corruption)
  Self-healing (with redundancy, auto-corrects corrupted blocks)
  Atomic transactions (always consistent)
  Snapshots and clones
  Compression (lz4, zstd, gzip)
  Deduplication (in-line, memory-intensive)
```

### ZFS Commands
```bash
# Pool management
zpool create mypool mirror /dev/sdb /dev/sdc  # Mirror pool
zpool create mypool raidz2 /dev/sd{b,c,d,e,f}  # RAIDZ-2
zpool status                    # Pool health
zpool list                      # Pool sizes
zpool iostat 1                  # I/O statistics
zpool scrub mypool              # Verify all data
zpool history mypool            # Command history

# Dataset management
zfs create mypool/data          # Create filesystem
zfs create -V 10G mypool/vol    # Create block volume

# Properties
zfs set compression=zstd mypool/data    # Enable compression
zfs set atime=off mypool/data           # Disable access time
zfs set quota=100G mypool/data          # Set quota
zfs get all mypool/data                 # All properties
zfs list -t all                         # All datasets

# Snapshots
zfs snapshot mypool/data@2024-01-01    # Create snapshot
zfs list -t snapshot                    # List snapshots
zfs rollback mypool/data@2024-01-01   # Rollback to snapshot
zfs diff mypool/data@2024-01-01 mypool/data  # What changed?

# Send/receive (for backup and replication)
zfs send mypool/data@snapshot | ssh remote zfs recv remotepool/data
zfs send -i @snap1 @snap2 mypool/data | ssh remote zfs recv -F remotepool/data

# Destroy
zfs destroy mypool/data@snapshot       # Delete snapshot
zfs destroy -r mypool/data             # Recursive destroy
```

---

## VFS (Virtual File System Layer)

### How VFS Works
```
VFS: abstraction layer enabling uniform file system interface

Application:    open("/home/user/file", O_RDONLY)
                    ↓
VFS:            look up dentry cache → find inode → call fs-specific open()
                    ↓
FS driver:      ext4_file_open() / btrfs_file_open() / etc.
                    ↓
Block layer:    submit_bio() → I/O scheduler → block device driver

Key VFS structures:
  superblock: mounted filesystem info
  inode:      file metadata
  dentry:     directory entry (name → inode cache)
  file:       open file (offset, flags)

Dentry cache (dcache):
  In-memory cache of path → inode lookups
  Makes path resolution fast (avoids disk reads)
  /proc/sys/fs/dentry-state  (size, used, etc.)

Inode cache:
  In-memory cache of file metadata
  /proc/sys/fs/inode-state

Page cache:
  File data cached in RAM
  Read: fill page cache from disk, serve from cache
  Write: write to page cache (dirty), flush to disk asynchronously
  /proc/meminfo → Cached: = page cache size
```

---

## I/O Stack and Performance

### I/O Path
```
write(fd, buf, n)
    ↓
Page cache (dirty pages accumulate)
    ↓
Writeback thread (flushes when dirty_ratio exceeded, or after dirty_expire_centisecs)
    ↓
Block layer (I/O scheduler: mq-deadline, bfq, none)
    ↓
Block device driver
    ↓
NVMe / SATA / SAS device

Important tunables:
  /proc/sys/vm/dirty_ratio         (% RAM before blocking writes, default 20)
  /proc/sys/vm/dirty_background_ratio  (% RAM before background flush starts, default 10)
  /proc/sys/vm/dirty_writeback_centisecs  (flush interval, default 500 = 5s)
  /proc/sys/vm/dirty_expire_centisecs     (age before flush, default 3000 = 30s)
```

### fsync and fdatasync
```c
#include <unistd.h>

// write() puts data in page cache (in-memory) — NOT on disk yet!
write(fd, data, len);
// If power loss here: data lost!

// fsync(): flush data AND metadata to disk
// Guarantees data is on stable storage after return
fsync(fd);

// fdatasync(): flush data only (not metadata like mtime)
// Faster than fsync when you don't need metadata durability
fdatasync(fd);

// O_SYNC: every write() blocks until durable
int fd = open("file", O_WRONLY | O_SYNC);

// O_DIRECT: bypass page cache, write directly to device
// Used by databases for their own caching layer
int fd = open("file", O_WRONLY | O_DIRECT);
// Requires: aligned buffers, aligned sizes, aligned offsets
// (posix_memalign for buffer alignment)

// fsync pitfall: must fsync the DIRECTORY too after rename!
// Otherwise directory entry might not survive crash
rename("file.tmp", "file");
int dir = open(".", O_RDONLY);
fsync(dir);  // Ensure directory update is durable
close(dir);
```

### I/O Benchmarking
```bash
# fio: flexible I/O tester
fio --name=seq-read --rw=read --bs=1M --size=4G --numjobs=1
fio --name=rand-read --rw=randread --bs=4k --size=4G --numjobs=4 --iodepth=32

# iostat: device I/O statistics
iostat -x 1           # Extended stats every 1s
# Key columns: r/s, w/s (IOPS), rkB/s, wkB/s (throughput)
# await: average wait time per request (ms)
# %util: device utilization (100% = saturated)

# iotop: per-process I/O (like top for I/O)
iotop -o              # Only show processes doing I/O
iotop -a              # Accumulated totals

# blktrace: kernel I/O tracing
blktrace -d /dev/sdb -o trace &
# ... do workload ...
kill %1
blkparse trace

# lsblk: show block devices
lsblk -o NAME,SIZE,TYPE,MOUNTPOINT,FSTYPE,ROTA
# ROTA=0 means SSD/NVMe

# hdparm: drive parameters
hdparm -Tt /dev/sda   # Buffered/cached read test
hdparm -I /dev/sda    # Drive info
```

---

## Special File Systems

### tmpfs
```bash
# tmpfs: in-memory filesystem (RAM backed)
mount -t tmpfs -o size=512m tmpfs /tmp
# Lives in RAM, extremely fast, lost on reboot

# /dev/shm is usually tmpfs (POSIX shared memory)
# /run is tmpfs (runtime data)

# Use for:
# - Fast temporary storage
# - Shared memory between processes
# - Build systems (avoids disk I/O during builds)
```

### procfs and sysfs
```bash
# /proc: process and kernel information (virtual FS)
# No disk backing — kernel generates on read

cat /proc/cpuinfo          # CPU info
cat /proc/meminfo          # Memory info
cat /proc/filesystems      # Supported file systems
cat /proc/mounts           # Current mounts
cat /proc/net/dev          # Network interface stats
cat /proc/sys/             # Kernel tunables (read/write)

# /sys: device and driver information
ls /sys/block/             # Block devices
cat /sys/block/sda/queue/rotational   # 0=SSD, 1=HDD
cat /sys/block/sda/queue/scheduler    # I/O scheduler
echo mq-deadline > /sys/block/sda/queue/scheduler  # Change scheduler

# /dev: device files
ls -la /dev/               # All devices
mknod /dev/mydev c 89 0   # Create char device (major 89, minor 0)
```

### Network File Systems
```bash
# NFS: Network File System
# Server
apt install nfs-kernel-server
echo "/export 192.168.1.0/24(rw,sync,no_subtree_check)" >> /etc/exports
exportfs -ra
# Client
mount -t nfs server:/export /mnt
mount.nfs -o vers=4,soft,timeo=10 server:/export /mnt

# SSHFS: mount over SSH
sshfs user@host:/remote/path /local/mountpoint
# Mount options
sshfs -o reconnect,ServerAliveInterval=15 user@host:/path /mnt

# CIFS/SMB (Windows shares)
mount -t cifs //server/share /mnt -o username=user,password=pass
```

---

*File systems are where software meets physics. The fsync, the journal, the B-tree of extents — all exist because disks are slow, power fails, and bits flip. Master this and you'll understand what databases really do.*
