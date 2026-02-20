# Vim — The God Mode Editor

> Vim is not a text editor you use. It's a language for text manipulation. Once you speak it fluently, nothing else comes close.

---

## Philosophy

Vim operates on a **composable language** principle:
```
[count] [operator] [motion]
```

Examples:
- `d3w` — delete 3 words
- `ci"` — change inside quotes
- `>ap` — indent a paragraph
- `yG` — yank to end of file
- `c/pattern` — change until pattern

This is not a shortcut system — it's a grammar. Learn the grammar, not the shortcuts.

---

## Modes

| Mode | Enter | Purpose |
|---|---|---|
| Normal | `Esc` / `Ctrl-[` | Navigation, commands (default) |
| Insert | `i`, `a`, `o`, etc. | Typing text |
| Visual | `v`, `V`, `Ctrl-v` | Select text |
| Command | `:` | Ex commands |
| Replace | `R` | Overwrite characters |
| Select | `gh` | Like visual but typing replaces |

---

## Normal Mode — Movement (Motions)

### Basic Movement
```
h j k l       ← ↓ ↑ →  (never touch arrow keys)
w             Next word start (by word boundary)
W             Next WORD start (by whitespace)
b             Previous word start
B             Previous WORD start
e             Next word end
E             Next WORD end
ge            Previous word end
```

### Line Movement
```
0             Start of line (column 0)
^             First non-blank character
$             End of line
g_            Last non-blank character
f{char}       Find next char on line (forward)
F{char}       Find prev char on line (backward)
t{char}       Till next char (one before)
T{char}       Till prev char
;             Repeat last f/t/F/T
,             Repeat last f/t/F/T reverse
```

### Screen/Document Movement
```
gg            Go to first line
G             Go to last line
{n}G          Go to line n
{n}gg         Same
Ctrl-d        Scroll down half screen
Ctrl-u        Scroll up half screen
Ctrl-f        Scroll down full screen
Ctrl-b        Scroll up full screen
H             Move cursor to top of screen
M             Move cursor to middle of screen
L             Move cursor to bottom of screen
zz            Center screen on cursor
zt            Cursor to top
zb            Cursor to bottom
%             Jump to matching bracket
{ }           Previous/next paragraph
[[ ]]         Previous/next section/function
```

---

## Operators (Work With Motions)

```
d{motion}     Delete
c{motion}     Change (delete + enter insert)
y{motion}     Yank (copy)
>{motion}     Indent right
<{motion}     Indent left
={motion}     Auto-indent
gU{motion}    Uppercase
gu{motion}    Lowercase
g~{motion}    Toggle case
!{motion}     Filter through external command
```

