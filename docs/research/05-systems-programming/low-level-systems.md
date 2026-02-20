# Low-Level Systems — Complete Reference

> Assembly, memory layout, OS internals, POSIX programming. The floor below which there is no floor.

---

## x86-64 Assembly

### Registers
```
General Purpose (64-bit / 32-bit / 16-bit / 8-bit):
  rax / eax / ax / al,ah   — Accumulator, function return value
  rbx / ebx / bx / bl,bh   — Base, callee-saved
  rcx / ecx / cx / cl,ch   — Counter (loops, shifts)
  rdx / edx / dx / dl,dh   — Data, 2nd return value
  rsi / esi / si / sil      — Source index, arg 2
  rdi / edi / di / dil      — Destination index, arg 1
  rsp / esp / sp / spl      — Stack pointer
  rbp / ebp / bp / bpl      — Base/frame pointer (callee-saved)
  r8–r15                    — Additional (r8–r11: caller-saved, r12–r15: callee-saved)

Special:
  rip      — Instruction pointer (program counter)
  rflags   — Status flags (ZF, SF, CF, OF, PF, AF)
    ZF: Zero flag — set if result is zero
    SF: Sign flag — set if result is negative
    CF: Carry flag — set if unsigned overflow
    OF: Overflow flag — set if signed overflow

SIMD:
  xmm0–xmm15   — 128-bit (SSE)
  ymm0–ymm15   — 256-bit (AVX)
  zmm0–zmm31   — 512-bit (AVX-512)
```

### Linux System Call Convention (x86-64)
```
syscall number: rax
arguments:      rdi, rsi, rdx, r10, r8, r9
return value:   rax (negative = errno)

Common syscalls:
  0  = read(fd, buf, count)
  1  = write(fd, buf, count)
  2  = open(path, flags, mode)
  3  = close(fd)
  60 = exit(status)
  57 = fork()
  59 = execve(path, argv, envp)
  9  = mmap(addr, len, prot, flags, fd, offset)
  11 = munmap(addr, len)
  231 = exit_group(status)

System call instruction: syscall
```

### System Call Convention (C function calls)
```
First 6 integer/pointer args: rdi, rsi, rdx, rcx, r8, r9
Float args: xmm0–xmm7
Return value: rax (+ rdx for 128-bit)
Stack: aligned to 16 bytes before call instruction
Caller-saved: rax, rcx, rdx, rsi, rdi, r8-r11, xmm0-xmm15
Callee-saved: rbx, rbp, r12-r15 (must save/restore)
```

### Basic Instructions
```asm
; Data movement
mov rax, 42          ; rax = 42 (immediate)
mov rax, rbx         ; rax = rbx (register to register)
mov rax, [rbx]       ; rax = *rbx (load from memory)
mov [rbx], rax       ; *rbx = rax (store to memory)
mov rax, [rbx+8]     ; rax = *(rbx + 8)
mov rax, [rbx+rcx*4] ; scaled index addressing
lea rax, [rbx+8]     ; rax = rbx + 8 (load effective address — arithmetic)
movsx rax, dword ptr [rbx]  ; Sign-extend 32→64 bit
movzx rax, byte ptr [rbx]   ; Zero-extend 8→64 bit

; Arithmetic
add rax, rbx         ; rax += rbx
sub rax, rbx         ; rax -= rbx
imul rax, rbx        ; rax *= rbx (signed)
idiv rbx             ; rdx:rax / rbx → quotient in rax, remainder in rdx
inc rax              ; rax++
dec rax              ; rax--
neg rax              ; rax = -rax

; Bitwise
and rax, rbx
or  rax, rbx
xor rax, rbx         ; Also used to zero: xor eax, eax (faster than mov eax, 0)
not rax
shl rax, 3           ; Logical shift left (multiply by 8)
shr rax, 3           ; Logical shift right (unsigned divide by 8)
sar rax, 3           ; Arithmetic shift right (signed divide by 8)

; Comparison (sets flags, no result stored)
cmp rax, rbx         ; rax - rbx (flags only)
test rax, rbx        ; rax & rbx (flags only)
test rax, rax        ; Check if rax == 0

; Jumps
jmp label            ; Unconditional jump
je  label            ; Jump if equal (ZF=1)
jne label            ; Jump if not equal (ZF=0)
jl  label            ; Jump if less (signed)
jle label            ; Jump if less or equal (signed)
jg  label            ; Jump if greater (signed)
jge label            ; Jump if greater or equal (signed)
jb  label            ; Jump if below (unsigned)
ja  label            ; Jump if above (unsigned)

; Stack
push rax             ; rsp -= 8; [rsp] = rax
pop  rax             ; rax = [rsp]; rsp += 8
call label           ; push rip; jmp label
ret                  ; pop rip
```

