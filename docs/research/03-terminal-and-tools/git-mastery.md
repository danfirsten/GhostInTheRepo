# Git — Deep Mastery

> Git is not a backup system. It's a time machine, a collaboration protocol, and a history of decisions. Understand it deeply.

---

## How Git Works Internally

### The Object Model
Git stores everything as **content-addressed objects** in `.git/objects/`:

```
blob     — file content
tree     — directory listing (names + modes + blob/tree hashes)
commit   — snapshot pointer (tree hash + parent + author + message)
tag      — annotated tag (pointer to commit)
```

Every object is identified by the **SHA-1 hash of its content** (40 hex chars).

```bash
# Inspect objects
git cat-file -t abc1234   # Type of object
git cat-file -p abc1234   # Print object content
git cat-file blob HEAD:file.txt   # Print file at commit

# Tree of a commit
git ls-tree HEAD
git ls-tree -r --name-only HEAD    # All files recursively
```

### The Three Trees
Git manages three distinct "trees":

| Tree | Location | Contains |
|---|---|---|
| Working Directory | Your filesystem | Actual files you edit |
| Index (Staging) | `.git/index` | What next commit will include |
| HEAD | `.git/HEAD` | Pointer to current branch/commit |

```
Working Directory  →  git add  →  Index  →  git commit  →  Repository
                   ←  git checkout  ←      ←  git reset ←
```

### HEAD, Branches, and References
```bash
cat .git/HEAD            # Shows: ref: refs/heads/main
cat .git/refs/heads/main # Shows commit hash

# Detached HEAD: HEAD points directly to commit, not branch
git checkout abc1234     # Enters detached HEAD

# HEAD~ vs HEAD^
HEAD^    = HEAD~1 = first parent of HEAD
HEAD~2   = grandparent
HEAD^2   = second parent (merge commits have 2 parents)
```

---

## Essential Commands

### Setup
```bash
git config --global user.name "Your Name"
git config --global user.email "you@email.com"
git config --global core.editor vim
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global rebase.autoStash true
git config --global core.autocrlf input   # Linux/Mac
git config --global core.autocrlf true    # Windows

git config --list           # Show all config
git config --global --edit  # Edit global config
```

### Staging & Committing
```bash
git add file.txt           # Stage specific file
git add .                  # Stage all changes
git add -p                 # Interactive patch staging (stage hunks)
git add -i                 # Interactive staging

git status
git status -s              # Short format

git diff                   # Working dir vs index
git diff --staged          # Index vs HEAD
git diff HEAD              # Working dir vs HEAD
git diff branch1..branch2  # Between branches

git commit -m "message"
git commit -am "message"   # Add tracked changes + commit
git commit --amend         # Edit last commit (message or content)
git commit --amend --no-edit  # Add to last commit without changing message
```

### Log & History
```bash
git log
git log --oneline
git log --oneline --graph --decorate --all    # Best log view
git log -n 10                                 # Last 10 commits
git log --since="2 weeks ago"
git log --author="Alice"
git log --grep="fix"                          # Search commit messages
git log --all --full-history -- "*.py"        # History of deleted files
git log -S "function_name"                   # Pickaxe: commits adding/removing string
git log -p                                    # Patches/diffs inline
git log --stat                                # Files changed per commit
git log --follow file.txt                    # Follow renames

git show abc1234             # Show commit
git show abc1234:file.txt    # Show file at commit
git blame file.txt           # Line-by-line who changed what
git blame -L 10,20 file.txt  # Specific lines
```

### Branching
```bash
git branch                 # List local branches
git branch -a              # All including remote
git branch -v              # With last commit
git branch -vv             # With upstream tracking
git branch feature         # Create branch
git switch feature         # Switch to branch (modern)
git checkout feature       # Switch (old way)
git switch -c feature      # Create and switch
git checkout -b feature    # Create and switch (old way)
git checkout -b feature origin/feature  # Track remote

git branch -d feature      # Delete merged branch
git branch -D feature      # Force delete unmerged
git branch -m old new      # Rename branch

git push origin feature    # Push branch to remote
git push -u origin feature # Push and set tracking
git push origin :feature   # Delete remote branch
git push origin --delete feature  # Same
```

