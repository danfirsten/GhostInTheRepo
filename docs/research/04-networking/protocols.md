# Network Protocols — Complete Reference

> Networking is the plumbing of the internet. Understanding protocols from Ethernet frames to HTTP/3 is what separates engineers who debug connection issues from those who just restart services.

---

## The OSI / TCP-IP Model

```
OSI (7 layers):                TCP/IP (4 layers):     Examples:
7. Application                 Application            HTTP, HTTPS, DNS, SMTP, SSH
6. Presentation                ↑                      TLS, encoding (UTF-8, gzip)
5. Session                     ↑                      TCP sessions, TLS handshake
4. Transport                   Transport              TCP, UDP, QUIC
3. Network                     Internet               IP (IPv4, IPv6), ICMP
2. Data Link                   Network Access         Ethernet, WiFi (802.11)
1. Physical                    ↑                      Cables, radio, fiber

Each layer adds headers:
  Ethernet frame: [Eth header][IP header][TCP header][HTTP data][Eth trailer]
  Encapsulation going down, decapsulation going up
```

---

## Ethernet and ARP

### Ethernet
```
Ethernet frame:
  [Preamble 8B][Dst MAC 6B][Src MAC 6B][EtherType 2B][Payload 46-1500B][FCS 4B]

EtherType:
  0x0800 = IPv4
  0x0806 = ARP
  0x86DD = IPv6
  0x8100 = VLAN tagged (802.1Q)

MAC address: 48-bit hardware identifier
  First 3 bytes = OUI (manufacturer)
  Last 3 bytes = device-specific
  FF:FF:FF:FF:FF:FF = broadcast

MTU (Maximum Transmission Unit):
  Standard Ethernet: 1500 bytes
  Jumbo frames: 9000 bytes (requires switch/NIC support)
  Fragmentation: IP fragments packets larger than MTU
  Path MTU Discovery: TCP/IP figures out minimum MTU on path
```

### ARP (Address Resolution Protocol)
```
ARP: resolve IP address → MAC address (on same local network)

Process:
  A wants to send to 192.168.1.5 on local network
  A broadcasts: "Who has 192.168.1.5? Tell 192.168.1.1"
  192.168.1.5 replies: "192.168.1.5 is at AA:BB:CC:DD:EE:FF"
  A caches result in ARP table

Commands:
  arp -a                  # Show ARP cache (legacy)
  ip neigh show           # Modern ARP table
  ip neigh flush all      # Clear ARP cache
  arping 192.168.1.5      # Send ARP request (Ethernet-level ping)

Gratuitous ARP: announce own MAC (for failover, IP change detection)
ARP spoofing: send fake ARP replies → MITM attack
  Defense: dynamic ARP inspection (DAI) on managed switches
```

---

## IP (Internet Protocol)

### IPv4
```
IPv4 header (20 bytes minimum):
  [Version|IHL][DSCP|ECN][Total Length]
  [Identification][Flags|Fragment Offset]
  [TTL][Protocol][Header Checksum]
  [Source IP (4B)]
  [Destination IP (4B)]
  [Options (variable)]

Key fields:
  TTL (Time To Live): decremented at each hop, discard at 0
    traceroute exploits this: sends packets with TTL=1,2,3,...
  Protocol:
    6  = TCP
    17 = UDP
    1  = ICMP
    89 = OSPF
  DSCP: Differentiated Services (QoS marking)
  Flags: DF (Don't Fragment), MF (More Fragments)
  Fragment Offset: for reassembling fragmented packets

IPv4 address space: 32 bits = 4,294,967,296 addresses
  Private ranges (RFC 1918):
    10.0.0.0/8
    172.16.0.0/12
    192.168.0.0/16
  Loopback: 127.0.0.0/8 (127.0.0.1)
  Link-local: 169.254.0.0/16 (APIPA)
  Multicast: 224.0.0.0/4
  Broadcast: 255.255.255.255

CIDR notation:
  192.168.1.0/24 = 256 addresses (192.168.1.0 - 192.168.1.255)
  /24 = 24 bits of network prefix, 8 bits of host
  Subnet mask: /24 = 255.255.255.0, /16 = 255.255.0.0, /8 = 255.0.0.0
```

