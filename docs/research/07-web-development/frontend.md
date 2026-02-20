# Frontend Engineering — Complete Reference

> The browser is a platform. Master it like a platform engineer masters Linux.

---

## The Browser Platform

### How Browsers Work
```
URL entered → browser processes:

1. DNS Resolution → IP address
2. TCP connection → TLS handshake
3. HTTP GET / → HTML response

HTML Parsing Pipeline:
  Bytes → Characters → Tokens → DOM tree
                ↓
  CSS bytes → CSSOM tree
                ↓
  DOM + CSSOM → Render Tree (visible nodes only)
                ↓
  Layout (Reflow): calculate positions and sizes
                ↓
  Paint: fill pixels in layers
                ↓
  Composite: merge layers → display

JavaScript blocks HTML parsing!
  → <script> pauses parser until script executes
  → <script defer> → executes after HTML parsed (preserves order)
  → <script async> → executes when downloaded (order not guaranteed)
  → ES Modules are deferred by default
```

### Critical Rendering Path
```
Render-blocking resources:
  - CSS in <head> → blocks rendering (browser needs CSSOM first)
  - Synchronous JS → blocks parsing

Optimization:
  1. Inline critical CSS in <head>
  2. Load non-critical CSS asynchronously:
     <link rel="preload" as="style" href="non-critical.css">
  3. defer or async non-critical scripts
  4. Preconnect to external domains:
     <link rel="preconnect" href="https://fonts.googleapis.com">
  5. Preload critical resources:
     <link rel="preload" as="font" href="font.woff2" crossorigin>
```

---

## HTML5 Deep Dive

### Semantic HTML
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Page description for SEO">
    <title>Page Title</title>
    <!-- Preconnect to CDN -->
    <link rel="preconnect" href="https://cdn.example.com">
</head>
<body>
    <header>
        <nav aria-label="Main navigation">
            <ul>
                <li><a href="/">Home</a></li>
                <li><a href="/about" aria-current="page">About</a></li>
            </ul>
        </nav>
    </header>

    <main>
        <article>
            <header>
                <h1>Article Title</h1>
                <time datetime="2024-01-15">January 15, 2024</time>
                <address>By <a href="/authors/alice">Alice</a></address>
            </header>
            <section aria-labelledby="intro-heading">
                <h2 id="intro-heading">Introduction</h2>
                <p>Content...</p>
            </section>
            <figure>
                <img src="photo.webp"
                     alt="Descriptive alt text"
                     width="800" height="600"
                     loading="lazy"
                     decoding="async">
                <figcaption>Figure caption</figcaption>
            </figure>
        </article>

        <aside aria-label="Related articles">
            <!-- Sidebar content -->
        </aside>
    </main>

    <footer>
        <p><small>&copy; 2024 Company</small></p>
    </footer>
</body>
</html>
```

### Forms
```html
<form method="post" action="/submit" novalidate>
    <fieldset>
        <legend>Personal Information</legend>

        <label for="name">Name <span aria-hidden="true">*</span></label>
        <input type="text"
               id="name"
               name="name"
               required
               minlength="2"
               maxlength="50"
               autocomplete="name"
               aria-required="true"
               aria-describedby="name-error">
        <span id="name-error" role="alert" aria-live="polite"></span>

        <label for="email">Email</label>
        <input type="email" id="email" name="email" autocomplete="email">

        <label for="dob">Date of Birth</label>
        <input type="date" id="dob" name="dob" min="1900-01-01">

        <label for="quantity">Quantity</label>
        <input type="number" id="quantity" name="quantity"
               min="1" max="100" step="1" value="1">

        <!-- Select -->
        <label for="country">Country</label>
        <select id="country" name="country">
            <option value="">Select...</option>
            <optgroup label="North America">
                <option value="us">United States</option>
                <option value="ca">Canada</option>
            </optgroup>
        </select>

        <!-- Checkbox group -->
        <fieldset>
            <legend>Interests</legend>
            <label><input type="checkbox" name="interests" value="tech"> Technology</label>
            <label><input type="checkbox" name="interests" value="design"> Design</label>
        </fieldset>
    </fieldset>

    <button type="submit">Submit</button>
    <button type="reset">Reset</button>
