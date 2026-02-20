# Terminal Mastery — The Complete Guide

> The terminal is your cockpit. Mastering it is the difference between navigating a map and knowing the terrain.

---

## Shell Fundamentals

### What Is a Shell?
A command-line interpreter that reads commands and executes them. Acts as interface between user and kernel.

**Common shells:**
- `bash` — Bourne Again Shell. Default on most Linux
- `zsh` — Z Shell. Superset of bash. Default on macOS. Highly configurable
- `fish` — Friendly Interactive Shell. Opinionated, user-friendly
- `sh` — POSIX shell. Minimal, portable
- `ksh` — Korn Shell
- `dash` — Debian Almquist Shell. Fast POSIX shell (used for `/bin/sh`)

### How Commands Execute
```
$ ls -la /tmp

1. Shell reads input
2. Tokenizes: ["ls", "-la", "/tmp"]
3. Checks if alias → expansion
4. Checks if builtin → execute directly
5. Searches PATH for binary
6. fork() → child process
7. execve("/bin/ls", args, envp)
8. Wait for exit
9. Print prompt
```

---

## Keyboard Shortcuts (Readline)

These work in bash, zsh, Python REPL, most UNIX prompts:

### Movement
```
Ctrl-a          Go to start of line
Ctrl-e          Go to end of line
Ctrl-f          Forward one character
Ctrl-b          Backward one character
Alt-f           Forward one word
Alt-b           Backward one word
Ctrl-xx         Toggle between start and current position
```

### Editing
```
Ctrl-d          Delete character under cursor (or EOF if empty)
Ctrl-h          Delete character before cursor (same as Backspace)
Ctrl-k          Kill (cut) from cursor to end of line
Ctrl-u          Kill from cursor to start of line
Ctrl-w          Kill previous word (back to space)
Alt-d           Kill next word
Ctrl-y          Yank (paste) last killed text
Alt-y           Rotate through kill ring
Ctrl-t          Transpose characters
Alt-t           Transpose words
Alt-u           Uppercase next word
Alt-l           Lowercase next word
Alt-c           Capitalize next word
```

### History
```
Ctrl-p          Previous command (same as Up arrow)
Ctrl-n          Next command (same as Down arrow)
Ctrl-r          Reverse incremental search through history
Ctrl-s          Forward incremental search (may need: stty -ixon)
Ctrl-g          Cancel search
!!              Repeat last command
!n              Repeat command n from history
!string         Repeat last command starting with string
!?string        Repeat last command containing string
^old^new        Replace old with new in last command
```

### Process Control
```
Ctrl-c          SIGINT — interrupt/kill foreground process
Ctrl-z          SIGTSTP — suspend foreground process to background
Ctrl-\          SIGQUIT — quit with core dump
Ctrl-d          EOF / logout if empty line
Ctrl-l          Clear screen (same as clear command)
Ctrl-s          Pause output (XOFF)
Ctrl-q          Resume output (XON)
```

---

## Shell Variables & Environment

```bash
# Variable assignment (no spaces around =)
name="value"
count=42

# Access
echo $name
echo ${name}
echo ${name:-default}     # Default if unset
echo ${name:=default}     # Assign default if unset
echo ${name:?error msg}   # Error if unset

# String operations
str="hello world"
echo ${#str}              # Length: 11
echo ${str:6}             # Substring from index 6: "world"
echo ${str:0:5}           # First 5 chars: "hello"
echo ${str/world/vim}     # Replace: "hello vim"
echo ${str//o/0}          # Replace all: "hell0 w0rld"
echo ${str^^}             # Uppercase: "HELLO WORLD"
echo ${str,,}             # Lowercase: "hello world"

# Arrays
arr=("one" "two" "three")
echo ${arr[0]}            # First element
echo ${arr[@]}            # All elements
echo ${#arr[@]}           # Length
arr+=(four)               # Append
unset arr[1]              # Remove element

# Associative arrays (bash 4+)
declare -A map
map[key]="value"
echo ${map[key]}
echo ${!map[@]}           # All keys

# Export to child processes
export PATH="/usr/local/bin:$PATH"
export MY_VAR="value"

# Read-only
readonly CONST="immutable"

# Special variables
$0          Script name
$1..$9      Positional arguments
$@          All arguments as separate words
$*          All arguments as single word
$#          Number of arguments
$?          Exit status of last command
$$          Current process PID
$!          PID of last background job
$-          Current shell options
$_          Last argument of previous command
```

---

## I/O Redirection

