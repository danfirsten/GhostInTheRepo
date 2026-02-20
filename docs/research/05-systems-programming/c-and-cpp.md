# C and C++ — Complete Reference

> C gives you direct hardware control. C++ gives you that plus abstraction. Together they are the foundation everything else is built on.

---

## C Fundamentals

### Memory Model
```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

// Memory layout (low → high address):
// .text (code) → .data (initialized globals) → .bss (zero-init globals)
// → heap (grows up) → ... → stack (grows down)

// Stack: automatic, fixed size (usually 8MB), fast, LIFO
void stack_example() {
    int x = 5;           // 4 bytes on stack
    char buf[256];       // 256 bytes on stack
    int arr[100];        // 400 bytes on stack
}                        // All freed when function returns

// Heap: dynamic, large, manual management
void heap_example() {
    int *p = malloc(sizeof(int));       // Allocate 4 bytes
    int *arr = malloc(100 * sizeof(int)); // Allocate 400 bytes
    int *big = calloc(1000, sizeof(int)); // Allocate + zero

    *p = 42;
    arr[0] = 1;

    // Resize
    arr = realloc(arr, 200 * sizeof(int));

    free(p);    // Must free everything
    free(arr);
    free(big);
    // p = NULL; // Good practice — avoids use-after-free
}

// Global/static memory
int global_init = 42;    // .data section
int global_zero;         // .bss section (zero-initialized)
static int file_local;   // Only visible in this file

void function() {
    static int call_count = 0;  // Persists across calls, on .data
    call_count++;
}
```

### Pointers — Master This
```c
int x = 5;
int *p = &x;       // p holds address of x
*p = 10;           // Dereference: change x through pointer
printf("%d\n", x); // 10

// Pointer arithmetic (moves by sizeof(type))
int arr[5] = {1, 2, 3, 4, 5};
int *ptr = arr;          // arr decays to pointer to first element
ptr++;                   // Now points to arr[1]
*(ptr + 2) = 99;         // arr[3] = 99
printf("%d\n", ptr[1]);  // Same as *(ptr + 1) = arr[2] = 3

// Pointer to pointer
int **pp = &p;
**pp = 20;         // x = 20

// Void pointer (generic pointer)
void *generic = malloc(100);
int *typed = (int *)generic;  // Must cast before use

// Function pointers
int add(int a, int b) { return a + b; }
int (*fn)(int, int) = add;
printf("%d\n", fn(3, 4));  // 7

// Array of function pointers (dispatch table)
int (*ops[4])(int, int) = {add, sub, mul, div_op};
ops[0](1, 2);  // Call add

// const with pointers
const int *cp = &x;    // Can't change *cp (value), can change cp (pointer)
int * const pc = &x;   // Can change *pc, can't change pc (pointer)
const int * const cpc = &x;  // Can't change either
```

### Strings
```c
// C strings: null-terminated char arrays
char s1[] = "hello";          // Stack: {'h','e','l','l','o','\0'} - 6 bytes
char *s2 = "hello";           // Pointer to string literal (read-only!)
char s3[20] = "hello";        // Stack array with room to grow

// Common operations (always check buffer sizes!)
strlen(s1)                    // 5 (not counting null)
strcpy(dst, src)              // Copy — UNSAFE (no bounds check)
strncpy(dst, src, n)          // Safer — copies up to n chars
strlcpy(dst, src, size)       // Safest — always null-terminates (BSD/POSIX)
strcat(dst, src)              // Concatenate — UNSAFE
strncat(dst, src, n)          // Safer
strcmp(s1, s2)                // Compare: 0 if equal, <0 or >0 otherwise
strncmp(s1, s2, n)            // Compare first n chars
strchr(s, 'e')                // Find char in string (returns pointer or NULL)
strstr(haystack, needle)      // Find substring
sprintf(buf, "%s %d", s, n)  // Format into buffer
snprintf(buf, sizeof(buf), ...)  // Safe version — always use this

// String to number
int n = atoi("42");
double d = atof("3.14");
long l = strtol("42", NULL, 10);
long hex = strtol("0xFF", NULL, 0);  // Base 0 = auto-detect
```

