# Process Management — Complete Reference

> Processes are the fundamental unit of execution in an OS. Understanding how they're created, scheduled, and communicate is essential for building performant, correct systems.

---

## What Is a Process?

```
Process: a running program — includes:
  - Code (text segment)
  - Data (global/static variables)
  - Stack (local variables, return addresses)
  - Heap (dynamic allocations)
  - File descriptors
  - Signal handlers
  - Environment variables
  - Memory mappings (mmap regions)

Process vs Thread:
  Process: own address space, isolated
  Thread:  shares address space with other threads in same process
           own stack and registers, shared heap/globals

Process states:
  Running   → currently executing on CPU
  Ready     → waiting to be scheduled
  Sleeping  → blocked on I/O or synchronization (S = interruptible, D = uninterruptible)
  Zombie    → finished, waiting for parent to call wait()
  Stopped   → paused (SIGSTOP/SIGTSTP)
```

---

## Process Creation

### fork() and exec()
```c
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>

// fork(): create a copy of current process
pid_t pid = fork();

if (pid < 0) {
    perror("fork failed");
    exit(1);
} else if (pid == 0) {
    // Child process
    // pid_t child_pid = getpid();
    // pid_t parent_pid = getppid();

    // exec: replace this process image with a new program
    // exec doesn't return on success
    execlp("ls", "ls", "-la", NULL);
    perror("exec failed");  // Only reached if exec fails
    exit(1);
} else {
    // Parent process
    // pid = child's PID

    int status;
    pid_t child = waitpid(pid, &status, 0);

    if (WIFEXITED(status)) {
        printf("Child exited with code %d\n", WEXITSTATUS(status));
    } else if (WIFSIGNALED(status)) {
        printf("Child killed by signal %d\n", WTERMSIG(status));
    }
}

// exec family:
// execlp(file, arg0, arg1, ..., NULL)    -- search PATH, list args
// execvp(file, argv[])                   -- search PATH, array args
// execve(path, argv[], envp[])           -- full path, array args, env
// execl(path, arg0, arg1, ..., NULL)     -- full path, list args
```

### Copy-on-Write (COW)
```
fork() does NOT immediately copy all memory.
  → Child shares same physical pages as parent
  → Pages marked read-only
  → On first write by either process: page is copied

Result:
  fork() is cheap (just copies page tables, not memory)
  Only modified pages get duplicated
  Makes fork+exec very efficient (exec throws away address space anyway)

vfork(): even cheaper — child borrows parent's address space
  Parent is suspended until child calls exec() or exit()
  Rare, dangerous — only use if you immediately exec
```

### Process Lifecycle Example
```c
#include <unistd.h>
#include <sys/wait.h>
#include <stdio.h>
#include <stdlib.h>

// Run a command, capture output
int run_command(const char *cmd, char *const argv[]) {
    pid_t pid = fork();

    if (pid == 0) {
        execvp(cmd, argv);
        perror("exec");
        _exit(127);  // Use _exit in child to avoid flushing parent's buffers
    }

    int status;
    waitpid(pid, &status, 0);
    return WEXITSTATUS(status);
}

// Zombie example: child exits but parent never calls wait()
void zombie_demo() {
    pid_t pid = fork();
    if (pid == 0) {
        exit(0);  // Child exits immediately
    }
    sleep(30);  // Parent sleeps — child is ZOMBIE during this time
    // Run: ps aux | grep Z to see zombie
    waitpid(pid, NULL, 0);  // Reap zombie
}
```

---

## Scheduling