### IPv6
```
IPv6: 128-bit addresses = 3.4×10³⁸ addresses
  No more NAT needed (every device gets global address)
  No broadcast (uses multicast instead)
  Simplified header (fixed 40 bytes)
  Built-in IPsec support
  Stateless Address Autoconfiguration (SLAAC)

Address format:
  2001:0db8:85a3:0000:0000:8a2e:0370:7334
  = 8 groups of 4 hex digits separated by colons
  :: = compress consecutive zero groups (once per address)
  2001:db8::1 = 2001:0db8:0000:0000:0000:0000:0000:0001

Special addresses:
  ::1                   loopback (localhost)
  fe80::/10             link-local (auto-configured)
  2001:db8::/32         documentation/examples
  fc00::/7              unique local (private, like RFC 1918)
  ff02::1               all-nodes multicast
  ff02::2               all-routers multicast

IPv6 header:
  [Version|TC|Flow Label]
  [Payload Length][Next Header][Hop Limit]
  [Source Address (16B)]
  [Destination Address (16B)]
  (Extension headers follow if Next Header != TCP/UDP/etc.)

Transition mechanisms:
  Dual stack: run IPv4 and IPv6 simultaneously
  6to4: tunnel IPv6 over IPv4
  NAT64/DNS64: IPv6-only clients reach IPv4 servers
```

---

## ICMP

```
ICMP: Internet Control Message Protocol — error and diagnostic
  Carried in IP packets (protocol 1)

Common types:
  Type 0, Code 0:  Echo Reply (ping response)
  Type 3:          Destination Unreachable
    Code 0: Network unreachable
    Code 1: Host unreachable
    Code 3: Port unreachable (UDP to closed port)
    Code 4: Fragmentation needed (DF set)
  Type 8, Code 0:  Echo Request (ping)
  Type 11:         Time Exceeded (TTL expired — used by traceroute)

ping:
  ping -c 4 8.8.8.8         # 4 pings
  ping -i 0.1 8.8.8.8       # 100ms interval
  ping -s 1400 8.8.8.8      # Large packet size (test fragmentation)
  ping6 2001:db8::1          # IPv6 ping

traceroute:
  traceroute google.com      # Sends UDP to high port by default
  traceroute -I google.com   # Use ICMP echo instead
  traceroute -T -p 443 google.com  # TCP SYN to port 443 (bypasses firewalls)
  mtr google.com             # Combined ping + traceroute, real-time

ICMPv6: neighbor discovery (replaces ARP for IPv6)
  Type 133: Router Solicitation
  Type 134: Router Advertisement
  Type 135: Neighbor Solicitation (ARP equivalent)
  Type 136: Neighbor Advertisement
```

---

## TCP (Transmission Control Protocol)

### TCP Header
```
TCP header (20 bytes minimum):
  [Source Port 2B][Destination Port 2B]
  [Sequence Number 4B]
  [Acknowledgment Number 4B]
  [Data Offset|Reserved|Flags][Window Size 2B]
  [Checksum 2B][Urgent Pointer 2B]
  [Options (variable)]

Flags:
  SYN: synchronize (start connection)
  ACK: acknowledgment
  FIN: finish (end connection)
  RST: reset (abort connection)
  PSH: push (deliver to application immediately)
  URG: urgent data
  ECE/CWR: Explicit Congestion Notification

Ports: 16-bit = 65535 possible
  0-1023:    well-known (requires root on Linux)
  1024-49151: registered
  49152-65535: ephemeral (client connections)

Sequence numbers:
  ISN: Initial Sequence Number (randomized to prevent spoofing)
  SEQ: byte offset of first data byte in segment
  ACK: next byte expected from peer
```

### TCP Three-Way Handshake
```
Client                          Server
  |                               |
  |------ SYN (seq=x) ---------->|
  |                               |
  |<---- SYN-ACK (seq=y,ack=x+1)-|
  |                               |
  |------ ACK (ack=y+1) -------->|
  |                               |
  |====== DATA TRANSFER =========|
  |                               |
  |------ FIN ------------------>|   Active close
  |<----- ACK -------------------|
  |<----- FIN -------------------|   Passive close
  |------ ACK ------------------>|
  |                               |
  (Client waits TIME_WAIT 2*MSL before closing)

TIME_WAIT: ~60-120 seconds
  Ensures delayed packets from old connection don't confuse new one
  High connection rate servers: SO_REUSEADDR, SO_REUSEPORT to avoid exhaustion

Connection states (view with: ss -tan or netstat -tan):
  LISTEN, SYN_SENT, SYN_RECEIVED, ESTABLISHED,
  FIN_WAIT_1, FIN_WAIT_2, TIME_WAIT,
  CLOSE_WAIT, LAST_ACK, CLOSED
```

