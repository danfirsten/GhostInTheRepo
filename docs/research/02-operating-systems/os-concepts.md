# Operating Systems — Core Concepts

> An OS is the software that lies between your application and the hardware. Understanding it deeply makes you a better systems engineer.

---

## What an OS Does

1. **Resource Management**: CPU, memory, I/O, disk
2. **Abstraction**: virtual memory, file system, processes
3. **Protection**: isolate processes from each other
4. **Communication**: IPC, networking

---

## Processes

### Process vs Thread
```
Process:
- Independent execution environment
- Own virtual address space
- Own file descriptor table
- Own signal handlers
- Heavyweight: fork() creates full copy
- Communication: IPC (pipes, sockets, shared memory)

Thread:
- Share process memory space
- Share file descriptors
- Lightweight: creation faster than fork()
- Communication: shared memory (requires synchronization)
```

### Process Lifecycle
```
new → ready → running → terminated
              ↓ ↑ ↑
              waiting (blocked on I/O, sleep, lock)
```

### Process Creation
```c
// fork() - Unix process creation
pid_t pid = fork();
if (pid == 0) {
    // Child process
    execve("/bin/ls", argv, envp);
} else if (pid > 0) {
    // Parent process
    int status;
    waitpid(pid, &status, 0);
} else {
    // Error
}

// fork() semantics:
// - Creates exact copy of parent (copy-on-write)
// - Returns 0 in child, child's PID in parent
// - execve() replaces current process with new program
```

### Process States (Linux)
```
R - Running or Runnable (in run queue)
S - Interruptible Sleep (waiting for event)
D - Uninterruptible Sleep (I/O wait — cannot be killed)
Z - Zombie (terminated, waiting for parent to read exit status)
T - Stopped (SIGSTOP, SIGTSTP)
X - Dead (shouldn't see this)
```

```bash
ps aux | grep defunct    # Find zombie processes
kill -SIGCHLD $PPID     # Signal parent to reap zombies
```

---

## CPU Scheduling

### Scheduler Goals (Conflicting!)
- **Throughput**: maximize work done per unit time
- **Latency**: minimize response time for interactive tasks
- **Fairness**: every process gets reasonable CPU share
- **Real-time**: meet deadlines

### Scheduling Algorithms

**First-Come First-Served (FCFS):**
- Non-preemptive, simple
- Problem: convoy effect (short jobs behind long jobs)

**Shortest Job First (SJF):**
- Optimal for average wait time
- Problem: starvation of long jobs, need to know burst time

**Round Robin (RR):**
- Each process gets time quantum (e.g., 10ms)
- After quantum expires, preempted and goes to end of queue
- Good for time-sharing, responsive
- Trade-off: quantum too short → too much context switch overhead; too long → FCFS behavior

**Multi-Level Feedback Queue (MLFQ):**
- Multiple queues with different priorities
- New processes start in highest priority queue
- If process uses full quantum → downgrade to lower queue
- Shorter jobs naturally stay in high-priority queues
- Used in: Windows, macOS, Linux (partially)

**Completely Fair Scheduler (CFS) — Linux:**
- Based on virtual runtime (vruntime)
- Always run the process with smallest vruntime
- Uses red-black tree (ordered by vruntime)
- Nice values: -20 (highest priority) to +19 (lowest)

### Context Switch
```
When CPU switches between processes:
1. Save CPU state (registers, PC, stack pointer) to PCB
2. Update process state
3. Load new process PCB
4. Restore CPU state

Cost: ~1-10µs
Causes: timer interrupt, I/O completion, yield, preemption

PCB (Process Control Block) contains:
- PID, PPID
- CPU registers
- Program counter
- Memory limits
- Open file table
- Signal handlers
- Scheduling info
```

---

## Memory Management

### Virtual Memory
```
Physical memory: actual RAM chips
Virtual memory: abstraction presented to each process

Benefits:
- Isolation: process can't access another's memory
- Address space larger than physical RAM (swap)
- Simplicity: each process has "same" address space

Implementation:
- CPU's MMU (Memory Management Unit)
- Page tables: virtual page → physical frame mapping
- TLB: cache for page table entries
```

### Page Tables
```
4KB page size (typical on x86-64)
48-bit virtual address space = 256TB addressable

Multi-level page table:
VA = [PML4 index][PDPT index][PD index][PT index][offset]
      9 bits      9 bits      9 bits    9 bits    12 bits

Each level: 2^9 = 512 entries
Full 4-level walk: 4 memory accesses (TLB miss)
```

### Memory Allocation

#### Kernel Memory Allocation
```
Slab allocator: pre-allocate pools of fixed-size objects
  kmem_cache_alloc(), kmem_cache_free()
  Avoids fragmentation for common object sizes
  Used for: inodes, dentries, socket buffers

Buddy system: allocate power-of-2 sized blocks
  Split large blocks, merge free buddies
  Balance between fragmentation and overhead
```

