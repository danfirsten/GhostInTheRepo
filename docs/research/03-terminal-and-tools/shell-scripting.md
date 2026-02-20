# Shell Scripting — Bash/Zsh Complete Reference

> Shell scripting is the glue of the Unix world. When you need to automate, orchestrate, or plumb systems together — this is your language.

---

## Script Anatomy

```bash
#!/usr/bin/env bash
# Shebang: use env for portability across systems

# Safety flags — ALWAYS use these
set -euo pipefail
# -e: exit immediately on error
# -u: treat unset variables as errors
# -o pipefail: pipe fails if any command fails

# Handle errors and cleanup
trap 'echo "Error on line $LINENO. Exit code: $?" >&2' ERR
trap 'cleanup' EXIT

cleanup() {
    # Remove temp files, release resources
    rm -f "$tmpfile"
}

# Constants
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SCRIPT_NAME="$(basename "$0")"
readonly LOG_FILE="/var/log/${SCRIPT_NAME%.sh}.log"

# Logging
log()  { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [INFO]  $*" | tee -a "$LOG_FILE"; }
warn() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] [WARN]  $*" | tee -a "$LOG_FILE" >&2; }
error(){ echo "[$(date '+%Y-%m-%d %H:%M:%S')] [ERROR] $*" | tee -a "$LOG_FILE" >&2; }
die()  { error "$*"; exit 1; }

# Usage
usage() {
    cat << EOF
Usage: $SCRIPT_NAME [OPTIONS] REQUIRED_ARG

Description: Does something useful.

Options:
  -h, --help       Show this help
  -v, --verbose    Verbose output
  -f FILE          Input file
  -n COUNT         Number of iterations (default: 10)

Examples:
  $SCRIPT_NAME -f input.txt myarg
  $SCRIPT_NAME --verbose -n 5 myarg
EOF
}

# Defaults
verbose=false
input_file=""
count=10

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)    usage; exit 0 ;;
        -v|--verbose) verbose=true; shift ;;
        -f)           input_file="$2"; shift 2 ;;
        -n)           count="$2"; shift 2 ;;
        --)           shift; break ;;
        -*)           die "Unknown option: $1" ;;
        *)            break ;;
    esac
done

[[ $# -ge 1 ]] || die "Required argument missing. Use -h for help."
required_arg="$1"

$verbose && log "Verbose mode enabled"
```

---

## Variables & Strings

```bash
# Assignment (no spaces around =)
name="Alice"
count=42
pi=3.14159

# Variable expansion
echo "$name"
echo "${name}"          # Explicit boundaries
echo "${name}s"         # Append characters

# Default values
echo "${name:-default}"     # Use default if unset or empty
echo "${name:=default}"     # Assign default if unset or empty
echo "${name:?error}"       # Error and exit if unset or empty
echo "${name:+other}"       # Use 'other' if name is SET

# String length
echo "${#name}"             # Length of string

# Substring
str="Hello, World!"
echo "${str:7}"             # From index 7: "World!"
echo "${str:7:5}"           # From 7, length 5: "World"
echo "${str: -6}"           # Last 6 chars: "World!"
echo "${str: -6:5}"         # From -6, length 5: "World"

# String manipulation
url="https://example.com/path/file.tar.gz"
echo "${url#*/}"            # Remove shortest prefix matching */
echo "${url##*/}"           # Remove longest prefix: "file.tar.gz" (basename)
echo "${url%/*}"            # Remove shortest suffix: dirname
echo "${url%%.*}"           # Remove longest suffix from .: "https://example"
echo "${url%.gz}"           # Remove .gz: "...file.tar"

echo "${url/example/test}"  # Replace first: .../test.com/...
echo "${url//o/0}"          # Replace all o with 0
echo "${url/#https/http}"   # Replace prefix
echo "${url/%gz/xz}"        # Replace suffix

# Case modification (bash 4+)
echo "${name,,}"            # lowercase
echo "${name^^}"            # UPPERCASE
echo "${name~}"             # Toggle first char
echo "${name~~}"            # Toggle all

# Trim whitespace
str="  hello world  "
echo "${str##*( )}"         # Leading (extglob)
trimmed="${str#"${str%%[! ]*}"}"  # Leading
trimmed="${trimmed%"${trimmed##*[! ]}"}"  # Trailing
# Simpler with sed/xargs:
echo "  hello  " | xargs
```

