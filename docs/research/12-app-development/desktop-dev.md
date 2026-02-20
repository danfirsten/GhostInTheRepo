# Desktop App Development — Complete Reference

> Desktop apps are the unsung heroes of software — the IDEs, the terminals, the creative tools that professionals live in. Building them well requires understanding both native platforms and the web-native alternatives.

---

## Tauri (Rust + Web Frontend)

### Why Tauri
```
Tauri: Rust backend + WebView frontend
  Bundle size: ~5 MB (vs Electron's ~150 MB)
  Performance: native Rust for business logic
  Security: no Node.js runtime, minimal attack surface
  Memory: shares OS WebView (vs bundling Chromium)

Architecture:
  Frontend: HTML/CSS/JS/React/Vue/Svelte (any web framework)
  Backend: Rust (commands, filesystem, native APIs)
  Bridge: invoke() from JS → Rust function

Trade-offs vs Electron:
  + Much smaller bundle
  + Lower RAM usage
  + Better security model
  - WebView differences across OS (browser inconsistencies)
  - Less mature ecosystem
  - Rust learning curve for backend
```

### Setting Up Tauri
```bash
# Prerequisites: Rust, Node.js
cargo install create-tauri-app --locked
npm create tauri-app@latest

# Project structure
my-app/
  src/           # Frontend (React/Vue/Svelte)
  src-tauri/     # Rust backend
    src/
      main.rs
    tauri.conf.json
    Cargo.toml

# Development
npm run tauri dev    # Hot-reload frontend + Rust backend

# Build
npm run tauri build  # Creates platform-specific installer
```

### Tauri Commands (Rust Backend)
```rust
// src-tauri/src/main.rs
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::State;
use std::sync::Mutex;

// Shared state
struct AppState {
    counter: Mutex<i32>,
}

// Tauri command: callable from JavaScript
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! From Rust.", name)
}

#[tauri::command]
fn read_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(&path)
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn increment(state: State<AppState>) -> i32 {
    let mut counter = state.counter.lock().unwrap();
    *counter += 1;
    *counter
}

// Emit events from Rust to frontend
#[tauri::command]
async fn start_task(window: tauri::Window) {
    std::thread::spawn(move || {
        for i in 0..10 {
            std::thread::sleep(std::time::Duration::from_secs(1));
            window.emit("progress", i).unwrap();
        }
        window.emit("task-done", "completed").unwrap();
    });
}

fn main() {
    tauri::Builder::default()
        .manage(AppState { counter: Mutex::new(0) })
        .invoke_handler(tauri::generate_handler![
            greet, read_file, increment, start_task
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Tauri Frontend Integration
```typescript
// Frontend: call Rust commands
import { invoke } from '@tauri-apps/api/tauri';
import { listen } from '@tauri-apps/api/event';
import { open, save } from '@tauri-apps/api/dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/api/fs';

// Call Rust command
async function greetUser() {
    const result = await invoke<string>('greet', { name: 'World' });
    console.log(result); // "Hello, World! From Rust."
}

// File system APIs (Tauri allows access beyond browser sandbox)
async function openFile() {
    // Native file picker dialog
    const path = await open({
        multiple: false,
        filters: [{ name: 'Text', extensions: ['txt', 'md'] }]
    });

    if (path && typeof path === 'string') {
        const content = await readTextFile(path);
        return content;
    }
}

async function saveFile(content: string) {
    const path = await save({
        filters: [{ name: 'Text', extensions: ['txt'] }]
    });
    if (path) {
        await writeTextFile(path, content);
    }
}

// Listen to Rust events
await listen<number>('progress', (event) => {
    console.log('Progress:', event.payload);
});

// System tray (src-tauri/src/main.rs)
// let tray = SystemTray::new().with_menu(menu);
// tauri::Builder::default().system_tray(tray)...
```

### Tauri Configuration
```json
// src-tauri/tauri.conf.json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:5173",
    "distDir": "../dist"
  },
  "tauri": {
    "bundle": {
      "identifier": "com.mycompany.myapp",
      "icon": ["icons/32x32.png", "icons/128x128.png", "icons/icon.icns", "icons/icon.ico"],
      "targets": ["dmg", "msi", "deb", "appimage"]
    },
    "windows": [{
      "title": "My App",
      "width": 1200,
      "height": 800,
      "minWidth": 800,
      "minHeight": 600,
      "resizable": true,
      "decorations": true,
      "transparent": false
    }],
    "allowlist": {
      "all": false,
      "fs": {
        "all": false,
        "readFile": true,
        "writeFile": true,
        "readDir": true,
        "scope": ["$DOCUMENT/**", "$DESKTOP/**", "$HOME/myapp/**"]
      },
      "dialog": { "open": true, "save": true },
      "notification": { "all": true },
      "shell": { "open": true }
    }
  }
}
```

---

## Electron (Node.js + Chromium)

### Architecture
```
Electron: Chromium browser + Node.js runtime packaged together

