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
];

export function getCheatsheet(domainSlug: string): Cheatsheet | undefined {
  return cheatsheets.find((c) => c.domainSlug === domainSlug);
}

export function getAllCheatsheets(): Cheatsheet[] {
  return cheatsheets;
}