</form>
```

---

## CSS Mastery

### Layout Systems

#### Flexbox
```css
.container {
    display: flex;
    flex-direction: row;          /* row | column | row-reverse | column-reverse */
    flex-wrap: wrap;              /* nowrap | wrap | wrap-reverse */
    justify-content: space-between; /* main axis: flex-start | flex-end | center | space-between | space-around | space-evenly */
    align-items: center;          /* cross axis: flex-start | flex-end | center | stretch | baseline */
    align-content: flex-start;    /* multiple lines: same as justify-content */
    gap: 1rem;                    /* gap between items */
}

.item {
    flex: 1 1 200px;              /* flex-grow flex-shrink flex-basis */
    /* flex: 1  = flex: 1 1 0%  (grow and shrink, start from 0) */
    /* flex: auto = flex: 1 1 auto (grow and shrink, natural size) */
    align-self: flex-start;       /* Override align-items for this item */
    order: -1;                    /* Reorder visually */
}
```

#### CSS Grid
```css
.grid {
    display: grid;

    /* Define columns */
    grid-template-columns: 1fr 2fr 1fr;           /* 3 columns: 25%, 50%, 25% */
    grid-template-columns: repeat(3, 1fr);         /* Equal 3 columns */
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));  /* Responsive */
    grid-template-columns: 250px 1fr;              /* Sidebar + main */

    /* Define rows */
    grid-template-rows: auto 1fr auto;             /* header, main, footer */
    grid-auto-rows: 100px;                         /* Default row height */

    /* Named areas */
    grid-template-areas:
        "header  header"
        "sidebar main"
        "footer  footer";

    gap: 1rem;
    row-gap: 1rem;
    column-gap: 2rem;
}

.header  { grid-area: header; }
.sidebar { grid-area: sidebar; }
.main    { grid-area: main; }
.footer  { grid-area: footer; }

/* Place items */
.item {
    grid-column: 1 / 3;           /* Span from line 1 to line 3 */
    grid-column: span 2;          /* Span 2 columns */
    grid-row: 2 / 4;
    justify-self: center;         /* Horizontal alignment within cell */
    align-self: center;           /* Vertical alignment within cell */
}
```

### CSS Custom Properties (Variables)
```css
:root {
    /* Design tokens */
    --color-primary: hsl(220, 90%, 56%);
    --color-primary-dark: hsl(220, 90%, 46%);
    --color-surface: hsl(0, 0%, 100%);
    --color-text: hsl(220, 15%, 15%);
    --color-text-muted: hsl(220, 10%, 50%);

    --space-xs: 0.25rem;
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 2rem;
    --space-xl: 4rem;

    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    --font-size-2xl: 2rem;

    --radius-sm: 0.25rem;
    --radius-md: 0.5rem;
    --radius-full: 9999px;

    --shadow-sm: 0 1px 3px rgb(0 0 0 / 0.1);
    --shadow-md: 0 4px 16px rgb(0 0 0 / 0.15);
}

@media (prefers-color-scheme: dark) {
    :root {
        --color-surface: hsl(220, 15%, 10%);
        --color-text: hsl(220, 15%, 90%);
    }
}

.button {
    background: var(--color-primary);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
}
```

### Responsive Design
```css
/* Mobile-first approach */
.container {
    width: 100%;
    padding: 0 var(--space-md);
}

@media (min-width: 640px)  { /* sm */
    .container { max-width: 640px; margin: 0 auto; }
}
@media (min-width: 768px)  { /* md */
    .container { max-width: 768px; }
}
@media (min-width: 1024px) { /* lg */
    .container { max-width: 1024px; }
}
@media (min-width: 1280px) { /* xl */
    .container { max-width: 1280px; }
}

/* Fluid typography */
.heading {
    font-size: clamp(1.5rem, 4vw, 3rem);
}