Processes:
  Main process: Node.js — creates windows, native APIs, file system
  Renderer process: Chromium tab — your web app
  Preload script: bridge between main and renderer (secure IPC)

Communication: IPC (Inter-Process Communication)
  ipcRenderer.invoke/send → ipcMain.handle/on

Why Electron:
  + Battle-tested: VS Code, Slack, Discord, Figma, 1Password, Obsidian
  + Full Node.js access (any npm package)
  + Consistent UI across platforms (same Chromium everywhere)
  + Huge ecosystem
  - Large bundle size (150-200 MB)
  - High memory usage (Chromium overhead)
  - Slower startup than native apps
```

### Main Process
```javascript
// main.js (or main/index.ts)
const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs/promises');

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,       // Security: no direct Node.js access
            contextIsolation: true,       // Security: isolate preload context
            preload: path.join(__dirname, 'preload.js'),
        },
        titleBarStyle: 'hiddenInset',    // macOS-style title bar
        vibrancy: 'under-window',        // macOS vibrancy effect
        show: false,                      // Don't show until ready-to-show
    });

    mainWindow.loadFile('index.html');
    // Or: mainWindow.loadURL('http://localhost:5173');

    mainWindow.once('ready-to-show', () => mainWindow.show());

    // Open DevTools in dev
    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }
}

app.whenReady().then(() => {
    createWindow();
    setupMenu();
    setupTray();
});

// Handle IPC calls from renderer
ipcMain.handle('read-file', async (event, filePath) => {
    try {
        return { success: true, content: await fs.readFile(filePath, 'utf-8') };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-file', async (event, { path: filePath, content }) => {
    await fs.writeFile(filePath, content, 'utf-8');
});

ipcMain.handle('open-file-dialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile'],
        filters: [{ name: 'Text Files', extensions: ['txt', 'md'] }]
    });
    return result;
});

// Global keyboard shortcuts
const { globalShortcut } = require('electron');
app.whenReady().then(() => {
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        mainWindow.webContents.toggleDevTools();
    });
});

// Dock/taskbar badge (macOS)
app.dock?.setBadge('3');

// Quit when all windows closed (except macOS)
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
```

### Preload Script (Secure Bridge)
```javascript
// preload.js — runs with Node.js access, exposes safe APIs to renderer
const { contextBridge, ipcRenderer } = require('electron');

// Expose safe API to renderer via contextBridge
contextBridge.exposeInMainWorld('electronAPI', {
    // File operations
    readFile: (path) => ipcRenderer.invoke('read-file', path),
    saveFile: (path, content) => ipcRenderer.invoke('save-file', { path, content }),
    openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),

    // Events from main → renderer
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-action', (event, action) => callback(action));
    },

    // Platform
    platform: process.platform,

    // App info
    appVersion: process.env.npm_package_version,
});
```

### Renderer Process (Web App)
```typescript
// In your React/Vue/Svelte app
// Access the exposed API via window.electronAPI

declare global {
    interface Window {
        electronAPI: {
            readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>;
            saveFile: (path: string, content: string) => Promise<void>;
            openFileDialog: () => Promise<Electron.OpenDialogReturnValue>;
            onMenuAction: (callback: (action: string) => void) => void;
            platform: string;
        };
    }
}

// Usage in React component
async function openDocument() {
    const result = await window.electronAPI.openFileDialog();
    if (!result.canceled && result.filePaths.length > 0) {
        const { success, content, error } = await window.electronAPI.readFile(result.filePaths[0]);
        if (success) {
            setContent(content);
        }
    }
}

// Listen to menu actions
useEffect(() => {
    window.electronAPI.onMenuAction((action) => {
        if (action === 'new-file') createNewFile();
        if (action === 'save') saveCurrentFile();
    });
}, []);
```

### Electron Build (electron-builder)
```bash
# electron-builder: package and distribute
npm install --save-dev electron-builder