### Structs and Unions
```c
// Struct: all fields present, total size = sum of fields + padding
typedef struct {
    int id;          // 4 bytes
    // 4 bytes padding (to align next 8-byte field)
    double salary;   // 8 bytes
    char name[32];   // 32 bytes
    // Total: 48 bytes (with padding)
} Employee;

Employee e = {.id = 1, .salary = 75000.0, .name = "Alice"};
Employee *ep = &e;
ep->id = 2;          // -> for pointer, . for value
(*ep).id = 2;        // Same thing

// Packed struct (no padding, slower access)
#pragma pack(1)
typedef struct { char a; int b; } Packed;  // 5 bytes
#pragma pack()

// Flexible array member
typedef struct {
    int length;
    char data[];  // Must be last member, allocated with extra space
} VarString;
VarString *vs = malloc(sizeof(VarString) + 100);
vs->length = 100;

// Union: one field at a time, size = largest field
typedef union {
    int i;
    float f;
    unsigned char bytes[4];
} IntOrFloat;

IntOrFloat u;
u.f = 3.14f;
// Read bytes of a float:
for (int i = 0; i < 4; i++) printf("%02x ", u.bytes[i]);

// Tagged union (safe discriminated union pattern)
typedef struct {
    enum { INT_TYPE, FLOAT_TYPE, STRING_TYPE } tag;
    union {
        int i;
        float f;
        char *s;
    };
} Value;
```

### Memory Safety — Common Bugs
```c
// Buffer overflow
char buf[10];
gets(buf);              // NEVER USE — no bounds checking
fgets(buf, sizeof(buf), stdin);  // Use this instead

// Use after free
int *p = malloc(4);
free(p);
*p = 5;                 // UNDEFINED BEHAVIOR

// Double free
free(p);
free(p);                // CRASH or heap corruption

// Memory leak
void leak() {
    int *p = malloc(100);
    return;             // p not freed — memory leaked
}

// Null pointer dereference
int *p = NULL;
*p = 5;                 // SEGFAULT

// Integer overflow
int a = INT_MAX;
int b = a + 1;          // UNDEFINED BEHAVIOR (signed overflow)
unsigned int c = UINT_MAX;
unsigned int d = c + 1;  // 0 (well-defined for unsigned)

// Uninitialized memory
int x;
printf("%d\n", x);      // UNDEFINED BEHAVIOR — could be anything
```

### C Standard Library Essentials
```c
#include <stdio.h>   // printf, scanf, fopen, fread, fwrite, fseek
#include <stdlib.h>  // malloc, free, exit, atoi, rand, qsort, bsearch
#include <string.h>  // strlen, strcpy, memcpy, memmove, memset, memcmp
#include <stdint.h>  // int8_t, int32_t, uint64_t, SIZE_MAX, INT32_MAX
#include <stdbool.h> // bool, true, false
#include <assert.h>  // assert(condition) — aborts if false
#include <errno.h>   // errno, strerror(errno)
#include <limits.h>  // INT_MAX, LONG_MAX, CHAR_BIT
#include <math.h>    // sin, cos, sqrt, pow, ceil, floor, fabs
#include <time.h>    // time, clock, difftime, localtime, strftime
#include <ctype.h>   // isalpha, isdigit, isspace, toupper, tolower
#include <stdarg.h>  // va_list, va_start, va_arg, va_end

// File I/O
FILE *f = fopen("file.txt", "r");  // "r", "w", "a", "rb", "wb"
if (!f) { perror("fopen"); exit(1); }
char line[256];
while (fgets(line, sizeof(line), f)) {
    // Process line
}
fclose(f);

// Binary I/O
size_t n = fread(buf, sizeof(uint8_t), count, f);
fwrite(buf, sizeof(uint8_t), count, f);
fseek(f, 0, SEEK_SET);    // SEEK_SET, SEEK_CUR, SEEK_END
long pos = ftell(f);

// qsort
int cmp_int(const void *a, const void *b) {
    return (*(int*)a - *(int*)b);
}
int arr[5] = {5,3,1,4,2};
qsort(arr, 5, sizeof(int), cmp_int);
```

---

## C++ Modern Features

### Classes and OOP
```cpp
#include <iostream>
#include <string>
#include <vector>
#include <memory>

class Animal {
public:
    std::string name;
    int age;

    // Constructor
    Animal(std::string name, int age) : name(std::move(name)), age(age) {}

    // Virtual destructor (critical for inheritance!)
    virtual ~Animal() = default;

    // Virtual function (polymorphism)
    virtual std::string speak() const = 0;  // Pure virtual = abstract

    // Non-virtual function
    void describe() const {
        std::cout << name << " (" << age << ") says: " << speak() << "\n";
    }
};

class Dog : public Animal {
public:
    Dog(std::string name, int age) : Animal(std::move(name), age) {}
    std::string speak() const override { return "Woof!"; }
};

class Cat : public Animal {
public:
    Cat(std::string name, int age) : Animal(std::move(name), age) {}
    std::string speak() const override { return "Meow!"; }
};

// Polymorphism via pointer/reference
std::vector<std::unique_ptr<Animal>> animals;
animals.push_back(std::make_unique<Dog>("Rex", 3));
animals.push_back(std::make_unique<Cat>("Whiskers", 5));
for (auto& a : animals) a->describe();
```

