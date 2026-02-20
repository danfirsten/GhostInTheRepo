import type { Cheatsheet } from "@/types/content";

const cheatsheets: Cheatsheet[] = [
  {
    domainSlug: "fundamentals",
    sections: [
      {
        title: "Big-O Complexity Reference",
        entries: [
          { command: "O(1)", description: "Constant — hash table lookup, array access by index" },
          { command: "O(log n)", description: "Logarithmic — binary search, balanced BST ops" },
          { command: "O(n)", description: "Linear — array scan, linear search" },
          { command: "O(n log n)", description: "Linearithmic — merge sort, heap sort" },
          { command: "O(n²)", description: "Quadratic — bubble sort, nested loops" },
          { command: "O(2ⁿ)", description: "Exponential — recursive Fibonacci, brute-force subsets" },
        ],
      },
      {
        title: "Bit Manipulation",
        entries: [
          { command: "x & (x-1)", description: "Clear the lowest set bit of x" },
          { command: "x & (-x)", description: "Isolate the lowest set bit of x" },
          { command: "x ^ x", description: "Always zero — useful for finding duplicates" },
          { command: "n >> 1", description: "Fast integer division by 2" },
        ],
      },
    ],
  },
  {
    domainSlug: "operating-systems",
    sections: [
      {
        title: "Essential Linux Commands",
        entries: [
          { command: "ps aux", description: "List all processes with CPU and memory usage" },
          { command: "kill -9 PID", description: "Force kill a process via SIGKILL" },
          { command: "ss -tlnp", description: "Show TCP listening ports and bound processes" },
          { command: "chmod 755 file", description: "Set permissions rwxr-xr-x" },
          { command: "find / -name '*.log' -mtime -7", description: "Find .log files modified within 7 days" },
          { command: "journalctl -u nginx -f", description: "Follow live logs for a systemd service" },
          { command: "systemctl enable nginx", description: "Start service automatically on boot" },
          { command: "rsync -avz --delete src/ dst/", description: "Mirror directory, deleting extra files at dst" },
        ],
      },
    ],
  },
  {
    domainSlug: "terminal-and-tools",
    sections: [
      {
        title: "Core Git Commands",
        entries: [
          { command: "git log --oneline --graph --all", description: "Visualize full branch history as a graph" },
          { command: "git add -p", description: "Interactively stage individual hunks" },
          { command: "git rebase -i HEAD~3", description: "Interactive rebase last 3 commits" },
          { command: "git stash push -m 'WIP'", description: "Save changes to a named stash entry" },
          { command: "git bisect run test.py", description: "Binary-search commits to find a bug" },
          { command: "git push --force-with-lease", description: "Safe force push — fails if remote changed" },
          { command: "git cherry-pick abc1234", description: "Apply a specific commit onto current branch" },
        ],
      },
    ],
  },
  {
    domainSlug: "networking",
    sections: [
      {
        title: "Network Diagnostics",
        entries: [
          { command: "ss -tlnp", description: "Show TCP listening sockets with processes" },
          { command: "tcpdump -i eth0 port 80", description: "Capture live HTTP traffic on eth0" },
          { command: "dig @1.1.1.1 google.com", description: "Query DNS resolver for A record" },
          { command: "mtr google.com", description: "Live traceroute with per-hop latency" },
          { command: "nmap -sV host", description: "Scan host and detect service versions" },
          { command: "curl -w '\\nTime: %{time_total}s\\n' URL", description: "Fetch URL and display total request time" },
          { command: "ip route show", description: "Display kernel routing table" },
          { command: "iperf3 -c server -P 4", description: "TCP bandwidth test with 4 parallel streams" },
        ],
      },
    ],
  },
  {
    domainSlug: "databases",
    sections: [
      {
        title: "Core SQL",
        entries: [
          { command: "EXPLAIN (ANALYZE, BUFFERS) SELECT ...", description: "Actual execution plan with timing and buffer stats" },
          { command: "INSERT ... ON CONFLICT DO UPDATE", description: "Upsert — insert or update on conflict" },
          { command: "SELECT ... FOR UPDATE SKIP LOCKED", description: "Lock rows, skip already-locked rows" },
          { command: "ROW_NUMBER() OVER (PARTITION BY ...)", description: "Assign sequential row numbers per partition" },
          { command: "WITH RECURSIVE cte AS (...)", description: "Traverse hierarchical data recursively" },
          { command: "CREATE INDEX ... WHERE condition", description: "Partial index covering only matching rows" },
          { command: "LAG(col) OVER (ORDER BY ...)", description: "Access previous row's value in window" },
        ],
      },
    ],
  },
  {
    domainSlug: "cloud-devops",
    sections: [
      {
        title: "Docker CLI",
        entries: [
          { command: "docker build -t myapp:1.0 .", description: "Build image from Dockerfile and tag it" },
          { command: "docker run -d -p 8080:80 nginx", description: "Run detached, map host:8080 to container:80" },
          { command: "docker exec -it container bash", description: "Open interactive shell in running container" },
          { command: "docker logs -f --tail 100 name", description: "Follow container logs from last 100 lines" },
          { command: "docker compose up --build -d", description: "Build and start all Compose services detached" },
          { command: "docker image prune -a", description: "Remove all unused images to free space" },
          { command: "docker stats --no-stream", description: "Snapshot of CPU/memory/IO for all containers" },
        ],
      },
    ],
  },
  {
    domainSlug: "systems-programming",
    sections: [
      {
        title: "C/C++ Quick Reference",
        entries: [
          { command: "sizeof(type)", description: "Size in bytes of a type at compile time" },
          { command: "volatile int *p", description: "Prevent compiler from optimizing away reads/writes to *p" },
          { command: "memcpy(dst, src, n)", description: "Copy n bytes — regions must not overlap" },
          { command: "memmove(dst, src, n)", description: "Copy n bytes — safe for overlapping regions" },
          { command: "valgrind --leak-check=full ./a.out", description: "Detect memory leaks and invalid accesses" },
          { command: "gcc -fsanitize=address", description: "Compile with AddressSanitizer for runtime memory checks" },
        ],
      },
      {
        title: "Rust Essentials",
        entries: [
          { command: "let mut x = 5;", description: "Mutable variable binding" },
          { command: "&T / &mut T", description: "Shared (immutable) / exclusive (mutable) reference" },
          { command: "Box<T>", description: "Heap-allocated value with single ownership" },
          { command: "Rc<T> / Arc<T>", description: "Reference counted — single-thread / thread-safe" },
          { command: "Option<T>::unwrap_or(default)", description: "Extract value or use fallback, no panic" },
          { command: "cargo clippy", description: "Run the linter for idiomatic Rust suggestions" },
          { command: ".iter().map().collect()", description: "Functional iterator chain — lazy until collected" },
        ],
      },
    ],
  },
  {
    domainSlug: "web-development",
    sections: [
      {
        title: "HTTP Status Codes",
        entries: [
          { command: "200 OK", description: "Request succeeded" },
          { command: "201 Created", description: "Resource created, check Location header" },
          { command: "301 Moved Permanently", description: "Permanent redirect — clients should update bookmarks" },
          { command: "304 Not Modified", description: "Cached version is still valid, no body returned" },
          { command: "400 Bad Request", description: "Malformed syntax, invalid parameters" },
          { command: "401 Unauthorized", description: "Authentication required or credentials invalid" },
          { command: "403 Forbidden", description: "Authenticated but not authorized for this resource" },
          { command: "404 Not Found", description: "Resource does not exist at this URL" },
          { command: "429 Too Many Requests", description: "Rate limit exceeded, check Retry-After header" },
          { command: "500 Internal Server Error", description: "Unhandled server-side exception" },
        ],
      },
      {
        title: "CSS Layout",
        entries: [
          { command: "display: flex", description: "One-dimensional layout — row or column" },
          { command: "display: grid", description: "Two-dimensional layout — rows and columns" },
          { command: "gap: 1rem", description: "Spacing between flex/grid children (replaces margin hacks)" },
          { command: "place-items: center", description: "Center grid items both horizontally and vertically" },
          { command: "grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))", description: "Responsive grid without media queries" },
          { command: "position: sticky; top: 0", description: "Stick element when scrolled past its position" },
        ],
      },
    ],
  },
  {
    domainSlug: "software-engineering",
    sections: [
      {
        title: "SOLID Principles",
        entries: [
          { command: "S — Single Responsibility", description: "A class should have only one reason to change" },
          { command: "O — Open/Closed", description: "Open for extension, closed for modification" },
          { command: "L — Liskov Substitution", description: "Subtypes must be substitutable for their base types" },
          { command: "I — Interface Segregation", description: "Many specific interfaces over one general-purpose interface" },
          { command: "D — Dependency Inversion", description: "Depend on abstractions, not concretions" },
        ],
      },
      {
        title: "Design Patterns",
        entries: [
          { command: "Strategy", description: "Swap algorithms at runtime via interchangeable interface" },
          { command: "Observer", description: "Notify dependents automatically when state changes" },
          { command: "Factory Method", description: "Delegate object creation to subclasses" },
          { command: "Adapter", description: "Convert interface of a class into one a client expects" },
          { command: "Decorator", description: "Add behavior dynamically by wrapping objects" },
          { command: "Repository", description: "Abstract data access behind a collection-like interface" },
        ],
      },
      {
        title: "Testing",
        entries: [
          { command: "Unit test", description: "Test a single function/class in isolation with mocked deps" },
          { command: "Integration test", description: "Test multiple modules working together" },
          { command: "AAA pattern", description: "Arrange → Act → Assert — structure every test this way" },
          { command: "Test doubles", description: "Stubs return canned data, mocks verify interactions" },
          { command: "Coverage ≠ Quality", description: "100% coverage with bad assertions catches nothing" },
        ],
      },
    ],
  },
  {
    domainSlug: "cybersecurity",
    sections: [
      {
        title: "Common Ports",
        entries: [
          { command: "22 — SSH", description: "Secure shell, remote administration" },
          { command: "53 — DNS", description: "Domain name resolution (UDP/TCP)" },
          { command: "80 / 443 — HTTP/S", description: "Web traffic, plaintext / TLS-encrypted" },
          { command: "3306 — MySQL", description: "MySQL/MariaDB database connections" },
          { command: "5432 — PostgreSQL", description: "PostgreSQL database connections" },
          { command: "6379 — Redis", description: "Redis in-memory data store" },
          { command: "8080 / 8443", description: "Common alternate HTTP/HTTPS ports" },
        ],
      },
      {
        title: "Nmap Commands",
        entries: [
          { command: "nmap -sV host", description: "Detect service versions on open ports" },
          { command: "nmap -sS -T4 host", description: "SYN stealth scan, aggressive timing" },
          { command: "nmap -O host", description: "OS detection via TCP/IP fingerprinting" },
          { command: "nmap -p- host", description: "Scan all 65535 ports" },
          { command: "nmap --script vuln host", description: "Run vulnerability detection scripts" },
          { command: "nmap -sU -p 53,161 host", description: "UDP scan on specific ports" },
        ],
      },
      {
        title: "Crypto Primitives",
        entries: [
          { command: "AES-256-GCM", description: "Symmetric encryption — authenticated, fast, standard" },
          { command: "SHA-256", description: "Cryptographic hash — 256-bit digest, collision-resistant" },
          { command: "bcrypt / argon2", description: "Password hashing — intentionally slow, salted" },
          { command: "RSA-2048", description: "Asymmetric encryption — key exchange, digital signatures" },
          { command: "Ed25519", description: "Fast elliptic curve signatures — SSH keys, TLS" },
          { command: "HMAC-SHA256", description: "Message authentication code — verify integrity + sender" },
        ],
      },
    ],
  },
  {
    domainSlug: "ai-ml",
    sections: [
      {
        title: "NumPy / Pandas",
        entries: [
          { command: "np.array([1,2,3])", description: "Create a 1D array" },
          { command: "arr.reshape(3, -1)", description: "Reshape array — -1 infers remaining dimension" },
          { command: "np.dot(A, B)", description: "Matrix multiplication (or A @ B)" },
          { command: "df.groupby('col').agg({'val': 'mean'})", description: "Group by column, aggregate with mean" },
          { command: "df.merge(other, on='key', how='left')", description: "SQL-style left join on key column" },
          { command: "df.isna().sum()", description: "Count missing values per column" },
        ],
      },
      {
        title: "Model Metrics",
        entries: [
          { command: "Accuracy", description: "Correct predictions / total — misleading on imbalanced data" },
          { command: "Precision", description: "TP / (TP + FP) — 'of those predicted positive, how many are?'" },
          { command: "Recall", description: "TP / (TP + FN) — 'of actual positives, how many were found?'" },
          { command: "F1 Score", description: "Harmonic mean of precision and recall" },
          { command: "AUC-ROC", description: "Area under the ROC curve — threshold-independent" },
          { command: "Cross-entropy loss", description: "Standard loss for classification — penalizes confident wrong predictions" },
        ],
      },
    ],
  },
  {
    domainSlug: "mobile-dev",
    sections: [
      {
        title: "React Native CLI",
        entries: [
          { command: "npx react-native init MyApp", description: "Create a new React Native project" },
          { command: "npx react-native start", description: "Start Metro bundler" },
          { command: "npx react-native run-ios", description: "Build and run on iOS simulator" },
          { command: "npx react-native run-android", description: "Build and run on Android emulator" },
          { command: "npx react-native log-android", description: "Stream Android device logs" },
          { command: "npx react-native link", description: "Link native dependencies (pre-autolinking)" },
        ],
      },
      {
        title: "Flutter Commands",
        entries: [
          { command: "flutter create myapp", description: "Create a new Flutter project" },
          { command: "flutter run", description: "Build and run on connected device" },
          { command: "flutter pub get", description: "Install dependencies from pubspec.yaml" },
          { command: "flutter doctor", description: "Check environment setup and dependencies" },
          { command: "flutter build apk --release", description: "Build a release APK for Android" },
          { command: "flutter test", description: "Run unit and widget tests" },
        ],
      },
    ],
  },
  {
    domainSlug: "languages",
    sections: [
      {
        title: "Python Builtins",
        entries: [
          { command: "enumerate(iterable)", description: "Yields (index, item) pairs" },
          { command: "zip(a, b)", description: "Pair elements from two iterables" },
          { command: "any() / all()", description: "Short-circuit boolean check across iterable" },
          { command: "[x for x in lst if x > 0]", description: "List comprehension with filter" },
          { command: "dict.get(key, default)", description: "Safe dict access without KeyError" },
          { command: "collections.defaultdict(list)", description: "Dict that auto-creates missing keys" },
          { command: "functools.lru_cache", description: "Memoize function results with LRU eviction" },
        ],
      },
      {
        title: "TypeScript Utility Types",
        entries: [
          { command: "Partial<T>", description: "Make all properties optional" },
          { command: "Required<T>", description: "Make all properties required" },
          { command: "Pick<T, K>", description: "Select a subset of properties" },
          { command: "Omit<T, K>", description: "Remove specific properties" },
          { command: "Record<K, V>", description: "Object type with keys K and values V" },
          { command: "ReturnType<F>", description: "Extract return type of a function type" },
          { command: "Awaited<T>", description: "Unwrap Promise type to its resolved value" },
        ],
      },
    ],
  },
  {
    domainSlug: "hacker-mindset",
    sections: [
      {
        title: "CTF Tools",
        entries: [
          { command: "binwalk file", description: "Scan for embedded files and data within a binary" },
          { command: "strings binary | grep flag", description: "Extract printable strings, search for flag" },
          { command: "file mystery.dat", description: "Identify file type from magic bytes" },
          { command: "xxd binary | head", description: "Hex dump to inspect raw bytes" },
          { command: "hashcat -m 0 hash.txt wordlist.txt", description: "Crack MD5 hashes with a wordlist" },
          { command: "base64 -d encoded.txt", description: "Decode base64-encoded data" },
        ],
      },
      {
        title: "GDB Commands",
        entries: [
          { command: "break main", description: "Set breakpoint at main()" },
          { command: "run [args]", description: "Start program with optional arguments" },
          { command: "next / step", description: "Step over / step into function calls" },
          { command: "info registers", description: "Display CPU register contents" },
          { command: "x/20x $rsp", description: "Examine 20 hex words starting at stack pointer" },
          { command: "disassemble main", description: "Show assembly for main()" },
          { command: "set disassembly-flavor intel", description: "Use Intel syntax instead of AT&T" },
        ],
      },
    ],
  },
];

export function getCheatsheet(domainSlug: string): Cheatsheet | undefined {
  return cheatsheets.find((c) => c.domainSlug === domainSlug);
}

export function getAllCheatsheets(): Cheatsheet[] {
  return cheatsheets;
}