# package.json
{
  "build": {
    "appId": "com.mycompany.myapp",
    "productName": "My App",
    "copyright": "Copyright © 2024",
    "directories": {
      "buildResources": "build"
    },
    "files": ["dist/**/*", "main.js", "preload.js"],
    "mac": {
      "target": ["dmg", "zip"],
      "category": "public.app-category.developer-tools",
      "hardenedRuntime": true,
      "entitlements": "build/entitlements.mac.plist",
      "notarize": true
    },
    "win": {
      "target": ["nsis", "portable"],
      "signingHashAlgorithms": ["sha256"]
    },
    "linux": {
      "target": ["AppImage", "deb", "rpm"],
      "category": "Development"
    },
    "publish": [{
      "provider": "github",
      "owner": "myorg",
      "repo": "myapp"
    }]
  }
}

# Build commands
electron-builder --mac     # macOS DMG
electron-builder --win     # Windows NSIS installer
electron-builder --linux   # Linux AppImage
electron-builder --publish always  # Build and publish to GitHub Releases
```

### Auto-Update
```javascript
// electron-updater: seamless auto-updates
const { autoUpdater } = require('electron-updater');

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', (info) => {
    mainWindow.webContents.send('update-available', info.version);
});

autoUpdater.on('update-downloaded', () => {
    // Ask user, then install
    dialog.showMessageBox({
        type: 'info',
        buttons: ['Restart', 'Later'],
        title: 'Update Ready',
        message: 'Update downloaded. Restart to apply?'
    }).then(result => {
        if (result.response === 0) autoUpdater.quitAndInstall();
    });
});
```

---

## Native GUI Frameworks

### Qt (C++ / Python)
```python
# PyQt6 / PySide6: Python bindings for Qt
from PySide6.QtWidgets import (QApplication, QMainWindow, QWidget,
                                QVBoxLayout, QPushButton, QLabel,
                                QFileDialog, QTextEdit)
from PySide6.QtCore import QThread, Signal, Qt
from PySide6.QtGui import QAction, QKeySequence
import sys

class WorkerThread(QThread):
    """Long-running task in background thread"""
    progress = Signal(int)
    finished = Signal(str)

    def run(self):
        for i in range(100):
            self.msleep(50)  # Simulate work
            self.progress.emit(i)
        self.finished.emit("Done!")

class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("My Qt App")
        self.setMinimumSize(800, 600)

        # Menu bar
        file_menu = self.menuBar().addMenu("File")
        open_action = QAction("Open", self)
        open_action.setShortcut(QKeySequence.Open)
        open_action.triggered.connect(self.open_file)
        file_menu.addAction(open_action)

        # Central widget
        central = QWidget()
        self.setCentralWidget(central)
        layout = QVBoxLayout(central)

        self.editor = QTextEdit()
        layout.addWidget(self.editor)

        self.status_label = QLabel("Ready")
        layout.addWidget(self.status_label)

        btn = QPushButton("Run Task")
        btn.clicked.connect(self.run_task)
        layout.addWidget(btn)

    def open_file(self):
        path, _ = QFileDialog.getOpenFileName(
            self, "Open File", "", "Text Files (*.txt *.md)"
        )
        if path:
            with open(path) as f:
                self.editor.setPlainText(f.read())

    def run_task(self):
        self.worker = WorkerThread()
        self.worker.progress.connect(lambda p: self.status_label.setText(f"{p}%"))
        self.worker.finished.connect(lambda msg: self.status_label.setText(msg))
        self.worker.start()

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())
```

### Dear ImGui (C++ Immediate Mode GUI)
```cpp
// ImGui: immediate mode GUI — perfect for tools, debuggers, game editors
// Used by: many game engines, debugging tools, scientific applications

#include "imgui.h"
#include "imgui_impl_glfw.h"
#include "imgui_impl_opengl3.h"
#include <GLFW/glfw3.h>

