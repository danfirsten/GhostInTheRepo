# DNS, TLS & HTTP — Deep Dive

> These three protocols power every web interaction. Understanding them at the packet level makes you an extraordinary debugging engineer.

---

## DNS (Domain Name System)

### How DNS Resolution Works
```
Browser: "What's the IP for www.example.com?"

1. Check browser cache
2. Check OS cache (/etc/hosts, DNS cache)
3. Query local resolver (ISP or 8.8.8.8)

Recursive resolution (if not cached):
4. Resolver → Root NS (.)
   "I need example.com"
   Response: "Ask .com nameservers: [list of TLD NS]"

5. Resolver → .com TLD NS
   "I need example.com"
   Response: "Ask example.com NS: [ns1.example.com, ns2.example.com]"

6. Resolver → ns1.example.com (Authoritative NS)
   "I need www.example.com"
   Response: "93.184.216.34" (A record, TTL: 3600)

7. Resolver caches response for TTL seconds
8. Returns 93.184.216.34 to browser
```

### DNS Record Types
```
A       example.com.    IN  A     93.184.216.34        IPv4 address
AAAA    example.com.    IN  AAAA  2606:2800:220:1::68   IPv6 address

CNAME   www             IN  CNAME example.com.          Alias (chain)
CNAME   # Cannot be used on apex domain (@ / root)

MX      example.com.    IN  MX    10 mail.example.com.  Mail exchanger
MX      # Lower priority number = preferred

NS      example.com.    IN  NS    ns1.example.com.      Name server

TXT     example.com.    IN  TXT   "v=spf1 include:_spf.google.com ~all"
# SPF: which servers can send email for this domain
# DKIM: public key for email signing
# DMARC: email authentication policy
# Verification: site ownership, etc.

PTR     34.216.184.93.in-addr.arpa. IN PTR example.com.  Reverse lookup
SOA     Start of Authority: serial, refresh, retry, expire, minimum TTL
SRV     _service._proto.domain  priority weight port target
        _https._tcp.example.com IN SRV 0 5 443 example.com.
CAA     example.com. IN CAA 0 issue "letsencrypt.org"  # Cert authorities
```

### DNS Tools
```bash
# Basic lookups
dig example.com                          # Default (A record)
dig example.com A                        # Explicit A
dig example.com AAAA                     # IPv6
dig example.com MX                       # Mail
dig example.com TXT                      # Text
dig example.com NS                       # Name servers
dig example.com SOA                      # SOA record
dig example.com ANY                      # All records
dig -x 8.8.8.8                          # Reverse lookup (PTR)

# Specify resolver
dig @8.8.8.8 example.com                # Google DNS
dig @1.1.1.1 example.com                # Cloudflare DNS
dig @ns1.example.com example.com        # Authoritative query

# Full trace (see entire resolution chain)
dig +trace example.com

# Short answer only
dig +short example.com

# Check DNSSEC
dig +dnssec example.com
dig example.com DNSKEY

# Zone transfer (test if allowed — often misconfigured)
dig axfr @ns1.example.com example.com

# Check propagation
# visit: dnschecker.org, whatsmydns.net
```

### DNSSEC
Adds cryptographic signatures to DNS responses.
- Zone signing: all records signed with zone's private key
- Chain of trust: root → TLD → domain
- DNSKEY record: public key
- RRSIG record: signature over record set
- DS record: hash of child zone's DNSKEY (in parent zone)

### DNS over HTTPS (DoH) & DNS over TLS (DoT)
```
Traditional DNS: UDP port 53, unencrypted, interceptable
DoT: DNS over TLS, TCP port 853
DoH: DNS over HTTPS, TCP port 443 (looks like normal HTTPS)

Providers:
- Cloudflare: 1.1.1.1 (DoH: https://cloudflare-dns.com/dns-query)
- Google: 8.8.8.8 (DoH: https://dns.google/dns-query)
- Quad9: 9.9.9.9 (filters malware)
```

---

## TLS (Transport Layer Security)

