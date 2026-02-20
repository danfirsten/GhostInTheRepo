# Build Systems — Complete Reference

> Build systems are force multipliers. Understanding them means understanding how complex software goes from source to binary, and how to make that process fast, reproducible, and correct.

---

## Make

### Makefile Fundamentals
```makefile
# Makefile syntax
# target: prerequisites
#	recipe (MUST be a TAB, not spaces)

# Basic example
CC = gcc
CFLAGS = -Wall -Wextra -O2
LDFLAGS = -lm

# Default target (first target = default)
all: myprogram

# Pattern rule
myprogram: main.o utils.o parser.o
	$(CC) $(LDFLAGS) -o $@ $^

# $@  = target name
# $^  = all prerequisites
# $<  = first prerequisite
# $*  = stem (matched by %)

# Pattern rule: %.o from %.c
%.o: %.c
	$(CC) $(CFLAGS) -c -o $@ $<

# Phony targets (not files)
.PHONY: all clean test install

clean:
	rm -f *.o myprogram

# Dependency generation (auto-track header changes)
DEPS = $(OBJS:.o=.d)
-include $(DEPS)

%.o: %.c
	$(CC) $(CFLAGS) -MMD -MP -c -o $@ $<
# -MMD: generate .d dependency files
# -MP:  add empty rules for headers (avoids errors when headers deleted)
```

### Advanced Make
```makefile
# Variables
SRC_DIR = src
BUILD_DIR = build
SRCS = $(wildcard $(SRC_DIR)/*.c)
OBJS = $(patsubst $(SRC_DIR)/%.c,$(BUILD_DIR)/%.o,$(SRCS))

# Create build directory
$(BUILD_DIR)/%.o: $(SRC_DIR)/%.c | $(BUILD_DIR)
	$(CC) $(CFLAGS) -c -o $@ $<

$(BUILD_DIR):
	mkdir -p $@

# Conditional assignment
CC ?= gcc              # Only if CC not already set
CFLAGS += -std=c17    # Append

# Recursive make (anti-pattern, but common)
# make -C subdir

# Parallel make
# make -j$(nproc)      # Use all CPUs

# Dry run
# make -n              # Print commands without executing

# Debug
# make -p              # Print all variables and rules

# Functions
SRCS := $(shell find src -name '*.c')
UPPER = $(shell echo $(1) | tr a-z A-Z)

# Recursive wildcard
rwildcard=$(foreach d,$(wildcard $(1:=/*)),$(call rwildcard,$d,$2) $(filter $(subst *,%,$2),$d))
ALL_SRCS = $(call rwildcard,src,*.c)
```

---

## CMake

### Modern CMake (Target-Based)
```cmake
cmake_minimum_required(VERSION 3.20)
project(MyApp VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)  # For clangd/editors

# Library
add_library(mylib STATIC
    src/utils.cpp
    src/parser.cpp
)

target_include_directories(mylib
    PUBLIC include/          # Consumers also get these includes
    PRIVATE src/internal/   # Only this target
)

target_compile_options(mylib PRIVATE
    -Wall -Wextra -Wpedantic
    $<$<CONFIG:Debug>:-g -O0>
    $<$<CONFIG:Release>:-O3 -DNDEBUG>
)

# Executable
add_executable(myapp src/main.cpp)

target_link_libraries(myapp
    PRIVATE mylib
    PRIVATE fmt::fmt          # External library (via find_package/FetchContent)
)

# Tests
enable_testing()
add_executable(test_utils tests/test_utils.cpp)
target_link_libraries(test_utils PRIVATE mylib GTest::gtest_main)
add_test(NAME utils_tests COMMAND test_utils)
```

### Finding and Fetching Dependencies
```cmake
# Find system library
find_package(OpenSSL REQUIRED)
target_link_libraries(myapp PRIVATE OpenSSL::SSL OpenSSL::Crypto)

find_package(fmt CONFIG REQUIRED)
target_link_libraries(myapp PRIVATE fmt::fmt)

# FetchContent: download dependency at configure time
include(FetchContent)
FetchContent_Declare(
    googletest
    URL https://github.com/google/googletest/archive/refs/tags/v1.14.0.zip
    URL_HASH SHA256=abc123...
)
FetchContent_MakeAvailable(googletest)
target_link_libraries(test_myapp GTest::gtest_main)

FetchContent_Declare(
    nlohmann_json
    GIT_REPOSITORY https://github.com/nlohmann/json.git
    GIT_TAG v3.11.3
    GIT_SHALLOW TRUE
)
FetchContent_MakeAvailable(nlohmann_json)
target_link_libraries(myapp PRIVATE nlohmann_json::nlohmann_json)
```