---

## Arrays

```bash
# Indexed arrays
arr=("alpha" "beta" "gamma" "delta")
arr[4]="epsilon"            # Direct assignment

# Access
echo "${arr[0]}"            # First element: "alpha"
echo "${arr[-1]}"           # Last element: "epsilon"
echo "${arr[@]}"            # All elements
echo "${arr[*]}"            # All elements (single word)
echo "${#arr[@]}"           # Length: 5
echo "${!arr[@]}"           # Indices: 0 1 2 3 4

# Slicing
echo "${arr[@]:1:3}"        # Elements 1,2,3: "beta gamma delta"
echo "${arr[@]: -2}"        # Last 2: "delta epsilon"

# Modification
arr+=("zeta")               # Append
arr=("${arr[@]}" "eta")    # Append (alternative)
unset arr[2]                # Delete element (leaves hole)

# Iteration
for item in "${arr[@]}"; do
    echo "$item"
done

# Iterate with index
for i in "${!arr[@]}"; do
    echo "$i: ${arr[$i]}"
done

# Read array from file
mapfile -t arr < file.txt   # Each line → one element
readarray -t arr < file.txt # Same

# Associative arrays (bash 4+)
declare -A map
map["key"]="value"
map["name"]="Alice"
map["age"]=30

echo "${map["key"]}"        # value
echo "${!map[@]}"           # All keys
echo "${map[@]}"            # All values
echo "${#map[@]}"           # Number of entries

# Iterate associative
for key in "${!map[@]}"; do
    echo "$key = ${map[$key]}"
done
```

---

## Control Flow

```bash
# If/elif/else
if [[ "$status" == "ok" ]]; then
    echo "All good"
elif [[ "$status" == "warn" ]]; then
    echo "Warning"
else
    echo "Error"
fi

# Ternary-like
result=$([[ "$x" -gt 0 ]] && echo "positive" || echo "non-positive")

# Case
case "$option" in
    start|begin)  start_service ;;
    stop|end)     stop_service ;;
    restart)      stop_service; start_service ;;
    status)       show_status ;;
    *.log)        tail -f "$option" ;;
    *)            echo "Unknown: $option"; exit 1 ;;
esac

# While
i=0
while [[ $i -lt 10 ]]; do
    process_item "$i"
    ((i++))
done

# Until (run until condition is true)
until check_ready; do
    echo "Waiting..."
    sleep 5
done

# For
for i in {1..10}; do echo "$i"; done
for i in {0..100..5}; do echo "$i"; done  # 0, 5, 10, ..., 100
for ((i=0; i<10; i++)); do echo "$i"; done
for file in *.txt; do process "$file"; done
for dir in /etc/*/; do echo "$dir"; done   # Directories only

# Loop control
for i in {1..100}; do
    [[ $i == 50 ]] && continue  # Skip 50
    [[ $i == 75 ]] && break     # Stop at 75
    echo "$i"
done

# Read lines from file
while IFS= read -r line; do
    echo "Line: $line"
done < input.txt

# Read from command
while IFS= read -r line; do
    echo "$line"
done < <(find . -name "*.py")   # Process substitution

# Null-delimited (safe with filenames containing spaces)
while IFS= read -r -d '' file; do
    process "$file"
done < <(find . -name "*.txt" -print0)
```

---

## Functions