#### User Space Allocation (malloc)
```
malloc() is a library function, not syscall
It calls:
  brk() / sbrk() - expand heap (contiguous)
  mmap() - anonymous mapping (for large allocations)

Internals:
  Free list: linked list of free chunks
  Best fit, first fit, segregated fits
  glibc ptmalloc: multiple arenas for threading
  jemalloc: better multi-threaded performance
  tcmalloc (Google): thread-local caches
```

### Memory Mapped Files
```c
void *ptr = mmap(NULL, file_size, PROT_READ | PROT_WRITE,
                 MAP_SHARED, fd, 0);
// ptr is now a pointer to file contents in memory
// Changes are reflected in file
// No explicit read/write needed
// OS handles page faults to load from disk
// Used in: databases, shared memory, exec

munmap(ptr, file_size);
```

---

## I/O Models

### Blocking I/O
```
Thread blocks until I/O completes.
Simple, but wastes CPU time.
```

### Non-Blocking I/O
```c
fcntl(fd, F_SETFL, O_NONBLOCK);
read(fd, buf, size);  // Returns EAGAIN if not ready
// Must poll or use select/epoll
```

### I/O Multiplexing
```c
// select() - check multiple FDs, old, limited to 1024
fd_set readfds;
FD_ZERO(&readfds);
FD_SET(fd1, &readfds);
FD_SET(fd2, &readfds);
select(max_fd+1, &readfds, NULL, NULL, &timeout);

// poll() - no fd limit, linear scan
struct pollfd fds[] = {{fd1, POLLIN}, {fd2, POLLIN}};
poll(fds, 2, timeout_ms);

// epoll (Linux) - O(1) notification, recommended
int epfd = epoll_create1(0);
struct epoll_event ev = {.events=EPOLLIN, .data.fd=fd};
epoll_ctl(epfd, EPOLL_CTL_ADD, fd, &ev);
int n = epoll_wait(epfd, events, MAX_EVENTS, timeout);
// events[] contains only ready FDs — O(events), not O(all FDs)

// kqueue (macOS/BSD) - similar to epoll
// io_uring (Linux 5.1+) - async, submit/complete ring buffers
```

### Asynchronous I/O
```c
// POSIX AIO: submit request, get notification when done
struct aiocb cb = {.aio_fd=fd, .aio_buf=buf, .aio_nbytes=size};
aio_read(&cb);
// Poll: aio_error(&cb) == 0 means done
// Or: signal-based notification

// io_uring (modern Linux): ring buffer of requests/completions
// Most efficient for high-throughput I/O
```

---

## Concurrency & Synchronization

### Race Conditions
```c
// BAD - race condition
int counter = 0;
void increment() {
    counter++;  // Read → Increment → Write — NOT atomic
}
// Two threads: both read 0, both write 1 → lost update

// GOOD - atomic operation
#include <stdatomic.h>
_Atomic int counter = 0;
atomic_fetch_add(&counter, 1);  // Hardware-level atomicity
```

### Mutex (Mutual Exclusion)
```c
pthread_mutex_t mutex = PTHREAD_MUTEX_INITIALIZER;

void critical_section() {
    pthread_mutex_lock(&mutex);
    // Only one thread here at a time
    counter++;
    pthread_mutex_unlock(&mutex);
}
```

### Semaphore
```c
// Counting semaphore: limit concurrent access to N
sem_t sem;
sem_init(&sem, 0, MAX_CONNECTIONS);

void use_resource() {
    sem_wait(&sem);    // Decrement (block if 0)
    // Use resource
    sem_post(&sem);    // Increment (wake waiter)
}
```

### Read-Write Lock
```c
// Multiple readers OR one writer
pthread_rwlock_t rwlock = PTHREAD_RWLOCK_INITIALIZER;

void read_data() {
    pthread_rwlock_rdlock(&rwlock);  // Many can read simultaneously
    // read...
    pthread_rwlock_unlock(&rwlock);
}

void write_data() {
    pthread_rwlock_wrlock(&rwlock);  // Exclusive write
    // write...
    pthread_rwlock_unlock(&rwlock);
}
```

### Condition Variables
```c
pthread_mutex_t mutex;
pthread_cond_t cond;
int ready = 0;

// Producer
pthread_mutex_lock(&mutex);
ready = 1;
pthread_cond_signal(&cond);    // Wake one waiter
pthread_mutex_unlock(&mutex);

// Consumer
pthread_mutex_lock(&mutex);
while (!ready) {                // Always check in loop (spurious wakeups)
    pthread_cond_wait(&cond, &mutex);  // Atomically releases mutex + waits
}
// Now ready == 1
pthread_mutex_unlock(&mutex);
```

### Deadlock Conditions (Coffman, 1971)
All four must hold simultaneously:
1. **Mutual exclusion**: resource can only be held by one thread
2. **Hold and wait**: thread holds resource while waiting for another
3. **No preemption**: resources can't be forcibly taken
4. **Circular wait**: T1 waits for T2 waits for T1

