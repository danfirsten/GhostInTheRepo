# Network Security — Complete Reference

> Network security is the art of defending communication. Understanding attacks, defenses, and protocols at the packet level is what makes the difference between a security engineer and someone who just installs firewalls.

---

## Firewalls

### iptables (Linux)
```bash
# iptables: packet filtering firewall
# Tables: filter (default), nat, mangle, raw
# Chains: INPUT, OUTPUT, FORWARD (filter table)
#         PREROUTING, POSTROUTING (nat/mangle)

# View rules
iptables -L -n -v           # List filter table (verbose, numeric)
iptables -t nat -L -n -v    # NAT table
iptables -L -n --line-numbers  # Show line numbers

# Basic INPUT rules
# Default: block all, then allow specific
iptables -P INPUT DROP       # Default policy: DROP everything
iptables -P FORWARD DROP
iptables -P OUTPUT ACCEPT    # Allow outgoing

# Allow established connections (stateful)
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

# Allow loopback
iptables -A INPUT -i lo -j ACCEPT

# Allow SSH (rate-limited)
iptables -A INPUT -p tcp --dport 22 -m state --state NEW \
         -m recent --set --name SSH
iptables -A INPUT -p tcp --dport 22 -m state --state NEW \
         -m recent --update --seconds 60 --hitcount 4 --name SSH -j DROP
iptables -A INPUT -p tcp --dport 22 -j ACCEPT

# Allow HTTP/HTTPS
iptables -A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT

# ICMP (ping): allow with rate limit
iptables -A INPUT -p icmp --icmp-type echo-request \
         -m limit --limit 1/s --limit-burst 5 -j ACCEPT

# Log dropped packets
iptables -A INPUT -j LOG --log-prefix "iptables-dropped: " --log-level 4
iptables -A INPUT -j DROP

# Save rules (Ubuntu)
iptables-save > /etc/iptables/rules.v4
iptables-restore < /etc/iptables/rules.v4

# NAT: masquerade outgoing (internet sharing)
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
echo 1 > /proc/sys/net/ipv4/ip_forward

# Port forwarding
iptables -t nat -A PREROUTING -p tcp --dport 8080 -j REDIRECT --to-port 80
# Or to another host:
iptables -t nat -A PREROUTING -p tcp --dport 80 \
         -j DNAT --to-destination 192.168.1.10:80
```

### nftables (Modern Linux Firewall)
```bash
# nftables: replacement for iptables, iptables-nat, ip6tables, arptables, ebtables

# View
nft list ruleset

# Basic server ruleset
nft -f - <<'EOF'
table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;

        # Established/related connections
        ct state { established, related } accept

        # Loopback
        iif lo accept

        # ICMP
        ip protocol icmp icmp type { echo-request } limit rate 5/second accept
        ip6 nexthdr icmpv6 icmpv6 type { echo-request } limit rate 5/second accept

        # SSH with rate limiting
        tcp dport 22 ct state new limit rate 4/minute burst 4 packets accept

        # HTTP/HTTPS
        tcp dport { 80, 443 } accept

        # Drop and log the rest
        log prefix "nft-dropped: " counter drop
    }

    chain output {
        type filter hook output priority 0; policy accept;
    }

    chain forward {
        type filter hook forward priority 0; policy drop;
    }
}

table ip nat {
    chain prerouting {
        type nat hook prerouting priority -100;
        tcp dport 8080 redirect to 80
    }
    chain postrouting {
        type nat hook postrouting priority 100;
        oif "eth0" masquerade
    }
}
EOF

# Save and load at boot (systemd)
nft list ruleset > /etc/nftables.conf
systemctl enable nftables
```

### UFW (Uncomplicated Firewall)
```bash
# UFW: simple wrapper around iptables
ufw status verbose           # Status
ufw enable                   # Enable
ufw disable                  # Disable
ufw default deny incoming
ufw default allow outgoing

# Allow rules
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow from 192.168.1.0/24 to any port 5432  # PostgreSQL from local only
ufw allow from 10.0.0.0/8 to any port 22         # SSH from VPN subnet

# Deny specific
ufw deny from 1.2.3.4

# Rate limit (6 connections per 30 seconds)
ufw limit ssh

# Delete rule
ufw delete allow 80/tcp
ufw delete 3  # By rule number

# Logging
ufw logging on
ufw logging high  # detailed
# Logs to: /var/log/ufw.log
```

---

## VPN Technologies

