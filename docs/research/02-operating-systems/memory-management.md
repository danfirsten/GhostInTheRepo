# Memory Management — Complete Reference

> Virtual memory is one of the greatest abstractions in computing. Understanding it explains everything from segfaults to performance cliffs to how containers work.

---

## Virtual Memory

### The Big Picture
```
Physical memory: RAM chips — finite, shared by all processes
Virtual memory:  each process sees its own private address space

Address translation:
  Virtual address → MMU (Memory Management Unit) → Physical address
  MMU uses page tables to map virtual → physical pages

Benefits:
  Isolation: process A can't read process B's memory
  Overcommit: can allocate more virtual memory than physical RAM
  Shared libraries: one physical copy, many virtual mappings
  Memory-mapped files: files accessed as memory
  Demand paging: load pages only when accessed (lazy)
```

### Address Space Layout (Linux x86-64)
```
High address (0xFFFF_FFFF_FFFF_FFFF):
  Kernel space (128 TB)  — not accessible from user mode
  ────────────────────────────────────────────────────
  Stack          grows downward from ~0x7FFF_FFFF_FFFF
  ↓
  (gap — stack grows into this)
  ↑
  mmap region    shared libraries, mmap() allocations
  ↑
  Heap           grows upward from data segment
  BSS segment    zero-initialized global/static data
  Data segment   initialized global/static data
  Text segment   executable code (read-only)
Low address (0x0000_0000_0040_0000):  typical code start

View your process's memory map:
  cat /proc/self/maps
  pmap -x PID
```

---

## Paging

### Page Tables
```
Page: fixed-size chunk of memory (typically 4 KB = 4096 bytes)
Page table: OS data structure mapping virtual pages → physical frames

4-level page table (x86-64, 48-bit virtual address):
  Virtual address: [PML4 (9 bits)] [PDPT (9 bits)] [PD (9 bits)] [PT (9 bits)] [Offset (12 bits)]
                      ↓               ↓               ↓              ↓
                   PML4 table → PDPT table → PD table → PT table → Physical frame

  Page walk: 4 memory accesses to translate one address!
  TLB caches recent translations to avoid this cost.

Page table entry (PTE) flags:
  P  (Present)      — page is in RAM
  R/W (Read/Write)  — writable
  U/S (User/Supervisor) — accessible from user mode
  A  (Accessed)     — set by CPU when page is read
  D  (Dirty)        — set by CPU when page is written
  XD (Execute Disable) — prevent code execution (NX bit)
```

### TLB (Translation Lookaside Buffer)
```
TLB: small, fast cache of recent virtual→physical translations
  ~1-4 ns hit latency (vs ~100ns for page table walk)
  Typical size: 64-1024 entries (L1 DTLB, L1 ITLB, L2 TLB)

TLB miss: walk page tables → expensive
TLB flush: invalidate all entries (happens on context switch, CR3 reload)

Huge pages (reduce TLB pressure):
  Normal: 4 KB pages → 1 TLB entry covers 4 KB
  Huge:   2 MB pages → 1 TLB entry covers 2 MB (512x better!)
  1 GB pages also possible

  # Enable transparent huge pages
  echo always > /sys/kernel/mm/transparent_hugepage/enabled
  # Or: allocate explicitly with mmap(MAP_HUGETLB)

  Perf impact:
    Fewer TLB misses (better for large memory workloads)
    But: wasted memory if pages not fully used
    Used by: databases, JVMs, ML frameworks
```

---

## Memory Allocation

### The Allocator Chain
```
malloc(size):
  If size > MMAP_THRESHOLD (~128KB): mmap(MAP_ANONYMOUS)
  Else: managed from heap (brk/sbrk region)

Heap:
  brk(): set end of heap
  sbrk(n): extend heap by n bytes (legacy, avoid)
  malloc uses free list internals to manage heap

Page granularity:
  OS allocates in pages (4KB minimum)
  malloc subdivides pages for small allocations
  → Requesting 1 byte still "costs" a 4KB page from OS
```