### Hello World in Assembly (Linux)
```asm
section .data
    msg db "Hello, World!", 10   ; 10 = newline
    msg_len equ $ - msg

section .text
    global _start

_start:
    ; write(1, msg, msg_len)
    mov rax, 1          ; syscall: write
    mov rdi, 1          ; fd: stdout
    mov rsi, msg        ; buffer
    mov rdx, msg_len    ; length
    syscall

    ; exit(0)
    mov rax, 60         ; syscall: exit
    xor rdi, rdi        ; status: 0
    syscall

; Assemble and run:
; nasm -f elf64 hello.asm -o hello.o
; ld hello.o -o hello
; ./hello
```

### Stack Frame Layout
```
Function call creates a stack frame:

High address
  ┌─────────────────────┐  ← previous rsp (before call)
  │   caller's locals   │
  ├─────────────────────┤
  │   caller's rbp      │  ← saved base pointer
  │   (callee-saved)    │
  ├─────────────────────┤  ← rsp after prologue
  │   local var 1       │  rbp - 8
  │   local var 2       │  rbp - 16
  │   ...               │
  └─────────────────────┘
Low address

Prologue:
  push rbp         ; Save caller's frame pointer
  mov rbp, rsp     ; Set frame pointer to current stack top
  sub rsp, 32      ; Allocate 32 bytes for locals

Epilogue:
  mov rsp, rbp     ; Restore stack pointer
  pop rbp          ; Restore caller's frame pointer
  ret              ; Return to caller
```

---

## POSIX System Programming

### Process Management
```c
#include <unistd.h>
#include <sys/wait.h>
#include <sys/types.h>

// fork: creates a copy of the current process
pid_t pid = fork();
if (pid < 0) {
    perror("fork");
    exit(1);
} else if (pid == 0) {
    // Child process: pid == 0
    printf("Child PID: %d, Parent PID: %d\n", getpid(), getppid());
    exit(0);
} else {
    // Parent process: pid == child's PID
    printf("Parent: Child PID is %d\n", pid);

    // Wait for child
    int status;
    waitpid(pid, &status, 0);
    if (WIFEXITED(status)) {
        printf("Child exited with %d\n", WEXITSTATUS(status));
    }
}

// execve: replace current process image
char *argv[] = {"/bin/ls", "-la", NULL};
char *envp[] = {NULL};
execve("/bin/ls", argv, envp);
// Only returns on error

// Common pattern: fork + exec
pid = fork();
if (pid == 0) {
    execvp("ls", (char*[]){"ls", "-la", NULL});
    perror("exec");
    exit(1);
}
```

### Signals
```c
#include <signal.h>

// Register signal handler
void handler(int sig) {
    // Must be async-signal-safe!
    write(STDOUT_FILENO, "Caught SIGINT\n", 14);  // write is async-safe
    // printf is NOT async-signal-safe
}

struct sigaction sa = {
    .sa_handler = handler,
    .sa_flags = SA_RESTART,  // Restart interrupted syscalls
};
sigemptyset(&sa.sa_mask);
sigaction(SIGINT, &sa, NULL);

// Block signals
sigset_t mask;
sigemptyset(&mask);
sigaddset(&mask, SIGTERM);
sigprocmask(SIG_BLOCK, &mask, NULL);

// Send signal
kill(pid, SIGTERM);    // Send to specific process
raise(SIGUSR1);        // Send to self

// Common signals:
// SIGINT  (2)  — Ctrl+C
// SIGTERM (15) — Terminate request (catchable)
// SIGKILL (9)  — Kill immediately (cannot be caught)
// SIGSEGV (11) — Segmentation fault
// SIGCHLD (17) — Child process changed state
// SIGUSR1 (10), SIGUSR2 (12) — User-defined
// SIGPIPE (13) — Write to broken pipe
// SIGALRM (14) — Alarm clock (timer)
```

### IPC: Pipes
```c
#include <unistd.h>

// Anonymous pipe (parent-child only)
int pipefd[2];  // [0] = read end, [1] = write end
pipe(pipefd);

pid_t pid = fork();
if (pid == 0) {
    close(pipefd[1]);        // Child: close write end
    char buf[256];
    ssize_t n = read(pipefd[0], buf, sizeof(buf));
    buf[n] = '\0';
    printf("Child received: %s\n", buf);
    close(pipefd[0]);
    exit(0);
} else {
    close(pipefd[0]);        // Parent: close read end
    write(pipefd[1], "Hello", 5);
    close(pipefd[1]);        // Signal EOF to child
    wait(NULL);
}

// Named pipe (FIFO) — unrelated processes
mkfifo("/tmp/myfifo", 0666);
// Process A:
int fd = open("/tmp/myfifo", O_WRONLY);
write(fd, data, len);
// Process B:
int fd = open("/tmp/myfifo", O_RDONLY);  // Blocks until writer
read(fd, buf, len);
```