### Merging
```bash
git merge feature          # Merge feature into current
git merge --no-ff feature  # Force merge commit (no fast-forward)
git merge --squash feature # Squash all commits to one
git merge --abort          # Abort in-progress merge

# Fast-forward: moves pointer forward (no commit created)
# Three-way merge: creates a merge commit
```

### Rebasing
```bash
git rebase main            # Replay current branch on main
git rebase --interactive HEAD~3    # Rewrite last 3 commits
git rebase -i origin/main          # Interactive from divergence

# Interactive rebase options:
# pick   = keep commit as-is
# reword = keep but edit message
# edit   = stop to amend commit
# squash = meld into previous commit
# fixup  = meld + discard this commit message
# drop   = remove commit entirely
# exec   = run shell command

git rebase --continue      # After resolving conflict
git rebase --abort         # Cancel rebase
git rebase --skip          # Skip current commit

# Danger: never rebase public/shared commits
```

### Remote Operations
```bash
git remote -v                          # List remotes
git remote add origin URL
git remote add upstream URL
git remote remove origin
git remote rename origin new-name

git fetch origin                       # Download but don't merge
git fetch --all                        # Fetch all remotes
git fetch --prune                      # Remove stale remote-tracking branches

git pull                               # fetch + merge
git pull --rebase                      # fetch + rebase (preferred)
git pull origin main                   # Pull specific branch

git push origin main
git push --force-with-lease            # Safe force push
git push --force                       # DANGEROUS: overwrites remote
git push --tags                        # Push all tags
```

---

## Advanced Git Techniques

### git stash
```bash
git stash                   # Stash working dir + index
git stash push -m "WIP"     # Named stash
git stash -u                # Include untracked files
git stash -a                # Include ignored files too

git stash list              # List stashes
git stash pop               # Apply latest + remove from stash
git stash apply stash@{2}  # Apply specific, keep in stash
git stash drop stash@{0}   # Remove from stash list
git stash clear             # Remove all stashes
git stash branch feature    # Create branch from stash
git stash show -p           # Show stash diff
```

### git cherry-pick
```bash
git cherry-pick abc1234              # Apply commit to current branch
git cherry-pick abc1234 def5678      # Multiple commits
git cherry-pick abc1234..def5678     # Range (exclusive start)
git cherry-pick abc1234^..def5678    # Range (inclusive start)
git cherry-pick --no-commit abc1234  # Apply without committing
git cherry-pick --edit abc1234       # Edit commit message
```

### git reset
```bash
# Three modes:
git reset --soft HEAD~1    # Move HEAD, keep staged changes
git reset --mixed HEAD~1   # Move HEAD, unstage changes (default)
git reset --hard HEAD~1    # Move HEAD, discard all changes (DESTRUCTIVE)

git reset file.txt         # Unstage file (mixed mode)
git reset HEAD             # Unstage all staged changes
```

### git revert
```bash
git revert abc1234         # Create new commit that undoes the change
git revert HEAD            # Undo last commit (safe for shared repos)
git revert --no-commit HEAD~3..HEAD  # Revert multiple, single commit
```

### git bisect — Find the Commit That Introduced a Bug
```bash
git bisect start
git bisect bad             # Current commit is broken
git bisect good v1.0       # v1.0 was good
# Git checks out midpoint
git bisect good            # This commit is OK
git bisect bad             # This commit is broken
# Continue until culprit found
git bisect reset           # Return to HEAD

# Automated:
git bisect start HEAD v1.0
git bisect run python test.py    # Script that returns 0=good, 1=bad
```