### WireGuard
```bash
# WireGuard: modern, fast, auditable VPN (kernel module)
# 4000 lines of code vs 70,000 for OpenVPN

# Install
apt install wireguard

# Generate keys
wg genkey | tee private.key | wg pubkey > public.key
chmod 600 private.key

# Server config: /etc/wireguard/wg0.conf
[Interface]
PrivateKey = <server_private_key>
Address = 10.0.0.1/24
ListenPort = 51820
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey = <client_public_key>
AllowedIPs = 10.0.0.2/32  # This client's IP

# Client config: /etc/wireguard/wg0.conf
[Interface]
PrivateKey = <client_private_key>
Address = 10.0.0.2/24
DNS = 1.1.1.1

[Peer]
PublicKey = <server_public_key>
Endpoint = server.example.com:51820
AllowedIPs = 0.0.0.0/0, ::/0  # Route all traffic through VPN
PersistentKeepalive = 25       # Keep NAT alive

# Start/stop
wg-quick up wg0
wg-quick down wg0
systemctl enable wg-quick@wg0

# Status
wg show                 # Status of all interfaces
wg show wg0            # Specific interface
```

### OpenVPN
```bash
# OpenVPN: mature, widely supported, SSL/TLS-based
# Uses UDP port 1194 by default

# Setup with Easy-RSA
git clone https://github.com/OpenVPN/easy-rsa.git
./easyrsa init-pki
./easyrsa build-ca          # Build Certificate Authority
./easyrsa gen-req server nopass
./easyrsa sign-req server server
./easyrsa gen-req client1 nopass
./easyrsa sign-req client client1
./easyrsa gen-dh             # Diffie-Hellman parameters

# Server config: /etc/openvpn/server.conf
port 1194
proto udp
dev tun
ca ca.crt
cert server.crt
key server.key
dh dh.pem
server 10.8.0.0 255.255.255.0
push "route 192.168.1.0 255.255.255.0"
push "redirect-gateway def1 bypass-dhcp"
push "dhcp-option DNS 8.8.8.8"
keepalive 10 120
cipher AES-256-GCM
auth SHA256
user nobody
group nogroup
persist-key
persist-tun

# Start
systemctl start openvpn@server
```

---

## IDS/IPS (Intrusion Detection/Prevention)

### Suricata
```yaml
# Suricata: high-performance network IDS/IPS/NSM

# Install and configure
apt install suricata

# /etc/suricata/suricata.yaml
HOME_NET: "[192.168.0.0/16,10.0.0.0/8,172.16.0.0/12]"
EXTERNAL_NET: "!$HOME_NET"

# Run modes:
# IDS: monitor only (af-packet)
# IPS: inline blocking (nfqueue or af-xdp)

# IDS mode on interface
suricata -c /etc/suricata/suricata.yaml -i eth0

# IPS mode (inline with nfqueue)
iptables -I FORWARD -j NFQUEUE
suricata -c /etc/suricata/suricata.yaml -q 0

# Update threat intelligence rules
suricata-update
systemctl restart suricata

# Rules syntax
# alert tcp $EXTERNAL_NET any -> $HTTP_SERVERS $HTTP_PORTS \
#   (msg:"ET SCAN Possible Nmap"; flags:S; \
#    threshold: type both, track by_src, count 5, seconds 60; \
#    classtype:attempted-recon; sid:2000537; rev:5;)

# View alerts
tail -f /var/log/suricata/fast.log
# JSON output:
cat /var/log/suricata/eve.json | jq 'select(.event_type=="alert")'
```

### Snort Rules
```
Snort rule syntax:
  action proto src_ip src_port direction dst_ip dst_port (options)

Examples:
  # Alert on SSH brute force (>5 attempts in 60s)
  alert tcp any any -> $HOME_NET 22 \
    (msg:"SSH Brute Force Attempt"; \
     detection_filter:track by_src, count 5, seconds 60; \
     sid:1000001; rev:1;)

  # Alert on SQL injection
  alert http $EXTERNAL_NET any -> $HTTP_SERVERS $HTTP_PORTS \
    (msg:"SQL Injection Attempt"; \
     content:"union"; nocase; content:"select"; nocase; distance:0; \
     pcre:"/union\s+select/i"; \
     sid:1000002; rev:1;)

  # Alert on port scan
  alert tcp any any -> $HOME_NET any \
    (msg:"NMAP SYN Scan"; flags:S; \
     threshold:type threshold, track by_src, count 100, seconds 1; \
     sid:1000003; rev:1;)
```

---

## Network Attacks and Defenses