### TLS 1.3 Handshake (1-RTT)
```
Client                              Server
  |                                    |
  |-- ClientHello ──────────────────→  |
  |   supported_versions: [TLS 1.3]    |
  |   cipher_suites: [...]             |
  |   key_share: [X25519, P-256]       |
  |   random: 32 bytes                 |
  |                                    |
  |  ←───────────── ServerHello ──────  |
  |  ←─── {EncryptedExtensions} ─────  |
  |  ←─────── {Certificate} ─────────  |  (server cert chain)
  |  ←─── {CertificateVerify} ───────  |  (signed with private key)
  |  ←──────── {Finished} ────────────  |  (HMAC over handshake)
  |                                    |
  |-- {Finished} ──────────────────→   |  (HMAC over handshake)
  |                                    |
  |====== Application Data ======|    (encrypted with session keys)
```
`{}` = encrypted with handshake key derived from key shares.

**Key exchange:** ECDHE (Ephemeral Elliptic Curve Diffie-Hellman)
- Both sides generate ephemeral key pair
- Exchange public keys → derive shared secret
- Never transmitted → **Perfect Forward Secrecy**

### TLS 1.3 0-RTT (Session Resumption)
```
Client has PSK (Pre-Shared Key) from previous session:
Client → (0-RTT Application Data + ClientHello)
Server → (ServerHello + 0-RTT data processed)
```
Warning: 0-RTT data is replay-vulnerable. Don't use for non-idempotent requests.

### TLS 1.3 Cipher Suites (only 5 remain)
```
TLS_AES_256_GCM_SHA384
TLS_CHACHA20_POLY1305_SHA256
TLS_AES_128_GCM_SHA256
TLS_AES_128_CCM_8_SHA256
TLS_AES_128_CCM_SHA256
```
All use authenticated encryption (AEAD). Removed: RSA key exchange, CBC ciphers, all TLS ≤1.2 ciphers.

### Certificate Lifecycle
```
1. Generate private key + CSR (Certificate Signing Request)
   openssl genrsa -out private.key 4096
   openssl req -new -key private.key -out request.csr

2. CA verifies domain ownership:
   DV (Domain Validated): prove DNS control (Let's Encrypt)
   OV (Org Validated): verify organization
   EV (Extended Validation): rigorous verification

3. CA signs certificate → Issues cert
   openssl x509 -req -in request.csr -CA ca.crt -CAkey ca.key -out cert.crt

4. Install cert + key in web server

5. OCSP stapling: server includes proof cert not revoked

6. Renewal: Let's Encrypt: 90-day certs, auto-renew with certbot
```

### Let's Encrypt / ACME Protocol
```bash
# Install certbot
apt install certbot python3-certbot-nginx

# Obtain certificate (Nginx)
certbot --nginx -d example.com -d www.example.com

# Wildcard (DNS challenge required)
certbot certonly --manual --preferred-challenges dns -d "*.example.com"

# Auto-renewal (certbot timer usually installed)
certbot renew --dry-run

# Certificate info
openssl x509 -in cert.pem -noout -text
openssl s_client -connect example.com:443 -servername example.com
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates
```

### Inspecting TLS
```bash
# Check TLS configuration
sslyze example.com
sslscan example.com
nmap --script ssl-enum-ciphers -p 443 example.com

# Check certificate
curl -v https://example.com 2>&1 | grep -A20 "Server certificate"
openssl s_client -connect example.com:443 -showcerts

# Check HSTS
curl -I https://example.com | grep Strict-Transport

# Test specific TLS version
curl --tlsv1.2 --tls-max 1.2 https://example.com
openssl s_client -connect example.com:443 -tls1_2
```

---

## HTTP in Depth

### HTTP/1.1 Wire Format
```
Request:
GET /api/users?page=1 HTTP/1.1\r\n
Host: api.example.com\r\n
Accept: application/json\r\n
Authorization: Bearer eyJhbGc...\r\n
\r\n

Response:
HTTP/1.1 200 OK\r\n
Content-Type: application/json; charset=utf-8\r\n
Content-Length: 156\r\n
Cache-Control: public, max-age=300\r\n
\r\n
{"users":[...]}
```

### HTTP/2 Binary Frames
```
Frame header (9 bytes):
[Length 24bit][Type 8bit][Flags 8bit][Stream ID 31bit]

Frame types:
DATA:          Payload data
HEADERS:       HTTP headers (HPACK compressed)
PRIORITY:      Stream prioritization
RST_STREAM:    Terminate stream
SETTINGS:      Connection parameters
PUSH_PROMISE:  Server push announcement
PING:          Liveness check
GOAWAY:        Connection shutdown
WINDOW_UPDATE: Flow control

Multiplexing:
  Stream 1: Request headers
  Stream 1: Data (request body)
  Stream 3: Request headers (concurrent!)
  Stream 1: Response headers
  Stream 3: Response headers (interleaved!)
  Stream 1: Data (response)
  Stream 3: Data (response)
```

