# Reverse Engineering — Complete Reference

> Reverse engineering is the art of understanding systems without documentation. It builds the deepest understanding of how software actually works.

---

## What Is Reverse Engineering?

```
Software RE goals:
  → Understand how software works (without source code)
  → Find security vulnerabilities
  → Analyze malware
  → Verify security claims
  → Interoperability (write compatible code)
  → CTF challenges

Legal contexts:
  → Security research (authorized)
  → Malware analysis
  → CTF competitions
  → Interoperability (often protected by law)
  → Vulnerability research for CVEs

Static analysis: analyze binary without running it
  Tools: Ghidra, IDA Pro, Binary Ninja, radare2, objdump

Dynamic analysis: run the binary, observe behavior
  Tools: GDB, x64dbg, Frida, ltrace, strace, Wireshark
```

---

## Static Analysis Workflow

### Initial Triage
```bash
# Step 1: Determine file type
file binary
file malware.exe
file suspicious.pdf

# Step 2: Check for strings
strings -n 8 binary              # Strings >= 8 chars
strings -e l binary              # Wide strings (Windows Unicode)
strings binary | grep -i "password\|key\|flag\|secret\|http\|admin"

# Step 3: ELF analysis (Linux)
readelf -h binary                # ELF header (arch, type, entry point)
readelf -S binary                # Section headers
readelf -d binary                # Dynamic section (linked libraries)
objdump -d binary                # Disassemble all text sections
objdump -d binary | grep -A3 "call"  # Find all function calls
nm binary                        # Symbol table
nm binary | grep " T "           # Defined functions
nm binary | grep " U "           # Imported symbols

# Step 4: PE analysis (Windows)
pescan malware.exe               # PE security scanner
pecheck malware.exe              # PE structure
diec malware.exe                 # Detect it easy (packer detection)
strings -e l malware.exe         # Unicode strings (Windows often uses these)

# Step 5: Dependencies
ldd binary                       # Dynamic library dependencies (Linux)
# Process Monitor on Windows: track DLL loading

# Step 6: Entropy analysis
binwalk -E binary                # Plot entropy (high entropy = packed/encrypted)
# Packed sections have entropy > 7.0
```

### Ghidra

```
Ghidra (NSA open-source decompiler):
  Free, powerful, produces readable pseudocode

Workflow:
  1. File → New Project → Import file
  2. Auto-analyze (CodeBrowser → Analysis → Auto Analyze All)
  3. Window → Symbol Tree → Functions → main/start/WinMain
  4. Use decompiler view (right side) for pseudocode

Key features:
  Decompiler: C-like pseudocode from disassembly
  Graphs: call graph, program graph, data flow
  Cross-references: find all callers of a function
  Scripts: automate analysis (Java or Python)
  Rename variables: click → L to rename (improves readability)
  Retype variables: click type → change to improve decompiler output

Navigation:
  G: go to address
  L: rename label/variable
  T: retype variable
  ; (semicolon): add comment
  Ctrl+Shift+E: Export to C
  Ctrl+F: search
  Right-click function → References To: see callers
```

### IDA Pro Tips
```
IDA Pro (industry standard, expensive):

Navigation:
  Space: toggle disassembly ↔ graph view
  N: rename
  Y: retype
  ;: add comment (regular)
  Alt+;: repeatable comment (shows everywhere function called)
  X: cross-references (find callers, references to data)
  Ctrl+E: entry points
  Ctrl+L: jump by name

Pseudocode (F5):
  Tab: toggle between disassembly and pseudocode
  Click variable → N: rename for clarity

Search:
  Alt+T: text search in disassembly
  Ctrl+F: function list
  Alt+I: search immediate values (constants, magic numbers)

Useful IDA plugins:
  FLIRT signatures: identify library functions
  Lumina: cloud-based function name sharing
  BinDiff: compare two binaries
  ret-sync: sync IDA with GDB/x64dbg for combined static+dynamic
```

---

## Dynamic Analysis