### glibc malloc Internals
```
Arena: per-thread heap (avoids contention on multi-threaded programs)
  Main arena (brk-based)
  Thread arenas (mmap-based)

Chunks: memory is divided into chunks
  Each chunk: [size|flags][data...][next chunk...]
  Free chunks: stored in bins by size

Bins:
  Fastbins: <128 bytes, LIFO singly-linked list (fast)
  Smallbins: <512 bytes, doubly-linked list
  Largebins: ≥512 bytes, sorted by size
  Unsorted bin: recently freed, searched first

tcmalloc / jemalloc: alternatives
  tcmalloc (Google): per-thread caches, less contention
  jemalloc (Facebook): better fragmentation, large scale
  Used by Chrome, Firefox, Redis, etc.

# Check allocation stats
#include <malloc.h>
malloc_stats();  // Print to stderr
struct mallinfo2 m = mallinfo2();
// m.uordblks = bytes in use, m.fordblks = bytes free
```

### Memory Leaks and Tools
```bash
# Valgrind: memory error detection
valgrind --leak-check=full --show-leak-kinds=all \
         --track-origins=yes ./program

# Output categories:
# "definitely lost": leaked, no pointers left
# "indirectly lost": leaked via a lost pointer
# "possibly lost":   complex pointer arithmetic
# "still reachable": global/static (often OK)

# AddressSanitizer (ASan): compile-time instrumentation, much faster
gcc -fsanitize=address -fno-omit-frame-pointer -g program.c
./program
# Reports: heap buffer overflow, stack overflow, use-after-free,
#          double-free, use-after-return

# LeakSanitizer
gcc -fsanitize=leak program.c
./program

# Heap profiling with heaptrack
heaptrack ./program
heaptrack_print heaptrack.program.*.gz
```

---

## Virtual Memory Operations

### mmap
```c
#include <sys/mman.h>

// Map a file into memory
int fd = open("data.bin", O_RDONLY);
struct stat st;
fstat(fd, &st);
void *map = mmap(NULL, st.st_size,
                 PROT_READ,        // Permissions
                 MAP_PRIVATE,      // COW (changes not written to file)
                 fd, 0);           // File and offset
close(fd);  // Can close fd after mmap

// Access the file as memory
unsigned char *bytes = (unsigned char*)map;
printf("First byte: %x\n", bytes[0]);

munmap(map, st.st_size);

// Anonymous mmap (no backing file — like malloc for large allocations)
void *mem = mmap(NULL, 1024*1024*100,  // 100 MB
                 PROT_READ | PROT_WRITE,
                 MAP_PRIVATE | MAP_ANONYMOUS,
                 -1, 0);

// Flags:
// MAP_SHARED:   writes visible to other mappings of same file
// MAP_PRIVATE:  copy-on-write, writes not visible to others
// MAP_ANONYMOUS: no file backing (fd = -1)
// MAP_FIXED:    use exact address (dangerous)
// MAP_POPULATE: prefault pages (avoid page faults later)
// MAP_LOCKED:   lock pages in RAM (mlock equivalent)
// MAP_HUGETLB:  use huge pages
```

### mlock and Memory Locking
```c
#include <sys/mman.h>

// Lock pages in RAM — prevent swapping
// Used by: cryptographic code (avoid secrets in swap)
//          real-time applications (avoid latency from page faults)

mlock(addr, size);    // Lock a range
mlockall(MCL_CURRENT | MCL_FUTURE);  // Lock all pages

// Check if locked
// /proc/PID/status → VmLck: locked memory amount

// Limits
// /proc/sys/vm/max_map_count    (max VMAs)
// ulimit -l                     (max locked memory for user)
// Privileged: CAP_IPC_LOCK needed for large amounts
```

### Page Faults
```
Major page fault: page not in RAM → read from disk
  → Very expensive: ~1-10ms (disk latency)

Minor page fault: page in RAM but not mapped yet
  → Cheap: ~1µs (just update page table)
  Occurs when: first access to new mmap region (demand paging)

Page fault handling:
  CPU raises #PF exception
  Kernel page fault handler:
    Look up VMA (virtual memory area) for faulting address
    If no VMA → SIGSEGV
    If VMA found:
      Anonymous: allocate new page (zero-filled for security)
      File-backed: read from filesystem
      COW: copy the shared page

Monitor page faults:
  /usr/bin/time -v command    # Reports major/minor faults
  perf stat command           # page-faults, major-faults
  cat /proc/PID/stat          # minflt, majflt counters
```

---

## Swap and Memory Pressure