```bash
# Function definition
function greet() {
    local name="$1"          # $1 = first argument
    local -r MAX_LEN=10      # Local constant
    echo "Hello, $name!"
    return 0                 # 0 = success, non-zero = failure
}

# Call
greet "Alice"
greet "Bob" "extra"          # Extra args ignored (or use $@)

# Arguments
show_args() {
    echo "Count: $#"
    echo "All: $@"
    echo "First: $1"
    echo "Second: $2"
    for arg in "$@"; do echo "Arg: $arg"; done
}

# Return value (functions only return exit codes)
get_value() {
    echo "computed_value"    # Return via stdout
}
value=$(get_value)           # Capture stdout

# Return complex data via global (or nameref)
compute() {
    declare -n _result=$1    # nameref to caller's variable
    _result="computed"
}
compute my_var
echo "$my_var"   # "computed"

# Recursion
factorial() {
    [[ $1 -le 1 ]] && echo 1 && return
    local prev=$(factorial $(($1 - 1)))
    echo $(($1 * prev))
}

# Error handling in functions
safe_operation() {
    local result
    if ! result=$(risky_command); then
        error "risky_command failed with: $result"
        return 1
    fi
    echo "$result"
    return 0
}
```

---

## Process Substitution & Advanced Pipes

```bash
# Process substitution: use command output as file
diff <(sort file1.txt) <(sort file2.txt)
grep "ERROR" <(journalctl -n 1000)

# Write to process
# Tee to multiple destinations
command | tee >(gzip > output.gz) >(wc -l) | grep ERROR

# Named pipes (FIFO) for persistent communication
mkfifo /tmp/mypipe
command1 > /tmp/mypipe &
command2 < /tmp/mypipe
rm /tmp/mypipe

# Here-document
cat << 'EOF'                 # Single quotes prevent expansion
The variable $HOME is ${literal}
EOF

cat << EOF                   # Double quotes (or no quotes): expand variables
Welcome to $HOME
EOF

# Suppress indentation
cat <<- EOF                  # Strip leading TABS
    This line has leading tabs removed
EOF

# Here-string
grep "pattern" <<< "$variable"
base64 -d <<< "aGVsbG8="
```

---

## Arithmetic

```bash
# Arithmetic expansion
result=$(( 5 + 3 * 2 ))
result=$(( ${count} / 4 ))
result=$(( count++ ))        # Post-increment
result=$(( ++count ))        # Pre-increment

# All operators: + - * / % ** (exponent) & | ^ ~ << >>
# Comparison: == != < > <= >=
# Logical: && ||

# bc for floating point
result=$(echo "scale=4; 22/7" | bc)
result=$(echo "sqrt(2)" | bc -l)
result=$(printf "%.2f" $(echo "22/7" | bc -l))

# let (alternative)
let "result = 5 + 3"
let count++

# Arrays of numbers
sum=0
for n in 5 3 8 1 9 2; do
    (( sum += n ))
done
echo "Sum: $sum"
```

---

## String Processing

```bash
# grep, sed, awk basics (already in terminal-mastery.md, but script context)

# Extract with regex (bash 4.x BASH_REMATCH)
if [[ "2024-01-15" =~ ^([0-9]{4})-([0-9]{2})-([0-9]{2})$ ]]; then
    year="${BASH_REMATCH[1]}"
    month="${BASH_REMATCH[2]}"
    day="${BASH_REMATCH[3]}"
fi

# Split string into array
str="one:two:three:four"
IFS=':' read -ra parts <<< "$str"
echo "${parts[0]}"    # "one"
echo "${parts[@]}"    # "one two three four"

# Join array into string
arr=("one" "two" "three")
IFS=','; joined="${arr[*]}"; unset IFS
echo "$joined"   # "one,two,three"

# Multi-line string handling
multiline="line1
line2
line3"
while IFS= read -r line; do
    echo "Process: $line"
done <<< "$multiline"

# Count occurrences
echo "$string" | grep -o "pattern" | wc -l

# Pad string
printf "%-20s %s\n" "Name:" "Alice"   # Left-align in 20 chars
printf "%20s %s\n"  "Name:" "Alice"   # Right-align
```

---

## File Operations