### TCP Flow Control and Congestion Control
```
Flow Control: prevent sender from overwhelming receiver
  Receiver advertises window size (how much buffer space available)
  Sender limits unacknowledged data to receiver window
  Window = 0: sender pauses (zero window probe)

Congestion Control: prevent overwhelming the network
  Algorithms: Cubic (Linux default), BBR (Google), Reno

  Slow Start:
    cwnd (congestion window) starts at 1 MSS
    Double cwnd each RTT until ssthresh or packet loss

  Congestion Avoidance:
    Once cwnd > ssthresh, increase by 1 MSS per RTT (linear)

  Loss detected:
    Timeout: cwnd → 1, ssthresh → cwnd/2 (severe)
    3 duplicate ACKs (fast retransmit): ssthresh → cwnd/2, cwnd → ssthresh

BBR (Bottleneck Bandwidth and RTT):
  Measures actual bandwidth and RTT
  Maintains high throughput without filling buffers
  Better for long-distance/lossy links
  echo bbr > /proc/sys/net/ipv4/tcp_congestion_control

Key tuning:
  /proc/sys/net/ipv4/tcp_rmem: receive buffer min/default/max
  /proc/sys/net/ipv4/tcp_wmem: send buffer min/default/max
  /proc/sys/net/ipv4/tcp_window_scaling: enable window scaling (> 65535)
  /proc/sys/net/core/somaxconn: max connection backlog
```

---

## UDP (User Datagram Protocol)

```
UDP header (8 bytes only):
  [Source Port 2B][Destination Port 2B]
  [Length 2B][Checksum 2B]

Features:
  No connection — just send datagrams
  No guarantee: delivery, ordering, no duplicate prevention
  No flow control, no congestion control
  Low overhead: 8 byte header vs TCP's 20+

Use cases (where speed > reliability):
  DNS: single query/response, retry at app layer
  DHCP: broadcast-based, can't use TCP
  Streaming video/audio: stale data useless, prefer loss over latency
  Online gaming: real-time, own packet sequencing
  VoIP: latency > reliability
  QUIC: implements reliability at application layer on top of UDP

UDP server pattern (Python):
import socket
sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
sock.bind(('0.0.0.0', 12345))
while True:
    data, addr = sock.recvfrom(1024)
    sock.sendto(b'response', addr)
```

---

## DNS (Domain Name System)

### DNS Resolution
```
Query flow (for google.com):
  1. Check /etc/hosts (local override)
  2. Check resolver cache (OS or systemd-resolved)
  3. Query recursive resolver (usually your router or 8.8.8.8)
  4. Recursive resolver queries root nameservers (.)
  5. Root refers to .com TLD nameservers
  6. .com TLD refers to google.com authoritative nameservers
  7. google.com NS returns A record (IP address)
  8. Recursive resolver caches result (for TTL seconds) and returns to client

Record types:
  A:      hostname → IPv4 address
  AAAA:   hostname → IPv6 address
  CNAME:  alias → canonical name (chain of CNAMEs resolved)
  MX:     mail server for domain (with priority)
  TXT:    arbitrary text (SPF, DKIM, verification)
  NS:     authoritative nameservers for domain
  PTR:    IP → hostname (reverse DNS)
  SRV:    service location (_http._tcp.example.com → host:port)
  SOA:    Start of Authority (zone metadata, serial number)
  CAA:    CA Authorization (which CAs can issue certs for domain)

TTL (Time to Live):
  How long resolvers cache the record (seconds)
  Short TTL: faster propagation of changes, more queries
  Long TTL: fewer queries, but slow to propagate changes
  Before changing DNS: lower TTL first (wait 2x old TTL), then change
```

### DNS Tools
```bash
# Query DNS
dig google.com               # Full output
dig google.com A             # Only A records
dig google.com MX            # MX records
dig -x 8.8.8.8               # Reverse lookup (PTR)
dig @8.8.8.8 google.com      # Use specific nameserver
dig +short google.com         # Just the answer
dig +trace google.com         # Show full resolution chain
dig google.com +dnssec        # Show DNSSEC info

nslookup google.com          # Older tool
host google.com              # Simple query

# Check DNSSEC
dig google.com +dnssec +multi

# DNS over HTTPS (DoH)
curl -H 'accept: application/dns-json' 'https://1.1.1.1/dns-query?name=google.com&type=A'

# Local DNS
cat /etc/resolv.conf          # Configured resolvers
cat /etc/hosts                # Local overrides
resolvectl status            # systemd-resolved status
systemd-resolve google.com   # Query via systemd

# DNS debugging
tcpdump -i any port 53       # Capture DNS traffic
```

### DNS Security
```
DNSSEC: cryptographically sign DNS records
  Zone signs records with private key
  Resolvers verify with public key (in parent zone)
  Chain of trust from root → TLD → domain

DNS hijacking attacks:
  Cache poisoning: forge DNS responses to recursive resolver
    Defense: DNSSEC, random port and transaction ID
  Rogue resolver: ISP or nation-state redirects queries
    Defense: DoH, DoT (encrypted DNS)

DoT (DNS over TLS): TCP port 853
DoH (DNS over HTTPS): HTTPS port 443
  Both encrypt DNS queries from network observers
```

---

## HTTP and HTTPS