### Linux CFS (Completely Fair Scheduler)
```
Goal: give each process a fair share of CPU time

Key concepts:
  Virtual runtime (vruntime):
    Each process tracks how much CPU it's "used" in virtual time
    Process with smallest vruntime runs next
    Higher priority (nice) → vruntime advances more slowly

  Red-Black Tree:
    All runnable processes stored in RB-tree by vruntime
    Leftmost node = next to run (O(log n) operations)

  Time slice (timeslice):
    Not fixed — proportional to weight/priority
    Minimum granularity: sched_min_granularity_ns (4ms default)

Nice values:
  Range: -20 (highest priority) to +19 (lowest)
  Default: 0
  Only root can set negative nice

  nice -n 10 command        # Run with lower priority
  renice -n 5 -p PID        # Change priority of running process

Real-time scheduling classes (higher priority than CFS):
  SCHED_FIFO:  run until preempted or yields — for time-critical tasks
  SCHED_RR:    like FIFO but with time slices (round robin)
  chrt -f 50 command        # Set SCHED_FIFO priority 50
```

### Scheduling in /proc
```bash
# View process scheduling info
cat /proc/PID/sched             # Scheduling statistics
cat /proc/PID/schedstat         # Time spent running/waiting

# System-wide scheduler tuning
cat /proc/sys/kernel/sched_min_granularity_ns    # Min slice (ns)
cat /proc/sys/kernel/sched_latency_ns            # Target latency

# CPU affinity: restrict process to specific CPUs
taskset -c 0,1 command          # Run on CPUs 0 and 1
taskset -c 0,1 -p PID          # Set affinity of running process
taskset -p PID                  # Show current affinity mask

# Context switches
pidstat -w PID 1               # Voluntary/involuntary context switches per sec
cat /proc/PID/status | grep ctxt  # Cumulative context switch counts

# CPU usage
top -p PID
htop
perf stat -p PID sleep 5       # Hardware performance counters
```

### Context Switching
```
Context switch: save one process's CPU state, load another's

Saved per-process:
  Registers (general purpose, FP, SIMD)
  Program counter (RIP)
  Stack pointer (RSP)
  Page table base (CR3) — causes TLB flush!
  Signal mask
  I/O state

Cost:
  Direct: ~1-10 µs for switch itself
  Indirect: TLB flush (huge cost for large workloads)
            Cache pollution (hot cache gone)

Minimize context switches:
  Fewer threads (avoid thundering herd)
  CPU affinity (avoid cache invalidation across cores)
  Batch work (fewer context switches total)
  Real-time scheduling for latency-sensitive tasks
```

---

## Signals

### Signal Basics
```c
#include <signal.h>

// Common signals:
// SIGTERM (15)  — polite termination request (default kill)
// SIGKILL (9)   — force kill, cannot be caught or ignored
// SIGINT (2)    — Ctrl+C
// SIGQUIT (3)   — Ctrl+\ (generates core dump)
// SIGHUP (1)    — terminal hangup (reload config in daemons)
// SIGCHLD (17)  — child process stopped or exited
// SIGALRM (14)  — timer expired
// SIGUSR1/2     — user-defined
// SIGSEGV (11)  — segmentation fault
// SIGPIPE (13)  — write to closed pipe (common in networking!)

// Install signal handler
#include <signal.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

volatile sig_atomic_t running = 1;

void handle_sigterm(int sig) {
    // Keep this small: only async-signal-safe functions allowed!
    // printf is NOT safe here (but write() is)
    running = 0;
}

int main() {
    struct sigaction sa = {0};
    sa.sa_handler = handle_sigterm;
    sigemptyset(&sa.sa_mask);
    sigaction(SIGTERM, &sa, NULL);
    sigaction(SIGINT, &sa, NULL);

    // Ignore SIGPIPE (essential for network servers)
    signal(SIGPIPE, SIG_IGN);

    while (running) {
        // do work
        sleep(1);
    }
    printf("Shutting down gracefully...\n");
    return 0;
}

// Send signals
kill(pid, SIGTERM);       // C API
// kill -SIGTERM PID      (shell)
// kill -9 PID            (shell, SIGKILL)
// kill -0 PID            (check if process exists, no signal sent)
```

### Signal Masking
```c
// Block signals during critical section
sigset_t mask, old_mask;
sigemptyset(&mask);
sigaddset(&mask, SIGTERM);
sigaddset(&mask, SIGINT);

pthread_sigmask(SIG_BLOCK, &mask, &old_mask);  // Block
// ... critical section ...
pthread_sigmask(SIG_SETMASK, &old_mask, NULL); // Restore

// Wait for a signal (pause execution until signal arrives)
sigset_t wait_set;
sigemptyset(&wait_set);
sigaddset(&wait_set, SIGTERM);
int sig;
sigwait(&wait_set, &sig);  // Blocks until SIGTERM
```