// In render loop:
void render_ui() {
    ImGui::Begin("Settings");

    // Immediate mode: state is external to ImGui
    static float speed = 1.0f;
    static int count = 10;
    static bool enabled = true;
    static char buf[256] = "";

    ImGui::SliderFloat("Speed", &speed, 0.0f, 10.0f);
    ImGui::InputInt("Count", &count);
    ImGui::Checkbox("Enable feature", &enabled);
    ImGui::InputText("Name", buf, sizeof(buf));

    if (ImGui::Button("Apply")) {
        // Button was clicked this frame
        apply_settings(speed, count, enabled, buf);
    }

    ImGui::SameLine();  // Next widget on same line
    if (ImGui::Button("Reset")) {
        speed = 1.0f; count = 10; enabled = true;
    }

    // Collapsible section
    if (ImGui::CollapsingHeader("Advanced")) {
        ImGui::Text("Debug info: %d objects", object_count);
        ImGui::Separator();
        ImGui::PlotLines("FPS", fps_history, 100);
    }

    // Table
    if (ImGui::BeginTable("data", 3)) {
        ImGui::TableSetupColumn("Name");
        ImGui::TableSetupColumn("Value");
        ImGui::TableSetupColumn("Status");
        ImGui::TableHeadersRow();
        for (auto& item : items) {
            ImGui::TableNextRow();
            ImGui::TableSetColumnIndex(0); ImGui::Text("%s", item.name.c_str());
            ImGui::TableSetColumnIndex(1); ImGui::Text("%.2f", item.value);
            ImGui::TableSetColumnIndex(2); ImGui::TextColored(
                item.ok ? ImVec4(0,1,0,1) : ImVec4(1,0,0,1),
                item.ok ? "OK" : "ERROR"
            );
        }
        ImGui::EndTable();
    }

    ImGui::End();
}
```

---

## Distribution and Packaging

### Cross-Platform Considerations
```
File paths:
  macOS/Linux: /Users/user/Documents
  Windows: C:\Users\user\Documents
  Use: app.getPath('documents') (Electron) or dirs crate (Rust)

Config storage:
  macOS: ~/Library/Application Support/MyApp/
  Linux: ~/.config/myapp/ (XDG)
  Windows: %APPDATA%\MyApp\
  Use platform APIs, never hardcode

Native dialogs: always use OS-native file/color/font pickers

Keyboard shortcuts:
  macOS: Cmd+C (⌘)
  Windows/Linux: Ctrl+C
  Use CommandOrControl in Electron

Window decorations:
  macOS: traffic light buttons (close, minimize, maximize) on left
  Windows: title bar with buttons on right
  Linux: varies by desktop environment

High DPI / Retina:
  Provide @2x images or use SVG
  Don't hardcode pixel sizes — use device pixel ratio
  window.devicePixelRatio in browser/Electron
```

### Code Signing
```bash
# macOS code signing and notarization (required for distribution outside App Store)
# 1. Get Apple Developer certificate
# 2. Sign binary
codesign --deep --force --options runtime \
          --sign "Developer ID Application: My Company (TEAMID)" \
          MyApp.app

# 3. Notarize (Apple scans for malware)
xcrun notarytool submit MyApp.dmg \
    --apple-id "dev@mycompany.com" \
    --team-id "TEAMID" \
    --password "@keychain:notarytool" \
    --wait

# 4. Staple notarization ticket to app
xcrun stapler staple MyApp.dmg

# Windows code signing
signtool sign /fd SHA256 /a /tr http://timestamp.digicert.com \
              /td SHA256 MyApp.exe

# electron-builder automates this with env vars:
# CSC_LINK=cert.p12 CSC_KEY_PASSWORD=password electron-builder --mac
```

---

## Performance Tips

```
Electron performance:
  Minimize IPC calls (batch operations)
  Use worker threads for CPU-intensive work
  Avoid blocking the renderer process
  Use virtual scrolling for large lists
  lazy-load features (code split)

Tauri performance:
  Rust is fast — put computation in Rust, not JS
  Use Tauri's streaming API for large data
  Minimize JS↔Rust bridge crossings

Native memory:
  Profile with Chrome DevTools Memory tab (Electron)
  Watch for memory leaks (forgotten event listeners, growing caches)
  electron.process.getHeapStatistics() — heap memory info

Startup time:
  Lazy initialize everything not needed immediately
  Show window early, load content progressively
  Cache initial data from previous session
  Consider app preloading (start process on login, show on click)
```

---

*Desktop apps live in a unique space — intimate, persistent, native. Whether you choose Tauri's lean Rust backend or Electron's mature ecosystem depends on your team, your requirements, and how much your users care about RAM usage. Either way, the fundamentals of native APIs, IPC, and distribution remain the same.*
