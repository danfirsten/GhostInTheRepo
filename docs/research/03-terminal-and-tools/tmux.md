# Tmux — Terminal Multiplexer Mastery

> Tmux gives you persistent sessions, split panes, and the ability to detach and reattach from any machine. It's non-negotiable for serious server work.

---

## Core Concepts

```
Session → Windows → Panes

Session:   top-level grouping, survives disconnect
Window:    like a tab in a browser, full-screen view
Pane:      split section within a window (horizontal or vertical)
```

---

## Sessions

```bash
# Creating sessions
tmux                              # New unnamed session
tmux new -s work                  # Named session "work"
tmux new-session -s dev -d        # Create detached (background)

# Listing and attaching
tmux ls                           # List all sessions
tmux list-sessions
tmux attach -t work               # Attach to "work"
tmux attach -t work -d            # Attach, detach others
tmux a                            # Attach to last session

# Renaming and killing
tmux rename-session -t 0 myname
tmux kill-session -t work
tmux kill-server                  # Kill everything

# Switching (inside tmux, with prefix)
Prefix $          Rename current session
Prefix (          Previous session
Prefix )          Next session
Prefix s          Choose session interactively (tree view)
Prefix L          Last (most recently used) session
```

---

## Default Key Bindings

**Prefix key**: `Ctrl-b` (commonly remapped to `Ctrl-a`)

### Session Management
```
Prefix d    Detach from session
Prefix $    Rename session
Prefix s    Switch session (interactive tree)
Prefix (    Previous session
Prefix )    Next session
```

### Window Management
```
Prefix c    New window
Prefix ,    Rename current window
Prefix w    List windows (interactive)
Prefix n    Next window
Prefix p    Previous window
Prefix 0-9  Jump to window by number
Prefix &    Kill current window (with confirmation)
Prefix .    Move window to number
Prefix f    Find window by name
```

### Pane Management
```
Prefix %    Split pane horizontally (left/right)
Prefix "    Split pane vertically (top/bottom)
Prefix x    Kill current pane (with confirmation)
Prefix q    Show pane numbers (press number to select)
Prefix o    Cycle through panes
Prefix z    Toggle pane zoom (fullscreen)
Prefix !    Break pane into new window
Prefix {    Move pane left (swap)
Prefix }    Move pane right (swap)
Prefix Spacebar  Toggle between pane layouts
Prefix Alt-1     Even-horizontal layout
Prefix Alt-2     Even-vertical layout
Prefix Alt-3     Main-horizontal layout
Prefix Alt-4     Main-vertical layout
Prefix Alt-5     Tiled layout
```

### Pane Navigation
```
Prefix ↑↓←→     Move between panes (arrow keys)
Prefix h/j/k/l  Move between panes (vim keys, if configured)
Prefix Ctrl-↑   Resize pane up
Prefix Alt-↑    Resize pane up (large step)
```

### Copy Mode (vi-style)
```
Prefix [        Enter copy mode
q               Exit copy mode
h/j/k/l        Move cursor
Ctrl-d/u       Scroll down/up half page
Ctrl-f/b       Scroll down/up full page
/               Search forward
?               Search backward
n/N            Next/previous match
Space          Start selection (vi mode)
Enter          Copy selection
Prefix ]        Paste
```

### Misc
```
Prefix ?        Show key bindings
Prefix :        Command mode (like vim :)
Prefix t        Show clock
Prefix ~        Show messages
```

---

## .tmux.conf — The Perfect Config

```bash
# ~/.tmux.conf

# ============================================
# Core Settings
# ============================================

# Use Ctrl-a as prefix (like screen, easier to reach)
unbind C-b
set-option -g prefix C-a
bind-key C-a send-prefix

# Enable mouse support
set -g mouse on

# Start numbering at 1 (easier to reach on keyboard)
set -g base-index 1
setw -g pane-base-index 1

# Renumber windows when one is closed
set -g renumber-windows on

# Increase scrollback buffer
set -g history-limit 50000

# Status line update interval
set -g status-interval 5

# Reduce escape time (important for vim in tmux)
set -s escape-time 10

# Enable 256 colors
set -g default-terminal "tmux-256color"
set -ga terminal-overrides ",xterm-256color*:Tc"

# Enable focus events (vim responsive to focus)
set -g focus-events on

# ============================================
# Key Bindings
# ============================================

# Reload config with r
bind r source-file ~/.tmux.conf \; display "Config reloaded!"

# Better split keys (current directory)
bind | split-window -h -c "#{pane_current_path}"
bind - split-window -v -c "#{pane_current_path}"
unbind '"'
unbind %

# Vim-style pane navigation
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R

# Smart pane switching with awareness of Vim splits
# Requires vim-tmux-navigator plugin in vim
is_vim="ps -o state= -o comm= -t '#{pane_tty}' \
    | grep -iqE '^[^TXZ ]+ +(\\S+\\/)?g?(view|l?n?vim?x?|fzf)(diff)?$'"
bind -n 'C-h' if-shell "$is_vim" 'send-keys C-h' 'select-pane -L'
bind -n 'C-j' if-shell "$is_vim" 'send-keys C-j' 'select-pane -D'
bind -n 'C-k' if-shell "$is_vim" 'send-keys C-k' 'select-pane -U'
bind -n 'C-l' if-shell "$is_vim" 'send-keys C-l' 'select-pane -R'

# Resize panes
bind -r H resize-pane -L 5
bind -r J resize-pane -D 5
bind -r K resize-pane -U 5
bind -r L resize-pane -R 5

# Create window in current directory
bind c new-window -c "#{pane_current_path}"

# Copy mode vi keys
setw -g mode-keys vi
bind -T copy-mode-vi 'v' send -X begin-selection
bind -T copy-mode-vi 'y' send -X copy-selection
bind -T copy-mode-vi C-v  send -X rectangle-toggle

# Paste from system clipboard
bind P paste-buffer

# Session switching
bind -n M-1 switch-client -t 1
bind -n M-2 switch-client -t 2
bind -n M-3 switch-client -t 3

# ============================================
# Status Bar
# ============================================
set -g status-position bottom
set -g status-style bg='#1e2030',fg='#cad3f5'

# Left: session name
set -g status-left-length 20
set -g status-left '#[bg=#89b4fa,fg=#1e2030,bold] #S #[default] '

# Right: date + time + hostname
set -g status-right-length 60
set -g status-right '#[fg=#a6e3a1]  %Y-%m-%d  #[fg=#89b4fa]%H:%M #[fg=#cdd6f4] #h'

# Window status
setw -g window-status-format ' #I:#W '
setw -g window-status-current-format '#[fg=#89b4fa,bold] #I:#W '
setw -g window-status-current-style fg='#89b4fa',bg='#313244'

# Pane borders
set -g pane-border-style fg='#313244'
set -g pane-active-border-style fg='#89b4fa'

# ============================================
# Plugins (requires TPM)
# ============================================
# Install TPM: git clone https://github.com/tmux-plugins/tpm ~/.tmux/plugins/tpm

set -g @plugin 'tmux-plugins/tpm'
set -g @plugin 'tmux-plugins/tmux-sensible'
set -g @plugin 'tmux-plugins/tmux-resurrect'     # Save/restore sessions
set -g @plugin 'tmux-plugins/tmux-continuum'     # Auto-save sessions
set -g @plugin 'christoomey/vim-tmux-navigator'  # Vim/tmux navigation

set -g @continuum-restore 'on'
set -g @resurrect-capture-pane-contents 'on'

run '~/.tmux/plugins/tpm/tpm'
```

