# Cryptography — Complete Reference

> Cryptography is the foundation of trust in digital systems. You don't need to implement it — you need to understand it well enough to use it correctly.

---

## Fundamentals

### Encryption Goals
```
Confidentiality: Only authorized parties can read the message
Integrity:       Message has not been altered in transit
Authentication:  Message is from who it claims to be from
Non-repudiation: Sender cannot deny sending the message

Kerckhoffs's Principle:
  A cryptosystem should be secure even if everything about the system,
  except the key, is public knowledge.
  → Security through obscurity is not security

Cryptanalysis attacks:
  Ciphertext only:   Only intercepted ciphertext
  Known plaintext:   Some plaintext+ciphertext pairs
  Chosen plaintext:  Can choose plaintexts and get ciphertext (AES modes matter here)
  Side-channel:      Timing, power consumption, EMF emissions
```

### Symmetric Encryption

#### AES (Advanced Encryption Standard)
```
Block cipher: operates on 128-bit (16 byte) blocks
Key sizes: 128, 192, or 256 bits

Modes of operation (how to handle multi-block data):

ECB (Electronic Codebook) — NEVER USE:
  Same block always encrypts to same ciphertext
  Patterns visible in ciphertext (famous penguin image)

CBC (Cipher Block Chaining) — use with care:
  XOR each block with previous ciphertext before encryption
  Requires random IV (Initialization Vector)
  Not parallelizable for encryption (is for decryption)
  Vulnerable to padding oracle attacks without authentication

CTR (Counter Mode):
  Turns block cipher into stream cipher
  AES(nonce + counter) → keystream → XOR with plaintext
  Parallelizable, random access
  Critical: NEVER reuse nonce+key pair (nonce reuse = catastrophic)

GCM (Galois/Counter Mode) — RECOMMENDED:
  CTR mode + GHASH authentication
  Provides authenticated encryption (AEAD)
  Returns: ciphertext + authentication tag (16 bytes)
  Nonce: typically 96 bits (12 bytes), must be unique per message
  NEVER reuse nonce with same key

ChaCha20-Poly1305 — RECOMMENDED:
  Stream cipher + Poly1305 MAC
  Faster than AES on devices without AES hardware acceleration
  Used in TLS 1.3, WireGuard
```

```python
from cryptography.hazmat.primitives.ciphers.aead import AESGCM, ChaCha20Poly1305
import os

# AES-GCM
key = AESGCM.generate_key(bit_length=256)  # 32 bytes
aes_gcm = AESGCM(key)

nonce = os.urandom(12)  # 96-bit nonce, must be unique per encryption
plaintext = b"Secret message"
aad = b"Additional authenticated data"  # Authenticated but not encrypted

ciphertext = aes_gcm.encrypt(nonce, plaintext, aad)
# ciphertext = encrypted_data + 16-byte authentication tag

# Decryption (raises InvalidTag if tampered)
decrypted = aes_gcm.decrypt(nonce, ciphertext, aad)

# ChaCha20-Poly1305
key2 = ChaCha20Poly1305.generate_key()
chacha = ChaCha20Poly1305(key2)
nonce2 = os.urandom(12)
ct = chacha.encrypt(nonce2, plaintext, aad)
pt = chacha.decrypt(nonce2, ct, aad)

# CRITICAL: Key management
# - Keys must be random (use os.urandom, not random or time-based)
# - Keys must be stored securely (Secrets Manager, Vault, HSM)
# - Rotate keys periodically
# - Never log or expose keys
```

---

## Asymmetric Cryptography

### RSA
```
How it works:
  1. Choose two large primes p, q
  2. n = p * q  (public modulus)
  3. φ(n) = (p-1)(q-1)
  4. Choose e: 65537 (public exponent, must be coprime to φ(n))
  5. d = e^(-1) mod φ(n)  (private exponent, computed with extended Euclidean)

Public key: (e, n)
Private key: (d, n)

Encrypt: c = m^e mod n
Decrypt: m = c^d mod n

Security: based on hardness of factoring large numbers

Key sizes:
  2048 bits: acceptable, but 3072+ recommended for new systems
  4096 bits: strong, slower operations
  1024 bits: BROKEN — do not use

OAEP padding (PKCS#1 OAEP):
  Always use padding for RSA encryption
  Prevents attacks on raw RSA
  Use MGF1 with SHA-256

RSA signatures:
  Sign: s = hash(m)^d mod n
  Verify: hash(m) == s^e mod n
  Use PSS padding (PKCS#1 v1.5 has weaknesses)
```

