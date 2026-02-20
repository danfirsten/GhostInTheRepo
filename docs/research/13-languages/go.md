# Go — Complete Reference

> Go is the language of infrastructure. Simple, fast, concurrent, and opinionated. Master it and you can build anything that needs to scale.

---

## Why Go?

```
Fast compilation (seconds not minutes)
Fast execution (compiled to native, GC overhead minor)
Simple language (few concepts, easy to read any code)
Built-in concurrency (goroutines, channels)
Strong standard library
Static typing with type inference
Cross-compilation built-in
Single binary deployment
```

---

## Basics

```go
package main  // Executable package

import (
    "fmt"
    "strings"
    "strconv"
)

func main() {
    // Variables
    var x int = 5
    y := 10          // Short declaration (infers type)
    const PI = 3.14  // Constant

    // Multiple assignment
    a, b := 1, 2
    a, b = b, a  // Swap

    // Types
    var i int64 = 1000000
    var f float64 = 3.14
    var s string = "hello"
    var b bool = true
    var r rune = 'A'  // int32
    var by byte = 255 // uint8

    // Type conversion (always explicit)
    n := float64(i)
    str := strconv.Itoa(42)  // int to string
    num, err := strconv.Atoi("42")  // string to int

    // String operations
    fmt.Println(strings.ToUpper("hello"))
    fmt.Println(strings.Contains("hello", "ell"))
    fmt.Println(strings.Split("a,b,c", ","))
    fmt.Println(strings.Join([]string{"a","b"}, ", "))

    // Formatted output
    fmt.Printf("int: %d, float: %.2f, string: %s, bool: %t\n", i, f, s, b)
    result := fmt.Sprintf("value: %v", x)  // Returns string
}
```

---

## Data Structures

```go
// Array (fixed size, rarely used directly)
var arr [5]int = [5]int{1, 2, 3, 4, 5}
arr2 := [...]int{1, 2, 3}  // Size inferred

// Slice (dynamic, built on array)
s := []int{1, 2, 3, 4, 5}
s = append(s, 6)           // Append (may allocate new backing array)
s = append(s, 7, 8, 9)     // Multiple
s = append(s, other...)    // Append slice

s2 := s[1:4]               // Slice of slice: [2,3,4] (shares backing array!)
s3 := make([]int, 5)       // Length 5, cap 5
s4 := make([]int, 0, 10)   // Length 0, capacity 10 (pre-allocated)

copy(dst, src)              // Copy elements (returns count)
len(s), cap(s)              // Length and capacity

// 2D slice
matrix := make([][]int, rows)
for i := range matrix {
    matrix[i] = make([]int, cols)
}

// Map
m := map[string]int{
    "alice": 30,
    "bob":   25,
}
m["carol"] = 28
value, ok := m["alice"]  // ok = false if not present
delete(m, "bob")

// Iteration
for key, value := range m {
    fmt.Printf("%s: %d\n", key, value)
}

// Struct
type Person struct {
    Name string     // Exported (capital)
    age  int        // Unexported (lowercase)
    Address         // Embedded (anonymous field)
}

type Address struct {
    City    string
    Country string
}

p := Person{Name: "Alice", age: 30}
p.Name                    // Access field
p.City                    // Promoted field from embedded Address

// Pointer
ptr := &p
(*ptr).Name = "Bob"
ptr.Name = "Bob"          // Auto-dereference
```

---

## Functions

```go
// Basic function
func add(x, y int) int {
    return x + y
}

// Multiple return values
func divide(a, b float64) (float64, error) {
    if b == 0 {
        return 0, fmt.Errorf("division by zero")
    }
    return a / b, nil
}

// Named return values
func minMax(nums []int) (min, max int) {
    min, max = nums[0], nums[0]
    for _, n := range nums[1:] {
        if n < min { min = n }
        if n > max { max = n }
    }
    return  // Naked return
}

// Variadic
func sum(nums ...int) int {
    total := 0
    for _, n := range nums {
        total += n
    }
    return total
}
sum(1, 2, 3)
sum(nums...)  // Spread slice

// First-class functions
func apply(fn func(int) int, values []int) []int {
    result := make([]int, len(values))
    for i, v := range values {
        result[i] = fn(v)
    }
    return result
}

// Closure
func counter(start int) func() int {
    n := start
    return func() int {
        n++
        return n
    }
}
c := counter(0)
c()  // 1
c()  // 2

// defer
func processFile(filename string) error {
    f, err := os.Open(filename)
    if err != nil { return err }
    defer f.Close()  // Runs when function returns (LIFO)
    // ... process file
    return nil
}

// Panic and recover
func safeDiv(a, b int) (result int, err error) {
    defer func() {
        if r := recover(); r != nil {
            err = fmt.Errorf("recovered: %v", r)
        }
    }()
    return a / b, nil  // panics if b == 0
}
```

---

## Interfaces