### The Rule of Five (RAII)
```cpp
class Buffer {
    char *data;
    size_t size;
public:
    // Constructor
    explicit Buffer(size_t n) : data(new char[n]), size(n) {}

    // Destructor
    ~Buffer() { delete[] data; }

    // Copy constructor
    Buffer(const Buffer& other) : data(new char[other.size]), size(other.size) {
        std::memcpy(data, other.data, size);
    }

    // Copy assignment
    Buffer& operator=(const Buffer& other) {
        if (this != &other) {
            delete[] data;
            size = other.size;
            data = new char[size];
            std::memcpy(data, other.data, size);
        }
        return *this;
    }

    // Move constructor (steal resources)
    Buffer(Buffer&& other) noexcept : data(other.data), size(other.size) {
        other.data = nullptr;
        other.size = 0;
    }

    // Move assignment
    Buffer& operator=(Buffer&& other) noexcept {
        if (this != &other) {
            delete[] data;
            data = other.data;
            size = other.size;
            other.data = nullptr;
            other.size = 0;
        }
        return *this;
    }
};

// RAII pattern: acquire in constructor, release in destructor
class MutexLock {
    std::mutex& m;
public:
    explicit MutexLock(std::mutex& m) : m(m) { m.lock(); }
    ~MutexLock() { m.unlock(); }
    // Non-copyable
    MutexLock(const MutexLock&) = delete;
    MutexLock& operator=(const MutexLock&) = delete;
};
```

### Smart Pointers
```cpp
#include <memory>

// unique_ptr: exclusive ownership, zero overhead
auto p = std::make_unique<int>(42);  // Always use make_unique
*p = 10;
// p goes out of scope → automatically deleted

// Transfer ownership
auto q = std::move(p);  // p is now null, q owns the int

// shared_ptr: shared ownership, reference counted
auto sp1 = std::make_shared<std::string>("hello");
auto sp2 = sp1;  // Both own the string, refcount = 2
// Destroyed when last shared_ptr goes out of scope

// weak_ptr: observe without owning (breaks cycles)
std::weak_ptr<std::string> wp = sp1;
if (auto locked = wp.lock()) {  // null if already destroyed
    std::cout << *locked << "\n";
}

// Custom deleter
auto file = std::unique_ptr<FILE, decltype(&fclose)>(
    fopen("file.txt", "r"), fclose);
// file automatically closed when it goes out of scope
```

### Templates and Generic Programming
```cpp
// Function template
template<typename T>
T max_val(T a, T b) { return a > b ? a : b; }

max_val(3, 5);        // int
max_val(3.0, 5.0);    // double
max_val<int>(3, 5);   // Explicit

// Class template
template<typename T, size_t N>
class Array {
    T data[N];
public:
    T& operator[](size_t i) { return data[i]; }
    size_t size() const { return N; }
};

Array<int, 5> arr;
arr[0] = 42;

// Template specialization
template<>
std::string max_val<std::string>(std::string a, std::string b) {
    return a.length() > b.length() ? a : b;  // Longer string
}

// Variadic templates
template<typename... Args>
void print_all(Args&&... args) {
    (std::cout << ... << args) << "\n";  // Fold expression (C++17)
}
print_all(1, " ", 2.5, " ", "hello");

// Concepts (C++20): constrain templates
template<typename T>
concept Addable = requires(T a, T b) { a + b; };

template<Addable T>
T add(T a, T b) { return a + b; }

// SFINAE / enable_if (older approach)
template<typename T, std::enable_if_t<std::is_integral_v<T>, int> = 0>
T double_it(T x) { return x * 2; }
```

