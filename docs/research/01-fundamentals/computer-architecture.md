# Computer Architecture — From Transistors to CPUs

> Understanding the machine is what separates engineers from programmers.

---

## From Transistors to Logic Gates

### The MOSFET
The fundamental unit of modern computing. A transistor with:
- **Gate**: control terminal (voltage here opens/closes the switch)
- **Source / Drain**: current flows when gate is open
- NMOS: closed when gate = HIGH
- PMOS: closed when gate = LOW

### Logic Gates
Built from transistors (CMOS = Complementary MOS):
- NAND gate = 2 NMOS + 2 PMOS
- All boolean functions are expressible with NAND alone (NAND-complete)

| Gate | Symbol | Truth |
|---|---|---|
| AND | A · B | 1 only if both inputs 1 |
| OR | A + B | 1 if at least one input 1 |
| NOT | Ā | Inverts input |
| NAND | ¬(A·B) | Universal gate |
| NOR | ¬(A+B) | Universal gate |
| XOR | A⊕B | 1 if inputs differ |

---

## Binary, Hex, and Number Representation

### Two's Complement
Standard way to represent signed integers:
- Positive numbers: same as unsigned
- Negate: flip all bits, add 1
- Range for n-bit: -2^(n-1) to 2^(n-1)-1
- MSB = sign bit

```
8-bit: -128 to 127
32-bit: -2,147,483,648 to 2,147,483,647
```

### IEEE 754 Floating Point
32-bit float: `[1 sign][8 exponent][23 mantissa]`
- Value = (-1)^s × 1.mantissa × 2^(exponent-127)
- Special: 0, infinity, NaN
- Precision: ~7 decimal digits
- `0.1 + 0.2 ≠ 0.3` — floating point is approximation

64-bit double: `[1][11][52]`
- Precision: ~15-17 decimal digits

---

## CPU Architecture

### Von Neumann Architecture
- Single memory for data and instructions
- CPU ↔ Memory bus bottleneck ("Von Neumann bottleneck")
- Components: ALU, Control Unit, Memory, I/O

### Harvard Architecture
- Separate instruction and data memory
- Allows simultaneous fetch + data access
- Used in: microcontrollers, DSPs, modern CPU caches (effectively)

### CPU Components

#### ALU (Arithmetic Logic Unit)
- Performs integer arithmetic (+, -, ×, ÷)
- Logical operations (AND, OR, XOR, NOT, shifts)
- Comparisons (sets flags: Zero, Carry, Overflow, Sign)

#### FPU (Floating Point Unit)
- IEEE 754 floating point operations
- Modern CPUs integrate FPU on-die

#### Control Unit
- Fetches instructions from memory (using PC register)
- Decodes instruction format
- Dispatches to appropriate execution unit
- Manages pipeline stages

#### Registers
Fastest storage in the system. Inside CPU die.
- **General purpose**: RAX, RBX, RCX, RDX, RSI, RDI, R8-R15 (x86-64)
- **Special**: RSP (stack pointer), RBP (base pointer), RIP (instruction pointer)
- **Flags**: RFLAGS — carries comparison results
- **Segment**: CS, DS, SS, ES, FS, GS

### Instruction Set Architecture (ISA)

#### x86-64 (AMD64)
- CISC: Complex Instruction Set Computer
- Variable-length instructions (1-15 bytes)
- Hundreds of instructions
- Dominant in desktops, servers, laptops
- Registers: RAX, RBX, RCX, RDX, RSI, RDI, R8-R15, RSP, RBP, RIP

#### ARM (AArch64)
- RISC: Reduced Instruction Set Computer
- Fixed 32-bit instruction width
- Load/store architecture (only load/store accesses memory)
- Dominant in mobile (A-series, Snapdragon), embedded, now servers (AWS Graviton, Apple Silicon)

#### RISC-V
- Open-source ISA, royalty-free
- Growing in embedded, research, emerging in datacenter