### DDoS (Distributed Denial of Service)
```
Attack types:
  Volumetric: flood bandwidth (UDP flood, ICMP flood, DNS amplification)
  Protocol: exploit protocol weakness (SYN flood, Ping of Death)
  Application layer: HTTP flood, Slowloris (slow HTTP headers)

SYN flood:
  Attacker sends many SYN packets with spoofed source IPs
  Server creates half-open connections (SYN_RECEIVED state)
  Fills backlog queue → legitimate connections refused

  Defense: SYN cookies (TCP option that avoids storing state)
    sysctl net.ipv4.tcp_syncookies=1  (Linux default)
    Proof-of-work: client must compute cookie before state allocated

DNS amplification:
  Send small DNS query with spoofed source IP (victim's IP)
  DNS response (much larger) sent to victim
  Amplification factor: 50-100x

  Defense:
    Response Rate Limiting (RRL) on authoritative nameservers
    Block spoofed source IPs (BCP38 ingress filtering)

Mitigation:
  CDN/DDoS scrubbing (Cloudflare, Akamai, AWS Shield)
  Anycast: distribute traffic across many PoPs
  Rate limiting at edge
  Block by geo/ASN (last resort)
  BGP blackhole: null-route victim IP (stop the DDoS but also stop legit traffic)

Application-layer mitigation:
  Rate limiting by IP/user
  CAPTCHA for suspicious patterns
  Slowloris defense: timeout on slow headers
    nginx: client_header_timeout 10s; client_body_timeout 10s;
```

### Man-in-the-Middle (MITM) Attacks
```
ARP Spoofing / Poisoning:
  Attacker broadcasts fake ARP: "I am 192.168.1.1" (gateway)
  Traffic flows through attacker's machine
  Attacker forwards traffic (invisible MITM)

  Tools: arpspoof, ettercap, bettercap
  Detection: arp -a, check for duplicate MACs, dynamic ARP inspection

  Defenses:
    Dynamic ARP Inspection (DAI) — managed switches
    Static ARP entries for critical hosts
    Detection tools: arpwatch, XArp

SSL Stripping (sslstrip):
  Downgrade HTTPS to HTTP by intercepting redirects
  Defense: HSTS (HTTP Strict Transport Security)
    Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
    HSTS Preload list: browsers hardcode HTTPS for domains

Certificate MITM:
  Attacker creates fake cert (using rogue CA)
  Defense: Certificate Transparency (CT) logs, cert pinning
  Defense: CAA DNS records restricting which CAs can issue

BGP Hijacking:
  Announce more specific route to redirect internet traffic
  No authentication in BGP (trust-based)
  Defense: RPKI (Resource Public Key Infrastructure) — sign prefixes
           BGP monitoring, MANRS (community norms)
```

### Scanning and Reconnaissance
```bash
# Network reconnaissance (authorized use only)
# Port scanning
nmap -sV -sC -p- target          # Full scan: all ports, version, scripts
nmap -sU target                  # UDP scan
nmap --script vuln target        # Vulnerability scripts
nmap -sn 192.168.1.0/24         # Ping sweep (host discovery)
masscan -p1-65535 target --rate=10000  # Very fast scanner

# Detect OS
nmap -O target
nmap -A target                   # Aggressive: OS, version, scripts, traceroute

# Service enumeration
nmap -sV --version-intensity 5 target  # Detailed version detection
nmap -p 80 --script http-enum target   # Web directory enumeration

# Detection of scanning:
# IDS: Suricata/Snort rules for port scan patterns
# Firewall: rate limit SYN packets per source
# Honeypot: fake open services to detect scanners
```

---

## Zero Trust Architecture

```
Zero Trust: "Never trust, always verify"
  Traditional: trust internal network, strict external perimeter
  Zero Trust: no implicit trust based on network location
               always authenticate and authorize every request

Principles:
  1. Verify explicitly: always authenticate and authorize (MFA, device health)
  2. Least privilege: minimal access necessary
  3. Assume breach: segment network, encrypt everything, log everything

Implementation:
  Identity: strong MFA for all users, service identities
  Device: device health checks (MDM, EDR) before granting access
  Network: micro-segmentation (VLAN, mTLS between services)
  Application: application-layer authentication (not network perimeter)
  Data: classify and encrypt sensitive data

Practical components:
  Service mesh (Istio, Linkerd): mTLS between services automatically
  Identity-Aware Proxy: authenticate at proxy, not network perimeter
  BeyondCorp (Google): no VPN, authenticate with certificates + context
  SPIFFE/SPIRE: X.509 identity for workloads

mTLS (mutual TLS):
  Both client AND server present certificates
  Clients need their own cert (issued by internal CA)
  Cryptographically binds identity to every connection
  Used by: service meshes, Zero Trust internally

# Check mTLS with openssl
openssl s_client -connect service:443 -cert client.crt -key client.key -CAfile ca.crt
```

---

## Network Monitoring and Forensics