### Move Semantics and Perfect Forwarding
```cpp
// lvalue: has an address, can be on left side of =
// rvalue: temporary, no persistent address

// std::move: cast to rvalue reference (transfer ownership)
std::string s = "hello";
std::string t = std::move(s);  // s is valid but unspecified state
// t = "hello", s = "" (or implementation-defined)

// rvalue reference
void process(std::string&& s) {
    // s is an rvalue reference — we can steal its resources
    internal_str = std::move(s);
}

process(std::string("temp"));  // OK: temporary
std::string named = "hello";
process(std::move(named));     // OK: explicit move

// Perfect forwarding (preserve value category)
template<typename T>
void wrapper(T&& arg) {
    // T&& is a "forwarding reference" (not rvalue ref)
    actual_function(std::forward<T>(arg));  // Preserve lvalue/rvalue
}
```

### STL Containers
```cpp
#include <vector>
#include <list>
#include <deque>
#include <map>
#include <unordered_map>
#include <set>
#include <unordered_set>
#include <queue>
#include <stack>
#include <algorithm>
#include <numeric>

// vector: dynamic array, O(1) amortized push_back, O(1) random access
std::vector<int> v = {1, 2, 3};
v.push_back(4);
v.emplace_back(5);             // Construct in place (no copy)
v.reserve(100);                // Pre-allocate (avoids reallocs)
v.size(), v.capacity();
v.front(), v.back();
v[2], v.at(2);                 // at() throws out_of_range

// map: sorted by key, O(log n) operations
std::map<std::string, int> m;
m["alice"] = 30;
m.insert({"bob", 25});
m.emplace("carol", 28);        // Construct in place
auto it = m.find("alice");
if (it != m.end()) std::cout << it->second;
m.count("dave");               // 0 or 1

// unordered_map: hash map, O(1) average
std::unordered_map<std::string, int> um;
um.reserve(100);               // Pre-size hash table
um["key"] = 42;

// Algorithms
std::sort(v.begin(), v.end());
std::sort(v.begin(), v.end(), std::greater<int>());
std::sort(v.begin(), v.end(), [](int a, int b) { return a > b; });

auto it2 = std::find(v.begin(), v.end(), 3);
bool found = std::binary_search(v.begin(), v.end(), 3);  // Requires sorted

std::transform(v.begin(), v.end(), v.begin(), [](int x) { return x * 2; });
std::for_each(v.begin(), v.end(), [](int x) { std::cout << x << " "; });

int sum = std::accumulate(v.begin(), v.end(), 0);
int max = *std::max_element(v.begin(), v.end());

// Ranges (C++20) — more composable
#include <ranges>
auto squares = v | std::views::transform([](int x) { return x * x; })
                 | std::views::filter([](int x) { return x > 10; });
```

### Lambda Expressions
```cpp
// Basic lambda: [capture](params) -> return_type { body }
auto add = [](int a, int b) { return a + b; };
std::cout << add(3, 4);

// Capture by value
int x = 10;
auto adder = [x](int n) { return x + n; };  // Captures x by value

// Capture by reference
int count = 0;
auto inc = [&count]() { count++; };
inc(); inc();  // count = 2

// Capture all by value/reference
auto f1 = [=]() { return x; };   // All by value
auto f2 = [&]() { count++; };    // All by reference

// Generic lambda (C++14)
auto multiply = [](auto a, auto b) { return a * b; };
multiply(3, 4);
multiply(3.0, 4.0);

// Immediately invoked
int result = [](int x) { return x * 2; }(21);  // 42

// Mutable: modify captured values
int counter = 0;
auto inc2 = [counter]() mutable { return ++counter; };
```

### Concurrency (C++11+)
```cpp
#include <thread>
#include <mutex>
#include <atomic>
#include <future>
#include <condition_variable>

// Threads
std::thread t([]() {
    std::cout << "Thread running\n";
});
t.join();    // Wait for thread
// t.detach(); // Run independently (don't lose the handle)

// Mutex
std::mutex m;
int shared = 0;
{
    std::lock_guard<std::mutex> lock(m);  // RAII lock
    shared++;
}  // Automatically unlocked

// unique_lock: more flexible (can unlock manually, defer, try)
std::unique_lock<std::mutex> lock(m, std::defer_lock);
lock.lock();

// Condition variable
std::condition_variable cv;
bool ready = false;

// Producer
{
    std::lock_guard<std::mutex> lock(m);
    ready = true;
    cv.notify_one();
}

// Consumer
{
    std::unique_lock<std::mutex> lock(m);
    cv.wait(lock, [] { return ready; });  // Spurious wakeup safe
    // Process...
}

// Atomic: lock-free for simple types
std::atomic<int> counter{0};
counter++;
counter.fetch_add(1);
counter.compare_exchange_strong(expected, desired);

// std::future / std::promise
std::promise<int> prom;
std::future<int> fut = prom.get_future();

std::thread worker([&prom]() {
    // Do work...
    prom.set_value(42);
});

int result = fut.get();  // Block until value set
worker.join();

// std::async (simpler)
auto f = std::async(std::launch::async, []() { return 42; });
int val = f.get();
```