#### CISC vs RISC
| | CISC (x86) | RISC (ARM) |
|---|---|---|
| Instruction count | Many | Few |
| Instruction length | Variable | Fixed |
| Memory ops | Direct | Load/Store only |
| Complexity | In hardware | In compiler/software |
| Power | Higher | Lower |

---

## The CPU Pipeline

### Basic 5-Stage Pipeline (RISC)
```
IF → ID → EX → MEM → WB
```
- **IF**: Instruction Fetch — read instruction at PC from I-cache
- **ID**: Instruction Decode — determine operation, read registers
- **EX**: Execute — ALU operation, address calculation
- **MEM**: Memory Access — load/store data
- **WB**: Write Back — write result to register file

Without pipeline: 1 instruction per 5 cycles.
With pipeline: 1 instruction per cycle (steady state).

### Pipeline Hazards

#### Structural Hazard
Two instructions need same hardware unit simultaneously.
Solution: duplicate units or stall.

#### Data Hazard (RAW — Read After Write)
```
ADD R1, R2, R3   ; writes R1
SUB R4, R1, R5   ; reads R1 before ADD writes it
```
Solutions:
- **Forwarding/Bypassing**: wire result directly to next instruction
- **Stalling**: insert NOP bubbles
- **Out-of-order execution**: reorder instructions (OoO)

#### Control Hazard (Branch)
Branch outcome not known until EX stage. Pipeline already fetched wrong instructions.
Solutions:
- **Branch prediction**: predict taken/not taken
- **Speculative execution**: execute predicted path
- **Branch delay slots**: always execute instruction after branch (MIPS)

### Branch Prediction
Modern CPUs achieve ~95-99% prediction accuracy:
- **Static**: always predict not-taken
- **Bimodal predictor**: 2-bit saturating counter per branch
- **Tournament predictor**: combines local + global history
- **TAGE predictor**: state of the art, uses tagged geometric history tables

Branch misprediction cost: 15-25 cycles (flush pipeline, restart correct path)

### Superscalar Execution
Multiple execution units → multiple instructions per cycle (IPC > 1)
- x86 modern CPUs: 4-6 instructions/cycle
- Out-of-order issue queue
- Register renaming: eliminates WAR/WAW false dependencies

### Speculative Execution (Meltdown/Spectre)
CPU executes instructions speculatively before knowing if they're valid.
If speculation is wrong, results are discarded — but cache state may leak.
**Spectre/Meltdown (2018)**: exploited speculative execution to read kernel memory from userspace.

---

## Memory Hierarchy

### Why Hierarchy?
Fundamental trade-off: fast ↔ cheap ↔ large (can only pick two)

```
         Speed   Size    Cost/byte
L1 Cache   ~1ns   32-64KB   $$$$$
L2 Cache   ~4ns   256-512KB $$$$
L3 Cache   ~15ns  8-32MB    $$$
DRAM       ~60ns  16-128GB  $$
SSD/NVMe   ~50µs  1-8TB     $
HDD        ~5ms   1-20TB    ¢
```

### Cache Organization

#### Cache Line
- Basic unit of cache transfer (typically 64 bytes)
- When you access 1 byte, CPU loads 64 bytes to cache
- **Spatial locality**: adjacent data in same cache line

#### Associativity
- **Direct-mapped**: each memory block maps to exactly 1 cache line
  - Fast, but high conflict miss rate
- **Fully associative**: block can go anywhere
  - No conflicts, but expensive to search
- **n-way set associative**: n possible locations per address
  - Compromise: 4-way, 8-way, 16-way common

#### Cache Address Breakdown (for n-way set associative):
`[tag bits][index bits][offset bits]`
- Offset: select byte within cache line (log2(64) = 6 bits)
- Index: select cache set
- Tag: verify correct block

#### Replacement Policies
- **LRU**: evict least recently used (expensive to implement exactly)
- **Pseudo-LRU**: approximation using bit tree
- **Random**: simple, surprisingly effective
- **FIFO**: first in, first out

