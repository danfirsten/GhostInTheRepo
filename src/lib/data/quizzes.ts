export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface TopicQuiz {
  domainSlug: string;
  topicSlug: string;
  questions: QuizQuestion[];
}

const QUIZZES: TopicQuiz[] = [
  // ── Fundamentals ──────────────────────────────────────────────
  {
    domainSlug: "fundamentals",
    topicSlug: "data-structures-algorithms",
    questions: [
      {
        id: "fundamentals-dsa-q1",
        question: "What is the average-case time complexity of quicksort?",
        options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        correctIndex: 1,
        explanation:
          "Quicksort achieves O(n log n) on average by partitioning the array around a pivot. The worst case O(n²) occurs when the pivot is always the smallest or largest element, but randomized pivots make this rare in practice.",
      },
      {
        id: "fundamentals-dsa-q2",
        question:
          "Which data structure would you use to implement a priority queue most efficiently?",
        options: ["Sorted array", "Linked list", "Binary heap", "Hash table"],
        correctIndex: 2,
        explanation:
          "A binary heap supports insert and extract-min in O(log n) time. A sorted array has O(n) insert due to shifting, and a hash table doesn't maintain ordering.",
      },
      {
        id: "fundamentals-dsa-q3",
        question:
          "In a hash table using separate chaining, what happens during a collision?",
        options: [
          "The entry is discarded",
          "The table is resized immediately",
          "The new entry is stored in a linked list at the same index",
          "The entry replaces the existing one",
        ],
        correctIndex: 2,
        explanation:
          "Separate chaining handles collisions by maintaining a linked list (or other collection) at each bucket. Multiple keys hashing to the same index coexist in that list.",
      },
    ],
  },
  {
    domainSlug: "fundamentals",
    topicSlug: "computer-architecture",
    questions: [
      {
        id: "fundamentals-arch-q1",
        question: "What does the CPU cache hierarchy's L1 cache optimize for?",
        options: [
          "Maximum storage capacity",
          "Lowest possible latency",
          "Power efficiency",
          "Shared access across cores",
        ],
        correctIndex: 1,
        explanation:
          "L1 cache is the smallest and fastest cache, typically 1-3 cycles latency. It sits closest to the CPU core and prioritizes speed over capacity, unlike L2/L3 which are larger but slower.",
      },
      {
        id: "fundamentals-arch-q2",
        question:
          "What is pipelining in CPU architecture?",
        options: [
          "Running multiple programs simultaneously",
          "Breaking instruction execution into stages that overlap",
          "Sending data through network pipes",
          "Caching frequently used instructions",
        ],
        correctIndex: 1,
        explanation:
          "Pipelining divides instruction execution into stages (fetch, decode, execute, memory, writeback) so multiple instructions can be in different stages simultaneously, increasing throughput.",
      },
      {
        id: "fundamentals-arch-q3",
        question: "What distinguishes RISC from CISC architectures?",
        options: [
          "RISC uses more complex instructions that do more per cycle",
          "RISC uses simpler, fixed-length instructions executed in fewer cycles",
          "CISC architectures are always faster",
          "RISC architectures don't use registers",
        ],
        correctIndex: 1,
        explanation:
          "RISC (Reduced Instruction Set Computer) uses simple, uniform instructions that typically execute in one cycle. CISC (Complex Instruction Set) has variable-length instructions that may take multiple cycles but accomplish more per instruction.",
      },
    ],
  },
  {
    domainSlug: "fundamentals",
    topicSlug: "compilers-and-languages",
    questions: [
      {
        id: "fundamentals-compilers-q1",
        question:
          "Which phase of compilation converts source code into tokens?",
        options: [
          "Parsing",
          "Lexical analysis",
          "Semantic analysis",
          "Code generation",
        ],
        correctIndex: 1,
        explanation:
          "Lexical analysis (scanning) breaks raw source code into tokens — identifiers, keywords, operators, literals. The parser then arranges these tokens into an abstract syntax tree.",
      },
      {
        id: "fundamentals-compilers-q2",
        question: "What is the purpose of an Abstract Syntax Tree (AST)?",
        options: [
          "To store compiled machine code",
          "To represent the hierarchical structure of source code",
          "To optimize memory allocation",
          "To manage runtime garbage collection",
        ],
        correctIndex: 1,
        explanation:
          "An AST captures the structural meaning of code — expressions, statements, declarations — in a tree form that strips away syntactic details like parentheses and semicolons, making it easier for later compiler phases to analyze and transform.",
      },
      {
        id: "fundamentals-compilers-q3",
        question:
          "What is the key difference between a compiler and an interpreter?",
        options: [
          "Compilers are faster to write",
          "Interpreters produce machine code",
          "Compilers translate the entire program before execution; interpreters execute line by line",
          "Interpreters only work with dynamically typed languages",
        ],
        correctIndex: 2,
        explanation:
          "A compiler translates the entire program into machine code (or bytecode) before any execution happens. An interpreter reads and executes code statement by statement, which gives faster startup but typically slower execution.",
      },
    ],
  },
  {
    domainSlug: "fundamentals",
    topicSlug: "discrete-mathematics",
    questions: [
      {
        id: "fundamentals-discrete-q1",
        question: "In Big-O notation, what does O(1) represent?",
        options: [
          "Linear time",
          "Constant time",
          "Logarithmic time",
          "Quadratic time",
        ],
        correctIndex: 1,
        explanation:
          "O(1) means the operation takes constant time regardless of input size. Examples include array index access and hash table lookup (amortized).",
      },
      {
        id: "fundamentals-discrete-q2",
        question:
          "How many edges does a complete graph with n vertices have?",
        options: ["n", "n - 1", "n(n-1)/2", "2n"],
        correctIndex: 2,
        explanation:
          "In a complete graph, every vertex connects to every other vertex. Each of n vertices connects to n-1 others, but each edge is counted twice, giving n(n-1)/2 total edges.",
      },
      {
        id: "fundamentals-discrete-q3",
        question: "What does the pigeonhole principle state?",
        options: [
          "Every function has an inverse",
          "If n items are put into m containers where n > m, at least one container has more than one item",
          "All graphs are planar",
          "Every recursive function needs a base case",
        ],
        correctIndex: 1,
        explanation:
          "The pigeonhole principle is fundamental to proving existence results in combinatorics: if you have more items than containers, some container must hold multiple items. It has applications in hashing, compression, and algorithm design.",
      },
    ],
  },

  // ── Operating Systems ─────────────────────────────────────────
  {
    domainSlug: "operating-systems",
    topicSlug: "os-concepts",
    questions: [
      {
        id: "os-concepts-q1",
        question: "What is the primary role of an operating system kernel?",
        options: [
          "Providing a graphical user interface",
          "Managing hardware resources and providing abstractions for programs",
          "Compiling source code",
          "Connecting to the internet",
        ],
        correctIndex: 1,
        explanation:
          "The kernel is the core of the OS, managing CPU scheduling, memory allocation, I/O devices, and providing system calls that programs use to interact with hardware safely.",
      },
      {
        id: "os-concepts-q2",
        question:
          "What is the difference between user mode and kernel mode?",
        options: [
          "User mode is for administrators, kernel mode is for regular users",
          "User mode restricts direct hardware access; kernel mode has full privileges",
          "There is no real difference",
          "Kernel mode is slower than user mode",
        ],
        correctIndex: 1,
        explanation:
          "User mode restricts what instructions a process can execute, preventing direct hardware access. Kernel mode has full CPU privileges. System calls transition between them, providing controlled access to privileged operations.",
      },
      {
        id: "os-concepts-q3",
        question: "What is a system call?",
        options: [
          "A function call between two user programs",
          "A request from a user-space program to the kernel for a privileged operation",
          "An interrupt from hardware",
          "A call to an external API",
        ],
        correctIndex: 1,
        explanation:
          "System calls (like read, write, fork, exec) are the interface between user programs and the kernel. They trigger a mode switch from user mode to kernel mode to perform operations that require elevated privileges.",
      },
    ],
  },
  {
    domainSlug: "operating-systems",
    topicSlug: "process-management",
    questions: [
      {
        id: "os-process-q1",
        question: "What does the fork() system call do on Unix?",
        options: [
          "Creates a new thread",
          "Creates a copy of the current process",
          "Terminates the current process",
          "Opens a new file",
        ],
        correctIndex: 1,
        explanation:
          "fork() creates a new child process that is a near-exact copy of the parent, including memory, file descriptors, and program counter. The child gets a return value of 0 from fork(), while the parent gets the child's PID.",
      },
      {
        id: "os-process-q2",
        question:
          "Which scheduling algorithm can cause starvation of low-priority processes?",
        options: [
          "Round Robin",
          "First-Come, First-Served",
          "Priority Scheduling without aging",
          "Shortest Job Next",
        ],
        correctIndex: 2,
        explanation:
          "Priority Scheduling without aging can starve lower-priority processes indefinitely if higher-priority ones keep arriving. Aging solves this by gradually increasing the priority of waiting processes.",
      },
      {
        id: "os-process-q3",
        question: "What is a zombie process?",
        options: [
          "A process that consumes excessive CPU",
          "A process that has terminated but whose parent hasn't called wait()",
          "A process stuck in an infinite loop",
          "A process running in the background",
        ],
        correctIndex: 1,
        explanation:
          "A zombie process has finished execution but still has an entry in the process table because its parent hasn't collected its exit status via wait(). It consumes no resources except a PID and process table entry.",
      },
    ],
  },
  {
    domainSlug: "operating-systems",
    topicSlug: "memory-management",
    questions: [
      {
        id: "os-memory-q1",
        question: "What is virtual memory?",
        options: [
          "Extra RAM installed on the motherboard",
          "An abstraction that gives each process its own address space, backed by physical RAM and disk",
          "Memory used only by virtual machines",
          "Cache memory on the CPU",
        ],
        correctIndex: 1,
        explanation:
          "Virtual memory provides each process with the illusion of a large, contiguous address space. The OS and MMU translate virtual addresses to physical ones, swapping pages to disk when RAM is full.",
      },
      {
        id: "os-memory-q2",
        question:
          "What causes a page fault?",
        options: [
          "A syntax error in the program",
          "A process accessing a virtual page not currently in physical RAM",
          "A full hard drive",
          "A corrupted file system",
        ],
        correctIndex: 1,
        explanation:
          "A page fault occurs when a process accesses a page marked as not present in the page table. The OS then loads the page from disk (or initializes it) into a free frame in RAM and updates the page table.",
      },
      {
        id: "os-memory-q3",
        question:
          "Which page replacement algorithm is theoretically optimal but impractical?",
        options: ["FIFO", "LRU", "OPT (Bélády's)", "Clock"],
        correctIndex: 2,
        explanation:
          "OPT replaces the page that won't be used for the longest time in the future. It's optimal but requires future knowledge, so it's only used as a benchmark. LRU is a practical approximation.",
      },
    ],
  },
  {
    domainSlug: "operating-systems",
    topicSlug: "concurrency",
    questions: [
      {
        id: "os-concurrency-q1",
        question: "What is a race condition?",
        options: [
          "When two programs compete for CPU time",
          "When the outcome depends on the unpredictable timing of concurrent operations",
          "When a program runs too fast",
          "When two threads run in parallel on different cores",
        ],
        correctIndex: 1,
        explanation:
          "A race condition occurs when two or more concurrent operations access shared data and the result depends on their relative timing. This can lead to bugs that are hard to reproduce. Locks, mutexes, and atomic operations prevent them.",
      },
      {
        id: "os-concurrency-q2",
        question:
          "Which of the four Coffman conditions for deadlock involves processes holding resources while requesting others?",
        options: [
          "Mutual Exclusion",
          "Hold and Wait",
          "No Preemption",
          "Circular Wait",
        ],
        correctIndex: 1,
        explanation:
          "Hold and Wait means a process holds at least one resource while waiting for additional resources held by other processes. All four Coffman conditions (Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait) must hold simultaneously for deadlock.",
      },
      {
        id: "os-concurrency-q3",
        question: "What is the difference between a mutex and a semaphore?",
        options: [
          "They are identical",
          "A mutex allows only one thread; a semaphore can allow a configurable number",
          "A semaphore is faster",
          "A mutex can only be used between processes, not threads",
        ],
        correctIndex: 1,
        explanation:
          "A mutex is a binary lock (one thread at a time). A counting semaphore allows up to N concurrent accesses, useful for resource pools. A mutex also has ownership semantics — only the locking thread can unlock it.",
      },
    ],
  },
  {
    domainSlug: "operating-systems",
    topicSlug: "file-systems",
    questions: [
      {
        id: "os-filesystems-q1",
        question: "What is an inode in Unix file systems?",
        options: [
          "A directory entry",
          "A data structure storing file metadata and pointers to data blocks",
          "A type of file permission",
          "A network socket",
        ],
        correctIndex: 1,
        explanation:
          "An inode stores metadata about a file (permissions, owner, timestamps, size) and pointers to the actual data blocks on disk. The filename-to-inode mapping is stored in directory entries, allowing hard links.",
      },
      {
        id: "os-filesystems-q2",
        question: "What is journaling in a file system?",
        options: [
          "Keeping a log of user activity",
          "Recording file system changes in a log before applying them to prevent corruption on crash",
          "Compressing old files",
          "Encrypting file contents",
        ],
        correctIndex: 1,
        explanation:
          "Journaling file systems (ext4, NTFS, XFS) write intended changes to a journal first. If a crash occurs mid-operation, the system can replay or discard the journal to maintain consistency.",
      },
      {
        id: "os-filesystems-q3",
        question: "What does a hard link do?",
        options: [
          "Creates a shortcut that points to a file path",
          "Creates another directory entry pointing to the same inode",
          "Copies the file to a new location",
          "Creates a compressed version of the file",
        ],
        correctIndex: 1,
        explanation:
          "A hard link creates a new directory entry that points to the same inode as the original file. Both names are equally valid — deleting one doesn't affect the other. The file data is only freed when all hard links are removed.",
      },
    ],
  },
  {
    domainSlug: "operating-systems",
    topicSlug: "linux-mastery",
    questions: [
      {
        id: "os-linux-q1",
        question: "What does the chmod 755 command set?",
        options: [
          "Owner: read/write, Group: read, Others: none",
          "Owner: read/write/execute, Group: read/execute, Others: read/execute",
          "Everyone: full access",
          "Owner: read only, Group: write, Others: execute",
        ],
        correctIndex: 1,
        explanation:
          "In octal notation, 7 = rwx, 5 = r-x. So 755 gives the owner full permissions and group/others read and execute. This is the standard permission for executable scripts and directories.",
      },
      {
        id: "os-linux-q2",
        question: "What is the purpose of the /proc filesystem in Linux?",
        options: [
          "Storing application data",
          "A virtual filesystem exposing kernel and process information",
          "A backup directory",
          "The location for user home directories",
        ],
        correctIndex: 1,
        explanation:
          "/proc is a virtual filesystem that doesn't exist on disk. It provides an interface to kernel data structures — process info (/proc/PID/), CPU info (/proc/cpuinfo), memory stats, and more. It's essential for system monitoring tools.",
      },
      {
        id: "os-linux-q3",
        question: "What does the pipe operator (|) do in a shell command?",
        options: [
          "Writes output to a file",
          "Connects stdout of one command to stdin of the next",
          "Runs commands in parallel",
          "Creates a symbolic link",
        ],
        correctIndex: 1,
        explanation:
          "The pipe connects the standard output of the left command to the standard input of the right command, allowing data to flow through a chain of programs. This is fundamental to the Unix philosophy of composing small tools.",
      },
    ],
  },

  // ── Terminal & Tools ──────────────────────────────────────────
  {
    domainSlug: "terminal-and-tools",
    topicSlug: "terminal-mastery",
    questions: [
      {
        id: "terminal-mastery-q1",
        question: "What does Ctrl+R do in most Unix shells?",
        options: [
          "Resets the terminal",
          "Searches backward through command history",
          "Refreshes the screen",
          "Restarts the shell",
        ],
        correctIndex: 1,
        explanation:
          "Ctrl+R activates reverse incremental search, allowing you to search through your command history by typing a substring. Press Ctrl+R again to cycle through older matches.",
      },
      {
        id: "terminal-mastery-q2",
        question: "What is the difference between > and >> in shell redirection?",
        options: [
          "No difference",
          "> overwrites the file; >> appends to it",
          "> reads from a file; >> writes to it",
          ">> is faster than >",
        ],
        correctIndex: 1,
        explanation:
          "> redirects stdout and creates/overwrites the target file. >> appends to the file without overwriting existing content. Both create the file if it doesn't exist.",
      },
      {
        id: "terminal-mastery-q3",
        question: "What does the $? variable contain in bash?",
        options: [
          "The current process ID",
          "The exit status of the last executed command",
          "The number of arguments",
          "The current working directory",
        ],
        correctIndex: 1,
        explanation:
          "$? holds the exit status of the most recently executed foreground command. An exit status of 0 means success; non-zero indicates an error. This is essential for scripting control flow.",
      },
    ],
  },
  {
    domainSlug: "terminal-and-tools",
    topicSlug: "git-mastery",
    questions: [
      {
        id: "terminal-git-q1",
        question: "What does 'git rebase' do compared to 'git merge'?",
        options: [
          "Rebase deletes branches; merge keeps them",
          "Rebase replays commits on top of another branch, creating a linear history; merge creates a merge commit",
          "They are identical",
          "Rebase is only for remote branches",
        ],
        correctIndex: 1,
        explanation:
          "Rebase moves or replays your commits onto the tip of another branch, creating a clean linear history. Merge preserves the branch topology with a merge commit. Rebase rewrites history, so avoid it on shared branches.",
      },
      {
        id: "terminal-git-q2",
        question: "What is the Git staging area (index)?",
        options: [
          "A remote server where code is stored",
          "An intermediate area where changes are prepared before committing",
          "A backup of the last commit",
          "A log of all branches",
        ],
        correctIndex: 1,
        explanation:
          "The staging area (index) lets you selectively choose which changes to include in the next commit. 'git add' stages changes, giving you fine-grained control over your commit history.",
      },
      {
        id: "terminal-git-q3",
        question: "What does 'git stash' do?",
        options: [
          "Permanently deletes uncommitted changes",
          "Temporarily saves uncommitted changes and reverts to a clean working tree",
          "Creates a new branch",
          "Pushes changes to the remote",
        ],
        correctIndex: 1,
        explanation:
          "Git stash saves your modified tracked files and staged changes on a stack, reverting your working directory to match HEAD. Use 'git stash pop' or 'git stash apply' to restore them later.",
      },
    ],
  },
  {
    domainSlug: "terminal-and-tools",
    topicSlug: "shell-scripting",
    questions: [
      {
        id: "terminal-shell-q1",
        question:
          "What is the shebang line (#!/bin/bash) at the top of a script?",
        options: [
          "A comment that is ignored",
          "A directive telling the OS which interpreter to use to execute the script",
          "A variable declaration",
          "A security feature",
        ],
        correctIndex: 1,
        explanation:
          "The shebang (#!) tells the OS kernel which interpreter to invoke when the script is executed directly (e.g., ./script.sh). Without it, the system uses the default shell, which may not be what you want.",
      },
      {
        id: "terminal-shell-q2",
        question:
          "In bash, what is the difference between single quotes and double quotes?",
        options: [
          "No difference",
          "Single quotes prevent variable expansion; double quotes allow it",
          "Double quotes prevent variable expansion",
          "Single quotes are for numbers only",
        ],
        correctIndex: 1,
        explanation:
          "Single quotes preserve everything literally — no variable expansion, no command substitution. Double quotes allow $variable expansion and $(command) substitution but still prevent word splitting and glob expansion.",
      },
      {
        id: "terminal-shell-q3",
        question: "What does 'set -e' do in a bash script?",
        options: [
          "Enables verbose output",
          "Causes the script to exit immediately if any command fails",
          "Sets environment variables",
          "Enables debug mode",
        ],
        correctIndex: 1,
        explanation:
          "'set -e' (errexit) makes the script exit immediately when a command returns a non-zero exit status. Combined with 'set -u' (treat unset variables as errors) and 'set -o pipefail', it creates robust error handling.",
      },
    ],
  },
  {
    domainSlug: "terminal-and-tools",
    topicSlug: "vim-mastery",
    questions: [
      {
        id: "terminal-vim-q1",
        question: "In Vim, what does 'dd' do in normal mode?",
        options: [
          "Deletes a character",
          "Deletes the entire current line",
          "Duplicates the current line",
          "Moves down two lines",
        ],
        correctIndex: 1,
        explanation:
          "'dd' cuts (deletes) the entire current line and stores it in the default register. You can paste it with 'p'. Prefix with a number (e.g., '5dd') to delete multiple lines.",
      },
      {
        id: "terminal-vim-q2",
        question: "What is the difference between Vim's visual mode and visual line mode?",
        options: [
          "Visual mode selects characters; visual line mode selects entire lines",
          "They are the same",
          "Visual line mode only works in insert mode",
          "Visual mode is for code; visual line mode is for text",
        ],
        correctIndex: 0,
        explanation:
          "'v' enters visual mode for character-wise selection. 'V' (shift-v) enters visual line mode, which always selects complete lines. There's also Ctrl-v for visual block mode, which selects rectangular blocks.",
      },
      {
        id: "terminal-vim-q3",
        question: "How do you search for a pattern in Vim?",
        options: [
          "Ctrl+F",
          "Type / followed by the pattern and press Enter",
          "Type :search pattern",
          "Press s",
        ],
        correctIndex: 1,
        explanation:
          "/ starts a forward search and ? starts a backward search. After finding a match, 'n' goes to the next occurrence and 'N' goes to the previous. Vim supports full regex patterns in search.",
      },
    ],
  },
  {
    domainSlug: "terminal-and-tools",
    topicSlug: "tmux",
    questions: [
      {
        id: "terminal-tmux-q1",
        question: "What is the main advantage of tmux over regular terminal tabs?",
        options: [
          "Tmux is faster",
          "Tmux sessions persist after disconnection and can be reattached",
          "Tmux has better colors",
          "Tmux uses less memory",
        ],
        correctIndex: 1,
        explanation:
          "Tmux sessions run as server processes that persist independently of your terminal. If your SSH connection drops or you close your terminal, you can reattach to the session with all your work intact.",
      },
      {
        id: "terminal-tmux-q2",
        question:
          "What is the difference between a tmux window and a tmux pane?",
        options: [
          "They are the same thing",
          "A window is a full-screen workspace; a pane is a subdivision within a window",
          "A pane is larger than a window",
          "Windows can only contain one pane",
        ],
        correctIndex: 1,
        explanation:
          "A tmux session contains windows (like tabs), and each window can be split into multiple panes. Panes share the window space and can be arranged vertically or horizontally.",
      },
      {
        id: "terminal-tmux-q3",
        question:
          "What key combination is the default tmux prefix?",
        options: ["Ctrl+A", "Ctrl+B", "Ctrl+T", "Alt+T"],
        correctIndex: 1,
        explanation:
          "The default tmux prefix key is Ctrl+B. After pressing it, you enter a command key (e.g., 'c' for new window, '%' for vertical split, '\"' for horizontal split). Many users remap it to Ctrl+A for easier reach.",
      },
    ],
  },
  {
    domainSlug: "terminal-and-tools",
    topicSlug: "build-systems",
    questions: [
      {
        id: "terminal-build-q1",
        question: "What is the primary purpose of a Makefile?",
        options: [
          "Version control",
          "Defining build rules and dependencies so only changed files are recompiled",
          "Managing package installations",
          "Running tests",
        ],
        correctIndex: 1,
        explanation:
          "Make uses dependency graphs to determine which files need rebuilding based on modification timestamps. This avoids recompiling unchanged code, significantly speeding up builds in large projects.",
      },
      {
        id: "terminal-build-q2",
        question: "What is a build artifact?",
        options: [
          "A source code file",
          "A file produced by the build process (binary, bundle, object file)",
          "A git commit",
          "A configuration file",
        ],
        correctIndex: 1,
        explanation:
          "Build artifacts are the outputs of a build process — compiled binaries, .o object files, JavaScript bundles, Docker images, etc. They are typically not committed to version control and are regenerated by the build system.",
      },
      {
        id: "terminal-build-q3",
        question:
          "What does 'tree shaking' do in JavaScript bundlers like webpack?",
        options: [
          "Removes unused code from the final bundle",
          "Reorganizes the file structure",
          "Minifies variable names",
          "Compresses images",
        ],
        correctIndex: 0,
        explanation:
          "Tree shaking analyzes ES module import/export graphs to identify and eliminate code that is never used (dead code). This reduces bundle size significantly, especially with large libraries where you only use a few functions.",
      },
    ],
  },

  // ── Networking ────────────────────────────────────────────────
  {
    domainSlug: "networking",
    topicSlug: "networking-fundamentals",
    questions: [
      {
        id: "networking-fundamentals-q1",
        question: "What layer of the OSI model does TCP operate on?",
        options: ["Network (Layer 3)", "Transport (Layer 4)", "Session (Layer 5)", "Data Link (Layer 2)"],
        correctIndex: 1,
        explanation:
          "TCP operates at the Transport Layer (Layer 4) of the OSI model. It provides reliable, ordered, connection-oriented data delivery on top of IP (Layer 3). UDP also operates at Layer 4 but without reliability guarantees.",
      },
      {
        id: "networking-fundamentals-q2",
        question: "What is the purpose of a subnet mask?",
        options: [
          "To encrypt network traffic",
          "To divide an IP address into network and host portions",
          "To speed up data transfer",
          "To assign MAC addresses",
        ],
        correctIndex: 1,
        explanation:
          "A subnet mask determines which bits of an IP address identify the network and which identify the host. For example, 255.255.255.0 (/24) means the first 24 bits are the network portion, leaving 8 bits for up to 254 hosts.",
      },
      {
        id: "networking-fundamentals-q3",
        question:
          "What is the key difference between TCP and UDP?",
        options: [
          "TCP is wireless; UDP is wired",
          "TCP guarantees ordered, reliable delivery; UDP is connectionless with no guarantees",
          "UDP is more secure than TCP",
          "TCP is only used for web traffic",
        ],
        correctIndex: 1,
        explanation:
          "TCP provides reliable, ordered byte stream delivery with flow control, congestion control, and retransmission. UDP sends datagrams with minimal overhead and no delivery guarantees, making it faster for real-time applications like video streaming and gaming.",
      },
    ],
  },
  {
    domainSlug: "networking",
    topicSlug: "dns-tls-http",
    questions: [
      {
        id: "networking-dns-q1",
        question: "What does DNS primarily do?",
        options: [
          "Encrypts web traffic",
          "Translates domain names to IP addresses",
          "Routes packets between networks",
          "Manages email delivery",
        ],
        correctIndex: 1,
        explanation:
          "The Domain Name System translates human-readable domain names (like example.com) to IP addresses (like 93.184.216.34). It uses a hierarchical system of nameservers: root servers, TLD servers, and authoritative servers.",
      },
      {
        id: "networking-dns-q2",
        question: "What does TLS (Transport Layer Security) provide?",
        options: [
          "Faster data transfer",
          "Encryption, authentication, and integrity for network communications",
          "Domain name resolution",
          "Load balancing",
        ],
        correctIndex: 1,
        explanation:
          "TLS provides confidentiality (encryption), authentication (certificates verify server identity), and integrity (MACs detect tampering). HTTPS is HTTP over TLS. The TLS handshake establishes a shared session key using asymmetric cryptography.",
      },
      {
        id: "networking-dns-q3",
        question: "What is HTTP/2's main improvement over HTTP/1.1?",
        options: [
          "Better security",
          "Multiplexing multiple requests over a single TCP connection",
          "Larger payload sizes",
          "Simpler headers",
        ],
        correctIndex: 1,
        explanation:
          "HTTP/2 introduces binary framing and multiplexing, allowing multiple request/response streams over a single TCP connection simultaneously. HTTP/1.1 suffered from head-of-line blocking, requiring multiple connections for parallelism.",
      },
    ],
  },
  {
    domainSlug: "networking",
    topicSlug: "protocols",
    questions: [
      {
        id: "networking-protocols-q1",
        question: "What is the purpose of ARP (Address Resolution Protocol)?",
        options: [
          "Resolving domain names to IPs",
          "Mapping IP addresses to MAC addresses on a local network",
          "Routing packets across the internet",
          "Encrypting data in transit",
        ],
        correctIndex: 1,
        explanation:
          "ARP resolves a known IP address to a MAC (hardware) address on the local network. When a device wants to communicate with an IP on the same subnet, it broadcasts an ARP request to find the corresponding MAC address.",
      },
      {
        id: "networking-protocols-q2",
        question: "What protocol does DHCP use to assign IP addresses?",
        options: ["TCP", "UDP", "ICMP", "ARP"],
        correctIndex: 1,
        explanation:
          "DHCP uses UDP (ports 67/68) because the client doesn't have an IP address yet, so it can't establish a TCP connection. The DORA process (Discover, Offer, Request, Acknowledge) uses broadcast messages on UDP.",
      },
      {
        id: "networking-protocols-q3",
        question: "What does ICMP stand for, and what is it used for?",
        options: [
          "Internet Control Message Protocol — used for diagnostics like ping and traceroute",
          "Internal Communication Management Protocol — used for email",
          "Integrated Circuit Monitoring Protocol — used for hardware checks",
          "Internet Cache Management Protocol — used for caching",
        ],
        correctIndex: 0,
        explanation:
          "ICMP is used for network diagnostics and error reporting. Ping uses ICMP Echo Request/Reply to test connectivity. Traceroute uses ICMP Time Exceeded messages to discover the path packets take.",
      },
    ],
  },
  {
    domainSlug: "networking",
    topicSlug: "network-programming",
    questions: [
      {
        id: "networking-programming-q1",
        question: "What is a socket in network programming?",
        options: [
          "A physical connector on a computer",
          "An endpoint for sending and receiving data, identified by IP address and port",
          "A type of encryption",
          "A web framework component",
        ],
        correctIndex: 1,
        explanation:
          "A socket is an OS-level abstraction providing a bidirectional communication endpoint. It's defined by (protocol, local address, local port, remote address, remote port) — the 5-tuple that uniquely identifies a connection.",
      },
      {
        id: "networking-programming-q2",
        question: "What is the purpose of the select() or poll() system call?",
        options: [
          "To choose the best network interface",
          "To monitor multiple file descriptors for I/O readiness without blocking",
          "To select a random port",
          "To poll a server for updates",
        ],
        correctIndex: 1,
        explanation:
          "select()/poll()/epoll() enable I/O multiplexing — monitoring multiple sockets simultaneously without creating a thread per connection. This is fundamental to building high-performance servers that handle thousands of concurrent connections.",
      },
      {
        id: "networking-programming-q3",
        question: "What does the listen() call do on a server socket?",
        options: [
          "Receives data from a client",
          "Marks the socket as passive, ready to accept incoming connections",
          "Sends data to a client",
          "Closes the socket",
        ],
        correctIndex: 1,
        explanation:
          "listen() converts a bound socket into a listening (passive) socket. It also sets the backlog size — the maximum number of pending connections waiting to be accepted. accept() then dequeues connections one at a time.",
      },
    ],
  },

  // ── Systems Programming ───────────────────────────────────────
  {
    domainSlug: "systems-programming",
    topicSlug: "c-and-cpp",
    questions: [
      {
        id: "sysprog-c-q1",
        question: "What is undefined behavior in C?",
        options: [
          "A compiler error",
          "Code whose behavior is not defined by the C standard, allowing the compiler to do anything",
          "A runtime exception",
          "A deprecated feature",
        ],
        correctIndex: 1,
        explanation:
          "Undefined behavior (UB) means the C standard places no requirements on the program's behavior. Examples include buffer overflows, null pointer dereference, and signed integer overflow. Compilers may optimize assuming UB never occurs.",
      },
      {
        id: "sysprog-c-q2",
        question:
          "What is the difference between stack and heap memory allocation?",
        options: [
          "Stack is slower; heap is faster",
          "Stack allocation is automatic and LIFO; heap allocation is manual and persists until freed",
          "They are the same",
          "Heap is only for arrays",
        ],
        correctIndex: 1,
        explanation:
          "Stack allocation is fast (just moving the stack pointer) and automatic (freed when the function returns). Heap allocation (malloc/free) is flexible but slower, requires manual management, and risks leaks and fragmentation.",
      },
      {
        id: "sysprog-c-q3",
        question: "What does RAII stand for in C++, and why is it important?",
        options: [
          "Random Access Indexed Interface — for arrays",
          "Resource Acquisition Is Initialization — ensures resources are released when objects go out of scope",
          "Runtime Allocation and Initialization — for memory management",
          "Recursive Algorithm Iteration Interface — for recursion",
        ],
        correctIndex: 1,
        explanation:
          "RAII ties resource lifetime to object lifetime. Resources (memory, file handles, locks) are acquired in constructors and released in destructors. When an object goes out of scope, its destructor runs automatically, preventing leaks even with exceptions.",
      },
    ],
  },
  {
    domainSlug: "systems-programming",
    topicSlug: "rust",
    questions: [
      {
        id: "sysprog-rust-q1",
        question: "What does Rust's ownership system prevent?",
        options: [
          "Syntax errors",
          "Data races and use-after-free bugs at compile time",
          "Network errors",
          "Type mismatches",
        ],
        correctIndex: 1,
        explanation:
          "Rust's ownership system enforces that each value has exactly one owner, and borrowing rules prevent data races at compile time. References can be either shared (&T, many readers) or exclusive (&mut T, one writer), never both simultaneously.",
      },
      {
        id: "sysprog-rust-q2",
        question:
          "What is the difference between String and &str in Rust?",
        options: [
          "They are interchangeable",
          "String is heap-allocated and owned; &str is a borrowed reference to string data",
          "String is for ASCII; &str is for Unicode",
          "&str is mutable; String is not",
        ],
        correctIndex: 1,
        explanation:
          "String is a growable, heap-allocated, owned string type. &str (string slice) is a borrowed reference to string data — it can point into a String, a string literal, or any UTF-8 bytes. Functions typically accept &str for flexibility.",
      },
      {
        id: "sysprog-rust-q3",
        question: "What does the Rust borrow checker enforce?",
        options: [
          "That all variables are initialized",
          "That you cannot have a mutable reference while immutable references exist",
          "That functions are pure",
          "That all loops terminate",
        ],
        correctIndex: 1,
        explanation:
          "The borrow checker enforces that at any point, you can have either one mutable reference OR any number of immutable references to data, but not both. This prevents data races at compile time without needing a garbage collector.",
      },
    ],
  },
  {
    domainSlug: "systems-programming",
    topicSlug: "low-level-systems",
    questions: [
      {
        id: "sysprog-lowlevel-q1",
        question: "What is memory-mapped I/O?",
        options: [
          "Using RAM as a hard drive",
          "Mapping device registers into the CPU's address space so they can be accessed like memory",
          "Compressing data in memory",
          "Using virtual memory for file access",
        ],
        correctIndex: 1,
        explanation:
          "Memory-mapped I/O maps hardware device registers to memory addresses. The CPU reads/writes these addresses to communicate with devices, using the same instructions as regular memory access. This simplifies device driver programming.",
      },
      {
        id: "sysprog-lowlevel-q2",
        question: "What is an interrupt in systems programming?",
        options: [
          "A program error",
          "A signal from hardware or software that causes the CPU to pause current execution and run a handler",
          "A break point in code",
          "A network timeout",
        ],
        correctIndex: 1,
        explanation:
          "Interrupts allow hardware devices to signal the CPU asynchronously. The CPU saves its current state, runs an Interrupt Service Routine (ISR), then resumes. This is more efficient than polling devices continuously.",
      },
      {
        id: "sysprog-lowlevel-q3",
        question: "What is a system call overhead?",
        options: [
          "The CPU time for compiling system code",
          "The cost of switching from user mode to kernel mode and back",
          "Memory used by the kernel",
          "Network latency",
        ],
        correctIndex: 1,
        explanation:
          "System calls require a context switch from user mode to kernel mode, saving/restoring registers and checking permissions. This overhead (typically hundreds of nanoseconds) is why techniques like buffered I/O and io_uring minimize syscall frequency.",
      },
    ],
  },

  // ── Databases ─────────────────────────────────────────────────
  {
    domainSlug: "databases",
    topicSlug: "sql-relational",
    questions: [
      {
        id: "db-sql-q1",
        question: "What does ACID stand for in database transactions?",
        options: [
          "Automated, Concurrent, Indexed, Distributed",
          "Atomicity, Consistency, Isolation, Durability",
          "Access, Control, Identity, Data",
          "Asynchronous, Cached, Immutable, Decoupled",
        ],
        correctIndex: 1,
        explanation:
          "ACID properties guarantee reliable transactions: Atomicity (all-or-nothing), Consistency (valid state transitions), Isolation (concurrent transactions don't interfere), Durability (committed data survives crashes).",
      },
      {
        id: "db-sql-q2",
        question:
          "What is the difference between an INNER JOIN and a LEFT JOIN?",
        options: [
          "INNER JOIN is faster",
          "INNER JOIN returns only matching rows; LEFT JOIN returns all rows from the left table plus matches from the right",
          "LEFT JOIN is for subqueries only",
          "They return the same results",
        ],
        correctIndex: 1,
        explanation:
          "INNER JOIN returns only rows where the join condition is met in both tables. LEFT JOIN returns all rows from the left table; if no match exists in the right table, those columns are NULL. This is essential for queries where you want to keep all records from one table.",
      },
      {
        id: "db-sql-q3",
        question: "What does database normalization aim to achieve?",
        options: [
          "Faster queries",
          "Eliminating data redundancy and ensuring data integrity through proper table design",
          "Compressing database files",
          "Encrypting sensitive data",
        ],
        correctIndex: 1,
        explanation:
          "Normalization organizes tables to reduce data duplication and prevent anomalies (insertion, update, deletion). Normal forms (1NF through 5NF) progressively eliminate different types of redundancy, though over-normalization can hurt read performance.",
      },
    ],
  },
  {
    domainSlug: "databases",
    topicSlug: "nosql",
    questions: [
      {
        id: "db-nosql-q1",
        question:
          "What does the CAP theorem state about distributed databases?",
        options: [
          "You can have all three: Consistency, Availability, Partition tolerance",
          "You can only guarantee two of three: Consistency, Availability, Partition tolerance",
          "NoSQL databases are always faster than SQL",
          "Distributed databases can't be consistent",
        ],
        correctIndex: 1,
        explanation:
          "The CAP theorem states that in the presence of a network partition, a distributed system must choose between Consistency (all nodes see the same data) and Availability (every request gets a response). Partition tolerance is required in practice.",
      },
      {
        id: "db-nosql-q2",
        question: "What is eventual consistency?",
        options: [
          "Data is always immediately consistent",
          "All replicas will converge to the same state given enough time without new updates",
          "Data is never consistent",
          "Consistency is guaranteed only during business hours",
        ],
        correctIndex: 1,
        explanation:
          "Eventual consistency means that if no new updates are made, all replicas will eventually have the same data. This trades strong consistency for higher availability and lower latency. DynamoDB, Cassandra, and DNS use this model.",
      },
      {
        id: "db-nosql-q3",
        question:
          "When would you choose a document database (like MongoDB) over a relational database?",
        options: [
          "When you need strict ACID transactions across tables",
          "When your data has a flexible, nested schema that doesn't fit well into rigid tables",
          "When you need complex multi-table JOINs",
          "When data integrity is the top priority",
        ],
        correctIndex: 1,
        explanation:
          "Document databases excel when data naturally fits into self-contained documents with varying schemas, like user profiles or product catalogs. They avoid expensive JOINs by embedding related data. Relational databases are better for highly interconnected data requiring strict integrity.",
      },
    ],
  },
  {
    domainSlug: "databases",
    topicSlug: "database-internals",
    questions: [
      {
        id: "db-internals-q1",
        question: "What is a B-tree, and why do databases use it for indexes?",
        options: [
          "A binary tree optimized for in-memory operations",
          "A self-balancing tree optimized for disk I/O with high branching factor",
          "A hash table variant",
          "A tree that only stores strings",
        ],
        correctIndex: 1,
        explanation:
          "B-trees have a high branching factor (hundreds of keys per node), keeping the tree shallow. Each node maps to a disk page, minimizing the number of disk reads needed to find a key. This makes them ideal for on-disk indexes.",
      },
      {
        id: "db-internals-q2",
        question: "What is a Write-Ahead Log (WAL)?",
        options: [
          "A log of all database queries",
          "A technique where changes are written to a log before being applied to the actual data pages",
          "A user activity log",
          "A backup file",
        ],
        correctIndex: 1,
        explanation:
          "WAL ensures durability by writing change records to a sequential log before modifying data pages. On crash recovery, the database replays the log to restore committed transactions. This is more efficient than flushing data pages on every write.",
      },
      {
        id: "db-internals-q3",
        question:
          "What is the difference between a clustered and non-clustered index?",
        options: [
          "Clustered indexes are faster",
          "A clustered index determines the physical order of data rows; a non-clustered index is a separate structure pointing to rows",
          "Non-clustered indexes use more disk space",
          "There can be many clustered indexes per table",
        ],
        correctIndex: 1,
        explanation:
          "A clustered index sorts and stores the actual table data in order of the index key. A table can have only one clustered index. Non-clustered indexes are separate B-trees whose leaf nodes contain pointers back to the data rows.",
      },
    ],
  },

  // ── Web Development ───────────────────────────────────────────
  {
    domainSlug: "web-development",
    topicSlug: "frontend",
    questions: [
      {
        id: "web-frontend-q1",
        question: "What is the Virtual DOM, and why is it used?",
        options: [
          "A browser security feature",
          "A lightweight in-memory representation of the real DOM that enables efficient updates by diffing changes",
          "A way to run JavaScript on the server",
          "A CSS optimization technique",
        ],
        correctIndex: 1,
        explanation:
          "The Virtual DOM (used by React) is a JavaScript object tree mirroring the real DOM. When state changes, React creates a new virtual tree, diffs it against the previous one, and applies only the minimal set of real DOM mutations needed.",
      },
      {
        id: "web-frontend-q2",
        question:
          "What is the CSS specificity order from lowest to highest?",
        options: [
          "ID → Class → Element → Inline",
          "Element → Class → ID → Inline",
          "Class → Element → ID → Inline",
          "Inline → ID → Class → Element",
        ],
        correctIndex: 1,
        explanation:
          "CSS specificity, from lowest to highest: element/pseudo-element selectors (0,0,1), class/attribute/pseudo-class selectors (0,1,0), ID selectors (1,0,0), and inline styles. !important overrides all specificity.",
      },
      {
        id: "web-frontend-q3",
        question: "What is the purpose of the useEffect hook in React?",
        options: [
          "To define CSS styles",
          "To perform side effects (data fetching, subscriptions, DOM mutations) after render",
          "To create new components",
          "To handle routing",
        ],
        correctIndex: 1,
        explanation:
          "useEffect runs after the component renders, letting you synchronize with external systems. The dependency array controls when it re-runs. Return a cleanup function for subscriptions. It replaces componentDidMount/Update/Unmount lifecycle methods.",
      },
    ],
  },
  {
    domainSlug: "web-development",
    topicSlug: "backend",
    questions: [
      {
        id: "web-backend-q1",
        question: "What is middleware in web frameworks?",
        options: [
          "Database software",
          "Functions that process requests/responses in a pipeline before reaching the route handler",
          "CSS preprocessing",
          "A type of web server",
        ],
        correctIndex: 1,
        explanation:
          "Middleware functions sit in the request/response pipeline, executing in order. Common uses include authentication, logging, CORS headers, body parsing, and rate limiting. Each middleware can modify the request, response, or end the chain.",
      },
      {
        id: "web-backend-q2",
        question: "What is the purpose of an ORM?",
        options: [
          "Optimizing frontend rendering",
          "Mapping database rows to programming language objects, abstracting SQL",
          "Managing API routes",
          "Handling file uploads",
        ],
        correctIndex: 1,
        explanation:
          "Object-Relational Mappers (like Prisma, SQLAlchemy, ActiveRecord) let you interact with databases using your language's objects instead of raw SQL. They handle query generation, relationships, and migrations but can introduce performance overhead with complex queries.",
      },
      {
        id: "web-backend-q3",
        question: "What is the difference between authentication and authorization?",
        options: [
          "They are the same",
          "Authentication verifies identity; authorization determines what actions that identity can perform",
          "Authorization happens before authentication",
          "Authentication is only for APIs",
        ],
        correctIndex: 1,
        explanation:
          "Authentication answers 'who are you?' (login, tokens, certificates). Authorization answers 'what can you do?' (roles, permissions, ACLs). Authentication must happen first — you can't determine permissions without knowing the identity.",
      },
    ],
  },
  {
    domainSlug: "web-development",
    topicSlug: "apis",
    questions: [
      {
        id: "web-apis-q1",
        question: "What makes an API RESTful?",
        options: [
          "Using JSON exclusively",
          "Following constraints: stateless, client-server, uniform interface, resource-based URLs",
          "Being fast",
          "Using GraphQL",
        ],
        correctIndex: 1,
        explanation:
          "REST (Representational State Transfer) defines architectural constraints: stateless requests, resource identification via URIs, manipulation through representations, self-descriptive messages, and HATEOAS. Not all HTTP APIs are truly RESTful.",
      },
      {
        id: "web-apis-q2",
        question:
          "What HTTP status code range indicates client errors?",
        options: ["1xx", "2xx", "3xx", "4xx"],
        correctIndex: 3,
        explanation:
          "4xx codes indicate client errors: 400 (Bad Request), 401 (Unauthorized), 403 (Forbidden), 404 (Not Found), 429 (Too Many Requests). 5xx codes are server errors. 2xx indicates success. 3xx indicates redirection.",
      },
      {
        id: "web-apis-q3",
        question: "What is the main advantage of GraphQL over REST?",
        options: [
          "GraphQL is faster",
          "Clients can request exactly the data they need in a single query, avoiding over-fetching",
          "GraphQL is more secure",
          "GraphQL doesn't need a server",
        ],
        correctIndex: 1,
        explanation:
          "GraphQL lets clients specify the exact shape of the data they need, solving REST's over-fetching (getting too much data) and under-fetching (needing multiple requests) problems. The trade-off is more complexity in server implementation and caching.",
      },
    ],
  },
  {
    domainSlug: "web-development",
    topicSlug: "web-performance",
    questions: [
      {
        id: "web-perf-q1",
        question: "What is Largest Contentful Paint (LCP)?",
        options: [
          "The time to load the first byte",
          "The time until the largest visible content element is rendered",
          "The total page load time",
          "The time to parse JavaScript",
        ],
        correctIndex: 1,
        explanation:
          "LCP measures when the largest content element (image, text block, video) becomes visible in the viewport. Google considers under 2.5 seconds 'good'. It's one of the three Core Web Vitals alongside FID/INP and CLS.",
      },
      {
        id: "web-perf-q2",
        question: "What does lazy loading achieve?",
        options: [
          "Faster server response times",
          "Deferring the loading of non-critical resources until they are needed",
          "Compressing all assets",
          "Reducing DNS lookups",
        ],
        correctIndex: 1,
        explanation:
          "Lazy loading defers loading resources (images, scripts, components) until they're about to enter the viewport or are actually needed. This reduces initial page weight and time to interactive. The loading='lazy' attribute enables native browser lazy loading for images.",
      },
      {
        id: "web-perf-q3",
        question: "What is a CDN and how does it improve performance?",
        options: [
          "A type of database",
          "A geographically distributed network of servers that caches content closer to users",
          "A CSS framework",
          "A code compilation tool",
        ],
        correctIndex: 1,
        explanation:
          "A Content Delivery Network caches static assets on edge servers worldwide. Users are served from the nearest edge server, reducing latency. CDNs also help absorb traffic spikes and DDoS attacks.",
      },
    ],
  },

  // ── Software Engineering ──────────────────────────────────────
  {
    domainSlug: "software-engineering",
    topicSlug: "design-patterns",
    questions: [
      {
        id: "se-patterns-q1",
        question: "What problem does the Observer pattern solve?",
        options: [
          "Creating objects without specifying their class",
          "Allowing objects to be notified of state changes in another object without tight coupling",
          "Ensuring only one instance exists",
          "Separating an abstraction from its implementation",
        ],
        correctIndex: 1,
        explanation:
          "The Observer pattern defines a one-to-many dependency: when the subject's state changes, all registered observers are notified. This decouples the subject from its observers. Event systems, React state, and pub/sub are all Observer variants.",
      },
      {
        id: "se-patterns-q2",
        question: "What is the Singleton pattern, and when is it an anti-pattern?",
        options: [
          "A pattern that creates multiple instances; never an anti-pattern",
          "Ensures a class has only one instance with global access; problematic when it introduces hidden state and makes testing difficult",
          "A pattern for building user interfaces",
          "A concurrency pattern for managing threads",
        ],
        correctIndex: 1,
        explanation:
          "Singleton guarantees one instance globally. It's useful for genuinely unique resources (connection pools, loggers) but becomes an anti-pattern when it hides dependencies, makes unit testing hard, and introduces global mutable state.",
      },
      {
        id: "se-patterns-q3",
        question:
          "What does the Strategy pattern allow you to do?",
        options: [
          "Undo and redo operations",
          "Define a family of interchangeable algorithms and select one at runtime",
          "Create complex objects step by step",
          "Traverse a collection without exposing its structure",
        ],
        correctIndex: 1,
        explanation:
          "Strategy encapsulates algorithms behind a common interface, letting you swap them at runtime. Example: a sorting component that can use quicksort, mergesort, or heapsort interchangeably based on input characteristics.",
      },
    ],
  },
  {
    domainSlug: "software-engineering",
    topicSlug: "clean-code-architecture",
    questions: [
      {
        id: "se-clean-q1",
        question: "What does the Single Responsibility Principle (SRP) state?",
        options: [
          "A class should do as much as possible",
          "A class should have only one reason to change",
          "A function should always return a single value",
          "A file should contain only one class",
        ],
        correctIndex: 1,
        explanation:
          "SRP states that a module/class should have one, and only one, reason to change — meaning it should encapsulate one responsibility. This leads to more focused, testable, and maintainable code.",
      },
      {
        id: "se-clean-q2",
        question:
          "What is dependency injection?",
        options: [
          "Installing npm packages",
          "Providing a component's dependencies from the outside rather than creating them internally",
          "Importing modules",
          "Adding environment variables",
        ],
        correctIndex: 1,
        explanation:
          "Dependency injection passes dependencies to a class rather than having the class create them. This inverts control, making code more testable (you can inject mocks) and more flexible (swap implementations without changing the class).",
      },
      {
        id: "se-clean-q3",
        question: "Why is premature optimization considered harmful?",
        options: [
          "It makes code slower",
          "It increases complexity without evidence that the optimization is needed, often sacrificing readability",
          "It breaks the compiler",
          "It uses too much memory",
        ],
        correctIndex: 1,
        explanation:
          "As Knuth said, 'premature optimization is the root of all evil.' Optimizing before profiling wastes effort on non-bottlenecks while making code harder to understand and maintain. Measure first, then optimize the proven hot spots.",
      },
    ],
  },
  {
    domainSlug: "software-engineering",
    topicSlug: "testing",
    questions: [
      {
        id: "se-testing-q1",
        question:
          "What is the testing pyramid, from bottom to top?",
        options: [
          "E2E tests → Integration tests → Unit tests",
          "Unit tests → Integration tests → E2E tests",
          "Manual tests → Automated tests → Unit tests",
          "Performance tests → Security tests → Unit tests",
        ],
        correctIndex: 1,
        explanation:
          "The testing pyramid suggests having many fast unit tests at the base, fewer integration tests in the middle, and the fewest (but most comprehensive) end-to-end tests at the top. This balances coverage, speed, and maintenance cost.",
      },
      {
        id: "se-testing-q2",
        question: "What is the difference between a mock and a stub?",
        options: [
          "They are the same",
          "A stub provides canned responses; a mock also verifies that specific interactions occurred",
          "A mock is for databases; a stub is for APIs",
          "Stubs are faster than mocks",
        ],
        correctIndex: 1,
        explanation:
          "Stubs provide predetermined responses without behavior verification — they just make the test work. Mocks additionally verify that specific methods were called with expected arguments. Both are test doubles that replace real dependencies.",
      },
      {
        id: "se-testing-q3",
        question:
          "What is test-driven development (TDD)?",
        options: [
          "Writing tests after the code is complete",
          "Writing a failing test first, then writing the minimum code to pass it, then refactoring",
          "Having QA write all tests",
          "Using only unit tests",
        ],
        correctIndex: 1,
        explanation:
          "TDD follows the Red-Green-Refactor cycle: write a failing test (Red), write the simplest code to pass it (Green), then improve the code while keeping tests passing (Refactor). This drives design and ensures high test coverage.",
      },
    ],
  },
  {
    domainSlug: "software-engineering",
    topicSlug: "system-design",
    questions: [
      {
        id: "se-sysdesign-q1",
        question: "What is horizontal scaling vs vertical scaling?",
        options: [
          "Horizontal = bigger server; Vertical = more servers",
          "Horizontal = adding more servers; Vertical = upgrading to a bigger server",
          "They mean the same thing",
          "Horizontal = scaling storage; Vertical = scaling compute",
        ],
        correctIndex: 1,
        explanation:
          "Horizontal scaling (scale out) adds more machines to distribute load. Vertical scaling (scale up) upgrades a single machine's resources. Horizontal scaling offers better fault tolerance and theoretically unlimited growth but adds complexity (load balancing, data consistency).",
      },
      {
        id: "se-sysdesign-q2",
        question: "What is a load balancer?",
        options: [
          "A device that reduces server CPU usage",
          "A system that distributes incoming requests across multiple servers",
          "A database optimization tool",
          "A caching layer",
        ],
        correctIndex: 1,
        explanation:
          "A load balancer sits between clients and a server pool, distributing traffic using algorithms like round robin, least connections, or IP hash. It provides high availability (failover if a server dies) and horizontal scalability.",
      },
      {
        id: "se-sysdesign-q3",
        question:
          "What is the purpose of a message queue in system architecture?",
        options: [
          "To speed up database queries",
          "To decouple producers and consumers, enabling asynchronous processing and load buffering",
          "To encrypt messages",
          "To replace API calls",
        ],
        correctIndex: 1,
        explanation:
          "Message queues (Kafka, RabbitMQ, SQS) decouple services: producers publish messages and consumers process them independently. This enables async processing, load leveling, and fault tolerance — if a consumer is down, messages queue up for later processing.",
      },
    ],
  },
  {
    domainSlug: "software-engineering",
    topicSlug: "distributed-systems",
    questions: [
      {
        id: "se-distributed-q1",
        question: "What is consensus in distributed systems?",
        options: [
          "All nodes agreeing to use the same programming language",
          "Getting multiple nodes to agree on a single value or decision despite failures",
          "Load balancing requests",
          "Synchronizing clocks",
        ],
        correctIndex: 1,
        explanation:
          "Consensus is the fundamental problem of getting distributed nodes to agree on a value. Algorithms like Raft and Paxos solve this even when some nodes crash. Consensus is essential for leader election, log replication, and distributed transactions.",
      },
      {
        id: "se-distributed-q2",
        question:
          "What is the Two Generals' Problem?",
        options: [
          "A scheduling algorithm",
          "A proof that reliable communication over unreliable channels is impossible to guarantee",
          "A load balancing strategy",
          "A database sharding technique",
        ],
        correctIndex: 1,
        explanation:
          "The Two Generals' Problem shows that no protocol can guarantee agreement between two parties over an unreliable channel. This fundamental impossibility result explains why distributed systems use probabilistic approaches and can never achieve 100% agreement guarantees.",
      },
      {
        id: "se-distributed-q3",
        question: "What is idempotency, and why does it matter for distributed systems?",
        options: [
          "A type of encryption",
          "An operation that produces the same result regardless of how many times it's executed",
          "A caching strategy",
          "A way to reduce latency",
        ],
        correctIndex: 1,
        explanation:
          "An idempotent operation has the same effect whether executed once or many times. In distributed systems, network failures cause retries — without idempotency, retrying a payment could charge a user twice. PUT and DELETE are idempotent by design; POST is not.",
      },
    ],
  },

  // ── Cloud & DevOps ────────────────────────────────────────────
  {
    domainSlug: "cloud-devops",
    topicSlug: "docker",
    questions: [
      {
        id: "cloud-docker-q1",
        question:
          "What is the difference between a Docker image and a container?",
        options: [
          "They are the same thing",
          "An image is a read-only template; a container is a running instance of an image",
          "A container is larger than an image",
          "An image is only used for development",
        ],
        correctIndex: 1,
        explanation:
          "A Docker image is an immutable blueprint containing the application code, runtime, libraries, and configuration. A container is a running instance of an image with its own writable layer. Multiple containers can run from the same image.",
      },
      {
        id: "cloud-docker-q2",
        question: "What is a multi-stage Docker build used for?",
        options: [
          "Running multiple containers at once",
          "Creating smaller final images by separating build dependencies from runtime",
          "Building for multiple operating systems",
          "Running tests automatically",
        ],
        correctIndex: 1,
        explanation:
          "Multi-stage builds use multiple FROM statements. Build tools, compilers, and dev dependencies are used in early stages, and only the final artifacts are copied to the slim production stage. This dramatically reduces final image size.",
      },
      {
        id: "cloud-docker-q3",
        question: "What is a Docker volume used for?",
        options: [
          "Increasing container CPU",
          "Persisting data beyond the container's lifecycle",
          "Speeding up network access",
          "Managing container permissions",
        ],
        correctIndex: 1,
        explanation:
          "Docker volumes provide persistent storage that survives container restarts and removal. Container filesystems are ephemeral — when a container is deleted, its writable layer is lost. Volumes mount host or managed storage into the container.",
      },
    ],
  },
  {
    domainSlug: "cloud-devops",
    topicSlug: "kubernetes",
    questions: [
      {
        id: "cloud-k8s-q1",
        question: "What is a Kubernetes Pod?",
        options: [
          "A virtual machine",
          "The smallest deployable unit, containing one or more co-located containers",
          "A network load balancer",
          "A storage volume",
        ],
        correctIndex: 1,
        explanation:
          "A Pod is the atomic unit in Kubernetes — one or more containers that share networking (same IP), storage, and lifecycle. Typically one container per Pod, but sidecar patterns use multi-container Pods for logging, proxying, etc.",
      },
      {
        id: "cloud-k8s-q2",
        question: "What does a Kubernetes Service do?",
        options: [
          "Runs a single container",
          "Provides stable networking (DNS name, IP) to a set of Pods selected by labels",
          "Manages secrets",
          "Builds container images",
        ],
        correctIndex: 1,
        explanation:
          "A Service gives Pods a stable endpoint. Pods are ephemeral (they get new IPs on restart), so a Service provides a consistent DNS name and load-balances traffic across matching Pods using label selectors.",
      },
      {
        id: "cloud-k8s-q3",
        question: "What is the purpose of a Kubernetes Deployment?",
        options: [
          "To create a database",
          "To declaratively manage Pod replicas, handle rolling updates, and enable rollbacks",
          "To expose Pods externally",
          "To manage storage",
        ],
        correctIndex: 1,
        explanation:
          "A Deployment manages ReplicaSets, which manage Pods. You declare the desired state (image, replicas, resources) and the Deployment controller handles rolling updates, scaling, and rollbacks automatically.",
      },
    ],
  },
  {
    domainSlug: "cloud-devops",
    topicSlug: "ci-cd",
    questions: [
      {
        id: "cloud-cicd-q1",
        question:
          "What is the difference between Continuous Integration and Continuous Deployment?",
        options: [
          "They are the same",
          "CI automatically builds and tests code on each commit; CD automatically deploys passing builds to production",
          "CI is for frontend; CD is for backend",
          "CD happens before CI",
        ],
        correctIndex: 1,
        explanation:
          "CI merges developer changes frequently, running automated builds and tests. CD extends this by automatically deploying successful builds. Continuous Delivery (also CD) requires a manual approval step before production deployment.",
      },
      {
        id: "cloud-cicd-q2",
        question: "What is a CI/CD pipeline artifact?",
        options: [
          "A source code file",
          "A file produced by the pipeline that is passed between stages or stored for deployment",
          "A git branch",
          "A test case",
        ],
        correctIndex: 1,
        explanation:
          "Pipeline artifacts are outputs from stages — compiled binaries, test reports, Docker images, deployment packages. They're stored between stages so the deploy stage can use what the build stage produced without rebuilding.",
      },
      {
        id: "cloud-cicd-q3",
        question: "What is a blue-green deployment?",
        options: [
          "Deploying to two data centers",
          "Running two identical production environments and switching traffic to the new one after verification",
          "A color-coded logging strategy",
          "Deploying on certain days of the week",
        ],
        correctIndex: 1,
        explanation:
          "Blue-green deployment maintains two identical environments. Traffic goes to 'blue' while 'green' gets the update. After verification, traffic switches to 'green'. If issues arise, switch back instantly. This enables zero-downtime deployments with instant rollback.",
      },
    ],
  },
  {
    domainSlug: "cloud-devops",
    topicSlug: "cloud-fundamentals",
    questions: [
      {
        id: "cloud-fundamentals-q1",
        question:
          "What is the shared responsibility model in cloud computing?",
        options: [
          "The cloud provider handles everything",
          "The provider secures infrastructure; the customer secures their data, apps, and configurations",
          "The customer manages all hardware",
          "Security is optional in the cloud",
        ],
        correctIndex: 1,
        explanation:
          "In the shared responsibility model, the cloud provider secures the underlying infrastructure (physical, network, hypervisor). The customer is responsible for their data, IAM, application security, OS patching (for IaaS), and encryption. The boundary shifts with IaaS vs PaaS vs SaaS.",
      },
      {
        id: "cloud-fundamentals-q2",
        question: "What is the difference between IaaS, PaaS, and SaaS?",
        options: [
          "They all offer the same level of abstraction",
          "IaaS provides infrastructure, PaaS provides a platform for development, SaaS provides complete applications",
          "SaaS is the lowest level",
          "PaaS is only for mobile apps",
        ],
        correctIndex: 1,
        explanation:
          "IaaS (EC2, GCE) gives you VMs and networking. PaaS (Heroku, App Engine) manages the runtime, so you just deploy code. SaaS (Gmail, Slack) provides finished applications. Each level abstracts away more infrastructure management.",
      },
      {
        id: "cloud-fundamentals-q3",
        question: "What is an availability zone in cloud infrastructure?",
        options: [
          "A geographic region",
          "An isolated data center or group of data centers within a region, with independent power and networking",
          "A pricing tier",
          "A network security zone",
        ],
        correctIndex: 1,
        explanation:
          "An availability zone (AZ) is one or more discrete data centers with redundant power, networking, and connectivity within a region. Deploying across multiple AZs provides fault tolerance — if one AZ goes down, your application continues running in others.",
      },
    ],
  },
  {
    domainSlug: "cloud-devops",
    topicSlug: "infrastructure-as-code",
    questions: [
      {
        id: "cloud-iac-q1",
        question: "What is Infrastructure as Code (IaC)?",
        options: [
          "Writing code that runs on servers",
          "Managing and provisioning infrastructure through machine-readable definition files instead of manual processes",
          "Using code editors for server configuration",
          "A type of version control",
        ],
        correctIndex: 1,
        explanation:
          "IaC treats infrastructure (servers, networks, load balancers) as code — version controlled, reviewed, tested, and repeatable. Tools like Terraform, Pulumi, and CloudFormation let you define desired state and automatically provision resources.",
      },
      {
        id: "cloud-iac-q2",
        question:
          "What is the difference between declarative and imperative IaC?",
        options: [
          "No difference",
          "Declarative describes the desired end state; imperative specifies the exact steps to reach it",
          "Imperative is always better",
          "Declarative is only for containers",
        ],
        correctIndex: 1,
        explanation:
          "Declarative IaC (Terraform, CloudFormation) says 'I want 3 servers with these specs' and the tool figures out how to get there. Imperative (scripts, Pulumi) specifies exact commands to run. Declarative is easier to reason about but less flexible for complex logic.",
      },
      {
        id: "cloud-iac-q3",
        question: "What is Terraform state?",
        options: [
          "The configuration files you write",
          "A record of the real-world resources Terraform manages, used to plan changes",
          "A list of Terraform commands",
          "A backup of your infrastructure",
        ],
        correctIndex: 1,
        explanation:
          "Terraform state maps your configuration to real resources. When you run 'terraform plan', it compares desired state (config) against current state (state file) to determine what changes are needed. State should be stored remotely (S3, GCS) for team collaboration.",
      },
    ],
  },
  {
    domainSlug: "cloud-devops",
    topicSlug: "observability",
    questions: [
      {
        id: "cloud-observability-q1",
        question:
          "What are the three pillars of observability?",
        options: [
          "Speed, security, scalability",
          "Logs, metrics, and traces",
          "CPU, memory, and disk",
          "Testing, monitoring, and alerting",
        ],
        correctIndex: 1,
        explanation:
          "The three pillars are: Logs (discrete events with context), Metrics (aggregated numerical measurements over time), and Traces (end-to-end request journeys through distributed systems). Together they provide complete system visibility.",
      },
      {
        id: "cloud-observability-q2",
        question: "What is distributed tracing?",
        options: [
          "Debugging code locally",
          "Following a single request as it traverses multiple services, recording timing and metadata at each hop",
          "Tracing network packets",
          "Logging all database queries",
        ],
        correctIndex: 1,
        explanation:
          "Distributed tracing (OpenTelemetry, Jaeger, Zipkin) assigns a trace ID to each request and propagates it across services. Each service creates spans showing what it did and how long it took, creating a timeline view of the full request lifecycle.",
      },
      {
        id: "cloud-observability-q3",
        question: "What is an SLO (Service Level Objective)?",
        options: [
          "A legal contract with customers",
          "A target reliability metric that a service aims to meet, like 99.9% availability",
          "A software license",
          "A development methodology",
        ],
        correctIndex: 1,
        explanation:
          "SLOs define target reliability levels for SLIs (Service Level Indicators) like availability, latency, or error rate. SLAs are contractual; SLOs are internal targets. Error budgets (100% - SLO) determine how much unreliability is acceptable before prioritizing reliability work.",
      },
    ],
  },

  // ── Cybersecurity ─────────────────────────────────────────────
  {
    domainSlug: "cybersecurity",
    topicSlug: "cybersecurity-fundamentals",
    questions: [
      {
        id: "security-fundamentals-q1",
        question: "What does the CIA triad stand for in information security?",
        options: [
          "Central Intelligence Agency",
          "Confidentiality, Integrity, Availability",
          "Control, Identity, Authentication",
          "Cryptography, Isolation, Authorization",
        ],
        correctIndex: 1,
        explanation:
          "The CIA triad is the foundation of information security: Confidentiality (data is only accessible to authorized parties), Integrity (data is accurate and unaltered), Availability (systems and data are accessible when needed).",
      },
      {
        id: "security-fundamentals-q2",
        question: "What is the principle of least privilege?",
        options: [
          "Giving all users admin access for convenience",
          "Granting users only the minimum permissions needed to perform their tasks",
          "Restricting internet access",
          "Using the simplest password possible",
        ],
        correctIndex: 1,
        explanation:
          "Least privilege limits each user, process, and system to the minimum access needed. This reduces attack surface — if an account is compromised, the damage is limited to what that account could do. It's fundamental to defense in depth.",
      },
      {
        id: "security-fundamentals-q3",
        question: "What is defense in depth?",
        options: [
          "Using a single very strong firewall",
          "Layering multiple security controls so that if one fails, others still protect the system",
          "Hiding security vulnerabilities",
          "Using only encryption",
        ],
        correctIndex: 1,
        explanation:
          "Defense in depth uses multiple overlapping security layers: network firewalls, intrusion detection, access controls, encryption, application security, physical security. No single layer is perfect, but together they create robust protection.",
      },
    ],
  },
  {
    domainSlug: "cybersecurity",
    topicSlug: "cryptography",
    questions: [
      {
        id: "security-crypto-q1",
        question:
          "What is the difference between symmetric and asymmetric encryption?",
        options: [
          "Symmetric is stronger",
          "Symmetric uses one shared key; asymmetric uses a public/private key pair",
          "Asymmetric is faster",
          "They are identical",
        ],
        correctIndex: 1,
        explanation:
          "Symmetric encryption (AES) uses the same key for encryption and decryption — fast but requires secure key exchange. Asymmetric (RSA, ECC) uses a public key for encryption and a private key for decryption, solving the key distribution problem but being slower.",
      },
      {
        id: "security-crypto-q2",
        question: "What is a hash function used for in security?",
        options: [
          "Encrypting files for storage",
          "Creating a fixed-size fingerprint of data that is practically impossible to reverse",
          "Compressing data",
          "Generating random numbers",
        ],
        correctIndex: 1,
        explanation:
          "Cryptographic hash functions (SHA-256, bcrypt) produce a fixed-size digest from any input. They are one-way (can't reverse), deterministic (same input → same output), and collision-resistant. Used for password storage, data integrity verification, and digital signatures.",
      },
      {
        id: "security-crypto-q3",
        question: "Why should you never use MD5 for password hashing?",
        options: [
          "It's too slow",
          "It's fast and vulnerable to brute-force attacks, and has known collision vulnerabilities",
          "It produces hashes that are too long",
          "It requires a license",
        ],
        correctIndex: 1,
        explanation:
          "MD5 is extremely fast (bad for passwords — enables rapid brute-forcing), has known collision attacks, and isn't salted by default. Use bcrypt, scrypt, or Argon2 instead — they're deliberately slow and memory-hard to resist attacks.",
      },
    ],
  },
  {
    domainSlug: "cybersecurity",
    topicSlug: "web-security",
    questions: [
      {
        id: "security-web-q1",
        question: "What is Cross-Site Scripting (XSS)?",
        options: [
          "A server-side SQL attack",
          "Injecting malicious scripts into web pages viewed by other users",
          "A denial of service attack",
          "Breaking encryption",
        ],
        correctIndex: 1,
        explanation:
          "XSS occurs when an attacker injects client-side scripts into web content. Stored XSS persists in the database; Reflected XSS comes from URLs; DOM XSS manipulates the page's DOM. Prevention: sanitize output, use CSP headers, and encode HTML entities.",
      },
      {
        id: "security-web-q2",
        question: "What is SQL injection, and how do you prevent it?",
        options: [
          "A database optimization technique",
          "Inserting malicious SQL through user input; prevent with parameterized queries",
          "A way to speed up queries",
          "A database backup strategy",
        ],
        correctIndex: 1,
        explanation:
          "SQL injection occurs when user input is concatenated into SQL queries, allowing attackers to modify the query logic. Prevention: always use parameterized/prepared statements, ORMs, or stored procedures — never concatenate user input into SQL strings.",
      },
      {
        id: "security-web-q3",
        question: "What is CSRF (Cross-Site Request Forgery)?",
        options: [
          "Forging SSL certificates",
          "Tricking a user's browser into making authenticated requests to a site the user is logged into",
          "Creating fake websites",
          "Breaking password hashes",
        ],
        correctIndex: 1,
        explanation:
          "CSRF exploits the browser's automatic inclusion of cookies. An attacker's page triggers a request to a site where the user is authenticated. Prevention: CSRF tokens (unique per session/request), SameSite cookie attribute, and checking Origin/Referer headers.",
      },
    ],
  },
  {
    domainSlug: "cybersecurity",
    topicSlug: "network-security",
    questions: [
      {
        id: "security-network-q1",
        question: "What is a man-in-the-middle (MITM) attack?",
        options: [
          "A physical attack on servers",
          "An attacker intercepting communication between two parties, potentially altering data",
          "A denial of service attack",
          "A brute-force password attack",
        ],
        correctIndex: 1,
        explanation:
          "MITM attacks intercept traffic between two parties, allowing the attacker to eavesdrop or alter data. TLS/HTTPS prevents this with encryption and certificate verification. ARP spoofing and DNS hijacking can facilitate MITM attacks on local networks.",
      },
      {
        id: "security-network-q2",
        question:
          "What is the purpose of a firewall?",
        options: [
          "To speed up network traffic",
          "To filter network traffic based on predefined rules, blocking unauthorized access",
          "To encrypt all data",
          "To replace antivirus software",
        ],
        correctIndex: 1,
        explanation:
          "Firewalls examine incoming and outgoing traffic against security rules, allowing or blocking based on source/destination IP, ports, protocols, and application data (for application-layer firewalls). They form a perimeter defense but are not sufficient alone.",
      },
      {
        id: "security-network-q3",
        question: "What is a VPN?",
        options: [
          "A type of antivirus",
          "A Virtual Private Network that creates an encrypted tunnel between your device and a server",
          "A faster internet connection",
          "A type of firewall",
        ],
        correctIndex: 1,
        explanation:
          "A VPN creates an encrypted tunnel over public networks, protecting data in transit and masking your IP address. Corporate VPNs provide secure remote access to internal networks. VPN protocols include WireGuard, OpenVPN, and IPSec.",
      },
    ],
  },
  {
    domainSlug: "cybersecurity",
    topicSlug: "offensive-security",
    questions: [
      {
        id: "security-offensive-q1",
        question: "What is the first phase of a penetration test?",
        options: [
          "Exploitation",
          "Reconnaissance — gathering information about the target",
          "Report writing",
          "Installing backdoors",
        ],
        correctIndex: 1,
        explanation:
          "Reconnaissance (recon) is the information-gathering phase: identifying IP ranges, subdomains, technologies, employees, and potential entry points. Passive recon uses public info (OSINT); active recon directly probes the target. Good recon is the foundation of effective testing.",
      },
      {
        id: "security-offensive-q2",
        question: "What is privilege escalation?",
        options: [
          "Getting faster internet",
          "Exploiting a vulnerability to gain higher-level permissions than initially obtained",
          "Installing a firewall",
          "Creating a new user account",
        ],
        correctIndex: 1,
        explanation:
          "Privilege escalation (privesc) is gaining higher access after initial compromise. Vertical privesc goes from user to admin/root. Horizontal privesc accesses another user's account. Common vectors: misconfigurations, SUID binaries, kernel exploits, and credential reuse.",
      },
      {
        id: "security-offensive-q3",
        question: "What is a reverse shell?",
        options: [
          "A shell that runs commands in reverse order",
          "A connection where the target machine connects back to the attacker, providing shell access",
          "A shell that decrypts data",
          "A backup terminal",
        ],
        correctIndex: 1,
        explanation:
          "A reverse shell has the target initiate an outbound connection to the attacker's machine, bypassing inbound firewall rules. The attacker sets up a listener, and the target connects back, providing interactive command-line access to the compromised system.",
      },
    ],
  },

  // ── AI & ML ───────────────────────────────────────────────────
  {
    domainSlug: "ai-ml",
    topicSlug: "machine-learning",
    questions: [
      {
        id: "ai-ml-q1",
        question:
          "What is the difference between supervised and unsupervised learning?",
        options: [
          "Supervised is faster",
          "Supervised uses labeled data; unsupervised finds patterns in unlabeled data",
          "Unsupervised is more accurate",
          "They require the same data",
        ],
        correctIndex: 1,
        explanation:
          "Supervised learning trains on input-output pairs (labeled data) to learn a mapping function (classification, regression). Unsupervised learning discovers hidden structure in unlabeled data (clustering, dimensionality reduction). Semi-supervised combines both.",
      },
      {
        id: "ai-ml-q2",
        question: "What is overfitting?",
        options: [
          "A model that trains too quickly",
          "A model that performs well on training data but poorly on unseen data",
          "A model with too few parameters",
          "A data preprocessing error",
        ],
        correctIndex: 1,
        explanation:
          "Overfitting occurs when a model memorizes training data noise instead of learning generalizable patterns. Signs: high training accuracy, low validation accuracy. Prevention: regularization, dropout, cross-validation, more data, and simpler models.",
      },
      {
        id: "ai-ml-q3",
        question: "What is the bias-variance tradeoff?",
        options: [
          "Choosing between CPU and GPU training",
          "The tension between underfitting (high bias) and overfitting (high variance) in model complexity",
          "The tradeoff between training speed and accuracy",
          "Balancing data collection and model training",
        ],
        correctIndex: 1,
        explanation:
          "Bias is error from simplifying assumptions (underfitting). Variance is error from sensitivity to training data fluctuations (overfitting). More complex models reduce bias but increase variance. The sweet spot minimizes total error (bias² + variance).",
      },
    ],
  },
  {
    domainSlug: "ai-ml",
    topicSlug: "deep-learning",
    questions: [
      {
        id: "ai-dl-q1",
        question: "What is backpropagation?",
        options: [
          "A data preprocessing technique",
          "An algorithm that computes gradients of the loss function with respect to weights, layer by layer",
          "A way to initialize weights",
          "A type of neural network architecture",
        ],
        correctIndex: 1,
        explanation:
          "Backpropagation applies the chain rule to efficiently compute gradients of the loss with respect to each weight, propagating error signals backward through the network. These gradients are used by optimizers (SGD, Adam) to update weights and minimize loss.",
      },
      {
        id: "ai-dl-q2",
        question: "What problem does the ReLU activation function solve?",
        options: [
          "Overfitting",
          "The vanishing gradient problem that occurs with sigmoid/tanh in deep networks",
          "Data normalization",
          "Feature selection",
        ],
        correctIndex: 1,
        explanation:
          "ReLU (f(x) = max(0, x)) has a constant gradient of 1 for positive values, preventing gradients from shrinking to near-zero in deep networks (vanishing gradient). Sigmoid/tanh saturate for large values, causing gradient flow to diminish in early layers.",
      },
      {
        id: "ai-dl-q3",
        question: "What is a convolutional neural network (CNN) best suited for?",
        options: [
          "Time series prediction",
          "Image and spatial data processing, due to its ability to learn local patterns",
          "Text generation",
          "Reinforcement learning",
        ],
        correctIndex: 1,
        explanation:
          "CNNs use convolutional filters that slide over spatial data to detect local features (edges, textures, objects) at multiple scales. Parameter sharing makes them efficient for images. Key components: convolutional layers, pooling layers, and fully connected layers.",
      },
    ],
  },
  {
    domainSlug: "ai-ml",
    topicSlug: "nlp-llms",
    questions: [
      {
        id: "ai-nlp-q1",
        question: "What is the Transformer architecture's key innovation?",
        options: [
          "Recurrent connections",
          "Self-attention mechanism that allows parallel processing of all positions in a sequence",
          "Convolutional layers for text",
          "Rule-based parsing",
        ],
        correctIndex: 1,
        explanation:
          "The Transformer (Vaswani et al., 2017) replaces recurrence with self-attention, computing relationships between all positions simultaneously. This enables parallelization during training, capturing long-range dependencies better than RNNs/LSTMs. It's the foundation of GPT, BERT, and modern LLMs.",
      },
      {
        id: "ai-nlp-q2",
        question: "What is tokenization in NLP?",
        options: [
          "Encrypting text",
          "Breaking text into smaller units (words, subwords, or characters) for model processing",
          "Translating text between languages",
          "Removing stop words",
        ],
        correctIndex: 1,
        explanation:
          "Tokenization converts raw text into tokens the model can process. Modern LLMs use subword tokenization (BPE, WordPiece) that balances vocabulary size with the ability to represent any text, including rare words and new terms, by breaking them into known subword pieces.",
      },
      {
        id: "ai-nlp-q3",
        question: "What is RAG (Retrieval-Augmented Generation)?",
        options: [
          "A training technique for LLMs",
          "Combining a retrieval system with an LLM to ground responses in external knowledge",
          "A way to compress models",
          "A type of fine-tuning",
        ],
        correctIndex: 1,
        explanation:
          "RAG retrieves relevant documents from a knowledge base (using embeddings + vector search) and includes them in the LLM prompt. This grounds responses in factual, up-to-date information without retraining, reducing hallucinations and enabling domain-specific answers.",
      },
    ],
  },
  {
    domainSlug: "ai-ml",
    topicSlug: "data-engineering",
    questions: [
      {
        id: "ai-dataeng-q1",
        question: "What is an ETL pipeline?",
        options: [
          "A machine learning model",
          "Extract, Transform, Load — a process for moving data from sources to a destination with transformations",
          "A type of database index",
          "A network protocol",
        ],
        correctIndex: 1,
        explanation:
          "ETL extracts data from various sources (APIs, databases, files), transforms it (cleaning, aggregating, joining), and loads it into a destination (data warehouse, data lake). ELT reverses the last two steps, loading raw data first and transforming in the warehouse.",
      },
      {
        id: "ai-dataeng-q2",
        question: "What is a data lake vs a data warehouse?",
        options: [
          "They are the same",
          "A data lake stores raw, unstructured data; a data warehouse stores structured, processed data optimized for queries",
          "A data warehouse is always larger",
          "A data lake is more expensive",
        ],
        correctIndex: 1,
        explanation:
          "Data lakes (S3, ADLS) store raw data in any format (structured, semi-structured, unstructured) at low cost, schema-on-read. Data warehouses (Snowflake, BigQuery, Redshift) store curated, schema-on-write data optimized for analytical queries.",
      },
      {
        id: "ai-dataeng-q3",
        question: "What is Apache Kafka used for?",
        options: [
          "Machine learning training",
          "Real-time event streaming and message queuing for high-throughput data pipelines",
          "Static website hosting",
          "Database management",
        ],
        correctIndex: 1,
        explanation:
          "Kafka is a distributed event streaming platform that handles high-throughput, fault-tolerant data feeds. Producers publish events to topics; consumers subscribe and process them. It's used for log aggregation, real-time analytics, event sourcing, and data pipeline integration.",
      },
    ],
  },
  {
    domainSlug: "ai-ml",
    topicSlug: "ai-engineering",
    questions: [
      {
        id: "ai-eng-q1",
        question: "What is prompt engineering?",
        options: [
          "Training a new LLM from scratch",
          "Crafting input text to guide an LLM toward desired outputs without changing model weights",
          "Building hardware for AI",
          "Writing unit tests for AI models",
        ],
        correctIndex: 1,
        explanation:
          "Prompt engineering designs inputs (system prompts, few-shot examples, structured instructions) to elicit better responses from LLMs. Techniques include chain-of-thought prompting, few-shot learning, role-playing, and output formatting instructions.",
      },
      {
        id: "ai-eng-q2",
        question: "What is fine-tuning an LLM?",
        options: [
          "Using the model without any changes",
          "Further training a pre-trained model on a specific dataset to adapt it for a particular task or domain",
          "Reducing the model's size",
          "Running the model on a GPU",
        ],
        correctIndex: 1,
        explanation:
          "Fine-tuning takes a pre-trained model and trains it further on task-specific data, adjusting weights for better performance on that task. Techniques like LoRA (Low-Rank Adaptation) enable efficient fine-tuning by training only a small number of additional parameters.",
      },
      {
        id: "ai-eng-q3",
        question: "What are embeddings in the context of AI?",
        options: [
          "Physical components in AI hardware",
          "Dense vector representations of data (text, images) that capture semantic meaning in continuous space",
          "Database indexes",
          "Encryption keys",
        ],
        correctIndex: 1,
        explanation:
          "Embeddings map discrete data (words, sentences, images) to dense vectors where semantic similarity corresponds to geometric proximity. Used in search (vector databases), recommendations, clustering, and RAG systems. Models like text-embedding-3 produce text embeddings.",
      },
    ],
  },

  // ── App Development (mobile-dev) ──────────────────────────────
  {
    domainSlug: "mobile-dev",
    topicSlug: "mobile-dev",
    questions: [
      {
        id: "mobile-dev-q1",
        question:
          "What is the difference between native and hybrid mobile development?",
        options: [
          "Native is always slower",
          "Native uses platform-specific languages (Swift/Kotlin); hybrid uses web technologies or cross-platform frameworks",
          "Hybrid apps can't access device APIs",
          "There is no real difference",
        ],
        correctIndex: 1,
        explanation:
          "Native development uses platform SDKs (Swift/SwiftUI for iOS, Kotlin/Jetpack Compose for Android) for maximum performance and platform integration. Hybrid/cross-platform (React Native, Flutter) shares code across platforms but may sacrifice some native feel or performance.",
      },
      {
        id: "mobile-dev-q2",
        question: "What is a mobile app's lifecycle?",
        options: [
          "The development process from design to deployment",
          "The states an app transitions through: inactive, active, background, suspended, terminated",
          "The app's version history",
          "The UI rendering pipeline",
        ],
        correctIndex: 1,
        explanation:
          "Mobile apps transition between states as users interact. Understanding lifecycle events (viewDidLoad, onResume, onPause) is crucial for saving state, releasing resources, handling interruptions (calls, notifications), and providing a smooth user experience.",
      },
      {
        id: "mobile-dev-q3",
        question: "What is a responsive vs adaptive mobile layout?",
        options: [
          "They are identical concepts",
          "Responsive fluidly adjusts to any screen size; adaptive uses predefined layouts for specific breakpoints",
          "Adaptive is only for tablets",
          "Responsive doesn't work on phones",
        ],
        correctIndex: 1,
        explanation:
          "Responsive design uses flexible grids, fluid images, and CSS media queries to smoothly adapt to any screen size. Adaptive design detects the device and serves specific predefined layouts. Modern approaches often combine both strategies.",
      },
    ],
  },
  {
    domainSlug: "mobile-dev",
    topicSlug: "cross-platform",
    questions: [
      {
        id: "mobile-crossplat-q1",
        question: "How does React Native differ from a WebView-based hybrid app?",
        options: [
          "They are the same",
          "React Native renders actual native UI components; WebView apps render HTML in an embedded browser",
          "WebView apps are faster",
          "React Native can only target iOS",
        ],
        correctIndex: 1,
        explanation:
          "React Native uses a JavaScript bridge to create actual native UI components (UIButton, TextView), giving near-native performance and feel. WebView-based apps (Cordova, Ionic) render HTML/CSS inside a browser component, which can feel less native and perform worse.",
      },
      {
        id: "mobile-crossplat-q2",
        question: "What rendering approach does Flutter use?",
        options: [
          "Native UI components via a bridge",
          "A custom rendering engine (Skia) that draws every pixel directly",
          "HTML rendering in a WebView",
          "System web components",
        ],
        correctIndex: 1,
        explanation:
          "Flutter uses the Skia graphics engine to paint every pixel directly to a canvas, bypassing platform UI frameworks entirely. This gives pixel-perfect consistency across platforms but means Flutter widgets don't look exactly like native widgets by default.",
      },
      {
        id: "mobile-crossplat-q3",
        question: "What is a common disadvantage of cross-platform development?",
        options: [
          "It's always more expensive",
          "Platform-specific features and optimizations may require native code bridges, adding complexity",
          "It can't access the camera",
          "It doesn't support offline mode",
        ],
        correctIndex: 1,
        explanation:
          "Cross-platform frameworks can't always keep up with the latest platform-specific APIs. Accessing new iOS/Android features often requires writing native modules/bridges, partially defeating the 'write once' benefit. Performance-critical features may also need native optimization.",
      },
    ],
  },
  {
    domainSlug: "mobile-dev",
    topicSlug: "desktop-dev",
    questions: [
      {
        id: "mobile-desktop-q1",
        question: "What is Electron, and what is its main tradeoff?",
        options: [
          "A native desktop framework with no downsides",
          "A framework that packages web apps as desktop apps using Chromium; the tradeoff is high memory/disk usage",
          "A mobile-first framework",
          "A database for desktop apps",
        ],
        correctIndex: 1,
        explanation:
          "Electron bundles a Chromium browser and Node.js runtime to run web apps as desktop apps (VS Code, Slack, Discord). The benefit is code reuse with web technologies. The cost is significant memory overhead (~100MB+) and large app size from bundling Chromium.",
      },
      {
        id: "mobile-desktop-q2",
        question: "What advantage does Tauri have over Electron?",
        options: [
          "Better JavaScript support",
          "Uses the OS's native webview instead of bundling Chromium, resulting in much smaller and lighter apps",
          "More plugins available",
          "Faster development time",
        ],
        correctIndex: 1,
        explanation:
          "Tauri uses the operating system's built-in webview (WebKit on macOS, WebView2 on Windows) and a Rust backend instead of bundling Chromium. This produces apps that are typically 600KB-10MB vs Electron's 150MB+, with lower memory usage.",
      },
      {
        id: "mobile-desktop-q3",
        question: "What is IPC (Inter-Process Communication) in desktop apps?",
        options: [
          "Internet Protocol Communication",
          "The mechanism for the UI process and backend process to exchange messages and data",
          "Image Processing Container",
          "A rendering optimization",
        ],
        correctIndex: 1,
        explanation:
          "In Electron and Tauri, the frontend (renderer process) and backend (main process/Rust) run separately for security. IPC channels let them communicate safely — the frontend sends requests, and the backend handles system operations like file access and native APIs.",
      },
    ],
  },

  // ── Languages ─────────────────────────────────────────────────
  {
    domainSlug: "languages",
    topicSlug: "javascript-typescript",
    questions: [
      {
        id: "lang-js-q1",
        question: "What is the JavaScript event loop?",
        options: [
          "A for loop that processes events",
          "A mechanism that processes callbacks from a task queue after the call stack is empty, enabling async behavior",
          "A DOM event handler",
          "A way to loop through arrays",
        ],
        correctIndex: 1,
        explanation:
          "JavaScript is single-threaded. The event loop checks if the call stack is empty, then dequeues tasks from the macro/microtask queues. This enables non-blocking I/O: async operations (setTimeout, fetch, I/O) queue callbacks for later execution without blocking the main thread.",
      },
      {
        id: "lang-js-q2",
        question: "What does TypeScript add on top of JavaScript?",
        options: [
          "Runtime performance improvements",
          "Static type checking at compile time, catching errors before code runs",
          "New runtime APIs",
          "A different execution engine",
        ],
        correctIndex: 1,
        explanation:
          "TypeScript adds a static type system that catches type errors during development (before runtime). It compiles to plain JavaScript — all types are erased at runtime. Benefits include better IDE support, self-documenting code, and safer refactoring.",
      },
      {
        id: "lang-js-q3",
        question: "What is a closure in JavaScript?",
        options: [
          "A way to close a browser tab",
          "A function that retains access to its outer scope's variables even after the outer function has returned",
          "A method for closing database connections",
          "A try/catch block",
        ],
        correctIndex: 1,
        explanation:
          "A closure is created when a function captures variables from its enclosing scope. The inner function 'closes over' those variables, keeping them alive. Closures enable data privacy, factory functions, and are fundamental to functional programming patterns in JavaScript.",
      },
    ],
  },
  {
    domainSlug: "languages",
    topicSlug: "python",
    questions: [
      {
        id: "lang-python-q1",
        question: "What is the Global Interpreter Lock (GIL) in CPython?",
        options: [
          "A security feature",
          "A mutex that prevents multiple native threads from executing Python bytecode simultaneously",
          "A package manager",
          "A syntax checking tool",
        ],
        correctIndex: 1,
        explanation:
          "The GIL ensures only one thread executes Python bytecode at a time, simplifying memory management but limiting true parallelism for CPU-bound tasks. Use multiprocessing for CPU parallelism, or threads for I/O-bound work (the GIL is released during I/O).",
      },
      {
        id: "lang-python-q2",
        question:
          "What is the difference between a list and a tuple in Python?",
        options: [
          "No difference",
          "Lists are mutable; tuples are immutable",
          "Tuples are larger",
          "Lists can only hold strings",
        ],
        correctIndex: 1,
        explanation:
          "Lists are mutable sequences (can be modified after creation). Tuples are immutable (fixed after creation). Tuples are hashable (can be dictionary keys), slightly faster, and signal intent that the data shouldn't change. Use tuples for fixed collections.",
      },
      {
        id: "lang-python-q3",
        question:
          "What are Python decorators?",
        options: [
          "Comments that document code",
          "Functions that modify the behavior of other functions, applied with the @ syntax",
          "A way to format strings",
          "Import statements",
        ],
        correctIndex: 1,
        explanation:
          "Decorators are higher-order functions that wrap other functions, adding behavior before/after execution. The @decorator syntax is syntactic sugar for func = decorator(func). Common uses: @property, @staticmethod, @login_required, @cache.",
      },
    ],
  },
  {
    domainSlug: "languages",
    topicSlug: "go",
    questions: [
      {
        id: "lang-go-q1",
        question: "What is a goroutine?",
        options: [
          "A Go function",
          "A lightweight, user-space thread managed by the Go runtime, started with the 'go' keyword",
          "A package manager",
          "A type of loop",
        ],
        correctIndex: 1,
        explanation:
          "Goroutines are extremely lightweight (initial stack: ~2KB vs ~1MB for OS threads) and multiplexed onto OS threads by the Go scheduler. You can run millions concurrently. Launch with 'go functionName()'. They communicate via channels, not shared memory.",
      },
      {
        id: "lang-go-q2",
        question: "What is a Go channel used for?",
        options: [
          "File I/O",
          "Communication and synchronization between goroutines",
          "HTTP requests",
          "Error handling",
        ],
        correctIndex: 1,
        explanation:
          "Channels are typed conduits for sending and receiving values between goroutines. Unbuffered channels synchronize sender and receiver. Buffered channels allow sending without blocking until full. The 'select' statement handles multiple channel operations.",
      },
      {
        id: "lang-go-q3",
        question: "How does Go handle errors differently from most languages?",
        options: [
          "Go uses try/catch exceptions",
          "Go returns errors as values that must be explicitly checked",
          "Go ignores errors by default",
          "Go uses global error handlers",
        ],
        correctIndex: 1,
        explanation:
          "Go functions return error values as the last return value. Callers must explicitly check 'if err != nil'. This makes error handling visible and explicit, avoiding hidden control flow. Go reserves panic/recover for truly exceptional situations, not normal error handling.",
      },
    ],
  },
  {
    domainSlug: "languages",
    topicSlug: "language-concepts",
    questions: [
      {
        id: "lang-concepts-q1",
        question:
          "What is the difference between compiled and interpreted languages?",
        options: [
          "Compiled languages are always faster",
          "Compiled languages are translated to machine code before execution; interpreted languages are executed line by line at runtime",
          "Interpreted languages can't be typed",
          "There is no practical difference",
        ],
        correctIndex: 1,
        explanation:
          "Compiled languages (C, Go, Rust) translate to machine code ahead of time for fast execution. Interpreted languages (Python, Ruby) execute via an interpreter at runtime. Many modern languages use both: Java compiles to bytecode, then the JVM JIT-compiles to native code.",
      },
      {
        id: "lang-concepts-q2",
        question: "What is type inference?",
        options: [
          "Converting between types manually",
          "The compiler automatically deducing variable types from context without explicit annotation",
          "A runtime type check",
          "A way to define custom types",
        ],
        correctIndex: 1,
        explanation:
          "Type inference lets the compiler determine types from usage context. In TypeScript: 'const x = 5' infers number. In Rust: 'let v = vec![1,2,3]' infers Vec<i32>. This gives type safety without verbose annotations, balancing safety with readability.",
      },
      {
        id: "lang-concepts-q3",
        question: "What is garbage collection?",
        options: [
          "Deleting unused files",
          "Automatic memory management that reclaims memory from objects no longer reachable by the program",
          "Optimizing database queries",
          "Cleaning up log files",
        ],
        correctIndex: 1,
        explanation:
          "Garbage collection (GC) automatically frees memory for objects that are no longer referenced. Techniques include reference counting, mark-and-sweep, and generational collection. Languages with GC (Java, Go, Python, JS) trade some control and GC pauses for safety against memory leaks and use-after-free.",
      },
    ],
  },

  // ── Hacker Mindset ────────────────────────────────────────────
  {
    domainSlug: "hacker-mindset",
    topicSlug: "ctf-ethical-hacking",
    questions: [
      {
        id: "hacker-ctf-q1",
        question: "What is a CTF (Capture The Flag) in cybersecurity?",
        options: [
          "A physical security exercise",
          "A competition where participants solve security challenges to find hidden 'flags' (strings)",
          "A network monitoring tool",
          "A certification exam",
        ],
        correctIndex: 1,
        explanation:
          "CTFs are security competitions with challenges in categories like web exploitation, cryptography, reverse engineering, forensics, and binary exploitation. Jeopardy-style CTFs have independent challenges; Attack-Defense CTFs involve hacking opponents' services while defending your own.",
      },
      {
        id: "hacker-ctf-q2",
        question:
          "What is the difference between white-box and black-box testing?",
        options: [
          "White-box is for websites only",
          "White-box testing has full source code access; black-box has no internal knowledge",
          "Black-box testing is more thorough",
          "They use different tools",
        ],
        correctIndex: 1,
        explanation:
          "White-box testing provides full access to source code, architecture, and credentials. Black-box testing simulates an external attacker with no internal knowledge. Gray-box falls between, with partial information. Each approach finds different types of vulnerabilities.",
      },
      {
        id: "hacker-ctf-q3",
        question: "What is responsible disclosure?",
        options: [
          "Publishing vulnerabilities immediately",
          "Privately reporting vulnerabilities to the vendor and giving them time to fix before public disclosure",
          "Selling vulnerabilities to the highest bidder",
          "Ignoring vulnerabilities",
        ],
        correctIndex: 1,
        explanation:
          "Responsible disclosure means privately notifying the affected vendor about a vulnerability, providing reasonable time to develop a fix (typically 90 days), then potentially publishing details. Bug bounty programs formalize this process with rewards for researchers.",
      },
    ],
  },
  {
    domainSlug: "hacker-mindset",
    topicSlug: "engineering-mindset",
    questions: [
      {
        id: "hacker-mindset-q1",
        question:
          "What does 'thinking in systems' mean for software engineers?",
        options: [
          "Only using systems programming languages",
          "Understanding how components interact, identifying feedback loops, and anticipating emergent behaviors",
          "Building everything from scratch",
          "Using the latest frameworks",
        ],
        correctIndex: 1,
        explanation:
          "Systems thinking views software as interconnected components rather than isolated pieces. Understanding feedback loops (performance bottleneck → increased latency → more timeouts → more retries → worse bottleneck) helps engineers design resilient, well-behaved systems.",
      },
      {
        id: "hacker-mindset-q2",
        question: "What is the value of reading source code of tools you use?",
        options: [
          "It has no value",
          "It deepens understanding of how things work, reveals patterns, and builds debugging intuition",
          "It's required by open source licenses",
          "It makes your code run faster",
        ],
        correctIndex: 1,
        explanation:
          "Reading source code of libraries, frameworks, and tools you use builds deep understanding that documentation alone can't provide. You learn implementation patterns, discover undocumented behavior, develop debugging skills, and gain insight into design decisions.",
      },
      {
        id: "hacker-mindset-q3",
        question:
          "Why is learning fundamentals more valuable than learning specific frameworks?",
        options: [
          "Frameworks are unnecessary",
          "Fundamentals transfer across languages and frameworks, while specific tools change frequently",
          "Fundamentals are easier to learn",
          "Companies only test fundamentals",
        ],
        correctIndex: 1,
        explanation:
          "Understanding data structures, algorithms, operating systems, networking, and security creates transferable knowledge that applies regardless of which language or framework you use. Frameworks come and go, but fundamentals remain relevant for your entire career.",
      },
    ],
  },
  {
    domainSlug: "hacker-mindset",
    topicSlug: "reverse-engineering",
    questions: [
      {
        id: "hacker-reverse-q1",
        question: "What is a disassembler?",
        options: [
          "A tool that removes malware",
          "A tool that converts machine code back into assembly language",
          "A tool that compiles source code",
          "A tool that encrypts binaries",
        ],
        correctIndex: 1,
        explanation:
          "A disassembler (IDA Pro, Ghidra, radare2) translates raw machine code bytes into human-readable assembly instructions. This is the first step in reverse engineering compiled binaries when source code is unavailable.",
      },
      {
        id: "hacker-reverse-q2",
        question: "What is a decompiler, and how does it differ from a disassembler?",
        options: [
          "They are the same thing",
          "A decompiler attempts to reconstruct higher-level source code; a disassembler only produces assembly",
          "A decompiler is less accurate",
          "A disassembler works on source code",
        ],
        correctIndex: 1,
        explanation:
          "A decompiler goes further than disassembly, attempting to reconstruct C/C++-like source code from machine code. It's an approximation — variable names, comments, and some structure are lost during compilation. Ghidra's decompiler and Hex-Rays are popular tools.",
      },
      {
        id: "hacker-reverse-q3",
        question: "What is dynamic analysis in reverse engineering?",
        options: [
          "Reading source code",
          "Observing a program's behavior at runtime using debuggers, tracers, and monitors",
          "Analyzing network protocols",
          "Writing documentation",
        ],
        correctIndex: 1,
        explanation:
          "Dynamic analysis runs the program and observes its behavior: using debuggers (GDB, x64dbg) to step through code, strace/ltrace to trace system/library calls, and monitoring network, file, and registry activity. It complements static analysis (examining code without running it).",
      },
    ],
  },

  // ── Startups ────────────────────────────────────────────────────
  {
    domainSlug: "startups",
    topicSlug: "founding-and-ideation",
    questions: [
      {
        id: "startups-founding-q1",
        question:
          'What percentage of surveyed users saying "very disappointed" without your product indicates product-market fit?',
        options: ["40%", "20%", "60%", "80%"],
        correctIndex: 0,
        explanation:
          "Sean Ellis' product-market fit survey suggests that if 40% or more of users say they'd be 'very disappointed' without your product, you've likely achieved product-market fit. Below that threshold, you should iterate on your value proposition before scaling.",
      },
      {
        id: "startups-founding-q2",
        question: 'What does the "Mom Test" help founders avoid?',
        options: [
          "Asking leading questions that produce false validation",
          "Building too slowly",
          "Hiring too early",
          "Raising too much money",
        ],
        correctIndex: 0,
        explanation:
          "The Mom Test (by Rob Fitzpatrick) teaches founders to ask about customers' actual behavior and problems rather than pitching their idea and asking 'would you use this?' Even your mom would say yes to be supportive — hence the name. Good questions focus on past behavior, not hypothetical futures.",
      },
      {
        id: "startups-founding-q3",
        question:
          "What is the recommended approach to technology selection for an MVP?",
        options: [
          "Use the newest frameworks",
          "Choose boring, proven technology that ships fastest",
          "Build custom infrastructure",
          "Use microservices from day one",
        ],
        correctIndex: 1,
        explanation:
          "For MVPs, speed to market matters more than technical sophistication. Boring, proven technology (e.g., Rails, Django, Next.js, PostgreSQL) lets you ship faster with fewer surprises. Custom infrastructure and microservices add complexity that slows down early-stage iteration when you're still searching for product-market fit.",
      },
    ],
  },
  {
    domainSlug: "startups",
    topicSlug: "business-and-finance",
    questions: [
      {
        id: "startups-finance-q1",
        question: "What is a healthy LTV:CAC ratio for a SaaS business?",
        options: ["1:1", "2:1", "3:1 or better", "10:1"],
        correctIndex: 2,
        explanation:
          "A 3:1 LTV:CAC ratio is the widely-accepted benchmark for a healthy SaaS business. It means you earn $3 in lifetime value for every $1 spent acquiring a customer. Below 3:1 suggests unprofitable growth; well above 3:1 may indicate you're under-investing in growth.",
      },
      {
        id: "startups-finance-q2",
        question:
          "What does Net Revenue Retention (NRR) above 100% indicate?",
        options: [
          "Customer churn is zero",
          "Existing customers are growing revenue even without new sales",
          "The company is profitable",
          "CAC is decreasing",
        ],
        correctIndex: 1,
        explanation:
          "NRR above 100% means that expansion revenue from existing customers (upgrades, additional seats, usage growth) exceeds the revenue lost to churn and contraction. Top SaaS companies achieve 120-140% NRR, meaning they'd still grow even if they stopped acquiring new customers.",
      },
      {
        id: "startups-finance-q3",
        question:
          "In a SAFE with a valuation cap, what happens if the next round's valuation is below the cap?",
        options: [
          "The SAFE converts at the cap",
          "The SAFE converts at the actual valuation",
          "The investor gets their money back",
          "The SAFE becomes void",
        ],
        correctIndex: 1,
        explanation:
          "A valuation cap sets the maximum valuation at which a SAFE converts to equity — it protects the investor if the company's valuation increases significantly. If the actual round valuation is below the cap, the SAFE converts at the actual (lower) valuation, since the cap is a ceiling, not a floor.",
      },
    ],
  },
  {
    domainSlug: "startups",
    topicSlug: "legal-and-equity",
    questions: [
      {
        id: "startups-legal-q1",
        question:
          "Why is the 83(b) election critical for startup founders receiving restricted stock?",
        options: [
          "It eliminates all taxes",
          "It allows being taxed at grant-time value instead of vesting-time value",
          "It converts stock to options",
          "It prevents dilution",
        ],
        correctIndex: 1,
        explanation:
          "The 83(b) election lets founders pay taxes on restricted stock at its current (usually very low) fair market value at the time of grant, rather than at each vesting milestone when the stock may be worth much more. It must be filed with the IRS within 30 days of the stock grant — missing this deadline can result in enormous tax bills as the company grows.",
      },
      {
        id: "startups-legal-q2",
        question: "What is the standard vesting schedule for startup equity?",
        options: [
          "2-year vest with 6-month cliff",
          "4-year vest with 1-year cliff",
          "3-year vest with no cliff",
          "5-year vest with 2-year cliff",
        ],
        correctIndex: 1,
        explanation:
          "The industry-standard vesting schedule is 4 years with a 1-year cliff. During the cliff period, no equity vests. After the cliff, 25% vests immediately, and the remaining 75% vests monthly (or quarterly) over the next 3 years. This protects the company from short-tenure departures while providing meaningful incentive alignment.",
      },
      {
        id: "startups-legal-q3",
        question:
          "Why do VCs typically require startups to be Delaware C-Corps?",
        options: [
          "Lower taxes",
          "Familiar legal framework for equity issuance and preferred shares",
          "It's the cheapest option",
          "Delaware has no corporate taxes",
        ],
        correctIndex: 1,
        explanation:
          "Delaware's Court of Chancery has decades of well-established case law around corporate governance, preferred stock rights, and fiduciary duties. VCs and their lawyers rely on this predictability. C-Corp status (vs LLC or S-Corp) allows for multiple share classes (common vs preferred), unlimited shareholders, and is the standard structure for venture-backed companies.",
      },
    ],
  },
  {
    domainSlug: "startups",
    topicSlug: "product-and-growth",
    questions: [
      {
        id: "startups-growth-q1",
        question: "What is Product-Led Growth (PLG)?",
        options: [
          "Hiring more salespeople",
          "Growth driven by product usage rather than sales teams",
          "Building more features faster",
          "Spending more on marketing",
        ],
        correctIndex: 1,
        explanation:
          "Product-Led Growth is a go-to-market strategy where the product itself drives acquisition, activation, and expansion. Users can try, adopt, and derive value from the product with minimal sales involvement. Examples include Slack, Dropbox, and Figma, where free/freemium usage naturally converts to paid plans as users hit usage limits or need team features.",
      },
      {
        id: "startups-growth-q2",
        question: "What is the primary purpose of feature flags?",
        options: [
          "Making code more complex",
          "Decoupling deployment from release and enabling gradual rollouts",
          "Improving test coverage",
          "Reducing bundle size",
        ],
        correctIndex: 1,
        explanation:
          "Feature flags (or feature toggles) let you deploy code to production without exposing it to all users. This enables gradual rollouts (1% -> 10% -> 100%), A/B testing, instant kill switches for problematic features, and beta programs. They decouple the act of deploying code from the business decision of releasing a feature.",
      },
      {
        id: "startups-growth-q3",
        question: "What is Answer Engine Optimization (AEO)?",
        options: [
          "Traditional SEO techniques",
          "Optimizing content to appear in AI-powered search summaries",
          "Improving page load speed",
          "A/B testing landing pages",
        ],
        correctIndex: 1,
        explanation:
          "Answer Engine Optimization is the practice of structuring content so it's surfaced by AI-powered search tools (ChatGPT, Perplexity, Google AI Overviews). Unlike traditional SEO which optimizes for link rankings, AEO focuses on providing clear, authoritative answers that AI models can extract and cite. It's an emerging discipline as AI search grows.",
      },
    ],
  },
  {
    domainSlug: "startups",
    topicSlug: "team-and-infrastructure",
    questions: [
      {
        id: "startups-team-q1",
        question:
          "What is the median equity grant for a startup's first engineer?",
        options: ["0.1%", "~1%", "5%", "10%"],
        correctIndex: 1,
        explanation:
          "The median equity grant for a startup's first engineer is approximately 1%, though the range varies from 0.5% to 2% depending on stage, salary trade-off, and the engineer's seniority. This typically comes as stock options (ISOs) with a 4-year vesting schedule and 1-year cliff. Later hires receive progressively smaller grants.",
      },
      {
        id: "startups-team-q2",
        question: 'What does "hiring for slope over intercept" mean?',
        options: [
          "Hiring experienced people only",
          "Prioritizing learning velocity over current knowledge",
          "Hiring only from top universities",
          "Offering steeper equity vesting",
        ],
        correctIndex: 1,
        explanation:
          "Hiring for slope (learning rate) over intercept (current skill level) means valuing a candidate's growth trajectory and ability to learn quickly over their existing credentials or experience. Early-stage startups benefit from fast learners who can adapt as the company pivots, rather than specialists who may be rigid in their approach.",
      },
      {
        id: "startups-team-q3",
        question:
          "What percentage of cloud spend is typically wasted on idle or over-provisioned resources?",
        options: ["5-10%", "15-20%", "30-35%", "50%+"],
        correctIndex: 2,
        explanation:
          "Industry reports consistently show that 30-35% of cloud spend is wasted on idle instances, over-provisioned resources, and forgotten services. For startups, this can significantly shorten runway. Right-sizing instances, using spot/preemptible instances, auto-scaling, and regularly auditing cloud costs are essential practices for capital-efficient infrastructure.",
      },
    ],
  },
];

export function getQuizForTopic(
  domainSlug: string,
  topicSlug: string,
): TopicQuiz | null {
  return (
    QUIZZES.find(
      (q) => q.domainSlug === domainSlug && q.topicSlug === topicSlug,
    ) ?? null
  );
}

export function getAllQuizzes(): TopicQuiz[] {
  return QUIZZES;
}