### Swap
```
Swap: disk space used as overflow for RAM
  When RAM full, kernel evicts ("swaps out") cold pages to disk
  On access: swap in (major page fault)

  Not just "extra RAM" — it's a safety valve
  Swapping = very bad performance (disk vs RAM latency)

swap-related tools:
  swapon --show               # Active swap devices
  free -h                     # RAM and swap usage
  vmstat 1                    # Swap in/out rates (si, so columns)
  sar -W 1                    # Swap statistics

swappiness tunable:
  /proc/sys/vm/swappiness     # 0-200, default 60
  0   = avoid swapping, use disk caches aggressively
  100 = balance
  200 = swap aggressively

  echo 10 > /proc/sys/vm/swappiness  # Prefer RAM over swap

  # For databases (PostgreSQL, Redis): set to 0 or 1
  # Unexpected swapping destroys latency characteristics
```

### OOM Killer
```
OOM (Out Of Memory) Killer:
  When system runs out of memory, kernel kills processes to recover RAM
  Selects victim by oom_score (/proc/PID/oom_score, 0=never kill, 1000=kill first)

Protect a process from OOM killer:
  echo -1000 > /proc/PID/oom_score_adj   # Protect (root only)

Make a process more likely to be killed:
  echo 1000 > /proc/PID/oom_score_adj   # Sacrifice

OOM log:
  dmesg | grep -i "out of memory"
  journalctl -k | grep -i oom

Linux overcommit:
  /proc/sys/vm/overcommit_memory
  0 = heuristic (allow reasonable overcommit)
  1 = always allow overcommit (never fail malloc)
  2 = never overcommit beyond RAM+swap*factor

  overcommit_ratio = % of swap to allow (default 50)

  PostgreSQL recommendation: overcommit_memory=2, overcommit_ratio=100
```

---

## Memory Performance

### NUMA (Non-Uniform Memory Access)
```
NUMA: servers with multiple CPU sockets, each with local RAM
  Local memory access: ~100ns
  Remote memory access (other socket): ~300ns (3x slower!)

numactl:
  numactl --hardware                    # Show NUMA topology
  numactl --membind=0 --cpunodebind=0 app  # Bind to node 0

  # Per-process NUMA stats
  numastat -p PID
  cat /proc/PID/numa_maps

  NUMA-aware allocation:
  - Linux NUMA-aware allocator (libnuma)
  - Java: NUMA-aware GC with -XX:+UseNUMA
  - JVM, databases often numa-aware by default

  # Set NUMA policy system-wide
  numactl --interleave=all app   # Round-robin across nodes
```

### Memory Profiling
```bash
# Valgrind Massif: heap profiling
valgrind --tool=massif --pages-as-heap=yes ./app
ms_print massif.out.* | head -50

# Heaptrack: fast heap profiler (lower overhead than Valgrind)
heaptrack ./app
heaptrack_gui heaptrack.app.*.zst  # GUI visualization

# /proc/PID/smaps: detailed per-mapping memory
cat /proc/PID/smaps
# RSS: physical pages mapped
# PSS: proportional share (shared libs divided by # users)
# Dirty: modified pages
# Swap: pages in swap

# System memory stats
cat /proc/meminfo
# MemTotal, MemFree, MemAvailable (actually usable)
# Buffers (kernel I/O buffers)
# Cached (page cache)
# Slab (kernel slab allocator usage)

# perf mem: memory access profiling
perf mem record -a command
perf mem report
# Shows load/store operations with latency breakdown
```

### Cache-Friendly Programming
```c
// Row-major vs column-major access

// BAD: column-major access of row-major array
// Cache line = 64 bytes = 16 ints
// Every access is a cache miss!
int matrix[N][N];
for (int j = 0; j < N; j++)
    for (int i = 0; i < N; i++)
        matrix[i][j]++;  // Striding by N (bad!)

// GOOD: row-major access
for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
        matrix[i][j]++;  // Sequential (cache-friendly)

// Structure of Arrays vs Array of Structures
// AoS (bad for SIMD, cache-unfriendly if accessing one field):
struct Particle { float x, y, z, mass; };
Particle particles[N];

// SoA (SIMD-friendly, cache-friendly for per-field operations):
float px[N], py[N], pz[N], mass[N];

// Prefetching
for (int i = 0; i < N; i++) {
    __builtin_prefetch(&data[i + 8], 0, 1);  // Prefetch 8 ahead
    process(data[i]);
}

// Cache line size: 64 bytes on modern x86
// Avoid false sharing: pad shared data between threads
struct __attribute__((aligned(64))) ThreadData {
    long counter;
    char padding[56];  // Pad to cache line
};
```

---

*Memory management is what separates programmers who guess at performance from those who know. The TLB, page faults, NUMA, cache lines — master these and you understand why your program is fast or slow.*