#### Cache Coherence (Multi-Core)
Problem: each core has own L1/L2. Write to address X on Core 0 must be visible to Core 1.
**MESI Protocol**:
- **M**odified: only this cache has valid copy, dirty
- **E**xclusive: only this cache has copy, clean
- **S**hared: multiple caches have valid copy
- **I**nvalid: data is stale

**False sharing**: two threads modify different variables in same cache line → constant invalidation → terrible performance.

### DRAM Internals
- Capacitor + transistor per bit (charge = 1, no charge = 0)
- Must refresh every ~64ms (capacitors leak)
- Access: row activate → column select → precharge
- **Bank interleaving**: multiple banks for parallel access
- **Channels**: modern CPUs support dual/quad channel memory

### Memory Controllers & NUMA
- **UMA**: Uniform Memory Access — all CPUs equal distance to memory
- **NUMA**: Non-Uniform Memory Access — local memory faster than remote
  - Modern multi-socket servers use NUMA
  - `numactl`, `taskset` for NUMA-aware placement

---

## Virtual Memory

### Address Spaces
Every process gets its own virtual address space (illusion of owning all memory).
- Virtual addresses → Physical addresses (via OS + hardware translation)
- Process isolation: processes can't read each other's memory

### Page Tables
- Memory divided into **pages** (typically 4KB)
- Page table maps virtual page number → physical frame number
- MMU (Memory Management Unit) performs translation

### TLB (Translation Lookaside Buffer)
- Cache for page table entries
- TLB hit: 1 cycle. TLB miss: 10-100+ cycles (page table walk)
- TLB typically holds 64-1024 entries
- `mmap`, `huge pages` to reduce TLB pressure

### Page Faults
- Access to unmapped virtual page → page fault → OS handles
- **Minor fault**: page in memory but not mapped (just update page table)
- **Major fault**: page must be loaded from disk (swap)
- Copy-on-Write (CoW): `fork()` shares pages until write

### Segmentation vs Paging
- **Segmentation**: variable-size regions (code, data, stack) — used in early x86
- **Paging**: fixed-size pages — used by modern OSes
- x86-64: segmentation mostly vestigial, paging dominant

---

## I/O Subsystem

### I/O Methods
- **Programmed I/O (PIO)**: CPU polls device status in loop (wasteful)
- **Interrupt-driven**: device raises interrupt when ready
- **DMA (Direct Memory Access)**: device transfers data directly to RAM, interrupts CPU when done

### Bus Architecture
- **PCI Express (PCIe)**: high-speed serial bus
  - PCIe 4.0 x16: ~32 GB/s
  - GPU, NVMe SSDs connect via PCIe
- **USB**: Universal Serial Bus for peripherals
- **SATA**: Serial ATA for spinning disk
- **NVMe**: over PCIe, latency ~50µs vs SATA ~100µs

### Interrupts
- IRQ (Interrupt Request) from hardware
- CPU saves state, jumps to ISR (Interrupt Service Routine)
- **Maskable**: can be disabled (e.g., during critical section)
- **Non-maskable (NMI)**: hardware faults, debugger

---

## Performance Optimization Implications

### Cache-Friendly Code
```c
// BAD: column-major traversal, cache misses
for (int j = 0; j < N; j++)
    for (int i = 0; i < N; i++)
        sum += matrix[i][j];

// GOOD: row-major traversal, sequential access
for (int i = 0; i < N; i++)
    for (int j = 0; j < N; j++)
        sum += matrix[i][j];
```

### False Sharing Example
```c
// BAD: counter[0] and counter[1] in same cache line
int counter[2];
// Thread 0 writes counter[0], Thread 1 writes counter[1]
// → Cache line ping-pong

// GOOD: pad to separate cache lines
struct { int val; char pad[60]; } counter[2];
```

### Branch Prediction Hints
```c
// GCC/Clang likely/unlikely hints
if (__builtin_expect(error, 0)) { ... }
```

### Amdahl's Law
Speedup from parallelizing fraction `p` of work with `n` processors:
`S = 1 / ((1-p) + p/n)`

Serial fraction dominates at scale. 5% serial = max ~20x speedup.

---

*Know this material and you'll write code that respects the machine.*
