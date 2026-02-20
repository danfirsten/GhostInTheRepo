# Network Programming — Complete Reference

> Writing networked software that's correct, fast, and resilient requires understanding sockets, I/O models, and the difference between latency and throughput. This is the craft of server programming.

---

## Sockets

### Socket Basics
```c
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <unistd.h>

// Create socket
int sockfd = socket(
    AF_INET,      // Address family: AF_INET (IPv4), AF_INET6 (IPv6), AF_UNIX
    SOCK_STREAM,  // Type: SOCK_STREAM (TCP), SOCK_DGRAM (UDP), SOCK_RAW
    0             // Protocol: 0 = auto-select
);

// TCP Server
struct sockaddr_in addr = {
    .sin_family = AF_INET,
    .sin_port = htons(8080),      // Network byte order (big-endian)
    .sin_addr.s_addr = INADDR_ANY  // All interfaces
};

// Enable port reuse (avoid "Address already in use")
int opt = 1;
setsockopt(sockfd, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt));
setsockopt(sockfd, SOL_SOCKET, SO_REUSEPORT, &opt, sizeof(opt));  // Kernel balances across processes

bind(sockfd, (struct sockaddr*)&addr, sizeof(addr));
listen(sockfd, 128);  // Backlog: size of connection queue

// Accept connections (blocks)
struct sockaddr_in client_addr;
socklen_t client_len = sizeof(client_addr);
int client_fd = accept(sockfd, (struct sockaddr*)&client_addr, &client_len);

char client_ip[INET_ADDRSTRLEN];
inet_ntop(AF_INET, &client_addr.sin_addr, client_ip, sizeof(client_ip));
printf("Connection from %s:%d\n", client_ip, ntohs(client_addr.sin_port));

// Send/receive
char buf[4096];
ssize_t n = recv(client_fd, buf, sizeof(buf), 0);
send(client_fd, "HTTP/1.1 200 OK\r\n\r\n", 19, 0);
// Or: read()/write() — but send/recv have flags

close(client_fd);
close(sockfd);
```

### TCP Client
```c
// TCP Client
struct addrinfo hints = {0}, *res;
hints.ai_family = AF_UNSPEC;       // IPv4 or IPv6
hints.ai_socktype = SOCK_STREAM;

getaddrinfo("example.com", "80", &hints, &res);  // DNS resolution
int sockfd = socket(res->ai_family, res->ai_socktype, res->ai_protocol);

connect(sockfd, res->ai_addr, res->ai_addrlen);
freeaddrinfo(res);

send(sockfd, "GET / HTTP/1.0\r\nHost: example.com\r\n\r\n", 38, 0);

char buf[4096];
ssize_t n;
while ((n = recv(sockfd, buf, sizeof(buf)-1, 0)) > 0) {
    buf[n] = '\0';
    printf("%s", buf);
}
close(sockfd);
```

### Socket Options
```c
// Timeout for receive operations
struct timeval tv = { .tv_sec = 5, .tv_usec = 0 };
setsockopt(sockfd, SOL_SOCKET, SO_RCVTIMEO, &tv, sizeof(tv));

// TCP keepalive (detect dead connections)
int keepalive = 1;
setsockopt(sockfd, SOL_SOCKET, SO_KEEPALIVE, &keepalive, sizeof(keepalive));
int keepidle = 60;   // Start keepalive after 60s idle
int keepintvl = 10;  // Probe every 10s
int keepcnt = 5;     // Give up after 5 probes
setsockopt(sockfd, IPPROTO_TCP, TCP_KEEPIDLE, &keepidle, sizeof(keepidle));
setsockopt(sockfd, IPPROTO_TCP, TCP_KEEPINTVL, &keepintvl, sizeof(keepintvl));
setsockopt(sockfd, IPPROTO_TCP, TCP_KEEPCNT, &keepcnt, sizeof(keepcnt));

// Disable Nagle's algorithm (send small packets immediately)
// Useful for real-time protocols, games, interactive apps
int nodelay = 1;
setsockopt(sockfd, IPPROTO_TCP, TCP_NODELAY, &nodelay, sizeof(nodelay));

// Buffer sizes
int rcvbuf = 1 << 20;  // 1MB
setsockopt(sockfd, SOL_SOCKET, SO_RCVBUF, &rcvbuf, sizeof(rcvbuf));

// Get socket error
int err;
socklen_t len = sizeof(err);
getsockopt(sockfd, SOL_SOCKET, SO_ERROR, &err, &len);
```