### git reflog — Your Safety Net
```bash
git reflog                 # All HEAD movements
git reflog branch-name     # Branch-specific reflog

# Recover deleted branch or lost commits
git reflog | grep "checkout: moving from feature"
git branch recovered abc1234   # Restore from reflog hash
```

### git worktree — Multiple Working Dirs
```bash
git worktree add ../feature-branch feature
git worktree list
git worktree remove ../feature-branch
# Great for: reviewing PRs, hotfixes while working on feature
```

### git submodules
```bash
git submodule add URL path/to/submod
git submodule init
git submodule update
git submodule update --init --recursive
git submodule foreach git pull origin main
git clone --recursive URL  # Clone with all submodules
```

---

## .gitignore Mastery

```gitignore
# Files
*.log
*.tmp
.env
.env.local

# Directories
node_modules/
dist/
build/
__pycache__/
.cache/
.pytest_cache/

# OS
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Language specific
*.pyc
*.class
*.o
*.a
*.so

# Negate (don't ignore)
!important.log
!node_modules/critical-package/

# Only root
/config.local.js    # Only at root, not subdirs

# Any directory
**/logs             # In any subdirectory

# Debug: what would be ignored
git check-ignore -v file.txt
git ls-files --others --ignored --exclude-standard  # List ignored files
```

---

## Git Hooks

Located in `.git/hooks/`. Make executable (`chmod +x`).

```bash
# Useful hooks:
pre-commit       # Run tests, linting before commit
commit-msg       # Validate commit message format
pre-push         # Run tests before push
post-commit      # Notifications
post-receive     # Server-side: deploy after push
pre-rebase       # Prevent rebasing specific branches

# Example pre-commit (runs eslint)
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
set -e
echo "Running linter..."
npm run lint
echo "Running tests..."
npm test
EOF
chmod +x .git/hooks/pre-commit

# Better: use husky (shares hooks with team in repo)
# npx husky init
```

---

## Commit Message Convention

### Conventional Commits
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`

```
feat(auth): add OAuth2 login with Google

Implements RFC 6749 OAuth2 flow using authorization_code grant.
Includes PKCE for added security.

Closes #123
BREAKING CHANGE: removes old session-based auth API
```

### Good vs Bad Commits
```
BAD:  "fixed stuff"
BAD:  "WIP"
BAD:  "update"
GOOD: "fix: resolve race condition in request queue"
GOOD: "feat(api): add rate limiting with token bucket algorithm"
GOOD: "refactor: extract auth middleware to separate module"
```

---

## Git Workflows

### Git Flow
```
main          — production-ready
develop       — integration branch
feature/*     — new features (from develop, merge back)
release/*     — release prep (from develop, merge to main + develop)
hotfix/*      — production fixes (from main, merge to main + develop)
```

### GitHub Flow (Simpler)
```
main         — always deployable
feature/*    — branch from main, PR to main
```

### Trunk-Based Development (Best at Scale)
```
main         — everyone commits here frequently
feature/*    — short-lived, <1 day, feature flags for incomplete work
```

---

## Useful Configs & Aliases

```bash
# ~/.gitconfig
[alias]
    lg = log --oneline --graph --decorate --all
    st = status -s
    co = checkout
    br = branch
    ci = commit
    cp = cherry-pick
    unstage = reset HEAD --
    last = log -1 HEAD
    visual = !gitk
    undo = reset --soft HEAD~1
    wip = commit -am "WIP"
    aliases = config --get-regexp alias

[diff]
    tool = vimdiff
    algorithm = histogram    # Better diffs than default Myers

[merge]
    tool = vimdiff
    conflictstyle = diff3    # Show both + common ancestor

[rerere]
    enabled = true           # Remember conflict resolutions

[push]
    default = current        # Push to matching remote branch

[fetch]
    prune = true             # Auto-remove stale remote branches

[core]
    pager = delta            # Better diff viewer (install: cargo install git-delta)
```

---

*Git is a graph. Once you see it as a graph, everything makes sense.*