### HTTP Caching
```
Cache-Control: public, max-age=3600     # Public cache, fresh for 1 hour
Cache-Control: private, max-age=0       # Browser only, always revalidate
Cache-Control: no-store                 # Don't cache at all
Cache-Control: no-cache                 # Revalidate before serving from cache
Cache-Control: immutable                # Content will never change (for hashed assets)
Cache-Control: stale-while-revalidate=60  # Serve stale while refreshing

ETag: "abc123"                          # Opaque identifier for version
Last-Modified: Wed, 01 Jan 2024 00:00:00 GMT

# Conditional requests (revalidation)
If-None-Match: "abc123"                 # → 304 Not Modified if ETag unchanged
If-Modified-Since: Wed, 01 Jan 2024 00:00:00 GMT  # → 304 if unchanged

# Vary header: cache differs by request header
Vary: Accept-Language, Accept-Encoding
```

### CORS (Cross-Origin Resource Sharing)
```
Browser enforces Same-Origin Policy:
- Scripts at https://app.com can't fetch from https://api.com
- Unless api.com explicitly allows it via CORS headers

Preflight request (for non-simple requests):
OPTIONS /api/data HTTP/1.1
Origin: https://app.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Authorization

Server response:
Access-Control-Allow-Origin: https://app.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400    # Cache preflight for 24h

Simple requests (no preflight):
- Methods: GET, HEAD, POST
- Headers: Content-Type limited to: text/plain, multipart/form-data, application/x-www-form-urlencoded
- No custom headers

Nginx CORS configuration:
if ($request_method = OPTIONS) {
    add_header Access-Control-Allow-Origin $http_origin;
    add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
    add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    add_header Access-Control-Max-Age 86400;
    return 204;
}
add_header Access-Control-Allow-Origin $http_origin;
```

### WebSockets Upgrade
```
Client request:
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13

Server response (101 Switching Protocols):
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
# Accept = base64(SHA1(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"))

[TCP connection remains open for bidirectional messages]
```

### HTTP/3 & QUIC
```
HTTP/3 = HTTP/2 semantics + QUIC transport

QUIC features:
- UDP-based
- Multiplexed streams (no TCP HoL blocking)
- Built-in TLS 1.3 (0-RTT possible)
- Connection ID (allows IP migration)
- Better mobile performance (tolerate packet loss per-stream)

Connection establishment:
Client → Server: Initial packet (crypto handshake data)
Server → Client: Handshake complete in 1-RTT
              (or 0-RTT for known servers)

Stream independence:
  If stream 1 packet is lost → only stream 1 blocked
  Other streams continue (unlike TCP where all stall)
```

---

## Real-World Debugging

### Debugging HTTP
```bash
# Full request/response with timing
curl -v --trace-ascii /dev/stdout https://example.com

# Timing breakdown
curl -w "
    namelookup: %{time_namelookup}s
       connect: %{time_connect}s
    appconnect: %{time_appconnect}s
   pretransfer: %{time_pretransfer}s
      redirect: %{time_redirect}s
 starttransfer: %{time_starttransfer}s
         total: %{time_total}s
" -o /dev/null -s https://example.com

# Override DNS resolution (test before DNS propagates)
curl --resolve example.com:443:1.2.3.4 https://example.com

# HTTP/2 explicit
curl --http2 https://example.com
curl --http2-prior-knowledge http://localhost:8080  # H2C (no TLS)

# Verbose headers only
curl -I https://example.com           # HEAD request
curl -sI https://example.com | head   # Silent, just headers
```

### Packet Analysis
```bash
# tcpdump — capture and filter
sudo tcpdump -i eth0 -n                    # All traffic
sudo tcpdump -i eth0 port 443             # HTTPS
sudo tcpdump -i eth0 host 1.2.3.4         # Specific host
sudo tcpdump -i eth0 -w capture.pcap      # Save to file
sudo tcpdump -r capture.pcap              # Read file

# tshark (CLI Wireshark)
tshark -i eth0 -f "port 80"
tshark -r capture.pcap -T fields -e http.request.method -e http.host

# Wireshark filters
http.response.code == 500
tcp.analysis.retransmission
tls.handshake.type == 1    # ClientHello
dns.qry.name contains "google"
```

---

*DNS, TLS, and HTTP are the pipes of the web. When something breaks, these are where you look first.*