```go
// Interface definition
type Writer interface {
    Write(p []byte) (n int, err error)
}

type ReadWriter interface {
    Reader  // Embedding
    Writer
}

// Implement interface (implicit — no 'implements' keyword)
type Buffer struct {
    data []byte
}

func (b *Buffer) Write(p []byte) (n int, err error) {
    b.data = append(b.data, p...)
    return len(p), nil
}

// Use interface
func writeAll(w Writer, messages []string) {
    for _, msg := range messages {
        w.Write([]byte(msg))
    }
}

// Interface satisfaction check at compile time
var _ Writer = (*Buffer)(nil)  // Compile error if Buffer doesn't implement Writer

// Empty interface (any type)
func printAnything(v interface{}) {
    fmt.Println(v)
}
// or: func printAnything(v any)  (Go 1.18+)

// Type assertion
var i interface{} = "hello"
s, ok := i.(string)        // Safe assertion
s = i.(string)             // Panics if wrong type

// Type switch
switch v := i.(type) {
case int:     fmt.Printf("int: %d\n", v)
case string:  fmt.Printf("string: %s\n", v)
case []int:   fmt.Printf("[]int of length %d\n", len(v))
default:      fmt.Printf("unknown type %T\n", v)
}

// Stringer interface (fmt.Println uses this)
type Color int
func (c Color) String() string {
    switch c {
    case 0: return "Red"
    case 1: return "Green"
    default: return "Unknown"
    }
}

// Error interface
type Error interface {
    Error() string
}

type ValidationError struct {
    Field   string
    Message string
}
func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation error: %s - %s", e.Field, e.Message)
}
```

---

## Generics (Go 1.18+)

```go
// Generic function
func Map[T, U any](slice []T, fn func(T) U) []U {
    result := make([]U, len(slice))
    for i, v := range slice {
        result[i] = fn(v)
    }
    return result
}

// Constraint (type set)
type Number interface {
    ~int | ~int32 | ~int64 | ~float32 | ~float64
}

func Sum[T Number](nums []T) T {
    var total T
    for _, n := range nums {
        total += n
    }
    return total
}

Sum([]int{1, 2, 3})
Sum([]float64{1.1, 2.2, 3.3})

// Generic struct
type Stack[T any] struct {
    items []T
}

func (s *Stack[T]) Push(item T) {
    s.items = append(s.items, item)
}

func (s *Stack[T]) Pop() (T, bool) {
    var zero T
    if len(s.items) == 0 {
        return zero, false
    }
    n := len(s.items) - 1
    item := s.items[n]
    s.items = s.items[:n]
    return item, true
}

// Ordered constraint
import "golang.org/x/exp/constraints"
func Min[T constraints.Ordered](a, b T) T {
    if a < b { return a }
    return b
}
```

---

## Goroutines & Channels

```go
package main

import (
    "sync"
    "time"
)

// Goroutine: lightweight thread (2-8KB stack, grows as needed)
// ~1 million goroutines per GiB RAM
go func() {
    // Runs concurrently
}()

// Channel: typed conduit between goroutines
ch := make(chan int)      // Unbuffered (synchronous)
ch := make(chan int, 100) // Buffered (async up to 100)

// Send (blocks if unbuffered and no receiver)
ch <- 42

// Receive (blocks if no sender)
value := <-ch

// Close channel (sender closes, receiver detects)
close(ch)
val, ok := <-ch  // ok = false if channel closed and empty

// Range over channel (until closed)
for val := range ch {
    process(val)
}

// Select: multiplex channels (like switch for channels)
select {
case msg := <-inbox:
    handle(msg)
case outbox <- reply:
    // Sent successfully
case <-time.After(5 * time.Second):
    timeout()
case <-ctx.Done():
    return ctx.Err()
default:
    // Non-blocking
}

// WaitGroup: wait for goroutine group
var wg sync.WaitGroup
for i := 0; i < 10; i++ {
    wg.Add(1)
    go func(id int) {
        defer wg.Done()
        work(id)
    }(i)
}
wg.Wait()

// Context: cancellation, timeouts, deadlines
ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
defer cancel()  // Important: always call cancel

go func() {
    select {
    case <-ctx.Done():
        fmt.Println("Cancelled:", ctx.Err())
        return
    case result := <-doWork():
        use(result)
    }
}()

// Pipeline pattern
func generate(ctx context.Context, nums ...int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for _, n := range nums {
            select {
            case out <- n:
            case <-ctx.Done():
                return
            }
        }
    }()
    return out
}

func square(ctx context.Context, in <-chan int) <-chan int {
    out := make(chan int)
    go func() {
        defer close(out)
        for n := range in {
            select {
            case out <- n * n:
            case <-ctx.Done():
                return
            }
        }
    }()
    return out
}

// Fan-out (distribute work to multiple goroutines)
func fanOut(in <-chan Task, n int) []<-chan Result {
    outputs := make([]<-chan Result, n)
    for i := 0; i < n; i++ {
        outputs[i] = worker(in)
    }
    return outputs
}

// Fan-in (merge multiple channels)
func merge(channels ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup
    for _, ch := range channels {
        wg.Add(1)
        go func(c <-chan int) {
            defer wg.Done()
            for v := range c {
                out <- v
            }
        }(ch)
    }
    go func() { wg.Wait(); close(out) }()
    return out
}
```