### GDB for Reverse Engineering
```bash
# Compile with debug info
gcc -g -O0 -o debug_binary source.c
# Or analyze without debug info (common in RE)
gdb ./binary

# GDB commands for RE
(gdb) info functions            # List all functions
(gdb) info functions main.*     # Functions matching pattern
(gdb) disassemble main          # Disassemble function
(gdb) disassemble /r 0x401000   # Disassemble at address with bytes
(gdb) break main                # Breakpoint at function
(gdb) break *0x401234           # Breakpoint at address
(gdb) run [args]

# Examine memory and registers
(gdb) info registers            # All registers
(gdb) print $rax                # Register value
(gdb) x/20x $rsp               # 20 hex words at RSP
(gdb) x/s 0x402000              # String at address
(gdb) x/10i $rip                # 10 instructions at current position

# Follow execution
(gdb) si                        # Step instruction (into calls)
(gdb) ni                        # Next instruction (over calls)
(gdb) c                         # Continue to next breakpoint
(gdb) finish                    # Run until function returns

# Modify execution (useful for patching)
(gdb) set $rax = 0              # Change register
(gdb) set *(int*)0x601234 = 1   # Change memory
(gdb) jump *0x401300            # Jump to address (skip code)

# Watchpoints (break when memory changes)
(gdb) watch *0x601234           # Break when value changes
(gdb) rwatch *0x601234          # Break when read
(gdb) awatch *0x601234          # Break when read or written

# GDB with PEDA/pwndbg (enhanced UI)
# PEDA: pattern, checksec, rop, searchmem, vmmap
(gdb) checksec                  # Show binary protections
(gdb) vmmap                     # Memory map with permissions
(gdb) searchmem "/bin/sh"       # Search all memory for string
(gdb) telescope $rsp 20         # Show stack with resolved pointers (pwndbg)
```

### Frida (Dynamic Instrumentation)
```javascript
// Frida: inject JavaScript into running processes
// Use for: hooking functions, tracing calls, bypassing checks

// Attach to process
// frida-ps -a  → list processes
// frida -p 1234 -l script.js  → attach
// frida -n processname -l script.js

// Hook a function by name
Interceptor.attach(Module.getExportByName(null, 'strcmp'), {
    onEnter: function(args) {
        // Log both strings being compared
        console.log('[strcmp]');
        console.log('  s1: ' + args[0].readUtf8String());
        console.log('  s2: ' + args[1].readUtf8String());
        this.s1 = args[0].readUtf8String();
    },
    onLeave: function(retval) {
        console.log('  result: ' + retval);
        // Force strcmp to return 0 (equal) — bypass comparison
        // retval.replace(0);
    }
});

// Hook by address
const targetFunc = ptr('0x401234');
Interceptor.attach(targetFunc, {
    onEnter: function(args) {
        console.log('targetFunc called, arg0 = ' + args[0]);
    }
});

// Replace function entirely
const originalFunc = new NativeFunction(ptr('0x401234'), 'int', ['int']);
Interceptor.replace(ptr('0x401234'), new NativeCallback(function(arg0) {
    console.log('Intercepted! arg0 = ' + arg0);
    return 1;  // Always return 1
}, 'int', ['int']));

// Read/write memory
const addr = ptr('0x601234');
console.log(addr.readS32());           // Read 32-bit signed integer
addr.writeByteArray([0x90, 0x90]);     // Patch: NOP NOP
console.log(addr.readUtf8String());    // Read string
console.log(hexdump(addr, { length: 64 }));  // Hex dump

// Enumerate modules
Process.enumerateModules().forEach(function(mod) {
    console.log(mod.name + ' @ ' + mod.base + ' size=' + mod.size);
});

// Find function in module
const func = Module.findExportByName('libssl.so', 'SSL_read');
console.log('SSL_read @ ' + func);
```

---

## Malware Analysis

### Safe Environment
```
NEVER analyze malware on your main machine.

Safe setup:
  1. Isolated VM (VirtualBox/VMware with Host-Only networking)
  2. Snapshot BEFORE running malware
  3. No shared folders with host
  4. REMnux (Linux) or FlareVM (Windows) VMs preconfigured for malware analysis
  5. Disable network or use INetSim (simulates internet services)

Virtual machine detection (malware checks for):
  VMware: CPUID leaf 40000000, registry keys, device names
  VirtualBox: device drivers, registry keys, window title
  Sandbox: timing checks, user activity detection, sleep()

Counter-detection:
  Use KVM instead of VMware (harder to detect)
  Add realistic-looking files, browser history
  Patch GetTickCount to prevent timing-based detection
  Use Pafish to test how detectable your VM is
```