### UDP Socket
```c
// UDP Server
int sock = socket(AF_INET, SOCK_DGRAM, 0);
struct sockaddr_in addr = {
    .sin_family = AF_INET,
    .sin_port = htons(12345),
    .sin_addr.s_addr = INADDR_ANY
};
bind(sock, (struct sockaddr*)&addr, sizeof(addr));

// Receive
struct sockaddr_in from;
socklen_t fromlen = sizeof(from);
char buf[1024];
ssize_t n = recvfrom(sock, buf, sizeof(buf), 0,
                     (struct sockaddr*)&from, &fromlen);

// Reply to sender
sendto(sock, "pong", 4, 0, (struct sockaddr*)&from, fromlen);

// UDP Multicast
// Join multicast group
struct ip_mreq mreq;
mreq.imr_multiaddr.s_addr = inet_addr("239.0.0.1");  // Multicast group
mreq.imr_interface.s_addr = INADDR_ANY;
setsockopt(sock, IPPROTO_IP, IP_ADD_MEMBERSHIP, &mreq, sizeof(mreq));
```

---

## I/O Models

### Blocking I/O (Default)
```
Process blocks on recv() until data arrives or timeout
Simple but inefficient for many connections:
  1 thread per connection → huge memory overhead (each thread ~2-8MB stack)
  Context switching overhead
  Works fine up to ~100s of connections

  Thread pool: limit threads but still 1:1 with connections
```

### Non-Blocking I/O
```c
#include <fcntl.h>

// Set non-blocking mode
int flags = fcntl(sockfd, F_GETFL, 0);
fcntl(sockfd, F_SETFL, flags | O_NONBLOCK);
// Or at creation: socket(AF_INET, SOCK_STREAM | SOCK_NONBLOCK, 0)

// recv returns immediately
ssize_t n = recv(sockfd, buf, sizeof(buf), 0);
if (n < 0) {
    if (errno == EAGAIN || errno == EWOULDBLOCK) {
        // No data available right now — try later
    } else {
        // Real error
    }
} else if (n == 0) {
    // Connection closed by peer
}

// Need event notification: when IS data available?
// → poll(), select(), epoll()
```

### select() and poll()
```c
// poll(): wait for events on multiple file descriptors
#include <poll.h>

struct pollfd fds[2] = {
    { .fd = listen_fd, .events = POLLIN },
    { .fd = client_fd, .events = POLLIN | POLLOUT }
};

int n = poll(fds, 2, -1);  // -1 = block indefinitely

if (fds[0].revents & POLLIN) {
    // New connection ready to accept
    int client = accept(listen_fd, NULL, NULL);
}
if (fds[1].revents & POLLIN) {
    // Data available to read
}
if (fds[1].revents & POLLOUT) {
    // Socket writable (send buffer has space)
}
if (fds[1].revents & (POLLERR | POLLHUP)) {
    // Error or hangup
}

// select(): older, limited to FD_SETSIZE (1024) file descriptors
fd_set read_fds;
FD_ZERO(&read_fds);
FD_SET(listen_fd, &read_fds);
struct timeval tv = { .tv_sec = 5 };
select(listen_fd + 1, &read_fds, NULL, NULL, &tv);
// Avoid select() — prefer poll() or epoll()
```