### IPC: Shared Memory
```c
#include <sys/mman.h>
#include <sys/stat.h>
#include <fcntl.h>

// POSIX shared memory
int shm_fd = shm_open("/myshm", O_CREAT | O_RDWR, 0666);
ftruncate(shm_fd, 4096);  // Set size

void *shm = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, shm_fd, 0);

// Use shm like normal memory
*((int *)shm) = 42;

// Another process:
int shm_fd2 = shm_open("/myshm", O_RDWR, 0666);
void *shm2 = mmap(NULL, 4096, PROT_READ | PROT_WRITE, MAP_SHARED, shm_fd2, 0);
int val = *((int *)shm2);  // 42

// Cleanup
munmap(shm, 4096);
shm_unlink("/myshm");
```

### IPC: Sockets
```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

// TCP Server
int server_fd = socket(AF_INET, SOCK_STREAM, 0);

// Allow reuse of port immediately after kill
int opt = 1;
setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));

struct sockaddr_in addr = {
    .sin_family = AF_INET,
    .sin_addr.s_addr = INADDR_ANY,
    .sin_port = htons(8080),
};

bind(server_fd, (struct sockaddr*)&addr, sizeof(addr));
listen(server_fd, 128);  // Backlog: queue size

while (1) {
    struct sockaddr_in client_addr;
    socklen_t client_len = sizeof(client_addr);
    int client_fd = accept(server_fd, (struct sockaddr*)&client_addr, &client_len);

    char buf[4096];
    ssize_t n = recv(client_fd, buf, sizeof(buf), 0);
    send(client_fd, "HTTP/1.1 200 OK\r\n\r\nHello", 24, 0);
    close(client_fd);
}

// TCP Client
int sock = socket(AF_INET, SOCK_STREAM, 0);
struct sockaddr_in server = {
    .sin_family = AF_INET,
    .sin_port = htons(80),
};
inet_pton(AF_INET, "93.184.216.34", &server.sin_addr);
connect(sock, (struct sockaddr*)&server, sizeof(server));
send(sock, "GET / HTTP/1.1\r\nHost: example.com\r\n\r\n", 38, 0);
```

### Memory Mapping
```c
#include <sys/mman.h>

// Map file into memory (zero-copy file I/O)
int fd = open("large_file.bin", O_RDONLY);
struct stat st;
fstat(fd, &st);
size_t size = st.st_size;

void *data = mmap(NULL, size, PROT_READ, MAP_PRIVATE, fd, 0);
close(fd);  // fd no longer needed after mmap

// Access file like an array
char *bytes = (char *)data;
for (size_t i = 0; i < size; i++) {
    process(bytes[i]);
}

munmap(data, size);

// Anonymous mapping (large allocations, bypass malloc)
void *buf = mmap(NULL, 1024*1024, PROT_READ|PROT_WRITE,
                 MAP_PRIVATE|MAP_ANONYMOUS, -1, 0);
// Use buf...
munmap(buf, 1024*1024);

// mprotect: change permissions
mprotect(buf, 4096, PROT_READ);  // Make first page read-only

// madvise: hints to kernel
madvise(data, size, MADV_SEQUENTIAL);  // Will access sequentially
madvise(data, size, MADV_WILLNEED);    // Pre-fault pages
madvise(data, size, MADV_DONTNEED);    // Free pages (not needed)
```

---

## Kernel Internals

### System Call Flow
```
User program calls open("file", O_RDONLY)
    ↓
C library (glibc/musl) sets up registers:
    rax = 2 (syscall number for open)
    rdi = address of "file"
    rsi = 0 (O_RDONLY)
    ↓
syscall instruction → CPU switches to ring 0
    ↓
Kernel syscall dispatcher (sys_call_table[2] = sys_open)
    ↓
sys_open → namei() → VFS → filesystem driver → disk I/O
    ↓
Return value in rax (fd number or -errno)
    ↓
CPU switches back to ring 3, returns from syscall
    ↓
C library checks for error (rax is -ENOENT etc.), sets errno
```