---

## Scripting Sessions

### Automate Session Creation
```bash
#!/usr/bin/env bash
# dev-session.sh — create my standard dev environment

SESSION="dev"

# Don't create if exists
tmux has-session -t $SESSION 2>/dev/null
if [[ $? == 0 ]]; then
    tmux attach-session -t $SESSION
    exit 0
fi

# Create session with first window
tmux new-session -d -s $SESSION -n "editor" -x 220 -y 50

# Window 1: Editor
tmux send-keys -t "$SESSION:editor" "cd ~/projects/myapp && nvim ." Enter

# Window 2: Server
tmux new-window -t "$SESSION" -n "server"
tmux send-keys -t "$SESSION:server" "cd ~/projects/myapp && npm run dev" Enter

# Window 3: Git/misc split
tmux new-window -t "$SESSION" -n "git"
tmux split-window -h -t "$SESSION:git" -c "~/projects/myapp"
tmux send-keys -t "$SESSION:git.1" "cd ~/projects/myapp && git status" Enter
tmux send-keys -t "$SESSION:git.2" "htop" Enter
tmux resize-pane -t "$SESSION:git.1" -x 100

# Window 4: DB shell
tmux new-window -t "$SESSION" -n "db"
tmux send-keys -t "$SESSION:db" "psql -U postgres myapp" Enter

# Select first window
tmux select-window -t "$SESSION:editor"

# Attach
tmux attach-session -t $SESSION
```

### tmuxinator (Session Manager)
```yaml
# ~/.config/tmuxinator/myproject.yml
name: myproject
root: ~/projects/myapp

windows:
  - editor:
      layout: main-vertical
      panes:
        - nvim .
        - # empty pane (shell)

  - server:
      panes:
        - npm run dev

  - database:
      panes:
        - psql -U postgres myapp

  - git:
      panes:
        - git status
```
```bash
mux start myproject
mux stop myproject
mux list
```

---

## Advanced Usage

### Synchronize Panes (Run Command on All)
```bash
# Prefix : setw synchronize-panes on
# Now typing in one pane types in all panes in the window
# Useful for: running same command on multiple servers

# Example: update all servers simultaneously
# Open panes connected to server1, server2, server3
# Enable sync, run: sudo apt update && sudo apt upgrade -y
# Disable sync: Prefix : setw synchronize-panes off
```

### Send Commands Programmatically
```bash
# Send keys to specific pane without attaching
tmux send-keys -t "session:window.pane" "command" Enter

# Example: run tests in background session
tmux send-keys -t "dev:test.0" "npm test" Enter

# Capture pane output
tmux capture-pane -t "session:window" -p    # Print pane content
tmux capture-pane -t "session:window" -p -S -   # Full scrollback
```

### Nested Tmux (Remote Servers)
```bash
# Problem: Ctrl-a passes to outer tmux
# Solution: Press Ctrl-a twice to send to inner tmux
# Or: use different prefix for inner (Ctrl-b)
```

### Persistent SSH Tunnels via Tmux
```bash
# Create named tmux session for SSH tunnel
tmux new-session -d -s tunnel "ssh -N -L 5432:db-server:5432 bastion-host"
# Tunnel persists even after you disconnect from local machine (if on remote)
```

---

## Quick Reference Card

```
Session:    new  list  attach  detach  kill  rename
Window:     new  next  prev    list    kill  rename
Pane:       split (| -)  navigate (hjkl)  resize (HJKL)  zoom (z)  kill (x)
Copy:       enter ([)  select (v)  copy (y)  paste (])
Commands:   Prefix :command
```

---

*Tmux makes remote work feel local. Once you're living in tmux, you'll never go back to plain terminals.*
