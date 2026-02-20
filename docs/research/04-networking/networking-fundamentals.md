# Networking Fundamentals — Complete Reference

> Every web request, every API call, every SSH session — it all flows through these layers. Know them cold.

---

## The OSI Model

```
Layer 7 — Application    HTTP, HTTPS, DNS, SMTP, FTP, SSH
Layer 6 — Presentation   TLS/SSL, encoding, compression
Layer 5 — Session        Session establishment, teardown
Layer 4 — Transport      TCP, UDP, SCTP
Layer 3 — Network        IP, ICMP, routing
Layer 2 — Data Link      Ethernet, MAC addresses, ARP, VLANs
Layer 1 — Physical       Cables, fiber, radio waves, signals
```

In practice engineers often collapse this to the **TCP/IP model**:
```
Application      (OSI 5-7): HTTP, DNS, TLS, etc.
Transport        (OSI 4):    TCP, UDP
Internet         (OSI 3):    IP, ICMP
Link             (OSI 1-2):  Ethernet, WiFi
```

---

## Physical & Data Link Layer

### Ethernet
- Dominant wired LAN technology
- IEEE 802.3 standard
- Frame format:
  ```
  [Preamble 8B][Dst MAC 6B][Src MAC 6B][EtherType 2B][Payload 46-1500B][FCS 4B]
  ```
- **CSMA/CD**: Carrier Sense Multiple Access / Collision Detection (historical)
- Modern switched ethernet: full duplex, no collisions

### MAC Addresses
- 48-bit hardware address: `AA:BB:CC:DD:EE:FF`
- First 3 bytes: OUI (Organizationally Unique Identifier) — identifies manufacturer
- Last 3 bytes: device-specific
- `ff:ff:ff:ff:ff:ff` = broadcast
- `01:xx:xx:xx:xx:xx` = multicast

### ARP (Address Resolution Protocol)
Resolves IP → MAC address on local network.
```
Host A: "Who has 192.168.1.5? Tell 192.168.1.1" (broadcast)
Host B: "192.168.1.5 is at 00:11:22:33:44:55" (unicast reply)
```
- ARP cache: `arp -n` or `ip neigh show`
- ARP poisoning: attacker sends fake ARP replies → MITM

### VLANs (802.1Q)
- Logical segmentation of physical network
- Tagged frames: 4-byte 802.1Q tag inserted after src MAC
- VLAN ID: 12 bits → 4094 VLANs
- Trunking: multiple VLANs on single link
- Used for: security isolation, traffic separation

### Spanning Tree Protocol (STP / 802.1D)
- Prevents loops in Ethernet networks (with redundant links)
- Elects Root Bridge, blocks redundant paths
- RSTP (Rapid STP) = faster convergence
- MSTP = per-VLAN spanning tree

---

## Network Layer (IP)

### IPv4
```
  0                   1                   2                   3
  0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |Version|  IHL  |    DSCP   |ECN|         Total Length          |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |         Identification        |Flags|      Fragment Offset    |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |  Time to Live |    Protocol   |         Header Checksum       |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                       Source Address                          |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
 |                    Destination Address                        |
 +-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

**Key fields:**
- **TTL**: decremented at each hop, prevents infinite loops (traceroute uses this)
- **Protocol**: 6=TCP, 17=UDP, 1=ICMP, 89=OSPF
- **Flags**: Don't Fragment (DF), More Fragments (MF)

### IP Addressing & Subnetting

**Classes (historic):**
```
Class A: 1.0.0.0 – 126.255.255.255  /8   (16M hosts)
Class B: 128.0.0.0 – 191.255.255.255 /16  (65K hosts)
Class C: 192.0.0.0 – 223.255.255.255 /24  (254 hosts)
```

**CIDR (Classless Inter-Domain Routing):**
```
192.168.1.0/24
↑           ↑
Network     Prefix length (bits in network portion)

Network:   192.168.1.0   (binary: ...0000 0000)
Broadcast: 192.168.1.255 (binary: ...1111 1111)
Hosts:     192.168.1.1 – 192.168.1.254 (254 hosts)
Mask:      255.255.255.0
```

**Subnetting Example:**
```
10.0.0.0/8 split into /24 subnets:
10.0.0.0/24, 10.0.1.0/24, ... 10.255.255.0/24 = 65536 subnets