```bash
# Standard streams
# stdin  = fd 0
# stdout = fd 1
# stderr = fd 2

command > file          # stdout to file (truncate)
command >> file         # stdout to file (append)
command < file          # stdin from file
command 2> file         # stderr to file
command 2>&1            # stderr to same place as stdout
command > file 2>&1     # Both to file
command &> file         # Both to file (bash shorthand)
command 2>/dev/null     # Discard stderr
command > /dev/null 2>&1  # Discard all output
command << EOF          # Here-doc: inline stdin
Hello
World
EOF
command <<< "string"    # Here-string: stdin from string

# Pipes
cmd1 | cmd2             # stdout of cmd1 → stdin of cmd2
cmd1 |& cmd2            # stdout+stderr of cmd1 → stdin of cmd2 (bash)
cmd1 2>&1 | cmd2        # Same in POSIX sh

# Process substitution
diff <(sort file1) <(sort file2)     # Use command output as file
cat > >(gzip > out.gz)               # Write to command as file

# tee — split output
command | tee file                   # Write to file AND stdout
command | tee file1 file2 | wc -l   # Write to two files, pipe to third
command | tee -a file                # Append to file

# Named pipes (FIFO)
mkfifo mypipe
command1 > mypipe &
command2 < mypipe
```

---

## Job Control

```bash
command &               # Run in background
jobs                    # List jobs
fg %1                   # Bring job 1 to foreground
bg %1                   # Continue job 1 in background
Ctrl-z                  # Suspend current job
kill %1                 # Kill job 1
disown %1               # Detach from shell
wait                    # Wait for all background jobs

# nohup — immune to HUP signal
nohup ./long_script.sh > output.log 2>&1 &

# screen / tmux for persistent sessions
```

---

## Advanced Shell Features

### Functions
```bash
greet() {
    local name=$1         # local scope
    echo "Hello, $name!"
    return 0              # explicit return
}
greet "World"

# With error handling
safe_cd() {
    cd "$1" || { echo "Failed to cd to $1"; return 1; }
}
```

### Conditional Logic
```bash
# if/elif/else
if [[ $x -gt 10 ]]; then
    echo "big"
elif [[ $x -eq 10 ]]; then
    echo "ten"
else
    echo "small"
fi

# [[ ]] vs [ ]
# [[ ]] is bash extended test (use this)
# [ ] is POSIX test

# Numeric comparisons
[[ $a -eq $b ]]   # equal
[[ $a -ne $b ]]   # not equal
[[ $a -lt $b ]]   # less than
[[ $a -gt $b ]]   # greater than
[[ $a -le $b ]]   # less than or equal
[[ $a -ge $b ]]   # greater than or equal

# String comparisons
[[ $a == $b ]]    # equal
[[ $a != $b ]]    # not equal
[[ -z $a ]]       # empty string
[[ -n $a ]]       # non-empty string
[[ $a =~ regex ]] # regex match

# File tests
[[ -e file ]]     # exists
[[ -f file ]]     # regular file
[[ -d dir ]]      # directory
[[ -r file ]]     # readable
[[ -w file ]]     # writable
[[ -x file ]]     # executable
[[ -s file ]]     # non-empty
[[ -L file ]]     # symbolic link
[[ file1 -nt file2 ]]  # newer than
[[ file1 -ot file2 ]]  # older than

# Logical
[[ cond1 && cond2 ]]
[[ cond1 || cond2 ]]
[[ ! cond ]]

# Short-circuit evaluation
command1 && command2    # Run cmd2 only if cmd1 succeeds
command1 || command2    # Run cmd2 only if cmd1 fails
```

### Loops
```bash
# for loop
for i in {1..10}; do
    echo $i
done

for file in *.txt; do
    echo "Processing $file"
done

for ((i=0; i<10; i++)); do
    echo $i
done

# while loop
while [[ $count -lt 10 ]]; do
    echo $count
    ((count++))
done

while IFS= read -r line; do
    echo "Line: $line"
done < file.txt

# until loop
until [[ $done == true ]]; do
    check_status
done

# Loop control
break           # Exit loop
continue        # Skip to next iteration
break 2         # Break out of 2 nested loops
```

### Case Statement
```bash
case $variable in
    pattern1)
        commands
        ;;
    pattern2|pattern3)
        commands
        ;;
    *.txt)
        echo "Text file"
        ;;
    *)
        echo "Default"
        ;;
esac
```

---

## Shell Scripting Best Practices

```bash
#!/usr/bin/env bash
# Always use env for portability

# Safety flags (put at top of every script)
set -euo pipefail
# -e: exit on error
# -u: error on unset variables
# -o pipefail: pipe fails if any command fails

# IFS for safe word splitting
IFS=$'\n\t'

# Trap for cleanup
trap 'cleanup' EXIT
trap 'echo "Error on line $LINENO"; cleanup; exit 1' ERR

cleanup() {
    rm -f "$tmpfile"
}

# Temporary files
tmpfile=$(mktemp)
tmpdir=$(mktemp -d)

# Robust argument parsing
usage() {
    cat << EOF
Usage: $0 [-h] [-v] [-f file]
  -h    Help
  -v    Verbose
  -f    Input file
EOF
}

verbose=false
file=""

while getopts "hvf:" opt; do
    case $opt in
        h) usage; exit 0 ;;
        v) verbose=true ;;
        f) file=$OPTARG ;;
        ?) usage; exit 1 ;;
    esac
done

# Logging
log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" >&2; }
die() { log "ERROR: $*"; exit 1; }

# Check dependencies
require() {
    command -v "$1" >/dev/null 2>&1 || die "Required: $1"
}
require jq
require curl
```