```bash
# Safe file creation
tmpfile=$(mktemp)
tmpdir=$(mktemp -d)
trap "rm -f '$tmpfile'; rm -rf '$tmpdir'" EXIT

# Atomic write (prevents partial reads)
tmp=$(mktemp "${target}.XXXXXX")
echo "content" > "$tmp"
mv "$tmp" "$target"          # mv is atomic on same filesystem

# File tests
[[ -e file ]] && echo "exists"
[[ -f file ]] && echo "regular file"
[[ -d dir  ]] && echo "directory"
[[ -r file ]] && echo "readable"
[[ -w file ]] && echo "writable"
[[ -x file ]] && echo "executable"
[[ -s file ]] && echo "non-empty"
[[ -L file ]] && echo "symlink"
[[ -z file ]] && echo "empty (careful: tests string, not file)"
[[ file1 -nt file2 ]] && echo "file1 newer than file2"
[[ file1 -ot file2 ]] && echo "file1 older than file2"

# Directory operations
mkdir -p /deep/nested/path
cp -av src/ dst/             # Archive + verbose
rsync -av --delete src/ dst/ # Mirror
find . -name "*.bak" -delete # Delete matching files

# Lock file (prevent concurrent execution)
LOCKFILE="/var/run/${SCRIPT_NAME}.lock"
exec 200>"$LOCKFILE"
flock -n 200 || die "Another instance is running"
echo $$ > "$LOCKFILE"
```

---

## Error Handling Patterns

```bash
# Try/catch pattern
run_with_retry() {
    local cmd=("$@")
    local max_attempts=3
    local attempt=0

    while [[ $attempt -lt $max_attempts ]]; do
        if "${cmd[@]}"; then
            return 0
        fi
        ((attempt++))
        log "Attempt $attempt failed, retrying in $((attempt * 2))s..."
        sleep $((attempt * 2))
    done
    return 1
}

# Ignore errors for specific commands
! command_that_might_fail || true   # ok either way
result=$(command) || result="default"

# Check exit codes
if ! curl -f "$URL" > output.html; then
    die "Failed to download $URL"
fi

# Assert helper
assert() {
    local condition="$1"
    local message="${2:-Assertion failed}"
    if ! eval "$condition"; then
        die "$message (condition: $condition)"
    fi
}
assert "[[ $count -gt 0 ]]" "count must be positive"
```

---

## Real-World Script Examples

### Deploy Script
```bash
#!/usr/bin/env bash
set -euo pipefail

APP="myapp"
VERSION="${1:?Usage: $0 VERSION [ENV]}"
ENV="${2:-production}"
IMAGE="registry.company.com/$APP:$VERSION"

log() { echo "[DEPLOY] $*"; }

log "Deploying $APP:$VERSION to $ENV"

# Pull image
log "Pulling image..."
docker pull "$IMAGE"

# Run DB migrations
log "Running migrations..."
docker run --rm --env-file "/etc/myapp/$ENV.env" "$IMAGE" npm run migrate

# Rolling restart
log "Updating service..."
docker service update \
    --image "$IMAGE" \
    --update-parallelism 1 \
    --update-delay 10s \
    --update-failure-action rollback \
    "$APP"

log "Deployment complete"
```

### Backup Script
```bash
#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Backup PostgreSQL
log "Backing up PostgreSQL..."
PGPASSWORD="$DB_PASSWORD" pg_dumpall \
    -h localhost -U postgres \
    | gzip > "$BACKUP_DIR/postgres_$DATE.sql.gz"

# Backup application data
log "Backing up app data..."
tar -czf "$BACKUP_DIR/appdata_$DATE.tar.gz" /var/app/data/

# Upload to S3
log "Uploading to S3..."
aws s3 cp "$BACKUP_DIR/postgres_$DATE.sql.gz" "s3://mybucket/backups/"
aws s3 cp "$BACKUP_DIR/appdata_$DATE.tar.gz" "s3://mybucket/backups/"

# Remove local backups older than retention
log "Cleaning old backups..."
find "$BACKUP_DIR" -name "*.gz" -mtime +"$RETENTION_DAYS" -delete

log "Backup complete"
```

---

*A good shell script is like a well-made tool: minimal, sharp, and reliable.*