10.10.5.0/28:
Mask: 255.255.255.240
Hosts: 14 (2^4 - 2)
Range: 10.10.5.0 – 10.10.5.15
```

**Private Address Space (RFC 1918):**
```
10.0.0.0/8        — Class A private
172.16.0.0/12     — Class B private (172.16-31.x.x)
192.168.0.0/16    — Class C private
127.0.0.0/8       — Loopback
169.254.0.0/16    — Link-local (APIPA)
```

### IPv6
- 128-bit addresses: `2001:0db8:85a3:0000:0000:8a2e:0370:7334`
- Shorthand: `2001:db8:85a3::8a2e:370:7334`
- 8 groups of 4 hex digits
- `::1` = loopback, `::` = all zeros
- **No NAT** (in theory), every device has global address
- **No broadcast**, uses multicast
- **NDP** (Neighbor Discovery) replaces ARP
- **SLAAC**: auto-configure from router advertisement

### NAT (Network Address Translation)
- Multiple private IPs share one public IP
- **SNAT**: Source NAT — modify source IP
- **DNAT**: Destination NAT — port forwarding
- **Masquerade**: SNAT with dynamic IP
- Breaks end-to-end connectivity, complicates protocols
- NAT table: `(private IP, private port) ↔ (public IP, public port)`

### ICMP
- Control messages: errors + diagnostics
- Types: 0=Echo Reply, 3=Unreachable, 8=Echo Request, 11=TTL Exceeded
- `ping`: ICMP echo request/reply
- `traceroute`: sends packets with incrementing TTL, catches TTL Exceeded

### Routing

**Routing table:**
```bash
ip route show
# Default: 0.0.0.0/0 via 192.168.1.1 dev eth0
# Specific: 10.0.0.0/8 via 10.1.1.1 dev eth1
```

**Longest prefix match**: most specific route wins.

**Routing protocols:**
- **Static**: manually configured, simple, doesn't adapt
- **RIP**: Distance Vector, hop count metric, max 15 hops
- **OSPF**: Link State, Dijkstra's algorithm, fast convergence
- **BGP**: Path Vector, used for internet routing (AS paths)

**BGP (Border Gateway Protocol):**
- The internet's routing protocol
- Each AS (Autonomous System) has an ASN
- BGP peers exchange reachability info
- Policy-based: can prefer paths based on business agreements
- eBGP: between ASes, iBGP: within AS

---

## Transport Layer

### TCP (Transmission Control Protocol)
**Features:**
- Reliable delivery (acknowledgments, retransmission)
- In-order delivery
- Flow control (receiver window)
- Congestion control
- Full-duplex
- Connection-oriented (three-way handshake)

**Three-Way Handshake:**
```
Client              Server
  SYN  →
       ←  SYN-ACK
  ACK  →
  [Connection established]
```

**Four-Way Teardown:**
```
  FIN  →
       ←  ACK
       ←  FIN
  ACK  →
  [TIME_WAIT: 2*MSL (~60s)]
```

**TCP Header:**
```
Source Port (16) | Destination Port (16)
Sequence Number (32)
Acknowledgment Number (32)
Data Offset | Reserved | Flags | Window Size
Checksum | Urgent Pointer
Options...
```

**Flags:**
- SYN, ACK, FIN, RST, PSH, URG, ECE, CWR

**TCP States:**
```
CLOSED → SYN_SENT → ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED
CLOSED → LISTEN → SYN_RCVD → ESTABLISHED → CLOSE_WAIT → LAST_ACK → CLOSED
```

**Flow Control:**
- Receiver advertises **window size** (how many bytes it can buffer)
- Sender can't exceed window
- Zero window: sender stops until window reopens

**Congestion Control:**
- **Slow Start**: cwnd starts at 1 MSS, doubles each RTT until threshold
- **Congestion Avoidance**: cwnd grows linearly (+1 MSS per RTT)
- **Fast Retransmit**: 3 duplicate ACKs → retransmit immediately
- **Fast Recovery**: after retransmit, don't slow start, cut to half
- **CUBIC** (Linux default): cubic function for cwnd increase
- **BBR** (Google): bandwidth-delay product model

**TCP Options:**
- **MSS** (Max Segment Size): typically 1460 bytes (1500 MTU - 40 headers)
- **Window Scaling**: extend window to 30 bits
- **SACK** (Selective Acknowledgment): ack specific segments
- **Timestamps**: RTT measurement, PAWS
- **TCP Fast Open**: data in SYN (reduces round-trips)

### UDP (User Datagram Protocol)
**Header:** Source Port | Dest Port | Length | Checksum (8 bytes total)

**Features:**
- Unreliable, unordered
- No connection setup
- Low overhead
- Application handles reliability if needed

**When to use UDP:**
- DNS queries (fast, single packet)
- Gaming (tolerate loss, minimize latency)
- Video streaming (some loss OK)
- DHCP, TFTP, NTP
- QUIC (HTTP/3) — implements its own reliability on top

### QUIC (HTTP/3 Transport)
- Built on UDP
- Multiplexed streams without head-of-line blocking
- 0-RTT connection establishment
- Connection migration (switch IPs without dropping)
- Encrypted by default (TLS 1.3 integrated)
- Used by: Chrome, YouTube, Google services

### Common Ports
```
20/21    FTP (data/control)
22       SSH
23       Telnet (insecure)
25       SMTP
53       DNS
67/68    DHCP
80       HTTP
110      POP3
143      IMAP
161/162  SNMP
179      BGP
443      HTTPS
465/587  SMTP (secure)
993      IMAPS
995      POP3S
3306     MySQL
5432     PostgreSQL
6379     Redis
27017    MongoDB
```

---

## Application Layer Protocols

### DNS (Domain Name System)
See `dns-tls-http.md` for full details.

**Quick reference:**
```
A      — IPv4 address
AAAA   — IPv6 address
CNAME  — Canonical name (alias)
MX     — Mail exchanger
NS     — Name server
TXT    — Text (SPF, DKIM, verification)
PTR    — Reverse lookup
SOA    — Start of Authority
SRV    — Service locator
CAA    — Certification Authority Authorization
```

### HTTP
See `dns-tls-http.md` for full details.

---

## Network Diagnostics

```bash
# Connectivity
ping -c 4 google.com
ping6 ::1                         # IPv6 ping