### epoll (Linux, High Performance)
```c
#include <sys/epoll.h>

// epoll: O(1) for event notification (vs poll's O(n))
// Critical for high-connection-count servers (10k+)

// Create epoll instance
int epfd = epoll_create1(EPOLL_CLOEXEC);

// Add file descriptor to watch
struct epoll_event ev;
ev.events = EPOLLIN | EPOLLET;  // Edge-triggered (ET) or level-triggered (LT)
ev.data.fd = listen_fd;
epoll_ctl(epfd, EPOLL_CTL_ADD, listen_fd, &ev);

// Edge-triggered (EPOLLET):
//   Notified only when state CHANGES (buffer goes from empty to non-empty)
//   Must read ALL data when notified (loop until EAGAIN)
//   More efficient but requires careful coding

// Level-triggered (default, no EPOLLET):
//   Notified while data is available
//   Simpler to use correctly

// Event loop
struct epoll_event events[1024];
while (1) {
    int nfds = epoll_wait(epfd, events, 1024, -1);

    for (int i = 0; i < nfds; i++) {
        if (events[i].data.fd == listen_fd) {
            // New connection
            int client = accept4(listen_fd, NULL, NULL, SOCK_NONBLOCK | SOCK_CLOEXEC);
            ev.events = EPOLLIN | EPOLLET;
            ev.data.fd = client;
            epoll_ctl(epfd, EPOLL_CTL_ADD, client, &ev);
        } else {
            // Data from client
            int fd = events[i].data.fd;
            char buf[4096];
            ssize_t n;
            // ET: must read all available data
            while ((n = recv(fd, buf, sizeof(buf), 0)) > 0) {
                // process data
            }
            if (n == 0) {
                epoll_ctl(epfd, EPOLL_CTL_DEL, fd, NULL);
                close(fd);
            } else if (errno != EAGAIN) {
                // Error
            }
        }
    }
}
```

---

## Async I/O in Python

### asyncio TCP Server
```python
import asyncio

async def handle_client(reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
    addr = writer.get_extra_info('peername')
    print(f"New connection from {addr}")

    try:
        while True:
            data = await reader.read(4096)
            if not data:
                break  # Connection closed

            message = data.decode()
            print(f"Received: {message!r}")

            # Echo back
            writer.write(f"Echo: {message}".encode())
            await writer.drain()  # Flush write buffer
    except asyncio.IncompleteReadError:
        pass
    finally:
        writer.close()
        await writer.wait_closed()
        print(f"Connection from {addr} closed")

async def main():
    server = await asyncio.start_server(
        handle_client,
        '0.0.0.0',
        8888,
        reuse_address=True,
        reuse_port=True,
    )
    async with server:
        print("Server listening on port 8888")
        await server.serve_forever()

asyncio.run(main())
```

### asyncio TCP Client
```python
import asyncio

async def connect():
    reader, writer = await asyncio.open_connection('127.0.0.1', 8888)

    try:
        # Send
        writer.write(b"Hello, server!\n")
        await writer.drain()

        # Receive with timeout
        try:
            data = await asyncio.wait_for(reader.readline(), timeout=5.0)
            print(f"Received: {data.decode()!r}")
        except asyncio.TimeoutError:
            print("Timeout!")

    finally:
        writer.close()
        await writer.wait_closed()

asyncio.run(connect())
```

### aiohttp HTTP Client
```python
import asyncio
import aiohttp

async def fetch_all(urls: list[str]) -> list[str]:
    async with aiohttp.ClientSession() as session:
        tasks = [fetch(session, url) for url in urls]
        return await asyncio.gather(*tasks)

async def fetch(session: aiohttp.ClientSession, url: str) -> str:
    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
        response.raise_for_status()
        return await response.text()

# Concurrent HTTP requests (no waiting for each to finish)
urls = ["https://httpbin.org/get"] * 10
results = asyncio.run(fetch_all(urls))
# All 10 requests made concurrently!

# Connection pooling (default in aiohttp)
# Limit connections per host
connector = aiohttp.TCPConnector(limit_per_host=10)
async with aiohttp.ClientSession(connector=connector) as session:
    pass
```

---

## High-Performance Server Patterns

### C10K Problem Solutions
```
C10K (10,000 concurrent connections) problem (1999):
  Old approach: 1 thread/process per connection
  10K threads × 8MB stack = 80GB RAM! Not feasible.

Solutions:
  epoll + event loop (Nginx, Node.js, Redis approach)
  Thread pool + epoll (Java NIO, Netty)
  User-space threading / fibers (Go goroutines, Erlang processes)

Modern C10M (10 million connections):
  DPDK: bypass kernel entirely, handle packets in user space
  io_uring: newer Linux async I/O interface
  SO_REUSEPORT: multiple processes listening on same port (kernel load balances)
```