### Packet Capture
```bash
# tcpdump: command-line packet capture
tcpdump -i eth0 -w capture.pcap          # Capture to file
tcpdump -r capture.pcap                  # Read capture
tcpdump -i any port 80 or port 443       # HTTP/HTTPS
tcpdump -i eth0 host 10.0.0.1           # Specific host
tcpdump -i eth0 'tcp[13] & 0x02 != 0'  # SYN packets (TCP flag byte)
tcpdump -i eth0 -n -c 1000 -w scan.pcap # Capture 1000 packets

# Wireshark filters (display filters)
http                                     # HTTP traffic
tcp.port == 443                          # Port 443
ip.src == 192.168.1.1                   # From specific IP
tcp.flags.syn == 1 && tcp.flags.ack == 0  # SYN only (connection attempts)
dns                                      # DNS queries
http.request.method == "POST"           # HTTP POST requests
ssl.handshake.type == 1                 # TLS ClientHello

# tshark: Wireshark CLI
tshark -i eth0 -f "port 80" -Y "http.request" \
       -T fields -e http.request.method -e http.request.uri -e ip.src

# Zeek (Bro): network traffic analysis
# Generates high-level logs from raw traffic
# zeek -i eth0 -e 'redef Log::default_rotation_interval = 1 hr;'
# Logs: conn.log, http.log, dns.log, ssl.log, files.log, weird.log
```

### Log Analysis
```bash
# Security-relevant logs to monitor
/var/log/auth.log          # SSH, sudo, su, PAM
/var/log/syslog            # System messages
/var/log/kern.log          # Kernel messages
/var/log/fail2ban.log      # fail2ban actions
/var/log/nginx/access.log  # Web access
/var/log/nginx/error.log   # Web errors
/var/log/ufw.log           # Firewall
journalctl -u sshd         # SSH daemon logs

# Real-time monitoring
tail -f /var/log/auth.log | grep -i "failed\|invalid\|error"

# Failed SSH login attempts
grep "Failed password" /var/log/auth.log | awk '{print $11}' | sort | uniq -c | sort -nr | head

# Successful logins
grep "Accepted" /var/log/auth.log

# fail2ban: automatic IP banning
apt install fail2ban
# /etc/fail2ban/jail.local
[sshd]
enabled = true
port = ssh
maxretry = 3
bantime = 3600
findtime = 600
banaction = iptables-multiport

fail2ban-client status         # Overall status
fail2ban-client status sshd    # SSH jail status
fail2ban-client unban IP       # Unban IP
```

### SIEM Concepts
```
SIEM (Security Information and Event Management):
  Collect → Normalize → Correlate → Alert → Investigate

Pipeline:
  Log sources (syslog, API) → Log shipper (Filebeat, Fluentd)
  → Storage (Elasticsearch, Splunk) → Analysis

Use cases:
  Detect brute force: >N failed logins from same IP in time window
  Lateral movement: successful login from new IP after previous failure
  Data exfiltration: large outbound data transfer
  Privilege escalation: sudo usage outside business hours

ELK Stack for SIEM:
  Elasticsearch: storage and search
  Logstash: parsing, enrichment (GeoIP, threat intel)
  Kibana: dashboards, search

Alert examples (Elasticsearch):
  Failed logins per IP > 10 in 1 minute
  Login from impossible travel (IP geolocation)
  Network connection to known C2 IPs (threat intel)
  Unusual outbound port (DNS on non-standard port = possible exfil)
```

---

## SSL/TLS Security

```bash
# Testing TLS configuration
# testssl.sh: comprehensive TLS tester
testssl.sh https://example.com
testssl.sh --severity HIGH --quiet example.com:443
# Tests: protocol versions, ciphers, heartbleed, BEAST, POODLE, ROBOT...

# sslyze: Python-based TLS analyzer
sslyze example.com
sslyze --robot --heartbleed --fallback example.com

# nmap TLS scripts
nmap --script ssl-enum-ciphers -p 443 example.com
nmap --script ssl-cert -p 443 example.com
nmap --script ssl-heartbleed -p 443 example.com

# openssl: inspect TLS handshake
openssl s_client -connect example.com:443 -servername example.com
openssl s_client -connect example.com:443 -tls1_3  # Force TLS 1.3
openssl s_client -connect example.com:443 </dev/null 2>&1 | grep "Protocol\|Cipher"

# Nginx secure TLS config
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256';
ssl_prefer_server_ciphers off;  # Client choice (TLS 1.3 doesn't use this)
ssl_session_timeout 1d;
ssl_session_cache shared:MozSSL:10m;  # ~40000 sessions
ssl_session_tickets off;  # Disable session tickets (PFS)
ssl_stapling on;          # OCSP stapling
ssl_stapling_verify on;

# HSTS
add_header Strict-Transport-Security "max-age=63072000" always;
```

---

*Network security is a continuous arms race. Attackers scan 24/7, and new techniques emerge constantly. The fundamentals — encryption, authentication, least privilege, monitoring — never change. Build on those and adapt to threats as they evolve.*