/* Container queries (element queries) */
.card-container {
    container-type: inline-size;
}
@container (min-width: 400px) {
    .card { display: flex; }
}

/* Responsive images */
img {
    max-width: 100%;
    height: auto;
}

picture {
    display: block;
}
/* Use <picture> for art direction */
```

### Animations and Transitions
```css
/* Transitions */
.button {
    transition: background-color 200ms ease,
                transform 150ms ease,
                box-shadow 200ms ease;
}
.button:hover {
    background-color: var(--color-primary-dark);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
}

/* Keyframe animations */
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-spinner {
    animation: spin 1s linear infinite;
}

.fade-in {
    animation: fadeIn 300ms ease-out both;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}

/* Performance: use transform and opacity (composite-only)
   NOT: width, height, top, left, margin (trigger layout) */
```

---

## JavaScript in the Browser

### DOM Manipulation
```javascript
// Query
const el = document.querySelector('.card');          // First match
const els = document.querySelectorAll('.card');       // All matches
const byId = document.getElementById('main');

// Create
const div = document.createElement('div');
div.className = 'card';
div.textContent = 'Hello';
div.setAttribute('data-id', '123');
document.body.appendChild(div);

// Template literals for HTML
function createCard({ id, title, description }) {
    const article = document.createElement('article');
    article.innerHTML = `
        <h2 class="card__title">${escapeHTML(title)}</h2>
        <p class="card__description">${escapeHTML(description)}</p>
    `;
    article.dataset.id = id;
    return article;
}

// Avoid XSS — never use innerHTML with user data directly
function escapeHTML(str) {
    return str.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;',
        '"': '&quot;', "'": '&#39;'
    }[c]));
}

// Events
document.addEventListener('DOMContentLoaded', () => {
    // DOM ready
});

// Event delegation (efficient — single listener for many elements)
document.querySelector('.list').addEventListener('click', (e) => {
    const item = e.target.closest('.list-item');
    if (!item) return;
    handleItemClick(item.dataset.id);
});

// Intersection Observer (lazy loading, infinite scroll)
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadContent(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, { rootMargin: '100px' });

document.querySelectorAll('[data-lazy]').forEach(el => observer.observe(el));