### io_uring (Modern Linux Async I/O)
```c
// io_uring: high-performance async I/O (Linux 5.1+)
// Used by: Nginx, RocksDB, many databases

#include <liburing.h>

struct io_uring ring;
io_uring_queue_init(256, &ring, 0);

// Submit read operation
struct io_uring_sqe *sqe = io_uring_get_sqe(&ring);
io_uring_prep_recv(sqe, client_fd, buf, sizeof(buf), 0);
sqe->user_data = (uint64_t)client_fd;

io_uring_submit(&ring);

// Wait for completion
struct io_uring_cqe *cqe;
io_uring_wait_cqe(&ring, &cqe);
int result = cqe->res;  // bytes received, or negative errno
io_uring_cqe_seen(&ring, cqe);

// Benefits over epoll:
// - Batch operations (submit many I/Os at once)
// - Zero-copy sends (SPLICE support)
// - Fixed buffers (registered with kernel, no copy)
// - Truly async everything: accept, connect, send, recv, read, write, fsync
```

### Zero-Copy Networking
```c
// sendfile(): send file to socket without kernel→user→kernel copy
#include <sys/sendfile.h>

int file_fd = open("bigfile.dat", O_RDONLY);
struct stat st;
fstat(file_fd, &st);

// Kernel copies directly file → socket buffer (no user space copy)
sendfile(client_fd, file_fd, NULL, st.st_size);
close(file_fd);

// splice(): pipe-based zero-copy between file descriptors
// splice(fd_in, off_in, fd_out, off_out, len, flags)

// mmap + write: map file, write to socket
// Still has copy but avoids read() syscall

// MSG_ZEROCOPY: truly zero-copy send (kernel 4.14+)
// Requires pinning pages, async completion notification
setsockopt(sockfd, SOL_SOCKET, SO_ZEROCOPY, &one, sizeof(one));
send(sockfd, buf, len, MSG_ZEROCOPY);
// Wait for notification via error queue
```

---

## Network Debugging

### Tools
```bash
# ss: socket statistics (modern netstat)
ss -tan                      # TCP sockets (all, numeric)
ss -tulnp                    # TCP+UDP listening, show process
ss -s                        # Summary stats
ss -tnp state established    # Established connections
ss -tnp 'dst :443'          # Connections to port 443
ss -o                        # Show TCP timer info

# netstat (legacy but still common)
netstat -tulnp               # Listening sockets with processes
netstat -an | grep ESTABLISHED | wc -l  # Count established connections
netstat -s                   # Protocol statistics

# tcpdump: packet capture
tcpdump -i eth0 port 80      # Capture HTTP on eth0
tcpdump -i any -n port 443   # All interfaces, numeric
tcpdump -w capture.pcap      # Write to file
tcpdump -r capture.pcap      # Read from file
tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0'  # TCP SYN packets
tcpdump -i eth0 host 10.0.0.1 and port 8080

# Wireshark: GUI packet analysis
# Open .pcap file or capture live
# Filter: http, tcp.port==8080, ip.src==10.0.0.1
# Follow stream: right-click → Follow → TCP Stream

# nmap: network scanner
nmap -sV 10.0.0.1             # Version detection
nmap -sS -p 1-65535 10.0.0.1  # SYN scan all ports (root)
nmap -sU -p 53,123 10.0.0.1   # UDP scan
nmap -O 10.0.0.1              # OS detection
nmap -A 10.0.0.1              # Aggressive (OS, version, scripts, traceroute)
nmap 10.0.0.0/24              # Scan entire subnet

# nc (netcat): TCP/UDP Swiss army knife
nc -lvp 8080                  # Listen on port 8080
nc 10.0.0.1 8080              # Connect
nc -u -lvp 5000               # UDP listener
echo "test" | nc 10.0.0.1 8080  # Send data
nc -z -v 10.0.0.1 20-100      # Port scan range (z=zero-I/O)
nc -l -p 8080 < file.txt      # Serve file
nc 10.0.0.1 8080 > received.txt  # Receive file

# curl: HTTP testing
curl -v https://example.com          # Verbose, show headers
curl -I https://example.com          # Headers only (HEAD request)
curl -X POST -H "Content-Type: application/json" \
     -d '{"key":"val"}' https://api.example.com/endpoint
curl -o /dev/null -w "%{time_total}\n" https://example.com  # Time request
curl --resolve example.com:443:1.2.3.4 https://example.com  # Override DNS

# iperf3: bandwidth testing
iperf3 -s                            # Server
iperf3 -c server_ip -t 30           # Client, 30 second test
iperf3 -c server_ip -P 4            # 4 parallel streams
iperf3 -c server_ip -u -b 100M      # UDP, 100 Mbps target
```