### CMake Workflow
```bash
# Configure (out-of-source build)
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake -B build -DCMAKE_BUILD_TYPE=Debug
cmake -B build -DCMAKE_TOOLCHAIN_FILE=vcpkg/scripts/buildsystems/vcpkg.cmake

# Build
cmake --build build               # Build
cmake --build build -j$(nproc)   # Parallel
cmake --build build --target mylib  # Specific target
cmake --build build --config Release  # (Windows multi-config)

# Install
cmake --install build --prefix /usr/local

# Run tests
ctest --test-dir build -j$(nproc) --output-on-failure

# Preset (CMakePresets.json) — standardize configurations
cmake --preset=default
cmake --build --preset=default

# Common variables
-DCMAKE_BUILD_TYPE=Debug|Release|RelWithDebInfo|MinSizeRel
-DCMAKE_INSTALL_PREFIX=/path
-DBUILD_SHARED_LIBS=ON
-DCMAKE_VERBOSE_MAKEFILE=ON
-DCMAKE_C_COMPILER=clang
-DCMAKE_CXX_COMPILER=clang++
```

### CMake Best Practices
```cmake
# DON'T: set global include/compile options
include_directories(include)  # Bad: pollutes all targets
add_definitions(-DFOO)        # Bad: global

# DO: use target-based commands
target_include_directories(mytarget PRIVATE include)
target_compile_definitions(mytarget PRIVATE FOO=1)

# Generator expressions (evaluated at build time, not config time)
target_compile_options(mylib PRIVATE
    $<$<CXX_COMPILER_ID:MSVC>:/W4>
    $<$<NOT:$<CXX_COMPILER_ID:MSVC>>:-Wall -Wextra>
)

# Interface vs PRIVATE vs PUBLIC
#  PRIVATE:    only this target uses it
#  PUBLIC:     this target AND consumers use it
#  INTERFACE:  only consumers use it (header-only libs)

add_library(header_only INTERFACE)
target_include_directories(header_only INTERFACE include/)
```

---

## Gradle

### Kotlin DSL (build.gradle.kts)
```kotlin
plugins {
    kotlin("jvm") version "1.9.0"
    application
    id("com.github.johnrengelman.shadow") version "8.1.1"
}

group = "com.example"
version = "1.0.0"

repositories {
    mavenCentral()
    maven("https://repo.example.com/releases")
}

dependencies {
    // Kotlin standard library
    implementation(kotlin("stdlib"))

    // External library
    implementation("io.ktor:ktor-server-netty:2.3.4")
    implementation("org.jetbrains.exposed:exposed-core:0.44.1")

    // Test dependencies
    testImplementation(kotlin("test"))
    testImplementation("io.kotest:kotest-runner-junit5:5.7.2")

    // Compile-only (like provided scope)
    compileOnly("jakarta.servlet:jakarta.servlet-api:6.0.0")
}

application {
    mainClass.set("com.example.MainKt")
}

tasks.test {
    useJUnitPlatform()
    maxParallelForks = Runtime.getRuntime().availableProcessors()
}

// Custom task
tasks.register("generateProto") {
    inputs.dir("src/main/proto")
    outputs.dir("build/generated/source/proto")
    doLast {
        exec {
            commandLine("protoc", "--kotlin_out=build/generated", "src/main/proto/*.proto")
        }
    }
}

// Task dependencies
tasks.named("compileKotlin") {
    dependsOn("generateProto")
}
```

### Gradle Commands
```bash
# Build
./gradlew build                # Full build + test
./gradlew assemble             # Build without tests
./gradlew compileKotlin        # Compile only

# Test
./gradlew test                 # Run tests
./gradlew test --tests "com.example.MyTest"  # Specific test
./gradlew test --info          # Verbose

# Run
./gradlew run
./gradlew run --args="--port 8080"

# Dependencies
./gradlew dependencies         # Full dependency tree
./gradlew dependencies --configuration runtimeClasspath
./gradlew dependencyInsight --dependency log4j  # Why is this here?

# Clean
./gradlew clean build          # Clean then build

# Daemon (speeds up subsequent builds)
./gradlew --daemon build       # Use daemon (default)
./gradlew --no-daemon build    # Disable
./gradlew --stop               # Stop all daemons

# Parallel builds
./gradlew build --parallel
# Or in gradle.properties:
# org.gradle.parallel=true
# org.gradle.workers.max=8

# Build cache (avoid re-running tasks whose inputs haven't changed)
./gradlew build --build-cache
# gradle.properties: org.gradle.caching=true

# Profile
./gradlew build --profile      # Generates HTML report
./gradlew build --scan         # Gradle Enterprise build scan
```

---

## Bazel

### Why Bazel
```
Bazel: build system from Google, designed for monorepos

Key properties:
  Hermetic: builds isolated from system (reproducible)
  Incremental: tracks inputs/outputs exactly, only rebuild what changed
  Correct: no stale state, content-addressed cache
  Scalable: distributed caching, remote execution
  Polyglot: C++, Java, Python, Go, Rust, etc. in one system

Used by: Google, Stripe, LinkedIn, Uber (large monorepos)

WORKSPACE: root of repository, lists external dependencies
BUILD:      build rules in each directory
```