---

## Useful One-Liners

```bash
# Find and replace in all files
find . -type f -name "*.py" -exec sed -i 's/old/new/g' {} +

# Files modified in last 24 hours
find . -mtime -1 -type f

# Disk usage sorted
du -h --max-depth=1 | sort -rh

# Watch command every 2 seconds
watch -n 2 'df -h'

# HTTP server in current directory
python3 -m http.server 8000

# Base64 encode/decode
echo "hello" | base64
echo "aGVsbG8K" | base64 -d

# Generate random password
openssl rand -base64 32
tr -dc 'A-Za-z0-9!@#$%' < /dev/urandom | head -c 20

# Show top 10 commands from history
history | awk '{print $2}' | sort | uniq -c | sort -rn | head

# CPU usage per core
mpstat -P ALL 1

# Network connections
ss -s                          # Summary stats
ss -o state established        # Established connections

# Find largest files
find / -type f -printf '%s %p\n' 2>/dev/null | sort -rn | head -20

# Monitor log file
tail -f /var/log/syslog | grep --line-buffered "error"

# Check if port is open
nc -zv hostname 443

# Create archive with date stamp
tar -czf backup-$(date +%Y%m%d).tar.gz /path/to/dir

# Recursive word count
find . -name "*.md" | xargs wc -l | sort -n

# Remove blank lines from file
sed '/^$/d' file

# Print unique lines maintaining order (not sort -u)
awk '!seen[$0]++' file

# Parallel execution with xargs
ls *.png | xargs -P 4 -I {} convert {} {}.jpg

# Run command on all servers
for host in server1 server2 server3; do
    ssh $host "uptime" &
done
wait
```

---

## Terminal Emulators & Multiplexers

### Why Tmux?
- Persist sessions (survive SSH disconnects)
- Multiple windows/panes in one terminal
- Share sessions with others
- See `tmux.md` for full reference

### Modern Terminal Emulators
| Terminal | Best For |
|---|---|
| Alacritty | Speed (GPU-rendered, minimal) |
| Kitty | Speed + graphics + tabs |
| WezTerm | Config as code (Lua), cross-platform |
| iTerm2 | macOS, feature-rich |
| Windows Terminal | Windows |
| Foot | Wayland-native, fast |

---

## Dotfiles & Shell Configuration

### Bash Startup Files
```
/etc/profile          # System-wide, login shells
~/.bash_profile       # User login shell
~/.bashrc             # Interactive non-login shells
~/.bash_logout        # On logout

# Best practice: in .bash_profile:
[[ -f ~/.bashrc ]] && source ~/.bashrc
```

### Zsh Startup Files
```
/etc/zprofile         # System login
~/.zprofile           # User login
~/.zshenv             # Every zsh (even scripts)
~/.zshrc              # Interactive
```

### Essential .zshrc / .bashrc Settings
```bash
# History
HISTSIZE=100000
HISTFILESIZE=100000
HISTCONTROL=ignoredups:erasedups
HISTTIMEFORMAT="%F %T "
setopt HIST_IGNORE_ALL_DUPS    # zsh
shopt -s histappend            # bash: append, don't overwrite

# Better completion
autoload -Uz compinit && compinit  # zsh

# Prompt (bash)
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '

# Aliases
alias ll='ls -lah'
alias la='ls -A'
alias ..='cd ..'
alias ...='cd ../..'
alias grep='grep --color=auto'
alias df='df -h'
alias du='du -h'
alias free='free -h'
alias mkdir='mkdir -pv'
alias cp='cp -iv'
alias mv='mv -iv'

# Git aliases
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
alias gl='git log --oneline --graph --decorate'
alias gd='git diff'
alias gco='git checkout'

# Functions
mkcd() { mkdir -p "$1" && cd "$1"; }
extract() {
    case $1 in
        *.tar.gz)  tar xzf $1 ;;
        *.tar.bz2) tar xjf $1 ;;
        *.tar.xz)  tar xJf $1 ;;
        *.zip)     unzip $1 ;;
        *.gz)      gunzip $1 ;;
        *.bz2)     bunzip2 $1 ;;
        *)         echo "Unknown: $1" ;;
    esac
}

# fzf integration (if installed)
# Ctrl-r: fuzzy history search
# Ctrl-t: fuzzy file find
# Alt-c: fuzzy cd
```

---

## Environment & PATH Management

```bash
# View PATH
echo $PATH | tr ':' '\n'

# Add to PATH
export PATH="$HOME/.local/bin:$PATH"
export PATH="$PATH:/opt/custom/bin"

# Check where a command comes from
which -a python3
type python3

# Environment inspection
env                           # All environment variables
printenv HOME                 # Specific variable
env -i command                # Run with clean environment

# Common env vars
HOME=/home/user
USER=username
SHELL=/bin/bash
TERM=xterm-256color
EDITOR=vim
VISUAL=vim
PAGER=less
LANG=en_US.UTF-8
LC_ALL=en_US.UTF-8
TZ=America/New_York
```

---

*When you master the terminal, you become 10x faster at everything else.*