### Kernel Memory Layout (x86-64 Linux)
```
Virtual Address Space (64-bit, 48-bit used):

0x0000000000000000 - 0x00007fffffffffff  User space (128 TB)
  0x000000000000xxxx    First page unmapped (NULL dereference catch)
  0x0000555555554xxx    Program .text (if ASLR off)
  0x00007fffffffeaaa    Stack (grows down)

0xffff800000000000 - 0xffffffffffffffff  Kernel space (128 TB)
  0xffff888000000000    Direct physical memory mapping
  0xffffffff80000000    Kernel .text, .data, .bss
  0xffffffff82000000    Kernel modules
```

### Interrupt Handling
```
Hardware interrupt (e.g., network packet arrives):
1. CPU finishes current instruction
2. Saves registers to kernel stack
3. Jumps to Interrupt Descriptor Table (IDT) entry
4. Kernel interrupt handler runs in interrupt context
   → Cannot sleep, no sleeping locks
   → Very short (top half)
5. Schedules deferred work (tasklet, softirq, workqueue)
6. Returns to interrupted code

Software interrupt (trap):
   Page fault (vector 14) → page fault handler
   Divide by zero (vector 0) → SIGFPE
   Undefined instruction → SIGILL
   Debug/breakpoint (int 3) → ptrace
```

---

## ELF Binary Format

```
ELF Header (52/64 bytes):
  Magic: 7f 45 4c 46 (0x7f 'E' 'L' 'F')
  Class: 1=32-bit, 2=64-bit
  Data: 1=little-endian, 2=big-endian
  Type: ET_EXEC=2, ET_DYN=3 (shared lib), ET_REL=1 (object file)
  Machine: EM_X86_64=62
  Entry point: address where execution begins

Program Headers (segments, used at runtime):
  PT_LOAD: loadable segment (maps to memory)
    .text segment: R+X (read+execute)
    .data/.bss segment: R+W (read+write)
  PT_INTERP: path to dynamic linker (/lib64/ld-linux-x86-64.so.2)
  PT_DYNAMIC: dynamic linking information
  PT_GNU_STACK: stack permissions

Section Headers (used by linker, stripped in final binary):
  .text    — executable code
  .data    — initialized global variables
  .bss     — uninitialized globals (no space in file, zeroed at load)
  .rodata  — read-only constants, string literals
  .plt     — Procedure Linkage Table (lazy binding stubs)
  .got     — Global Offset Table (addresses of globals/functions)
  .got.plt — GOT entries for PLT
  .symtab  — symbol table
  .strtab  — string table
  .debug_* — DWARF debug info
```

### Dynamic Linking
```
When calling printf() from a dynamically linked binary:
1. call printf → jumps to printf@plt stub
2. PLT stub: jump to [got.plt[printf]]
   First call: GOT entry points back to PLT resolver
3. PLT resolver: calls ld.so to find printf's real address
4. ld.so patches GOT entry with real address of printf in libc
5. Subsequent calls: PLT → GOT → real printf directly

Tools:
  readelf -h binary          # ELF header
  readelf -S binary          # Section headers
  readelf -l binary          # Program headers (segments)
  objdump -d binary          # Disassemble .text
  nm binary                  # Symbol table
  ldd binary                 # Dynamic library dependencies
  strings binary             # Printable strings
  file binary                # Binary type
  strace ./binary            # Trace system calls
  ltrace ./binary            # Trace library calls
```

---

## Performance and Optimization

### CPU Pipeline Effects
```c
// Branch prediction: sorted data is faster
// Random branches → pipeline flushes → 5-10 cycle penalty

// Unpredictable branch (avoid in hot loops)
for (int i = 0; i < N; i++)
    if (data[i] > 50)    // ~50% branch, unpredictable
        sum += data[i];

// Branchless (no mispredictions)
for (int i = 0; i < N; i++)
    sum += data[i] * (data[i] > 50);  // Multiply by 0 or 1

// Prefetch: hide memory latency
for (int i = 0; i < N; i++) {
    __builtin_prefetch(&data[i + 16], 0, 1);  // Prefetch ahead
    process(data[i]);
}

// Memory barriers
__sync_synchronize();           // Full barrier
__asm__ volatile("mfence");     // x86 store+load barrier
__asm__ volatile("sfence");     // x86 store barrier
__asm__ volatile("lfence");     // x86 load barrier

// Atomic without locks (lock-free)
__atomic_fetch_add(&counter, 1, __ATOMIC_SEQ_CST);
__atomic_compare_exchange_n(&head, &old, new, false,
                             __ATOMIC_ACQ_REL, __ATOMIC_ACQUIRE);
```

---

*Assembly is not just for exploits and drivers — understanding it makes you read compiler output, debug impossible bugs, and optimize for the hardware.*