### Bazel BUILD Files
```python
# BUILD (Python-like syntax called Starlark)

# C++ library
cc_library(
    name = "utils",
    srcs = ["utils.cc"],
    hdrs = ["utils.h"],
    deps = ["//third_party/absl:strings"],
    visibility = ["//visibility:public"],
)

# C++ binary
cc_binary(
    name = "myapp",
    srcs = ["main.cc"],
    deps = [":utils", "//src/parser:parser"],
)

# Tests
cc_test(
    name = "utils_test",
    srcs = ["utils_test.cc"],
    deps = [":utils", "@googletest//:gtest_main"],
)

# Python
py_library(
    name = "mylib",
    srcs = ["mylib.py"],
    deps = ["//third_party/py/requests"],
)

py_binary(
    name = "main",
    srcs = ["main.py"],
    deps = [":mylib"],
)
```

### Bazel Commands
```bash
# Build
bazel build //src:myapp           # Build specific target
bazel build //...                 # Build everything
bazel build //src/...             # Build all in src/

# Test
bazel test //...                  # Test everything
bazel test //src:mytest           # Specific test
bazel test //... --test_output=all  # Show stdout

# Run
bazel run //src:myapp -- --arg1 val1

# Query: understand the build graph
bazel query "deps(//src:myapp)"   # All dependencies
bazel query "rdeps(//..., //lib:utils)"  # Who depends on utils?
bazel query "//src/..."           # All targets in src/
bazel cquery --output=label_kind "//..."  # Show rule types

# Clean
bazel clean                       # Clean output
bazel clean --expunge             # Full clean including cache

# Remote caching (team-wide)
bazel build --remote_cache=grpc://cache.example.com:9090 //...

# Remote execution
bazel build --remote_executor=grpc://exec.example.com:8980 //...
```

---

## Build System Concepts

### Incremental Builds and Caching
```
Problem: rebuilding unchanged code wastes time

Approaches:
  Timestamp-based (Make): rebuild if input newer than output
    Fast check, but fragile (timestamps can be wrong)

  Content-addressed (Bazel, Nix): hash inputs
    Rebuild if input hash changed
    Correct: stale state impossible
    Enables: remote caching, distributed builds

  Dependency tracking: know exactly which files affect which outputs
    Make: explicit in rules (fragile, easy to miss)
    Bazel: sandboxed build (only declared inputs visible)
    CMake+Ninja: compiler-generated deps (-MMD)

Build cache:
  Local cache: avoid rebuilding on same machine
  Remote cache: share between team members and CI
  Ccache: C/C++ compiler cache (wraps gcc/clang)
    export CC="ccache gcc"
    ccache --show-stats
```

### Ninja
```bash
# Ninja: low-level build tool optimized for speed
# CMake and Meson generate Ninja files (CMake default since 3.14 on Linux)

# Use CMake with Ninja
cmake -G Ninja -B build
cmake --build build

# Ninja directly
ninja -C build              # Build (auto-detects CPU count)
ninja -C build -j8          # 8 parallel jobs
ninja -C build -t graph | dot -Tpng > graph.png  # Dependency graph
ninja -C build -t clean     # Clean
ninja -C build mylib        # Specific target

# Why Ninja is fast:
# - Minimal parsing overhead
# - No shell overhead for simple rules
# - Dependency file loading optimized
# - Optimized parallel scheduling
```

### Reproducible Builds
```
Reproducible build: same source → same binary byte-for-byte
  Why it matters:
    Verify supply chain (build matches source)
    Detect compromised build servers
    Content-addressed caching correctness

Common sources of non-reproducibility:
  Timestamps embedded in binaries (__DATE__, __TIME__)
  File system ordering (readdir returns random order)
  Random UUIDs/identifiers generated at build time
  Host system paths embedded in debug info
  Parallel build ordering

Fixes:
  SOURCE_DATE_EPOCH: standardize timestamps
    export SOURCE_DATE_EPOCH=$(git log -1 --pretty=%ct)
  -ffile-prefix-map: normalize source paths
    -ffile-prefix-map=$(pwd)=.
  Sort file lists before processing
  Bazel: hermetic sandboxed builds ensure reproducibility

# Check if builds are reproducible
diffoscope build1/myapp build2/myapp
```

---

## Language-Specific Build Tools

```bash
# Python
pip install -e .              # Install in editable mode
python -m build               # Build wheel + sdist
twine upload dist/*           # Publish to PyPI

# pyproject.toml (PEP 518/621)
[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[project]
name = "mypackage"
version = "1.0.0"
dependencies = ["requests>=2.28", "pydantic>=2.0"]

# Node.js (npm/yarn/pnpm)
npm install                   # Install dependencies
npm run build                 # Run build script
npm run test                  # Run test script
npm pack                      # Create tarball
npm publish                   # Publish to npm

# Rust (Cargo)
cargo build                   # Debug build
cargo build --release         # Optimized build
cargo test                    # Test
cargo run                     # Build and run
cargo doc --open              # Build and open docs
cargo clippy                  # Linter
cargo fmt                     # Format
cargo publish                 # Publish to crates.io

# Go
go build ./...                # Build all packages
go test ./...                 # Test all
go install cmd/myapp@latest   # Install binary
go mod tidy                   # Clean up go.mod/go.sum
```

---

*Build systems seem boring until they break. Master them and you'll understand why builds are fast or slow, why "it works on my machine" happens, and how to make CI 10x faster.*