### HTTP/1.1
```
HTTP/1.1 (1997):
  Text-based protocol, human-readable
  Request-response model
  Keep-alive connections (but sequential requests)
  Chunked transfer encoding
  Host header (required — enables virtual hosting)

Request:
  GET /path HTTP/1.1
  Host: example.com
  Accept: application/json
  Authorization: Bearer token123
  Content-Type: application/json

  {"key": "value"}

Response:
  HTTP/1.1 200 OK
  Content-Type: application/json
  Content-Length: 27
  Cache-Control: max-age=3600

  {"status": "ok", "id": 42}

Problems:
  Head-of-line blocking: requests queued, slow response blocks all
  No multiplexing: need multiple connections for parallel requests
  No header compression: repetitive headers on every request
```

### HTTP/2
```
HTTP/2 (2015):
  Binary framing (not text)
  Multiplexing: multiple streams on single TCP connection
  Header compression (HPACK)
  Server push (proactively send resources)
  Stream prioritization

Frames: smallest communication unit
  DATA, HEADERS, PRIORITY, RST_STREAM, SETTINGS, PUSH_PROMISE, PING, GOAWAY

Still has TCP head-of-line blocking:
  Packet loss on TCP stalls ALL streams (not just affected one)
  One TCP connection means one kernel buffer
```

### HTTP/3 and QUIC
```
HTTP/3 (2022):
  Runs over QUIC instead of TCP
  QUIC: UDP + reliability + TLS 1.3 built-in
  Solves TCP head-of-line blocking (each stream independent)
  0-RTT connection resumption (for returning clients)
  Connection migration (roaming between WiFi/cellular)

QUIC improvements:
  TLS 1.3 handshake integrated (1 RTT vs 1.5 for TLS over TCP)
  Connection ID: survive IP/port changes (phone switching networks)
  Per-stream flow control (not per-connection)
  Faster loss recovery

ALPN (Application-Layer Protocol Negotiation):
  TLS extension to negotiate HTTP/1.1 vs HTTP/2 vs HTTP/3
  Alt-Svc header: "h3=:443" (server announces HTTP/3 support)
```

---

## TLS (Transport Layer Security)

```
TLS 1.3 Handshake:
  Client → Server: ClientHello (supported ciphers, key share, extensions)
  Server → Client: ServerHello (chosen cipher, key share), Certificate, Finished
  (1 RTT! Symmetric keys established)
  Client → Server: Finished
  Both: Application data (encrypted)

TLS 1.2 was 2 RTT — TLS 1.3 is 1 RTT, 0-RTT possible for resumption

Cipher suite (TLS 1.3):
  TLS_AES_128_GCM_SHA256
  TLS_AES_256_GCM_SHA384
  TLS_CHACHA20_POLY1305_SHA256

Key concepts:
  Forward Secrecy (PFS): each session uses ephemeral keys
    Even if server's private key later compromised, past sessions safe
    ECDHE (Ephemeral Diffie-Hellman) provides PFS

  Certificate pinning: verify specific cert/public key
    Stronger than just trusting any CA
    Mobile apps often pin to their own cert
    Risk: pin rotation is operationally tricky

Tools:
  openssl s_client -connect host:443    # Inspect TLS connection
  openssl s_client -connect host:443 -servername host  # SNI
  sslyze host:443                       # TLS vulnerability scanner
  nmap --script ssl-enum-ciphers -p 443 host
```

---

## Email Protocols

```
SMTP (Simple Mail Transfer Protocol) — port 25/587/465
  25:  server-to-server (MTA to MTA)
  587: client submission (with STARTTLS)
  465: SMTPS (implicit TLS)

SMTP conversation:
  220 mail.example.com ESMTP
  EHLO client.example.com      # Announce client, request ESMTP
  250-mail.example.com         # Server capabilities
  250-STARTTLS
  250-AUTH PLAIN LOGIN
  STARTTLS                     # Upgrade to TLS
  AUTH PLAIN ...
  MAIL FROM:<sender@example.com>
  RCPT TO:<recipient@example.com>
  DATA
  From: Sender <sender@example.com>
  To: Recipient <recipient@example.com>
  Subject: Test
  ...body...
  .                            # Single dot on line = end of message
  QUIT

IMAP (port 993/143): access mailbox (messages stay on server)
POP3 (port 995/110): download and delete from server

Email authentication:
  SPF:  TXT record listing authorized sending IPs
        v=spf1 ip4:1.2.3.4 include:_spf.google.com -all
  DKIM: cryptographic signature in email header
        Selector + domain → public key in DNS → verify signature
  DMARC: policy combining SPF + DKIM, reporting
         v=DMARC1; p=reject; rua=mailto:dmarc@example.com
```

---

*Protocols are the contracts that make the internet work. When something breaks, knowing what layer it's at and what the wire looks like is how you diagnose it in minutes instead of hours.*