### Elliptic Curve Cryptography (ECC)
```
Based on mathematical properties of elliptic curves:
  y² = x³ + ax + b (over finite field GF(p))

Key advantages over RSA:
  256-bit ECC key ≈ security of 3072-bit RSA
  Smaller keys = faster operations, less bandwidth

Common curves:
  P-256 (secp256r1/prime256v1): NIST curve, widely supported
  P-384: Higher security level
  X25519 (Curve25519): Faster, considered more secure than NIST curves
  secp256k1: Bitcoin's curve

ECDHE (Elliptic Curve Diffie-Hellman Ephemeral):
  Used in TLS 1.3 for key exchange
  Each connection uses fresh ephemeral keys → Perfect Forward Secrecy

ECDSA: Elliptic Curve Digital Signature Algorithm
Ed25519: Edwards-curve DSA using Curve25519 (preferred for signatures)
```

```python
from cryptography.hazmat.primitives.asymmetric import ec, padding, rsa
from cryptography.hazmat.primitives import hashes, serialization

# Generate EC key pair
private_key = ec.generate_private_key(ec.SECP256R1())
public_key = private_key.public_key()

# ECDH key exchange (derive shared secret)
server_private = ec.generate_private_key(ec.X25519())
client_private = ec.generate_private_key(ec.X25519())

# Each side derives same shared secret
shared_secret = server_private.exchange(ec.ECDH(), client_private.public_key())
# shared_secret == client_private.exchange(ec.ECDH(), server_private.public_key())

# ECDSA signature
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
signature = private_key.sign(b"message to sign", ec.ECDSA(hashes.SHA256()))

public_key.verify(signature, b"message to sign", ec.ECDSA(hashes.SHA256()))
# Raises InvalidSignature if wrong

# Ed25519 (preferred for signatures)
from cryptography.hazmat.primitives.asymmetric.ed25519 import Ed25519PrivateKey
ed_key = Ed25519PrivateKey.generate()
sig = ed_key.sign(b"message")
ed_key.public_key().verify(sig, b"message")

# Serialize keys
pem = private_key.private_bytes(
    encoding=serialization.Encoding.PEM,
    format=serialization.PrivateFormat.PKCS8,
    encryption_algorithm=serialization.BestAvailableEncryption(b"passphrase")
)
```

---

## Hash Functions

### Properties of Cryptographic Hash Functions
```
Deterministic: same input always → same output
One-way (preimage resistance): cannot compute input from output
Collision resistant: cannot find two inputs with same output
Avalanche effect: small change in input → completely different output

SHA-256: 256-bit output, current standard, used in TLS, Bitcoin
SHA-3 (Keccak): Different construction, good alternative
SHA-512: 512-bit output, sometimes faster on 64-bit hardware
BLAKE2/BLAKE3: Very fast, secure, good for checksums
MD5, SHA-1: BROKEN for security — only for non-security checksums
```

```python
import hashlib
import hmac

# SHA-256
h = hashlib.sha256(b"data to hash").hexdigest()

# BLAKE2 (fast, secure)
h2 = hashlib.blake2b(b"data", digest_size=32).hexdigest()

# HMAC: hash-based message authentication code
# Provides both integrity and authentication (requires shared key)
key = b"secret-key"
mac = hmac.new(key, b"message", hashlib.sha256).hexdigest()

# Compare MACs — MUST use constant-time comparison to prevent timing attacks
import hmac as hmac_module
is_valid = hmac_module.compare_digest(
    hmac.new(key, b"message", hashlib.sha256).digest(),
    expected_mac
)

# Password hashing — NEVER use plain SHA-256 for passwords!
# Use bcrypt, Argon2, or scrypt
import bcrypt

# Hash password
password = b"user_password"
salt = bcrypt.gensalt(rounds=12)  # Cost factor: higher = slower = more secure
hashed = bcrypt.hashpw(password, salt)

# Verify
is_valid = bcrypt.checkpw(password, hashed)

# Argon2 (winner of Password Hashing Competition 2015, modern choice)
from argon2 import PasswordHasher
ph = PasswordHasher(
    time_cost=3,       # Number of iterations
    memory_cost=65536, # 64 MB
    parallelism=4,
    hash_len=32,
    salt_len=16
)
hash = ph.hash("password")
ph.verify(hash, "password")  # Raises if wrong, also indicates if rehash needed
```

---

## Key Derivation

### Key Derivation Functions (KDFs)
```
PBKDF2: Simple, slow by design, uses HMAC
  Weakness: can be GPU-accelerated with custom ASICs

bcrypt: Memory-hard, slower with increased cost factor

scrypt: Memory-hard (requires large memory), harder to GPU-attack

Argon2: Most modern, designed for KDF competition
  Argon2id: Hybrid (combines Argon2d and Argon2i) — use this

HKDF: For deriving multiple keys from one key material
  (Not for passwords — for key material)
```