// Resize Observer
const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const { width, height } = entry.contentRect;
        adjustLayout(width, height);
    }
});
resizeObserver.observe(document.querySelector('.container'));
```

### Web APIs
```javascript
// Fetch API
async function fetchUser(id) {
    const res = await fetch(`/api/users/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
}

// POST with JSON
async function createUser(data) {
    const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(5000)  // 5s timeout
    });
    return res.json();
}

// Local Storage (persists across sessions)
localStorage.setItem('theme', 'dark');
const theme = localStorage.getItem('theme');
localStorage.removeItem('theme');
localStorage.clear();

// Session Storage (cleared on tab close)
sessionStorage.setItem('draft', JSON.stringify(formData));

// IndexedDB (large structured data)
const request = indexedDB.open('myDB', 1);
request.onupgradeneeded = (e) => {
    const db = e.target.result;
    const store = db.createObjectStore('users', { keyPath: 'id' });
    store.createIndex('email', 'email', { unique: true });
};

// Web Workers (background threads)
const worker = new Worker('worker.js');
worker.postMessage({ type: 'COMPUTE', data: bigArray });
worker.onmessage = (e) => {
    console.log('Result:', e.data);
};

// worker.js:
// self.onmessage = (e) => {
//     const result = heavyComputation(e.data.data);
//     self.postMessage(result);
// };

// History API (SPA routing)
history.pushState({ page: 'about' }, '', '/about');
history.replaceState(state, '', '/home');
window.addEventListener('popstate', (e) => navigate(e.state));
```

---

## React Patterns

```jsx
import { useState, useEffect, useCallback, useMemo, useRef,
         createContext, useContext, useReducer } from 'react';

// Custom hook
function useDebounce(value, delay = 300) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
}

// Context for global state
const ThemeContext = createContext({ theme: 'light', toggle: () => {} });

function ThemeProvider({ children }) {
    const [theme, setTheme] = useState('light');
    const toggle = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), []);

    return (
        <ThemeContext.Provider value={{ theme, toggle }}>
            {children}
        </ThemeContext.Provider>
    );
}

// Reducer for complex state
const initialState = { items: [], loading: false, error: null };

function cartReducer(state, action) {
    switch (action.type) {
        case 'ADD_ITEM':
            return { ...state, items: [...state.items, action.item] };
        case 'REMOVE_ITEM':
            return { ...state, items: state.items.filter(i => i.id !== action.id) };
        case 'SET_LOADING':
            return { ...state, loading: action.loading };
        case 'SET_ERROR':
            return { ...state, error: action.error };
        default:
            return state;
    }
}

// Data fetching pattern with cleanup
function useData(url) {
    const [state, dispatch] = useReducer(
        (s, a) => ({ ...s, ...a }),
        { data: null, loading: true, error: null }
    );

    useEffect(() => {
        let cancelled = false;
        dispatch({ loading: true, error: null });

        fetch(url)
            .then(r => r.json())
            .then(data => { if (!cancelled) dispatch({ data, loading: false }); })
            .catch(err => { if (!cancelled) dispatch({ error: err.message, loading: false }); });

        return () => { cancelled = true; };  // Cleanup on unmount or url change
    }, [url]);

    return state;
}

// Performance optimizations
const ExpensiveList = React.memo(({ items, onSelect }) => {
    // Only re-renders if items or onSelect change
    return (
        <ul>
            {items.map(item => (
                <li key={item.id} onClick={() => onSelect(item)}>
                    {item.name}
                </li>
            ))}
        </ul>
    );
});

function ParentComponent() {
    const [filter, setFilter] = useState('');
    const [items, setItems] = useState([]);

    // useMemo: recalculate only when items or filter change
    const filteredItems = useMemo(
        () => items.filter(i => i.name.toLowerCase().includes(filter.toLowerCase())),
        [items, filter]
    );

    // useCallback: stable function reference (won't cause ExpensiveList to re-render)
    const handleSelect = useCallback((item) => {
        console.log('Selected:', item);
    }, []);

    return <ExpensiveList items={filteredItems} onSelect={handleSelect} />;
}
```

---

## Web Performance

### Core Web Vitals
```
LCP (Largest Contentful Paint): < 2.5s
  → How quickly the main content loads
  → Optimize: preload hero image, fast server response

FID (First Input Delay): < 100ms
  → Responsiveness to first user interaction
  → Optimize: reduce long tasks, code splitting

CLS (Cumulative Layout Shift): < 0.1
  → How much page layout shifts unexpectedly
  → Fix: always specify width/height on images/videos

INP (Interaction to Next Paint): < 200ms
  → Overall responsiveness (replaces FID)
  → Optimize: reduce JavaScript execution time
```

### Optimization Techniques
```javascript
// Code splitting (React/webpack)
const LazyComponent = React.lazy(() => import('./LazyComponent'));

<Suspense fallback={<Spinner />}>
    <LazyComponent />
</Suspense>

// Route-based splitting
const Home = React.lazy(() => import('./routes/Home'));
const About = React.lazy(() => import('./routes/About'));

// Virtualization (large lists)
// react-virtual, react-window — only render visible items
import { useVirtualizer } from '@tanstack/react-virtual';

// Image optimization
// Use modern formats: WebP, AVIF
// Responsive images
<img
    src="image-800.webp"
    srcset="image-400.webp 400w, image-800.webp 800w, image-1200.webp 1200w"
    sizes="(max-width: 600px) 100vw, 800px"
    loading="lazy"
    decoding="async"
    width="800"
    height="600"
    alt="Description"
/>
```

---

*The browser is one of the most complex pieces of software ever built. Mastering it — not just frameworks, but the platform itself — separates frontend engineers from frontend developers.*