---

## Inter-Process Communication (IPC)

### Pipes
```c
#include <unistd.h>
#include <stdio.h>

// Anonymous pipe: parent→child communication
int pipefd[2];
pipe(pipefd);  // pipefd[0] = read end, pipefd[1] = write end

pid_t pid = fork();
if (pid == 0) {
    // Child reads
    close(pipefd[1]);          // Close write end (child doesn't write)
    char buf[256];
    ssize_t n = read(pipefd[0], buf, sizeof(buf));
    buf[n] = '\0';
    printf("Child received: %s\n", buf);
    close(pipefd[0]);
    exit(0);
} else {
    // Parent writes
    close(pipefd[0]);          // Close read end (parent doesn't read)
    write(pipefd[1], "hello", 5);
    close(pipefd[1]);          // EOF to child
    wait(NULL);
}

// Named pipe (FIFO): unrelated processes
// mkfifo("/tmp/myfifo", 0666);
// Open as regular file — blocks until both ends open
```

### Shared Memory
```c
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>

// POSIX shared memory: fastest IPC
// Create/open shared memory
int fd = shm_open("/myshm", O_CREAT | O_RDWR, 0666);
ftruncate(fd, sizeof(int));  // Set size

// Map into address space
int *shared = mmap(NULL, sizeof(int),
                   PROT_READ | PROT_WRITE,
                   MAP_SHARED, fd, 0);
close(fd);

// Now multiple processes can read/write *shared
*shared = 42;  // Write

// Unmap when done
munmap(shared, sizeof(int));
// shm_unlink("/myshm");  // Remove from filesystem

// Need synchronization! Use POSIX semaphores:
#include <semaphore.h>
sem_t *sem = sem_open("/mysem", O_CREAT, 0666, 1);
sem_wait(sem);   // Lock (acquire)
// critical section
sem_post(sem);   // Unlock (release)
sem_close(sem);
// sem_unlink("/mysem");
```

### Message Queues (POSIX)
```c
#include <mqueue.h>

// Create/open message queue
mqd_t mq = mq_open("/myqueue", O_CREAT | O_RDWR,
                   0666, NULL);  // NULL = default attributes

// Send message
char msg[] = "hello";
mq_send(mq, msg, strlen(msg), 0);  // priority 0

// Receive message
char buf[256];
unsigned int priority;
mq_receive(mq, buf, sizeof(buf), &priority);

mq_close(mq);
mq_unlink("/myqueue");
```

### Unix Domain Sockets
```c
// Best for high-throughput, bidirectional IPC
// Used by Docker, systemd, X11, DBus
#include <sys/un.h>
#include <sys/socket.h>

// Server
int server_fd = socket(AF_UNIX, SOCK_STREAM, 0);
struct sockaddr_un addr = {.sun_family = AF_UNIX};
strncpy(addr.sun_path, "/tmp/myapp.sock", sizeof(addr.sun_path)-1);
unlink(addr.sun_path);  // Remove stale socket
bind(server_fd, (struct sockaddr*)&addr, sizeof(addr));
listen(server_fd, 10);

int client_fd = accept(server_fd, NULL, NULL);
// read/write on client_fd
```

---

## /proc Filesystem