```python
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.hazmat.primitives import hashes

# HKDF: derive encryption key from Diffie-Hellman shared secret
shared_secret = b"raw key material from DH exchange"
info = b"aes-gcm-key-v1"  # Context-specific label

hkdf = HKDF(
    algorithm=hashes.SHA256(),
    length=32,
    salt=None,  # Or a random salt
    info=info,
)
derived_key = hkdf.derive(shared_secret)

# PBKDF2 for password stretching
from cryptography.hazmat.backends import default_backend
import os

salt = os.urandom(16)
kdf = PBKDF2HMAC(
    algorithm=hashes.SHA256(),
    length=32,
    salt=salt,
    iterations=600000,  # NIST 2023 recommendation for SHA-256
    backend=default_backend()
)
key = kdf.derive(b"password")
```

---

## Digital Certificates and PKI

### X.509 Certificate Structure
```
Version: 3
Serial Number: unique (CA assigns)
Signature Algorithm: sha256WithRSAEncryption
Issuer: CN=Let's Encrypt, O=Let's Encrypt
Validity:
  Not Before: 2024-01-01
  Not After:  2024-04-01  (Let's Encrypt: 90 days)
Subject: CN=example.com
Subject Public Key Info:
  Algorithm: rsaEncryption
  Public Key: (2048 bit)
Extensions:
  Subject Alternative Names: DNS:example.com, DNS:www.example.com
  Key Usage: Digital Signature, Key Encipherment
  Extended Key Usage: TLS Web Server Authentication
  Authority Key Identifier: ...
  Certificate Policies: Let's Encrypt OID
Signature: (signed by CA's private key)
```

### Certificate Validation
```
Browser validates certificate by:
1. Check signature: verify with CA's public key (from trusted root store)
2. Check validity period: not before / not after
3. Check revocation: OCSP or CRL
4. Check subject: hostname matches SAN or CN
5. Check key usage: includes TLS Server Authentication

Chain of trust:
  Root CA (in browser/OS trust store)
    └── Intermediate CA (signed by root)
          └── End-entity cert (signed by intermediate)

Root CAs are hardcoded in browsers and OS.
Google, Mozilla, Apple, Microsoft control their trust stores.
```

```bash
# Inspect certificate
openssl x509 -in cert.pem -noout -text
openssl x509 -in cert.pem -noout -dates -subject -issuer

# Check remote certificate
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -text

# Verify certificate chain
openssl verify -CAfile ca-chain.pem cert.pem

# Generate self-signed certificate (development only)
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes \
  -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"

# Let's Encrypt
certbot certonly --standalone -d example.com -d www.example.com
certbot renew --dry-run
```

---

## Random Number Generation

```python
# NEVER use for security:
import random
random.randint(0, 100)  # Predictable from seed!

# ALWAYS use for security:
import os
import secrets

# Random bytes (for keys, IVs, salts)
key = os.urandom(32)           # 256-bit key
iv = os.urandom(16)            # 128-bit IV
salt = os.urandom(16)          # 128-bit salt

# Random integers
token = secrets.randbelow(1000000)   # [0, 1000000)

# Random URL-safe token (for session tokens, CSRF tokens, API keys)
session_token = secrets.token_urlsafe(32)  # 256 bits → 43 base64url chars
api_key = secrets.token_hex(32)            # 256 bits → 64 hex chars

# Constant-time comparison (prevent timing attacks)
import hmac
is_match = hmac.compare_digest(provided_token.encode(), expected_token.encode())
```

---

## Common Cryptographic Pitfalls

```
Pitfall 1: Reusing nonces/IVs
  Two-time pad attack: C1 XOR C2 = P1 XOR P2 (leaks info!)
  Fix: Always use unique, random nonces

Pitfall 2: Using encryption without authentication
  An attacker can modify ciphertext without decrypting it (bit flipping)
  Fix: Always use AEAD modes (AES-GCM, ChaCha20-Poly1305)

Pitfall 3: Not validating authentication tags
  Decrypting without checking the MAC leaks information
  Fix: Reject before decrypting; AEAD modes do this automatically

Pitfall 4: Timing attacks on string comparison
  if token == expected_token  → takes longer for longer matches
  Fix: hmac.compare_digest()

Pitfall 5: Using ECB mode
  Identical blocks produce identical ciphertext
  Fix: Never use ECB; use GCM or CTR

Pitfall 6: Weak key derivation
  password = SHA256(user_password)  → GPU crackable
  Fix: Use Argon2id or bcrypt for password hashing

Pitfall 7: RSA textbook encryption
  RSA without padding allows numerous attacks
  Fix: Always use OAEP padding for encryption

Pitfall 8: Generating keys with seeded PRNG
  datetime.now() as seed → predictable
  Fix: os.urandom() / secrets module only

Pitfall 9: Rolling your own crypto
  Never implement cryptographic algorithms yourself
  Use well-audited libraries: cryptography, libsodium, BoringSSL
```

---

*Cryptography is like a lock. You don't design the lock mechanism — you use it correctly. Understanding the theory makes you use it right.*