Prevention: break any one condition.
- Acquire all locks in fixed order (break circular wait)
- Lock timeout (break hold-and-wait)
- Try-lock (break hold-and-wait)

### Lock-Free Programming
```c
// Compare-and-swap (CAS) — hardware instruction
// Atomically: if (*addr == expected) { *addr = new; return true; }

// Lock-free stack push
void push(Node *new_node) {
    do {
        new_node->next = head;
    } while (!__sync_bool_compare_and_swap(&head, new_node->next, new_node));
}
```

---

## File Systems

### VFS (Virtual File System) Layer
```
Application
    ↓ read/write/open system calls
VFS (Abstract interface)
    ↓
ext4  |  xfs  |  btrfs  |  tmpfs  |  proc  |  nfs
```

### Inode
Each file has one inode:
```
Inode contains:
- File type (regular, directory, symlink, device, pipe)
- Permissions (rwxrwxrwx + SUID/SGID/sticky)
- Owner UID, GID
- Size
- Timestamps: atime (access), mtime (modify), ctime (change)
- Link count (hard links)
- Block pointers (where data is on disk)
  - Direct blocks: first 12 block pointers
  - Single indirect: points to block of block pointers
  - Double indirect: points to block of single indirects
  - Triple indirect: ...

Does NOT contain:
- Filename (stored in directory entry)
```

```bash
stat file.txt        # View inode info
ls -i                # Show inode numbers
df -i                # Inode usage per filesystem
debugfs /dev/sda1    # Low-level filesystem exploration
```

### Journaling
```
Without journaling: power failure during write = filesystem corruption

With journaling (ext4, xfs, etc.):
  Journal transactions before writing to main filesystem
  On recovery: replay journal to ensure consistency

Modes:
  ordered: metadata + data order guaranteed (default ext4)
  writeback: metadata journaled, data might lag
  journal: both metadata and data journaled (safest, slowest)
```

---

## Signals

```c
#include <signal.h>

// Common signals
SIGHUP  (1)  - Hangup (terminal closed; servers: reload config)
SIGINT  (2)  - Interrupt (Ctrl-C)
SIGQUIT (3)  - Quit with core dump (Ctrl-\)
SIGKILL (9)  - Kill immediately (cannot be caught or ignored)
SIGTERM (15) - Terminate gracefully (can be caught)
SIGSTOP (19) - Stop process (cannot be caught)
SIGCONT (18) - Continue stopped process
SIGCHLD (17) - Child process changed state
SIGSEGV (11) - Segmentation fault (invalid memory access)
SIGPIPE (13) - Broken pipe

// Handle signal
void handler(int signum) {
    // Set flag for graceful shutdown
    running = false;
}

signal(SIGTERM, handler);
sigaction(SIGTERM, &sa, NULL);  // More robust

// Sending signals
kill(pid, SIGTERM);    // Send to specific process
kill(0, SIGTERM);      // Send to process group
raise(SIGUSR1);        // Send to self
killpg(pgrp, SIGTERM); // Send to process group
```

---

## Inter-Process Communication (IPC)

```bash
# Pipes (anonymous)
ls | grep ".py"                 # Shell pipe
# Parent-child only, unidirectional

# Named pipes (FIFO)
mkfifo /tmp/mypipe
cat /tmp/mypipe &               # Reader (blocks)
echo "hello" > /tmp/mypipe     # Writer

# Shared memory (fastest IPC)
shmget(key, size, flags)       # Create/access
shmat(shmid, NULL, 0)          # Attach
shmdt(ptr)                     # Detach
shmctl(shmid, IPC_RMID, NULL)  # Remove

# Message queues
msgget, msgsnd, msgrcv, msgctl

# Unix domain sockets (AF_UNIX)
# Like TCP sockets but for local IPC
# Used by: Docker daemon, DBs, X11
```

---

## System Calls Reference

```c
// Process
fork(), exec*(), wait*(), exit()
getpid(), getppid(), getuid(), getgid()
setsid(), setpgid()

// Memory
brk(), sbrk(), mmap(), munmap(), mprotect()
madvise(), mlock(), munlock()

// File I/O
open(), close(), read(), write(), pread(), pwrite()
lseek(), fsync(), fdatasync()
stat(), fstat(), lstat()
openat(), fstatat() (modern, directory-relative)

// Directory
mkdir(), rmdir(), rename(), link(), unlink(), symlink()
opendir(), readdir(), closedir()

// Network
socket(), bind(), listen(), accept(), connect()
send(), recv(), sendto(), recvfrom()
setsockopt(), getsockopt()
getaddrinfo(), getnameinfo()

// Control
ioctl(), fcntl(), dup(), dup2()
select(), poll(), epoll_*()
signalfd(), eventfd(), timerfd_*()

// Time
clock_gettime(), nanosleep(), timer_create()

// Misc
getrlimit(), setrlimit()
prctl() (process attributes)
seccomp() (system call filtering)
```

---

*The OS is the foundation. When your code misbehaves, the answers are always in the kernel — if you know where to look.*
