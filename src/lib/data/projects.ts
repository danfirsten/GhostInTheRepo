import type { Project } from "@/types/content";

const projects: Project[] = [
  // ── Fundamentals ──────────────────────────────
  {
    id: "sorting-visualizer",
    title: "Sorting Algorithm Visualizer",
    description:
      "Build an interactive web app that visualizes sorting algorithms (bubble, merge, quick, heap) step by step with animated bar charts.",
    difficulty: "beginner",
    estimatedHours: 8,
    domainSlug: "fundamentals",
    topicSlug: "data-structures-algorithms",
    prerequisites: [
      {
        topicSlug: "data-structures-algorithms",
        domainSlug: "fundamentals",
        title: "Data Structures & Algorithms",
      },
    ],
    skills: [
      "Algorithm analysis",
      "Big-O reasoning",
      "DOM manipulation",
      "Async control flow",
    ],
    tags: ["algorithms", "visualization", "frontend"],
    llmPrompt: `You are a computer science professor. Generate a complete project document for a "Sorting Algorithm Visualizer" assignment.

Requirements:
- Title, course context (Data Structures & Algorithms)
- Project overview (2-3 paragraphs)
- Learning objectives (5-7 bullet points)
- Functional requirements: implement at least 4 sorting algorithms (bubble sort, merge sort, quicksort, heapsort), animated visualization with adjustable speed, array size slider (10-200 elements), step counter and comparison counter, color-coded states (unsorted, comparing, swapped, sorted)
- Technical requirements: vanilla JS/TS or React, no sorting libraries allowed, responsive layout
- Deliverables: source code, README with build instructions, 1-page written reflection comparing algorithm performance
- Success criteria / grading rubric (4 tiers: basic pass, good, excellent, exceptional)
- Stretch goals: add radix sort, sound effects tied to element height, time complexity graph overlay
- Hints section (3-5 hints without giving away the solution)
- Estimated time: 8-12 hours`,
  },
  {
    id: "custom-hashmap",
    title: "Build Your Own HashMap",
    description:
      "Implement a hash map from scratch with chaining, dynamic resizing, and iterator support. Write benchmarks comparing your implementation to the standard library.",
    difficulty: "intermediate",
    estimatedHours: 10,
    domainSlug: "fundamentals",
    topicSlug: "data-structures-algorithms",
    prerequisites: [
      {
        topicSlug: "data-structures-algorithms",
        domainSlug: "fundamentals",
        title: "Data Structures & Algorithms",
      },
    ],
    skills: [
      "Hash functions",
      "Collision resolution",
      "Amortized analysis",
      "Memory layout",
      "Benchmarking",
    ],
    tags: ["data-structures", "low-level", "performance"],
    llmPrompt: `You are a computer science professor. Generate a complete project document for a "Build Your Own HashMap" assignment.

Requirements:
- Title, course context (Data Structures & Algorithms)
- Project overview explaining why understanding hash maps matters
- Learning objectives (5-7 bullet points covering hashing, collision resolution, amortized complexity, resizing)
- Functional requirements: generic key-value storage, separate chaining for collisions, automatic resizing at 75% load factor, support get/set/delete/has/keys/values/entries, iterator protocol support
- Technical requirements: language of choice (Python, TypeScript, Rust, or C recommended), no use of built-in hash map/dict, must implement own hash function for strings and integers
- Testing requirements: unit tests for all operations, edge cases (empty map, single element, collisions, resize trigger), benchmark suite comparing to stdlib
- Deliverables: source code, test suite, benchmark results with analysis (table + graph), 1-page write-up on design decisions
- Success criteria / grading rubric
- Stretch goals: open addressing variant, Robin Hood hashing, concurrent-safe version
- Hints section
- Estimated time: 10-15 hours`,
  },

  // ── Operating Systems ─────────────────────────
  {
    id: "mini-shell",
    title: "Mini Shell",
    description:
      "Write a Unix shell from scratch that supports command execution, piping, I/O redirection, background processes, and built-in commands like cd and history.",
    difficulty: "intermediate",
    estimatedHours: 15,
    domainSlug: "operating-systems",
    topicSlug: "os-concepts",
    prerequisites: [
      {
        topicSlug: "os-concepts",
        domainSlug: "operating-systems",
        title: "OS Concepts",
      },
      {
        topicSlug: "process-management",
        domainSlug: "operating-systems",
        title: "Process Management",
      },
    ],
    skills: [
      "Process creation (fork/exec)",
      "File descriptors",
      "Signal handling",
      "Pipe syscalls",
      "Tokenization / parsing",
    ],
    tags: ["systems", "C", "unix", "processes"],
    llmPrompt: `You are a systems programming professor. Generate a complete project document for a "Mini Shell" assignment.

Requirements:
- Title, course context (Operating Systems)
- Project overview: why building a shell teaches you OS fundamentals
- Learning objectives covering fork/exec, waitpid, file descriptors, signal handling, environment variables
- Functional requirements: interactive prompt with username and cwd, command execution via fork+exec, pipe chains (cmd1 | cmd2 | cmd3), I/O redirection (>, <, >>), background execution (&) with job tracking, built-in commands (cd, pwd, exit, history, jobs), Ctrl+C handling (kill foreground, don't exit shell), quoted strings and escape characters
- Technical requirements: C or Rust, no use of system() or popen(), must use fork/exec/pipe/dup2 directly
- Testing: test script with 20+ test cases covering all features, edge cases (empty input, nonexistent commands, nested pipes)
- Deliverables: source code, Makefile, test suite, architecture diagram, design document
- Success criteria / grading rubric
- Stretch goals: tab completion, wildcard globbing, command aliases, .shellrc config file
- Hints section (mention tokenizer-first approach, how to handle pipe chains recursively)
- Estimated time: 15-20 hours`,
  },
  {
    id: "memory-allocator",
    title: "Custom Memory Allocator",
    description:
      "Implement malloc, free, and realloc using sbrk/mmap. Compare first-fit, best-fit, and buddy system strategies with fragmentation benchmarks.",
    difficulty: "advanced",
    estimatedHours: 20,
    domainSlug: "operating-systems",
    topicSlug: "memory-management",
    prerequisites: [
      {
        topicSlug: "memory-management",
        domainSlug: "operating-systems",
        title: "Memory Management",
      },
      {
        topicSlug: "os-concepts",
        domainSlug: "operating-systems",
        title: "OS Concepts",
      },
    ],
    skills: [
      "Virtual memory",
      "Page alignment",
      "Fragmentation analysis",
      "sbrk / mmap syscalls",
      "Pointer arithmetic",
    ],
    tags: ["systems", "C", "memory", "low-level"],
    llmPrompt: `You are a systems programming professor. Generate a complete project document for a "Custom Memory Allocator" assignment.

Requirements:
- Title, course context (Operating Systems / Systems Programming)
- Project overview on why memory allocation matters
- Learning objectives: virtual memory, heap management, fragmentation, alignment, metadata headers
- Functional requirements: implement my_malloc(), my_free(), my_realloc(), my_calloc() using sbrk or mmap, block splitting and coalescing, at least two allocation strategies (first-fit and best-fit or buddy system), 16-byte alignment, thread safety with mutex (stretch)
- Technical requirements: C only, no use of standard malloc/free, must work on Linux x86_64
- Testing: stress test with random alloc/free patterns, fragmentation measurement, comparison benchmark against glibc malloc
- Deliverables: source code, benchmark suite, analysis report with graphs (throughput, fragmentation, memory overhead), architecture diagram showing block headers and free list
- Success criteria / grading rubric
- Stretch goals: thread-local caches (arena per thread), memory pool allocator, valgrind-clean under stress
- Hints section
- Estimated time: 20-30 hours`,
  },

  // ── Terminal & Tools ──────────────────────────
  {
    id: "dotfiles-manager",
    title: "Dotfiles Manager",
    description:
      "Build a CLI tool that manages your dotfiles with symlinks, backup/restore, profiles for different machines, and a bootstrap script for fresh installs.",
    difficulty: "beginner",
    estimatedHours: 6,
    domainSlug: "terminal-and-tools",
    topicSlug: "shell-scripting",
    prerequisites: [
      {
        topicSlug: "shell-scripting",
        domainSlug: "terminal-and-tools",
        title: "Shell Scripting",
      },
      {
        topicSlug: "git-mastery",
        domainSlug: "terminal-and-tools",
        title: "Git Mastery",
      },
    ],
    skills: [
      "Shell scripting",
      "Symlink management",
      "Git automation",
      "XDG base directories",
      "Cross-platform scripting",
    ],
    tags: ["cli", "shell", "git", "automation"],
    llmPrompt: `You are a DevOps instructor. Generate a complete project document for a "Dotfiles Manager" assignment.

Requirements:
- Title, course context (Terminal & Tools / DevOps)
- Project overview: why managing dotfiles matters for developer productivity
- Learning objectives: symlinks, shell scripting, git workflows, XDG conventions, idempotent scripts
- Functional requirements: CLI with subcommands (init, link, unlink, backup, restore, status), symlink creation from repo to home directory, automatic backup of existing files before linking, machine profiles (work vs personal) with conditional config, bootstrap script that installs dependencies and links everything, dry-run mode
- Technical requirements: Bash or POSIX sh (no external dependencies beyond coreutils + git), must work on macOS and Linux
- Deliverables: the CLI tool, example dotfiles repo structure, README with usage guide, bootstrap.sh one-liner
- Success criteria / grading rubric
- Stretch goals: encrypted secrets management, automatic theme switching, integration tests in Docker
- Hints section
- Estimated time: 6-10 hours`,
  },

  // ── Networking ────────────────────────────────
  {
    id: "http-server",
    title: "HTTP Server from Scratch",
    description:
      "Build an HTTP/1.1 server that handles GET/POST, serves static files, supports routing, and implements keep-alive connections — using only raw sockets.",
    difficulty: "intermediate",
    estimatedHours: 15,
    domainSlug: "networking",
    topicSlug: "network-programming",
    prerequisites: [
      {
        topicSlug: "networking-fundamentals",
        domainSlug: "networking",
        title: "Networking Fundamentals",
      },
      {
        topicSlug: "protocols",
        domainSlug: "networking",
        title: "Protocols",
      },
      {
        topicSlug: "network-programming",
        domainSlug: "networking",
        title: "Network Programming",
      },
    ],
    skills: [
      "TCP sockets",
      "HTTP parsing",
      "Concurrent connections",
      "MIME types",
      "Keep-alive",
    ],
    tags: ["networking", "protocols", "sockets", "server"],
    llmPrompt: `You are a networking professor. Generate a complete project document for an "HTTP Server from Scratch" assignment.

Requirements:
- Title, course context (Computer Networking)
- Project overview: understanding HTTP by implementing it
- Learning objectives: TCP socket programming, HTTP/1.1 spec, request parsing, response formatting, concurrency models
- Functional requirements: listen on configurable port, parse HTTP/1.1 requests (method, path, headers, body), support GET and POST methods, static file serving with correct MIME types, configurable document root, route handler registration, proper status codes (200, 301, 400, 404, 405, 500), Content-Length and Connection headers, keep-alive support, concurrent connections (threads or async)
- Technical requirements: Python, Go, Rust, or C — no HTTP framework libraries allowed, raw socket API only
- Testing: curl-based test suite, load testing with wrk or ab, comparison with nginx for same static content
- Deliverables: source code, test suite, load test results, 1-page architecture document
- Success criteria / grading rubric
- Stretch goals: chunked transfer encoding, gzip compression, HTTPS via TLS, HTTP/2 basics
- Hints section
- Estimated time: 15-20 hours`,
  },
  {
    id: "packet-sniffer",
    title: "Network Packet Analyzer",
    description:
      "Build a command-line packet sniffer that captures and decodes Ethernet, IP, TCP/UDP headers, with filtering by protocol, port, and host.",
    difficulty: "advanced",
    estimatedHours: 12,
    domainSlug: "networking",
    topicSlug: "networking-fundamentals",
    prerequisites: [
      {
        topicSlug: "networking-fundamentals",
        domainSlug: "networking",
        title: "Networking Fundamentals",
      },
      {
        topicSlug: "protocols",
        domainSlug: "networking",
        title: "Protocols",
      },
    ],
    skills: [
      "Raw sockets",
      "Protocol headers",
      "Byte-level parsing",
      "BPF filters",
      "Network analysis",
    ],
    tags: ["networking", "security", "packets", "analysis"],
    llmPrompt: `You are a networking/security professor. Generate a complete project document for a "Network Packet Analyzer" assignment.

Requirements:
- Title, course context (Computer Networking / Security)
- Project overview: learning protocols by dissecting real traffic
- Learning objectives: OSI layers, Ethernet frames, IP/TCP/UDP headers, packet capture APIs, binary parsing
- Functional requirements: capture live packets on a network interface, decode Ethernet, IPv4, TCP, UDP, ICMP headers, display formatted output (source/dest IP, ports, flags, payload preview), filter by protocol, port, and host, packet count and byte statistics, save captures to pcap format
- Technical requirements: Python with scapy or C with libpcap — must parse headers manually (not just print scapy's default output), must handle the raw bytes
- Ethical requirements: only capture on own machine/lab network, include disclaimer
- Testing: capture known traffic patterns (HTTP request, DNS lookup, ping), verify parsed fields match Wireshark
- Deliverables: source code, sample capture output, comparison with Wireshark screenshots, analysis report
- Success criteria / grading rubric
- Stretch goals: DNS query/response decoding, HTTP header extraction, live ASCII art traffic graph, ARP table builder
- Hints section
- Estimated time: 12-18 hours`,
  },

  // ── Systems Programming ───────────────────────
  {
    id: "key-value-store",
    title: "Persistent Key-Value Store",
    description:
      "Build a log-structured key-value database with a write-ahead log, in-memory index, compaction, and a simple TCP protocol for get/set/delete operations.",
    difficulty: "advanced",
    estimatedHours: 20,
    domainSlug: "systems-programming",
    topicSlug: "rust",
    prerequisites: [
      {
        topicSlug: "rust",
        domainSlug: "systems-programming",
        title: "Rust",
      },
      {
        topicSlug: "low-level-systems",
        domainSlug: "systems-programming",
        title: "Low-Level Systems",
      },
    ],
    skills: [
      "File I/O and fsync",
      "Log-structured storage",
      "Serialization",
      "Compaction",
      "TCP server",
    ],
    tags: ["databases", "rust", "storage", "systems"],
    llmPrompt: `You are a systems programming professor. Generate a complete project document for a "Persistent Key-Value Store" assignment.

Requirements:
- Title, course context (Systems Programming)
- Project overview: understanding database internals by building one
- Learning objectives: log-structured merge trees, write-ahead logs, crash recovery, file I/O, serialization formats, TCP server design
- Functional requirements: SET key value, GET key, DELETE key via TCP text protocol, write-ahead log with crash recovery, in-memory hash index pointing to log file offsets, log compaction (merge and remove stale entries), support keys up to 256 bytes and values up to 64KB, concurrent read access
- Technical requirements: Rust recommended (C++ acceptable), no embedded database libraries, raw file I/O
- Testing: unit tests, crash recovery test (kill -9 during writes, verify data integrity), benchmark (throughput for sequential and random writes)
- Deliverables: source code, benchmark results, architecture diagram, design document explaining trade-offs
- Success criteria / grading rubric
- Stretch goals: SSTable-based LSM tree, bloom filters, range queries, replication to a second node
- Hints section
- Estimated time: 20-30 hours`,
  },

  // ── Databases ─────────────────────────────────
  {
    id: "sql-query-engine",
    title: "Mini SQL Query Engine",
    description:
      "Build a SQL query engine that parses SELECT statements, executes them against CSV files, and supports WHERE, ORDER BY, JOIN, and GROUP BY clauses.",
    difficulty: "intermediate",
    estimatedHours: 15,
    domainSlug: "databases",
    topicSlug: "sql-relational",
    prerequisites: [
      {
        topicSlug: "sql-relational",
        domainSlug: "databases",
        title: "SQL & Relational Databases",
      },
    ],
    skills: [
      "SQL parsing",
      "Query planning",
      "Relational algebra",
      "File-based storage",
      "Iterator model",
    ],
    tags: ["databases", "sql", "parsing", "query-engine"],
    llmPrompt: `You are a database systems professor. Generate a complete project document for a "Mini SQL Query Engine" assignment.

Requirements:
- Title, course context (Database Systems)
- Project overview: understanding query processing by building an engine
- Learning objectives: SQL syntax, relational algebra, query parsing, iterator model, join algorithms
- Functional requirements: parse and execute SELECT statements, data stored as CSV files (one file per table), support: SELECT columns, WHERE with =, !=, <, >, AND, OR, ORDER BY (ASC/DESC), GROUP BY with COUNT, SUM, AVG, INNER JOIN on equality conditions, LIMIT, column aliases
- Technical requirements: Python, TypeScript, or Go — no SQL libraries, must parse SQL and execute it yourself
- Testing: provide 3 sample CSV datasets, 20+ test queries with expected output, edge cases (empty tables, NULL-like values, self-joins)
- Deliverables: source code, test suite, sample datasets, query plan visualizer (text-based), performance analysis for different join sizes
- Success criteria / grading rubric
- Stretch goals: query optimizer (push down predicates), hash join, CREATE TABLE / INSERT support, B-tree index
- Hints section
- Estimated time: 15-20 hours`,
  },

  // ── Web Development ───────────────────────────
  {
    id: "markdown-blog",
    title: "Static Site Generator",
    description:
      "Build a static site generator that converts Markdown files into a themed HTML blog with pagination, tags, RSS feed, and syntax-highlighted code blocks.",
    difficulty: "beginner",
    estimatedHours: 10,
    domainSlug: "web-development",
    topicSlug: "frontend",
    prerequisites: [
      {
        topicSlug: "frontend",
        domainSlug: "web-development",
        title: "Frontend Development",
      },
    ],
    skills: [
      "Markdown parsing",
      "HTML templating",
      "CSS layout",
      "File system traversal",
      "RSS/XML generation",
    ],
    tags: ["web", "frontend", "static-site", "markdown"],
    llmPrompt: `You are a web development instructor. Generate a complete project document for a "Static Site Generator" assignment.

Requirements:
- Title, course context (Web Development)
- Project overview: understanding how static sites work under the hood
- Learning objectives: Markdown to HTML conversion, templating, CSS architecture, content pipelines, RSS spec
- Functional requirements: read Markdown files with YAML frontmatter (title, date, tags, draft), convert to HTML with a base template, index page with paginated post list, tag pages, individual post pages, syntax-highlighted code blocks, RSS feed (valid XML), development server with live reload, build command that outputs to dist/
- Technical requirements: Node.js — may use a Markdown library (marked/remark) but must build the SSG framework, templating, routing, and pagination yourself
- Deliverables: source code, example blog with 5+ posts, deployed to GitHub Pages or Netlify, README with usage guide
- Success criteria / grading rubric
- Stretch goals: dark/light theme toggle, search (client-side), image optimization, draft mode
- Hints section
- Estimated time: 10-15 hours`,
  },
  {
    id: "realtime-chat",
    title: "Real-Time Chat Application",
    description:
      "Build a full-stack chat app with WebSocket-based real-time messaging, rooms, typing indicators, message history, and user presence.",
    difficulty: "intermediate",
    estimatedHours: 15,
    domainSlug: "web-development",
    topicSlug: "backend",
    prerequisites: [
      {
        topicSlug: "frontend",
        domainSlug: "web-development",
        title: "Frontend Development",
      },
      {
        topicSlug: "backend",
        domainSlug: "web-development",
        title: "Backend Development",
      },
      {
        topicSlug: "apis",
        domainSlug: "web-development",
        title: "APIs",
      },
    ],
    skills: [
      "WebSockets",
      "Real-time architecture",
      "State management",
      "Authentication",
      "Database design",
    ],
    tags: ["web", "fullstack", "websockets", "realtime"],
    llmPrompt: `You are a web development instructor. Generate a complete project document for a "Real-Time Chat Application" assignment.

Requirements:
- Title, course context (Full-Stack Web Development)
- Project overview: learning real-time communication patterns
- Learning objectives: WebSocket protocol, event-driven architecture, state synchronization, authentication, database persistence
- Functional requirements: user registration and login, create/join chat rooms, real-time message delivery via WebSockets, typing indicators, online/offline user presence, message history (persisted to database), message timestamps, unread message counts, responsive mobile-friendly UI
- Technical requirements: any frontend framework + Node.js/Go/Python backend, WebSocket library allowed (socket.io, ws), must implement the real-time protocol yourself (no Firebase/Supabase realtime)
- Testing: unit tests for backend, integration test with 2 concurrent clients, load test with 50+ simultaneous connections
- Deliverables: source code (frontend + backend), database schema, deployment instructions, architecture diagram
- Success criteria / grading rubric
- Stretch goals: file/image sharing, message reactions, end-to-end encryption, voice messages
- Hints section
- Estimated time: 15-20 hours`,
  },

  // ── Software Engineering ──────────────────────
  {
    id: "ci-cd-pipeline",
    title: "CI/CD Pipeline from Scratch",
    description:
      "Design and implement a complete CI/CD pipeline for a sample app: linting, testing, building, containerizing, and deploying with rollback support.",
    difficulty: "intermediate",
    estimatedHours: 12,
    domainSlug: "software-engineering",
    topicSlug: "testing",
    prerequisites: [
      {
        topicSlug: "testing",
        domainSlug: "software-engineering",
        title: "Testing",
      },
      {
        topicSlug: "design-patterns",
        domainSlug: "software-engineering",
        title: "Design Patterns",
      },
    ],
    skills: [
      "GitHub Actions / CI config",
      "Docker containerization",
      "Automated testing",
      "Deployment strategies",
      "Infrastructure as code",
    ],
    tags: ["devops", "ci-cd", "docker", "automation"],
    llmPrompt: `You are a software engineering professor. Generate a complete project document for a "CI/CD Pipeline from Scratch" assignment.

Requirements:
- Title, course context (Software Engineering)
- Project overview: why CI/CD is essential for modern software teams
- Learning objectives: continuous integration, continuous deployment, containerization, testing strategies, deployment patterns
- Functional requirements: create a sample web app (any framework), GitHub Actions pipeline with: lint stage, unit test stage, integration test stage, build stage (Docker image), deploy stage (to a cloud provider or local Docker), automatic rollback on failed health check, environment-specific config (staging vs production), status badges in README, Slack/Discord notification on failure
- Technical requirements: GitHub Actions (or GitLab CI), Docker, any cloud provider free tier or local Docker Compose
- Deliverables: sample app, pipeline config files, Dockerfile, docker-compose.yml, deployment docs, post-mortem template for failures
- Success criteria / grading rubric
- Stretch goals: canary deployment, feature flags, performance regression testing, dependency vulnerability scanning
- Hints section
- Estimated time: 12-18 hours`,
  },

  // ── Cloud & DevOps ────────────────────────────
  {
    id: "container-orchestrator",
    title: "Mini Container Orchestrator",
    description:
      "Build a simplified container orchestrator that manages multiple Docker containers with health checks, auto-restart, scaling, and a REST API for control.",
    difficulty: "advanced",
    estimatedHours: 20,
    domainSlug: "cloud-devops",
    prerequisites: [
      {
        topicSlug: "docker-containers",
        domainSlug: "cloud-devops",
        title: "Docker & Containers",
      },
    ],
    skills: [
      "Docker API",
      "Health checking",
      "Process supervision",
      "REST API design",
      "Distributed systems basics",
    ],
    tags: ["devops", "docker", "orchestration", "distributed"],
    llmPrompt: `You are a cloud computing professor. Generate a complete project document for a "Mini Container Orchestrator" assignment.

Requirements:
- Title, course context (Cloud & DevOps)
- Project overview: understanding orchestration by building a simplified version
- Learning objectives: container lifecycle management, health checking, service discovery, scaling, API design
- Functional requirements: deploy containers from image specs (JSON config), health checks (HTTP or TCP), automatic restart on failure (with backoff), horizontal scaling (scale up/down replicas), REST API: deploy, scale, status, logs, destroy, rolling update (one container at a time), simple round-robin load balancing
- Technical requirements: Go or Python, Docker SDK/API, no use of Kubernetes/Docker Swarm
- Testing: deploy a sample web app with 3 replicas, kill one, verify auto-restart, scale to 5, rolling update to new version
- Deliverables: source code, API documentation, demo script, architecture diagram, comparison write-up vs Kubernetes
- Success criteria / grading rubric
- Stretch goals: multi-node support, persistent volumes, secrets management, web dashboard
- Hints section
- Estimated time: 20-25 hours`,
  },

  // ── Cybersecurity ─────────────────────────────
  {
    id: "password-manager",
    title: "Encrypted Password Manager",
    description:
      "Build a CLI password manager with AES-256 encryption, master password derivation via Argon2, clipboard integration, and password strength analysis.",
    difficulty: "intermediate",
    estimatedHours: 12,
    domainSlug: "cybersecurity",
    prerequisites: [
      {
        topicSlug: "cryptography",
        domainSlug: "cybersecurity",
        title: "Cryptography",
      },
    ],
    skills: [
      "Symmetric encryption (AES)",
      "Key derivation (Argon2/PBKDF2)",
      "Secure random generation",
      "Clipboard management",
      "Threat modeling",
    ],
    tags: ["security", "cryptography", "cli", "encryption"],
    llmPrompt: `You are a cybersecurity professor. Generate a complete project document for an "Encrypted Password Manager" assignment.

Requirements:
- Title, course context (Cybersecurity / Applied Cryptography)
- Project overview: practical cryptography through building a security tool
- Learning objectives: symmetric encryption, key derivation functions, salt and IV management, secure memory handling, threat modeling
- Functional requirements: CLI with subcommands (init, add, get, list, remove, generate), master password with Argon2id key derivation, AES-256-GCM encryption for stored passwords, password generator (configurable length, character sets), clipboard copy with auto-clear after 30 seconds, password strength analyzer (entropy calculation), import/export (encrypted), vault locking after inactivity timeout
- Technical requirements: Python or Rust, use established crypto libraries (not roll your own crypto), encrypted file stored as JSON or SQLite
- Security requirements: threat model document, explain what the tool protects against and what it doesn't, clear master password from memory after use
- Deliverables: source code, threat model, security analysis document, user guide
- Success criteria / grading rubric
- Stretch goals: TOTP support, browser extension, vault sync via cloud, breach check (HaveIBeenPwned API)
- Hints section
- Estimated time: 12-16 hours`,
  },
  {
    id: "vuln-scanner",
    title: "Web Vulnerability Scanner",
    description:
      "Build an automated scanner that detects common web vulnerabilities: XSS, SQL injection, open redirects, missing security headers, and directory traversal.",
    difficulty: "advanced",
    estimatedHours: 18,
    domainSlug: "cybersecurity",
    prerequisites: [
      {
        topicSlug: "web-security",
        domainSlug: "cybersecurity",
        title: "Web Security",
      },
      {
        topicSlug: "network-security",
        domainSlug: "cybersecurity",
        title: "Network Security",
      },
    ],
    skills: [
      "OWASP Top 10",
      "HTTP request crafting",
      "Payload fuzzing",
      "HTML parsing",
      "Responsible disclosure",
    ],
    tags: ["security", "web", "scanning", "offensive"],
    llmPrompt: `You are a cybersecurity professor. Generate a complete project document for a "Web Vulnerability Scanner" assignment.

Requirements:
- Title, course context (Cybersecurity / Offensive Security)
- Project overview: understanding web vulnerabilities by building detection tools
- Learning objectives: OWASP Top 10, injection attacks, XSS variants, security headers, automated testing
- Functional requirements: CLI that takes a target URL, crawl target site to discover pages and forms, test for: reflected XSS (script injection in parameters), SQL injection (error-based and time-based), missing security headers (CSP, X-Frame-Options, HSTS, etc.), open redirects, directory traversal, severity-rated report output (HTML or JSON), rate limiting to avoid overwhelming the target, scope restriction (stay within target domain)
- Ethical requirements: ONLY test against deliberately vulnerable apps (DVWA, WebGoat, juice-shop), include prominent disclaimer, require explicit --i-have-permission flag
- Technical requirements: Python, must craft HTTP requests (no Burp Suite/ZAP), may use requests + BeautifulSoup
- Deliverables: source code, sample scan report against DVWA, false positive analysis, ethical guidelines document
- Success criteria / grading rubric
- Stretch goals: CSRF detection, subdomain enumeration, API endpoint fuzzing, CI integration mode
- Hints section
- Estimated time: 18-24 hours`,
  },

  // ── AI & ML ───────────────────────────────────
  {
    id: "neural-network-scratch",
    title: "Neural Network from Scratch",
    description:
      "Implement a feedforward neural network with backpropagation using only NumPy. Train it on MNIST and visualize the learning process.",
    difficulty: "intermediate",
    estimatedHours: 12,
    domainSlug: "ai-ml",
    prerequisites: [
      {
        topicSlug: "ml-fundamentals",
        domainSlug: "ai-ml",
        title: "ML Fundamentals",
      },
    ],
    skills: [
      "Matrix math",
      "Backpropagation",
      "Gradient descent",
      "Activation functions",
      "Loss functions",
    ],
    tags: ["ai", "ml", "neural-networks", "math"],
    llmPrompt: `You are a machine learning professor. Generate a complete project document for a "Neural Network from Scratch" assignment.

Requirements:
- Title, course context (Machine Learning / Deep Learning)
- Project overview: understanding neural networks by implementing the math
- Learning objectives: forward propagation, backpropagation, gradient descent variants, activation functions, loss functions, weight initialization, regularization
- Functional requirements: implement a feedforward neural network class (no PyTorch/TensorFlow), configurable layers (input, hidden, output), activation functions (ReLU, sigmoid, softmax), loss functions (cross-entropy, MSE), SGD and mini-batch gradient descent, training loop with epoch logging (loss and accuracy), train on MNIST to achieve > 95% test accuracy, visualization of: loss curves, sample predictions with confidence, weight matrices as heatmaps
- Technical requirements: Python + NumPy only (no ML frameworks), matplotlib for visualization
- Deliverables: source code (well-documented), Jupyter notebook with training run, accuracy report, 1-page write-up on what you learned about backprop
- Success criteria / grading rubric
- Stretch goals: convolutional layer, learning rate scheduling, dropout, batch normalization, Adam optimizer
- Hints section (mention numerical gradient checking for debugging)
- Estimated time: 12-18 hours`,
  },
  {
    id: "rag-chatbot",
    title: "RAG Chatbot",
    description:
      "Build a retrieval-augmented generation chatbot that indexes a document corpus, retrieves relevant chunks via embeddings, and generates contextual answers using an LLM API.",
    difficulty: "intermediate",
    estimatedHours: 10,
    domainSlug: "ai-ml",
    prerequisites: [
      {
        topicSlug: "nlp-llms",
        domainSlug: "ai-ml",
        title: "NLP & LLMs",
      },
    ],
    skills: [
      "Vector embeddings",
      "Semantic search",
      "Prompt engineering",
      "Document chunking",
      "LLM API integration",
    ],
    tags: ["ai", "llm", "rag", "nlp", "chatbot"],
    llmPrompt: `You are an AI/ML instructor. Generate a complete project document for a "RAG Chatbot" assignment.

Requirements:
- Title, course context (AI & Machine Learning / NLP)
- Project overview: practical LLM application combining retrieval and generation
- Learning objectives: embeddings, vector similarity search, chunking strategies, prompt engineering, RAG architecture, evaluation methods
- Functional requirements: ingest documents (PDF, markdown, or plain text), chunk documents with overlap, generate embeddings (OpenAI or open-source model), store in vector database (FAISS, ChromaDB, or pgvector), user query: retrieve top-k relevant chunks, build context-augmented prompt, call LLM API for answer, show source citations with chunk references, conversation memory (multi-turn), web UI or CLI interface
- Technical requirements: Python, may use LangChain/LlamaIndex or build from scratch, must use a vector store (not brute force), LLM API (OpenAI, Anthropic, or local model)
- Evaluation: prepare 20 test questions with ground truth answers, measure answer relevance (manual or LLM-as-judge), compare RAG vs no-RAG answers
- Deliverables: source code, sample document corpus, evaluation results, architecture diagram, cost analysis (API tokens used)
- Success criteria / grading rubric
- Stretch goals: hybrid search (BM25 + semantic), re-ranking, streaming responses, multi-modal (images), fine-tuned embeddings
- Hints section
- Estimated time: 10-15 hours`,
  },

  // ── App Development ───────────────────────────
  {
    id: "habit-tracker-app",
    title: "Habit Tracker Mobile App",
    description:
      "Build a cross-platform mobile app for tracking daily habits with streak counting, reminders, statistics, and a calendar heat map visualization.",
    difficulty: "beginner",
    estimatedHours: 12,
    domainSlug: "mobile-dev",
    prerequisites: [
      {
        topicSlug: "cross-platform",
        domainSlug: "mobile-dev",
        title: "Cross-Platform Development",
      },
    ],
    skills: [
      "Mobile UI patterns",
      "Local storage",
      "Push notifications",
      "Date/time handling",
      "Data visualization",
    ],
    tags: ["mobile", "app", "react-native", "flutter"],
    llmPrompt: `You are a mobile development instructor. Generate a complete project document for a "Habit Tracker Mobile App" assignment.

Requirements:
- Title, course context (Mobile / App Development)
- Project overview: building a practical daily-use app
- Learning objectives: mobile UI/UX patterns, local persistence, notifications, state management, data visualization on mobile
- Functional requirements: create/edit/delete habits (name, icon, frequency: daily/weekly), daily check-in screen, streak counter per habit, calendar heat map view (GitHub-style), weekly/monthly statistics, push notification reminders (configurable time), themes (light/dark), data export (JSON/CSV)
- Technical requirements: React Native or Flutter, local storage (AsyncStorage/SQLite/Hive), no backend required
- Testing: test on both iOS and Android (or simulators), accessibility check (screen reader, font scaling)
- Deliverables: source code, APK/IPA build, 5 screenshots, app store listing draft (title, description, keywords)
- Success criteria / grading rubric
- Stretch goals: social accountability (share streaks), widgets, Apple Health / Google Fit integration, habit templates
- Hints section
- Estimated time: 12-18 hours`,
  },

  // ── Languages ─────────────────────────────────
  {
    id: "interpreter",
    title: "Programming Language Interpreter",
    description:
      "Design and implement a small programming language with variables, functions, conditionals, loops, and a REPL — from lexer to tree-walk interpreter.",
    difficulty: "advanced",
    estimatedHours: 25,
    domainSlug: "languages",
    prerequisites: [
      {
        topicSlug: "language-concepts",
        domainSlug: "languages",
        title: "Language Concepts",
      },
    ],
    skills: [
      "Lexical analysis",
      "Parsing (recursive descent)",
      "AST construction",
      "Scope and environments",
      "Runtime evaluation",
    ],
    tags: ["languages", "compilers", "interpreters", "parsing"],
    llmPrompt: `You are a programming languages professor. Generate a complete project document for a "Programming Language Interpreter" assignment.

Requirements:
- Title, course context (Programming Languages / Compilers)
- Project overview: understanding how languages work by building one
- Learning objectives: lexical analysis, parsing strategies, AST representation, variable scoping, function closures, runtime environments, error handling
- Functional requirements: design a small language with: integer and string literals, variables (let/var), arithmetic and comparison operators, if/else conditionals, while loops, functions with parameters and return values, print statement, comments, REPL (read-eval-print loop), script file execution, meaningful error messages (line numbers, expected vs got)
- Language spec: provide a formal grammar (BNF or EBNF), at least 10 example programs
- Technical requirements: implement in Python, TypeScript, Go, or Rust — no parser generator libraries (yacc, ANTLR), must write lexer and parser by hand (recursive descent)
- Testing: 30+ test programs covering all features, error case tests, edge cases (nested functions, recursion, string operations)
- Deliverables: source code, language spec document, test suite, 5 example programs, 2-page design document
- Success criteria / grading rubric
- Stretch goals: arrays/lists, closures, standard library (math, string functions), bytecode compiler + VM
- Hints section
- Estimated time: 25-35 hours`,
  },

  // ── Hacker Mindset ────────────────────────────
  {
    id: "ctf-toolkit",
    title: "CTF Toolkit",
    description:
      "Build a collection of CTF utilities: a Caesar/Vigenere cipher cracker, base encoding detector, steganography extractor, and a simple binary exploit template generator.",
    difficulty: "intermediate",
    estimatedHours: 14,
    domainSlug: "hacker-mindset",
    prerequisites: [
      {
        topicSlug: "ctf-challenges",
        domainSlug: "hacker-mindset",
        title: "CTF Challenges",
      },
      {
        topicSlug: "reverse-engineering",
        domainSlug: "hacker-mindset",
        title: "Reverse Engineering",
      },
    ],
    skills: [
      "Classical cryptanalysis",
      "Encoding detection",
      "Binary analysis",
      "Steganography",
      "Automation scripting",
    ],
    tags: ["security", "ctf", "hacking", "tools"],
    llmPrompt: `You are a cybersecurity/CTF instructor. Generate a complete project document for a "CTF Toolkit" assignment.

Requirements:
- Title, course context (Hacker Mindset / CTF Competitions)
- Project overview: building reusable tools for capture-the-flag competitions
- Learning objectives: classical cryptography, encoding schemes, binary formats, steganography basics, tool-building mindset
- Functional requirements: CLI toolkit with subcommands: cipher cracker (Caesar brute force, Vigenere with frequency analysis), encoding detector and converter (base64, base32, hex, ROT13, URL encoding), XOR key finder (known plaintext attack), steganography: LSB extraction from PNG images, binary exploit template generator (generates Python pwntools skeleton for buffer overflow), hash identifier (MD5, SHA-1, SHA-256 by format), string extractor from binary files
- Technical requirements: Python, may use Pillow for image manipulation, pwntools reference only in generated templates
- Testing: provide 10 CTF-style challenges that the toolkit should solve, verify against known flags
- Deliverables: source code, test challenges with solutions, usage guide, write-up of each tool's algorithm
- Success criteria / grading rubric
- Stretch goals: web request fuzzer, JWT decoder, Morse code translator, automated flag submission
- Hints section
- Estimated time: 14-20 hours`,
  },

  // ── Startups ──────────────────────────────────
  {
    id: "startup-financial-dashboard",
    title: "Startup Financial Dashboard",
    description:
      "Build a dashboard that tracks MRR, burn rate, runway, and CAC/LTV metrics with interactive charts and scenario modeling.",
    difficulty: "beginner",
    estimatedHours: 10,
    domainSlug: "startups",
    topicSlug: "business-and-finance",
    prerequisites: [
      {
        topicSlug: "business-and-finance",
        domainSlug: "startups",
        title: "Business & Finance",
      },
    ],
    skills: [
      "Financial modeling",
      "Data visualization",
      "SaaS metrics",
      "React/charting",
    ],
    tags: ["saas", "metrics", "dashboard", "finance"],
    llmPrompt: `You are a startup finance instructor. Generate a complete project document for a "Startup Financial Dashboard" assignment.

Requirements:
- Title, course context (Startups / Business & Finance)
- Project overview: understanding key SaaS and startup financial metrics by building an interactive dashboard
- Learning objectives (5-7 bullet points covering MRR, burn rate, runway, CAC, LTV, unit economics, scenario planning)
- Functional requirements: MRR waterfall chart showing new, expansion, contraction, and churned revenue; burn rate tracker with monthly cash outflow breakdown; runway projection calculator based on current burn and cash balance; CAC/LTV calculator with cohort-based inputs; scenario modeling tool allowing users to adjust growth rate, churn, and hiring plans to see projected runway and revenue; monthly/quarterly toggle for all views; export data as CSV
- Technical requirements: React or Next.js with a charting library (Recharts, Chart.js, or D3), responsive layout, mock data seeding for demo mode
- Deliverables: source code, README with setup instructions, sample dataset, 1-page write-up explaining the metrics and what healthy values look like
- Success criteria / grading rubric (4 tiers: basic pass, good, excellent, exceptional)
- Stretch goals: connect to Stripe API for real MRR data, investor-ready PDF export, benchmark comparison against industry medians, multi-currency support
- Hints section (3-5 hints without giving away the solution)
- Estimated time: 10-15 hours`,
  },
  {
    id: "cap-table-simulator",
    title: "Cap Table Simulator",
    description:
      "Simulate equity dilution across funding rounds — model SAFEs, priced rounds, option pools, and visualize ownership changes over time.",
    difficulty: "intermediate",
    estimatedHours: 12,
    domainSlug: "startups",
    topicSlug: "legal-and-equity",
    prerequisites: [
      {
        topicSlug: "legal-and-equity",
        domainSlug: "startups",
        title: "Legal & Equity",
      },
      {
        topicSlug: "business-and-finance",
        domainSlug: "startups",
        title: "Business & Finance",
      },
    ],
    skills: [
      "Equity math",
      "SAFE conversion",
      "Dilution modeling",
      "Financial visualization",
    ],
    tags: ["equity", "fundraising", "simulation", "finance"],
    llmPrompt: `You are a startup law and finance instructor. Generate a complete project document for a "Cap Table Simulator" assignment.

Requirements:
- Title, course context (Startups / Legal & Equity)
- Project overview: understanding equity mechanics by building a simulator that models real funding scenarios
- Learning objectives (5-7 bullet points covering cap tables, SAFE mechanics, priced round mechanics, dilution, option pools, pro-rata rights, waterfall analysis)
- Functional requirements: model founding equity splits with vesting schedules; SAFE conversion calculator supporting valuation caps, discounts, and MFN provisions; priced round modeler with pre-money valuation, new investment amount, and resulting share prices; option pool creation and expansion with dilution impact; pro-rata rights calculator for existing investors; ownership visualization showing pie charts and stacked area charts across rounds; dilution waterfall table showing each stakeholder's ownership percentage after each event; support for at least 4 rounds (seed SAFE, Series A, option pool expansion, Series B)
- Technical requirements: React or Next.js, visualization library for ownership charts, form-based inputs with real-time recalculation
- Deliverables: source code, sample scenarios (solo founder, 2 co-founders with angel + seed + Series A), architecture document, 1-page explainer on SAFE conversion mechanics
- Success criteria / grading rubric (4 tiers)
- Stretch goals: convertible note support, liquidation preference modeling, 409A valuation estimator, PDF export of cap table snapshots
- Hints section
- Estimated time: 12-18 hours`,
  },
  {
    id: "lean-validation-toolkit",
    title: "Lean Validation Toolkit",
    description:
      "Build a full-stack toolkit that helps founders validate startup ideas — landing page builder, email capture, fake-door testing, and analytics dashboard to measure interest signals.",
    difficulty: "advanced",
    estimatedHours: 20,
    domainSlug: "startups",
    topicSlug: "founding-and-ideation",
    prerequisites: [
      {
        topicSlug: "founding-and-ideation",
        domainSlug: "startups",
        title: "Founding & Ideation",
      },
      {
        topicSlug: "product-and-growth",
        domainSlug: "startups",
        title: "Product & Growth",
      },
    ],
    skills: [
      "Full-stack development",
      "Landing page design",
      "Analytics",
      "A/B testing",
      "Lean methodology",
    ],
    tags: ["validation", "lean-startup", "full-stack", "analytics"],
    llmPrompt: `You are a startup methodology instructor. Generate a complete project document for a "Lean Validation Toolkit" assignment.

Requirements:
- Title, course context (Startups / Founding & Ideation)
- Project overview: applying lean startup principles by building a toolkit that helps founders validate ideas before writing production code
- Learning objectives (5-7 bullet points covering lean validation, landing page testing, fake-door experiments, conversion metrics, signal vs noise in early data, MVP definition, hypothesis-driven development)
- Functional requirements: landing page template builder with drag-and-drop sections (hero, features, pricing, CTA); email capture forms with confirmation and basic drip sequence; fake-door testing — create buttons/links for features that don't exist yet, track clicks as interest signals; A/B testing framework allowing two variants of headline, CTA, or pricing; analytics dashboard showing unique visitors, email signups, fake-door clicks, conversion rates, and traffic sources; experiment timeline view showing when tests started and ended with results; shareable results page for co-founders or advisors
- Technical requirements: full-stack (Next.js or similar), database for analytics events, server-side rendering for landing pages, no third-party analytics (build your own event tracking)
- Deliverables: source code, 3 sample landing pages for different startup ideas, analytics walkthrough, 2-page write-up on lean validation methodology and how the toolkit supports it
- Success criteria / grading rubric (4 tiers)
- Stretch goals: custom domain support, Stripe integration for payment intent validation, social proof widgets (fake testimonials generator for testing), integration with Google Ads for traffic acquisition
- Hints section
- Estimated time: 20-28 hours`,
  },
];

export function getAllProjects(): Project[] {
  return projects;
}

export function getProjectsForDomain(domainSlug: string): Project[] {
  return projects.filter((p) => p.domainSlug === domainSlug);
}

export function getProject(id: string): Project | undefined {
  return projects.find((p) => p.id === id);
}