### Text Objects (The Real Power)
```
iw            Inner word
aw            A word (includes surrounding space)
is            Inner sentence
as            A sentence
ip            Inner paragraph
ap            A paragraph
i"            Inner double quotes
a"            A double quotes (includes quotes)
i'            Inner single quotes
i`            Inner backticks
i(  i)  ib    Inner parentheses
i[  i]        Inner brackets
i{  i}  iB    Inner braces
i<  i>        Inner angle brackets
it            Inner XML tag
at            A XML tag (includes tags)
```

**Examples:**
```
di"           Delete inside quotes: "hello" → ""
da"           Delete with quotes: "hello" → (nothing)
ci(           Change inside parens: (old) → ()  enter insert
yap           Yank entire paragraph
=iB           Auto-indent inside braces
vit           Visually select XML tag contents
```

---

## Editing Commands

### Insert Mode Entry Points
```
i             Insert before cursor
I             Insert at start of line
a             Append after cursor
A             Append at end of line
o             Open new line below
O             Open new line above
s             Substitute character (delete + insert)
S / cc        Substitute entire line
C             Change to end of line
```

### Common Edit Operations
```
x             Delete character under cursor
X             Delete character before cursor
dd            Delete line
D             Delete to end of line
yy            Yank line
p             Paste after cursor/below line
P             Paste before cursor/above line
u             Undo
Ctrl-r        Redo
.             Repeat last change (most powerful command)
J             Join line below to current line
r{char}       Replace character
R             Enter replace mode
~             Toggle case of character
Ctrl-a        Increment number under cursor
Ctrl-x        Decrement number under cursor
```

---

## Visual Mode

```
v             Character visual
V             Line visual
Ctrl-v        Block visual (column selection)

After selection:
d             Delete
y             Yank
c             Change
>  <          Indent
=             Auto-indent
I             Insert at start of each block line (Ctrl-v mode)
A             Append at end of each block line
```

---

## Search & Replace

```bash
/pattern          Search forward
?pattern          Search backward
n                 Next match
N                 Previous match
*                 Search word under cursor (forward)
#                 Search word under cursor (backward)
gd                Go to definition (local)
gD                Go to definition (global)

# Ex command substitution
:s/old/new/       Replace first on current line
:s/old/new/g      Replace all on current line
:%s/old/new/g     Replace all in file
:%s/old/new/gc    Interactive (confirm each)
:5,10s/old/new/g  Replace in lines 5-10

# Regex in search/replace
:%s/\(\w\+\)/[\1]/g    # Capture group (old regex)
:%s/\v(\w+)/[\1]/g     # Very magic (modern style)
:%s/foo/\U&/g          # Uppercase match (\U)
:%s/foo/\L&/g          # Lowercase match (\L)
```

### Search Options
```vim
set ignorecase    " Case insensitive
set smartcase     " Case sensitive if uppercase in pattern
set hlsearch      " Highlight matches
set incsearch     " Incremental search
:noh              " Clear highlights
```

---

## Registers & Macros

### Registers
```
""            Unnamed (default) register
"0            Yank register (last explicit yank)
"1-9          History of deletes
"a-z          Named registers (lowercase = replace)
"A-Z          Named registers (uppercase = append)
"+            System clipboard
"*            Primary selection (X11)
"_            Black hole register (delete without saving)
"=            Expression register
```

```bash
"ayy          Yank line into register a
"ap           Paste from register a
"+yy          Yank line to clipboard
"+p           Paste from clipboard
:reg          Show all registers
```

### Macros — Automate Everything
```
qa            Start recording into register a
...           Do your operations
q             Stop recording
@a            Replay macro a
@@            Repeat last macro
10@a          Replay 10 times
```

**Example macro to add semicolons to end of lines:**
```
qa            Start recording
$             End of line
a;            Append semicolon
Esc           Back to normal
j             Next line
q             Stop
@a            Run on current line
99@a          Run on next 99 lines
```

---

## Windows, Tabs & Buffers

### Buffers (open files in memory)
```vim
:e filename       Open file
:bn               Next buffer
:bp               Previous buffer
:bd               Delete (close) buffer
:ls               List buffers
:b2               Switch to buffer 2
:b filename       Switch to buffer by name
```

### Windows (splits)
```
Ctrl-w s          Horizontal split
Ctrl-w v          Vertical split
:sp filename      Open file in horizontal split
:vsp filename     Open file in vertical split
Ctrl-w h/j/k/l    Navigate between windows
Ctrl-w H/J/K/L    Move window to direction
Ctrl-w =          Equal size windows
Ctrl-w _          Maximize height
Ctrl-w |          Maximize width
Ctrl-w q          Close window
:only             Close all other windows
```

### Tabs
```vim
:tabnew           New tab
:tabn             Next tab
:tabp             Previous tab
gt                Next tab (normal mode)
gT                Previous tab
:tabclose         Close tab
:tabs             List tabs
```

---

## Command Mode (:)

```vim
:q              Quit
:w              Write (save)
:wq             Write and quit
:x              Write if modified and quit
:q!             Force quit without saving
ZZ              Save and quit
ZQ              Quit without saving

:w !sudo tee %  Save as root when opened without sudo
:w new_name     Save as new file
:sav new_name   Save as and switch to new file

:!command       Run shell command
:r !command     Insert output of command
:r filename     Insert file contents

:set number     Show line numbers
:set rnu        Relative line numbers (amazing for motions)
:set tabstop=4
:set expandtab
:colorscheme desert

:%              Entire file range
:1,5            Lines 1-5
:'<,'>          Visual selection (auto-filled)
:.              Current line
:$              Last line
:.,$            Current to end
```

---

## .vimrc — Configuration

```vim
" Basic settings
set nocompatible          " No Vi compatibility
filetype plugin indent on " Filetype detection
syntax enable             " Syntax highlighting

" UI
set number               " Line numbers
set relativenumber       " Relative line numbers
set cursorline           " Highlight current line
set colorcolumn=80       " Show 80 char limit
set scrolloff=8          " Keep 8 lines visible when scrolling
set signcolumn=yes       " Always show sign column
set termguicolors        " True color support

" Search
set hlsearch             " Highlight matches
set incsearch            " Incremental search
set ignorecase           " Case insensitive
set smartcase            " Smart case
nnoremap <C-l> :nohlsearch<CR>  " Clear highlight with Ctrl-l

" Indentation
set tabstop=4
set softtabstop=4
set shiftwidth=4
set expandtab            " Spaces not tabs
set autoindent
set smartindent

" File handling
set noswapfile
set nobackup
set undofile             " Persistent undo
set undodir=~/.vim/undo

" Performance
set lazyredraw
set updatetime=100

" Leader key (Space is ideal)
let mapleader = " "

" Key mappings
nnoremap <leader>ff :find *
nnoremap <leader>w :w<CR>
nnoremap <leader>q :q<CR>
nnoremap <C-h> <C-w>h
nnoremap <C-j> <C-w>j
nnoremap <C-k> <C-w>k
nnoremap <C-l> <C-w>l

" Keep visual selection when indenting
vnoremap < <gv
vnoremap > >gv

" Move lines up/down
nnoremap <A-j> :m .+1<CR>==
nnoremap <A-k> :m .-2<CR>==
vnoremap <A-j> :m '>+1<CR>gv=gv
vnoremap <A-k> :m '<-2<CR>gv=gv

" Center after search
nnoremap n nzzzv
nnoremap N Nzzzv

" Yank to end of line (consistent with D, C)
nnoremap Y y$
```

---

## Neovim — The Modern Vim

Neovim is a refactored Vim with:
- Lua-based config (`~/.config/nvim/init.lua`)
- Built-in LSP client (Language Server Protocol)
- Async I/O
- Tree-sitter for syntax
- Better terminal emulator

### Essential Neovim Plugins
```lua
-- Plugin manager: lazy.nvim
require("lazy").setup({
    -- LSP
    "neovim/nvim-lspconfig",
    "williamboman/mason.nvim",           -- Install LSP servers
    "williamboman/mason-lspconfig.nvim",

    -- Completion
    "hrsh7th/nvim-cmp",
    "hrsh7th/cmp-nvim-lsp",

    -- Syntax
    "nvim-treesitter/nvim-treesitter",

    -- Fuzzy finder (FZF-like)
    "nvim-telescope/telescope.nvim",
    "nvim-lua/plenary.nvim",

    -- File tree
    "nvim-tree/nvim-tree.lua",

    -- Status line
    "nvim-lualine/lualine.nvim",

    -- Git
    "lewis6991/gitsigns.nvim",
    "tpope/vim-fugitive",

    -- Utilities
    "tpope/vim-surround",       -- cs"' change surrounding
    "tpope/vim-commentary",     -- gc to comment
    "jiangmiao/auto-pairs",     -- Auto close brackets
    "folke/which-key.nvim",     -- Show keybindings

    -- Theme
    "folke/tokyonight.nvim",
})
```

---

## Advanced Techniques

### Global Command
```vim
:g/pattern/command     " Run command on all matching lines
:g/TODO/p              " Print all TODO lines
:g/^$/d                " Delete all blank lines
:g/pattern/d           " Delete all matching lines
:v/pattern/d           " Delete all non-matching lines (inverse)
:g/function/normal @q  " Run macro on all function lines
```

### Sort & Filter
```vim
:sort                  " Sort entire file
:'<,'>sort             " Sort selection
:sort n                " Numeric sort
:sort!                 " Reverse sort
:sort u                " Sort unique (remove dupes)
:%!sort | uniq         " Pipe through shell command
```

### Marks
```
ma              Set mark 'a' (lowercase: buffer-local)
mA              Set mark 'A' (uppercase: global, across files)
'a              Jump to line of mark a
`a              Jump to exact position of mark a
'.              Last change position
''              Position before last jump
```

### Folds
```
zf{motion}      Create fold
zo              Open fold
zc              Close fold
za              Toggle fold
zR              Open all folds
zM              Close all folds
zd              Delete fold
```

### Multiple Files
```bash
vim -p *.py        # Open all in tabs
vim -o *.py        # Open all in horizontal splits
vim -O *.py        # Open all in vertical splits

# In vim
:args *.py         # Set arg list
:next :prev        # Navigate arg list
:argdo %s/old/new/ge | update  # Apply sub to all files
```

---

## Vim Verbs at a Glance (Cheat Reference)

```
Operators: d c y > < = gU gu g~ ! q@
Motions:   hjkl webWEB ge gE 0^$gf tf;, {}[]%
Objects:   iw aw is as ip ap i"a" i'a' i(a( i[a[ i{a{ it at
Actions:   x X dd D yy p P u Ctrl-r . r R J ~ Ctrl-a Ctrl-x
Modes:     i I a A o O s S v V Ctrl-v : /? R
Windows:   Ctrl-w s v hjkl = _ | q :sp :vsp
```

---

*Vim is not about speed. It's about precision. Once you stop thinking about the editor, you can think about the code.*