# Route tracing
traceroute google.com
traceroute -T google.com          # TCP mode (bypasses ICMP blocks)
mtr google.com                    # Continuous traceroute
pathping google.com               # Windows equivalent

# DNS
dig google.com
dig google.com A
dig google.com MX
dig @1.1.1.1 google.com          # Use Cloudflare DNS
dig -x 8.8.8.8                   # Reverse lookup
dig google.com +trace             # Full resolution trace
nslookup google.com
host google.com

# Ports & connections
ss -tlnp                          # TCP listening ports + processes
ss -tlnp | grep LISTEN
ss -o state established           # Established connections
ss -s                             # Socket summary
netstat -tlnp                     # Legacy alternative

# Network interfaces
ip addr show
ip link show
ip route show
ip neigh show                     # ARP table

# Packet capture
tcpdump -i eth0 -n                # All traffic on eth0
tcpdump -i eth0 port 80           # Filter by port
tcpdump -i eth0 host 1.2.3.4      # Filter by host
tcpdump -i eth0 -w capture.pcap   # Save to file
tcpdump -r capture.pcap           # Read from file
wireshark capture.pcap            # GUI analysis

# Bandwidth testing
iperf3 -s                        # Server mode
iperf3 -c server-ip              # Client: TCP test
iperf3 -c server-ip -u          # UDP test
iperf3 -c server-ip -P 4        # 4 parallel streams

# Port scanning (for authorized testing)
nmap -p 80,443 host
nmap -p 1-65535 host
nmap -sV host                    # Service version
nmap -A host                     # Aggressive (OS, version, scripts)
nmap -sU host                    # UDP scan

# HTTP testing
curl -v https://example.com              # Verbose
curl -I https://example.com             # Headers only
curl -w "\nTime: %{time_total}s\n" URL  # Timing
curl --resolve example.com:443:1.2.3.4 https://example.com  # Override DNS
```

---

## Firewalls & iptables

### iptables Chains
```
INPUT     — traffic destined for this host
OUTPUT    — traffic originating from this host
FORWARD   — traffic passing through (routing)
PREROUTING  — before routing decision (NAT)
POSTROUTING — after routing decision (NAT)
```

### iptables Rules
```bash
# View rules
iptables -L -v -n             # List all with verbose
iptables -L INPUT -v -n
iptables -t nat -L -v -n      # NAT table

# Allow/deny
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -P INPUT DROP         # Default policy: drop

# NAT
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE  # Enable NAT/masquerade
iptables -t nat -A PREROUTING -p tcp --dport 80 -j DNAT --to 192.168.1.10:80

# Save/restore
iptables-save > /etc/iptables/rules.v4
iptables-restore < /etc/iptables/rules.v4
```

---

## Load Balancing

### Algorithms
- **Round Robin**: distribute evenly in order
- **Least Connections**: send to server with fewest active connections
- **IP Hash**: hash client IP → consistent server (session affinity)
- **Weighted**: servers have different weights (capacities)
- **Random**: random selection

### Layer 4 vs Layer 7
- **L4 LB**: routes by IP/port without reading content (fast, less overhead)
- **L7 LB**: routes by HTTP headers, URL, cookies (smarter, more overhead)
  - Can do: SSL termination, content-based routing, health checks

### Health Checks
- **Passive**: observe error rates in real traffic
- **Active**: probe servers with synthetic requests
- Types: TCP connect, HTTP GET with expected status, custom script

---

## CDN (Content Delivery Network)

- Geographically distributed cache servers
- User requests go to nearest PoP (Point of Presence)
- Reduces latency, origin server load
- TTL-based cache invalidation
- **Anycast routing**: same IP announced from multiple locations, routing picks nearest
- **Edge computing**: run code at CDN nodes (Cloudflare Workers, Lambda@Edge)

---

*Master networking and you'll debug anything. Miss it and you'll be lost.*