---

## Error Handling

```go
// Go's idiomatic error handling
func doSomething() error {
    if err := step1(); err != nil {
        return fmt.Errorf("step1 failed: %w", err)  // %w wraps error
    }
    if err := step2(); err != nil {
        return fmt.Errorf("step2: %w", err)
    }
    return nil
}

// Custom error types
type NotFoundError struct {
    Resource string
    ID       int
}
func (e *NotFoundError) Error() string {
    return fmt.Sprintf("%s %d not found", e.Resource, e.ID)
}

// Error checking and unwrapping
if errors.Is(err, os.ErrNotExist) { ... }         // Check specific error

var notFound *NotFoundError
if errors.As(err, &notFound) {                     // Type assertion on error
    fmt.Println(notFound.Resource, notFound.ID)
}

// Sentinel errors
var ErrNotFound = errors.New("not found")
if err == ErrNotFound { ... }
```

---

## HTTP Server

```go
package main

import (
    "encoding/json"
    "log"
    "net/http"
    "time"

    "github.com/gorilla/mux"
)

type User struct {
    ID    int    `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}

func getUserHandler(w http.ResponseWriter, r *http.Request) {
    vars := mux.Vars(r)
    id := vars["id"]

    user, err := db.GetUser(id)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// Middleware
func loggingMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        wrapped := &responseWriter{ResponseWriter: w}
        next.ServeHTTP(wrapped, r)
        log.Printf("%s %s %d %v", r.Method, r.URL.Path, wrapped.status, time.Since(start))
    })
}

func main() {
    r := mux.NewRouter()
    r.Use(loggingMiddleware)

    r.HandleFunc("/users", listUsersHandler).Methods("GET")
    r.HandleFunc("/users/{id}", getUserHandler).Methods("GET")
    r.HandleFunc("/users", createUserHandler).Methods("POST")

    srv := &http.Server{
        Addr:         ":8080",
        Handler:      r,
        ReadTimeout:  10 * time.Second,
        WriteTimeout: 10 * time.Second,
        IdleTimeout:  120 * time.Second,
    }

    log.Fatal(srv.ListenAndServe())
}
```

---

## Testing

```go
package mypackage_test

import (
    "testing"
    "github.com/stretchr/testify/assert"
    "github.com/stretchr/testify/require"
)

func TestAdd(t *testing.T) {
    result := Add(2, 3)
    assert.Equal(t, 5, result)
}

// Table-driven tests (idiomatic Go)
func TestDivide(t *testing.T) {
    tests := []struct {
        name    string
        a, b    float64
        want    float64
        wantErr bool
    }{
        {"positive", 10, 2, 5, false},
        {"negative", -10, 2, -5, false},
        {"zero divisor", 10, 0, 0, true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            got, err := Divide(tt.a, tt.b)
            if tt.wantErr {
                require.Error(t, err)
                return
            }
            require.NoError(t, err)
            assert.InDelta(t, tt.want, got, 0.001)
        })
    }
}

// Benchmarks
func BenchmarkSort(b *testing.B) {
    data := randomSlice(1000)
    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        Sort(data)
    }
}
```

```bash
go test ./...                 # Run all tests
go test -v ./...              # Verbose
go test -run TestFoo          # Run specific test
go test -bench=.              # Run benchmarks
go test -race ./...           # Race condition detection
go test -cover ./...          # Coverage
go test -count=5 ./...        # Run each test 5 times
```

---

## Go Tooling

```bash
# Build
go build ./...           # Build all packages
go build -o myapp .      # Build current package
GOOS=linux GOARCH=amd64 go build .   # Cross-compile

# Run
go run main.go

# Module management
go mod init github.com/user/repo
go mod tidy              # Remove unused deps, add missing
go get package@v1.2.3    # Add/update dependency
go get package@latest

# Code quality
go vet ./...             # Static analysis
gofmt -w .               # Format code
goimports -w .           # Format + organize imports
staticcheck ./...        # More checks (install separately)
golangci-lint run        # Comprehensive linter

# Performance
go tool pprof cpu.prof
go tool pprof http://localhost:6060/debug/pprof/heap
go test -cpuprofile=cpu.prof -memprofile=mem.prof -bench=.

# Documentation
go doc fmt.Printf        # Show documentation
godoc -http :6060        # Browse docs in browser
```

---

*Go forces you to be explicit. That explicitness — in error handling, in types, in concurrency — is why Go code is so readable and maintainable at scale.*