---

## Build Systems

### Makefiles
```makefile
CC = gcc
CXX = g++
CFLAGS = -Wall -Wextra -O2 -g
CXXFLAGS = -Wall -Wextra -O2 -g -std=c++20
LDFLAGS = -lpthread -lm

SRCS = main.c util.c parser.c
OBJS = $(SRCS:.c=.o)
TARGET = myapp

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $@ $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)

.PHONY: clean
```

### CMake
```cmake
cmake_minimum_required(VERSION 3.20)
project(MyApp VERSION 1.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

# Executable
add_executable(myapp
    src/main.cpp
    src/parser.cpp
    src/util.cpp
)

target_include_directories(myapp PRIVATE include)

# Library
add_library(mylib STATIC lib/algo.cpp lib/data.cpp)
target_include_directories(mylib PUBLIC include)
target_link_libraries(myapp PRIVATE mylib)

# Find external library
find_package(OpenSSL REQUIRED)
target_link_libraries(myapp PRIVATE OpenSSL::SSL OpenSSL::Crypto)

# Build types
# cmake -DCMAKE_BUILD_TYPE=Release ..
# cmake -DCMAKE_BUILD_TYPE=Debug ..
```

```bash
mkdir build && cd build
cmake ..
make -j$(nproc)
make install
```

---

## Debugging and Profiling

### GDB
```bash
gcc -g -O0 program.c -o program   # Compile with debug info
gdb ./program

# GDB commands
(gdb) run [args]
(gdb) break main
(gdb) break file.c:42
(gdb) continue
(gdb) next             # Step over
(gdb) step             # Step into
(gdb) finish           # Step out
(gdb) print x
(gdb) print *ptr
(gdb) info locals
(gdb) info registers
(gdb) backtrace        # Stack trace
(gdb) frame 2          # Select frame
(gdb) list             # Show source
(gdb) watch x          # Break on variable change
(gdb) x/10x $rsp       # Examine memory (hex)
(gdb) x/s 0x4008b4     # Examine as string
```

### Valgrind (Memory Error Detection)
```bash
valgrind --leak-check=full --show-leak-kinds=all ./program
valgrind --tool=helgrind ./program  # Thread errors
valgrind --tool=callgrind ./program  # CPU profiling
callgrind_annotate callgrind.out.PID
```

### AddressSanitizer (ASan)
```bash
# Compile with ASan (fast, ~2x overhead)
gcc -fsanitize=address,undefined -g program.c -o program
./program  # Detailed error report on any memory error

# ThreadSanitizer
gcc -fsanitize=thread -g program.c -o program
```

---

## Performance Patterns

```cpp
// Cache-friendly data: access arrays sequentially
// BAD: column-major access in row-major array
for (int j = 0; j < N; j++)       // Cache miss per iteration
    for (int i = 0; i < N; i++)
        sum += matrix[i][j];       // Jumps N elements each time

// GOOD: row-major access
for (int i = 0; i < N; i++)       // Sequential access — cache friendly
    for (int j = 0; j < N; j++)
        sum += matrix[i][j];

// SIMD via auto-vectorization (compile with -O2 or -march=native)
void add_arrays(float *a, float *b, float *c, int n) {
    for (int i = 0; i < n; i++) c[i] = a[i] + b[i];
    // GCC/Clang will auto-vectorize with proper flags
}

// Branch prediction: arrange code so common case doesn't branch
// Predictable: all true or all false
// Unpredictable: random — use branchless code

// Branchless conditional
int abs_val = (x < 0) ? -x : x;  // Branch
int abs_val2 = (x ^ (x >> 31)) - (x >> 31);  // Branchless (signed)

// Structure of Arrays vs Array of Structures
// AoS (bad for SIMD, good for one entity at a time)
struct Particle { float x, y, z, vx, vy, vz; };
Particle particles[1000];

// SoA (good for SIMD, cache-friendly for processing all x)
struct Particles {
    float x[1000], y[1000], z[1000];
    float vx[1000], vy[1000], vz[1000];
};
```

---

*C is power with responsibility. C++ is power with tools to manage that responsibility. Master both and you understand what everything else is doing under the hood.*