### Diagnosing Connection Problems
```bash
# Can't connect?
telnet host port             # Simple TCP connect test
nc -zv host port             # Better version

# Check routing
ip route get 8.8.8.8         # Which interface and gateway for 8.8.8.8
traceroute 8.8.8.8           # Path to destination
mtr --report 8.8.8.8         # Detailed path analysis with loss/latency

# DNS issues
dig hostname                 # Basic DNS query
dig +trace hostname          # Full DNS chain
dig hostname @8.8.8.8        # Use Google DNS directly

# Check firewall
iptables -L -n -v            # Show rules (root)
nft list ruleset             # nftables (modern)

# Check if port is in use
lsof -i :8080
fuser 8080/tcp

# Connection refused vs timeout
# Refused: service not listening or firewall RST
# Timeout: firewall dropping packets (no RST)

# Check TCP backlog
ss -lnt | grep :8080         # Send-Q = backlog queue
# If Recv-Q is consistently high: accept() not fast enough
```

---

## Network Programming in Python

### socket Module
```python
import socket
import struct

# Address helpers
ip = socket.gethostbyname("example.com")  # DNS lookup
hostname, aliases, ips = socket.gethostbyname_ex("example.com")
socket.inet_aton("192.168.1.1")  # IP string → 4 bytes
socket.inet_ntoa(b'\xc0\xa8\x01\x01')  # 4 bytes → IP string

# Byte order conversion
val = socket.htonl(0x12345678)   # Host → Network (long)
val = socket.htons(80)           # Host → Network (short)
val = socket.ntohl(val)          # Network → Host (long)

# struct: pack/unpack binary protocols
# Pack: 4-byte big-endian uint, 2-byte big-endian uint, 10-byte string
header = struct.pack('>I H 10s', 0xDEADBEEF, 1234, b'hello')
magic, version, name = struct.unpack('>I H 10s', header)

# Context manager for sockets
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
    sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    sock.bind(('0.0.0.0', 8080))
    sock.listen(128)
    conn, addr = sock.accept()
    with conn:
        data = conn.recv(4096)
        conn.sendall(b"HTTP/1.1 200 OK\r\n\r\nhello")
```

### Protocol Framing
```python
import asyncio
import struct

# Problem: TCP is a byte stream — need to delimit messages

# Length-prefix framing: [4-byte length][payload]
async def read_message(reader: asyncio.StreamReader) -> bytes:
    header = await reader.readexactly(4)
    length = struct.unpack('>I', header)[0]
    return await reader.readexactly(length)

async def write_message(writer: asyncio.StreamWriter, data: bytes) -> None:
    header = struct.pack('>I', len(data))
    writer.write(header + data)
    await writer.drain()

# Line-delimited framing: messages end with \n
async def read_line_message(reader: asyncio.StreamReader) -> str:
    line = await reader.readline()  # Reads until \n
    return line.decode().rstrip('\n')

# Fixed-size framing: all messages same size
async def read_fixed(reader: asyncio.StreamReader, size: int) -> bytes:
    return await reader.readexactly(size)
```

---

*Network programming is where theory meets hardware. The epoll, the zero-copy sendfile, the TCP_NODELAY — each exists because someone measured, found a bottleneck, and solved it. Knowing these tools is what separates engineers who write fast servers from those who just write slow ones.*