### Static Malware Analysis
```bash
# Extract indicators of compromise (IOCs)
strings malware.exe | grep -E "(http|https|ftp)://"  # URLs
strings malware.exe | grep -E "[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+"  # IPs
strings malware.exe | grep -E "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]"  # Emails
strings malware.exe | grep -iE "(HKEY|HKLM|HKCU)"  # Registry keys
strings malware.exe | grep -iE "(cmd|powershell|wscript|cscript)"  # Script engines

# PE header analysis
pecheck malware.exe                   # Sections, imports, exports
pedump malware.exe --imports          # All imported functions
pedump malware.exe --sections         # Sections (UPX = packed)

# Useful imports to look for:
# Persistence: RegSetValueEx, CreateService, WriteFile + scheduled tasks
# Network: WSAStartup, connect, recv, send, HttpOpenRequest
# Process injection: VirtualAllocEx, WriteProcessMemory, CreateRemoteThread
# Crypto: CryptCreateHash, CryptEncrypt, CryptGenRandom
# Keylogging: SetWindowsHookEx, GetAsyncKeyState
# Privilege escalation: AdjustTokenPrivileges, OpenProcessToken

# Hashes for threat intel lookup
md5sum malware.exe
sha256sum malware.exe
# Look up on VirusTotal, MalwareBazaar, Any.run
```

### Dynamic Malware Analysis
```bash
# Process Monitor (Windows) — track file, registry, network activity
# Wireshark — capture network traffic
# Process Hacker — watch process creation, DLL injection
# Autoruns — what persists across reboots?
# Regshot — before/after snapshot of registry

# Linux
strace -f -o trace.txt ./malware  # All syscalls (including children)
ltrace ./malware                  # Library calls
# Monitor with inotifywait, lsof, netstat, /proc

# Cuckoo Sandbox: automated analysis
# submit malware → get full report:
# files created, registry changes, network activity, screenshots, memory dumps
```

---

## Obfuscation and Packing

### Identifying Packed Binaries
```bash
# High entropy sections = packed/encrypted
binwalk -E binary

# Common packers
diec binary                    # Detect It Easy — identify packer
strings binary | grep -i "upx\|aspack\|themida\|vmprotect"

# UPX (easy to unpack)
upx -d packed_binary -o unpacked_binary  # Unpack

# Manual unpacking:
# 1. Run in debugger
# 2. Breakpoint on OEP (Original Entry Point)
#    - Look for "tail jump": jmp to original code after unpack stub
# 3. Dump process memory to file
# 4. Fix imports (ImportREC for Windows)
```

---

## Disassembly Tricks

### Recognizing Common Patterns
```asm
; Function prologue (x86-64)
push rbp
mov rbp, rsp
sub rsp, 0x50       ; Allocate stack space

; Function epilogue
mov rsp, rbp        ; or: leave
pop rbp
ret

; String compare loop
loop_start:
  movzx eax, byte [rdi]    ; Load byte from s1
  movzx ecx, byte [rsi]    ; Load byte from s2
  cmp eax, ecx             ; Compare
  jne not_equal            ; Different
  test eax, eax            ; End of string?
  jz equal                 ; Yes - strings equal
  inc rdi
  inc rsi
  jmp loop_start

; Common obfuscation: junk instructions
xor eax, eax   ; Clear eax (might be junk)
nop
lea eax, [eax] ; Nop equivalent
xchg ax, ax    ; 66 90 = NOP

; Anti-debugging: RDTSC timing check
rdtsc              ; Read timestamp counter
mov esi, eax
rdtsc
sub eax, esi       ; Time elapsed
cmp eax, 0x200000  ; Very large? → debugger present
jg being_debugged
```

---

## Recommended Tools

```
Disassemblers / Decompilers:
  Ghidra         — Free, by NSA, excellent decompiler
  IDA Pro        — Industry standard (expensive)
  Binary Ninja   — Good balance, moderate price
  radare2        — Free, powerful CLI
  cutter         — GUI for radare2
  objdump        — Basic, built into Linux

Debuggers:
  GDB + pwndbg   — Linux, essential
  x64dbg         — Windows userland
  WinDbg         — Windows kernel + crash dumps
  LLDB           — macOS (part of Xcode)

Dynamic Instrumentation:
  Frida          — Cross-platform, JavaScript scripting
  DynamoRIO      — Platform for dynamic RE tools
  PIN (Intel)    — Instruction-level analysis

Malware Analysis:
  Any.run        — Online interactive sandbox
  Hybrid Analysis — Online sandbox
  Cuckoo         — Self-hosted sandbox
  REMnux         — Linux distro for malware analysis
  FlareVM        — Windows distro for malware analysis

Network:
  Wireshark      — Packet capture and analysis
  Fiddler/Charles — HTTP proxy
  INetSim        — Simulate network services
```

---

*Every binary has a story. Reverse engineering is learning to read that story — byte by byte, instruction by instruction — until the machine's intentions become clear.*