```bash
# Process information
ls /proc/PID/
  cmdline    # Command line arguments (null-separated)
  cwd        # Symlink to current working directory
  environ    # Environment variables (null-separated)
  exe        # Symlink to executable
  fd/        # Open file descriptors
  maps       # Memory mappings
  mem        # Process memory (readable with ptrace)
  net/       # Network stats
  smaps      # Detailed memory mapping info (includes RSS, PSS)
  stat       # Process stats (for parsing)
  status     # Human-readable status
  wchan      # Kernel function process is waiting in

# Useful commands
cat /proc/PID/status           # PID, PPID, memory, capabilities
cat /proc/PID/maps             # All memory mappings with permissions
cat /proc/PID/fdinfo/N         # Info about file descriptor N
ls -la /proc/PID/fd            # All open files/sockets
cat /proc/PID/net/tcp          # TCP connections of this process
cat /proc/PID/net/unix         # Unix domain socket connections

# System-wide
cat /proc/cpuinfo              # CPU info
cat /proc/meminfo              # Memory info
cat /proc/loadavg              # Load average (1m 5m 15m running/total)
cat /proc/uptime               # Seconds since boot
cat /proc/sys/kernel/pid_max   # Max PID number
```

---

## Namespaces and Cgroups (Containers)

### Linux Namespaces
```
Namespaces: isolate process's view of the system

  PID namespace:    independent PID numbering (init = PID 1 inside)
  Network namespace: own network stack, interfaces, routing
  Mount namespace:  own filesystem mount points
  UTS namespace:    own hostname and domain name
  IPC namespace:    own message queues, shared memory, semaphores
  User namespace:   own UID/GID mappings (unprivileged containers)
  Cgroup namespace: own cgroup root

# Create new namespace
unshare --pid --fork --mount-proc bash   # New PID namespace
# PID 1 inside, isolated from host PIDs

# See namespaces of process
ls -la /proc/PID/ns/

# nsenter: enter existing namespaces (like docker exec)
nsenter -t PID --pid --mount bash
```

### Cgroups (Control Groups)
```bash
# Cgroups: limit and account resource usage
# cgroups v2 (modern)

# Hierarchy: /sys/fs/cgroup/
# Each directory is a cgroup

# Create cgroup and limit memory
mkdir /sys/fs/cgroup/myapp
echo 104857600 > /sys/fs/cgroup/myapp/memory.max  # 100MB limit
echo $$ > /sys/fs/cgroup/myapp/cgroup.procs       # Add current process

# CPU limit (50% of one core)
echo "50000 100000" > /sys/fs/cgroup/myapp/cpu.max  # quota/period

# View current process's cgroup
cat /proc/self/cgroup

# systemd uses cgroups for service isolation
systemctl status nginx           # Shows cgroup for service
systemd-cgtop                    # Real-time cgroup resource monitor
```

---

## Process Monitoring Tools

```bash
# ps: snapshot of processes
ps aux                   # All processes, BSD format
ps -ef                   # All processes, POSIX format
ps aux --sort=-%cpu      # Sort by CPU
ps aux --sort=-%mem      # Sort by memory
ps -o pid,ppid,cmd       # Custom columns
pstree -p                # Process tree with PIDs

# top / htop
top -d 1 -p PID          # Monitor specific PID, 1s refresh
htop                     # Interactive, color, tree view
btop                     # Modern, beautiful resource monitor

# pidstat: per-process statistics
pidstat 1                # All processes, 1s interval
pidstat -p PID 1         # Specific process
pidstat -d 1             # Disk I/O per process
pidstat -r 1             # Memory per process
pidstat -w 1             # Context switches per process
pidstat -t 1             # Per thread stats

# strace: trace system calls
strace command           # Trace system calls
strace -p PID            # Attach to running process
strace -f command        # Follow forks (trace children too)
strace -e trace=open,read,write command  # Only specific syscalls
strace -c command        # Summary of syscall counts/time
strace -T command        # Show time spent in each syscall

# lsof: list open files
lsof -p PID              # All files opened by PID
lsof -i :8080            # Process using port 8080
lsof -u username         # All files by user
lsof +D /path            # All processes with files in directory

# perf: Linux profiler
perf stat command        # Hardware counter statistics
perf top                 # Real-time profiling (like top but function-level)
perf record -g command   # Record with call graphs
perf report              # Analyze recording
perf trace -p PID        # Trace like strace but lower overhead
```

---

*Understanding process management is understanding how the OS juggles work. Everything from Docker containers to async servers to build systems depends on these primitives.*
