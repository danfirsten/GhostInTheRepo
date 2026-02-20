# Web Performance — Complete Reference

> Performance IS a feature. A 1-second delay reduces conversions by 7%. Google's Core Web Vitals are now ranking signals. Fast websites win.

---

## Core Web Vitals

```
Google's metrics for user experience quality:

LCP (Largest Contentful Paint) — Loading
  Measures: render time of largest image or text block
  Target: ≤ 2.5 seconds
  Common culprits: slow server, render-blocking resources, slow images

FID (First Input Delay) → replaced by INP
INP (Interaction to Next Paint) — Interactivity
  Measures: time from user interaction to browser paints response
  Target: ≤ 200 milliseconds
  Common culprits: long JS tasks, heavy event handlers

CLS (Cumulative Layout Shift) — Visual Stability
  Measures: unexpected layout shifts during page load
  Target: ≤ 0.1
  Common culprits: images without dimensions, dynamic content insertion,
                   web fonts causing FOUT

Measuring:
  Chrome DevTools → Lighthouse → Performance
  Chrome DevTools → Performance tab → record
  web-vitals npm package (real user metrics)
  PageSpeed Insights (Google's tool, field + lab data)
  WebPageTest.org (advanced waterfall analysis)
```

---

## Critical Rendering Path

```
Browser rendering pipeline:
  HTML received → Parsing → DOM
  CSS received → CSSOM
  DOM + CSSOM → Render Tree → Layout → Paint → Composite

Render-blocking:
  CSS: ALL CSS is render-blocking (browser needs full CSSOM)
  JS: By default, parser-blocking (stops HTML parsing)
      async: download async, execute when ready (can still block render)
      defer: download async, execute after parsing (non-blocking!)
      type="module": defer by default

Optimization strategies:
  1. Critical CSS: inline above-the-fold CSS in <head>
     Load rest with media trick or JS:
     <link rel="stylesheet" href="full.css" media="print"
           onload="this.media='all'">

  2. Defer non-critical JS:
     <script defer src="analytics.js"></script>
     <script async src="ads.js"></script>

  3. Preload critical resources:
     <link rel="preload" href="hero.webp" as="image">
     <link rel="preload" href="font.woff2" as="font" crossorigin>
     <link rel="preloadconnect" href="https://api.example.com">

  4. Avoid document.write() — parser-blocking

  5. Resource hints:
     <link rel="dns-prefetch" href="https://cdn.example.com">
     <link rel="preconnect" href="https://api.example.com">
     <link rel="prefetch" href="/next-page.js">  <!-- User might need -->
```

---

## Image Optimization

### Formats and Compression
```
Image format comparison:
  JPEG:  photos, lossy, no transparency
  PNG:   lossless, transparency (large file size)
  WebP:  30% smaller than JPEG/PNG, lossy+lossless, transparency, wide support
  AVIF:  50% smaller than JPEG, excellent quality, slower decode (improving)
  SVG:   vector, scalable, for icons/logos
  GIF:   animations (use video instead: 80-90% smaller!)

Decision:
  Photos: WebP first, AVIF for modern browsers, JPEG fallback
  Icons: SVG or WebP
  Screenshots/logos: WebP or PNG
  Animations: <video> with autoplay/loop/muted

Compression tools:
  squoosh (browser-based, excellent quality control)
  imagemin (Node.js build pipeline)
  sharp (Node.js, fast, server-side)
  cwebp / avifenc (CLI)
  ImageMagick: convert input.jpg -quality 80 output.webp
```

### Responsive Images
```html
<!-- srcset: provide multiple sizes, browser picks best -->
<img
  src="hero-800.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1600.webp 1600w"
  sizes="(max-width: 600px) 100vw, (max-width: 1200px) 50vw, 800px"
  alt="Hero image"
  loading="lazy"
  decoding="async"
>

<!-- picture: art direction + format switching -->
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero" width="800" height="450">
</picture>

<!-- Always include width and height to prevent CLS! -->
<!-- Browser reserves space before image loads -->
<img src="image.webp" width="800" height="600" alt="...">

<!-- Loading strategies -->
<img loading="lazy">    <!-- Defer off-screen images (LCP images: eager!) -->
<img loading="eager">   <!-- Load immediately (default for above-fold) -->
<img decoding="async">  <!-- Don't block main thread while decoding -->
<img fetchpriority="high">  <!-- Boost priority for LCP image -->
```

### CSS Image Techniques
```css
/* Background images: preload critical ones */
.hero {
    background-image: image-set(
        url('hero.avif') type('image/avif'),
        url('hero.webp') type('image/webp'),
        url('hero.jpg') type('image/jpeg')
    );
    /* Specify dimensions to prevent layout shift */
    aspect-ratio: 16 / 9;
}

/* Lazy load background images with JS */
/* Add data-src, swap when in view */
```

---

## JavaScript Performance

### Measuring JavaScript Cost
```javascript
// Long Tasks: >50ms blocks main thread
// Chrome DevTools → Performance → look for red "long tasks"
// PerformanceObserver for long tasks
new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        console.log('Long task:', entry.duration, 'ms', entry.startTime);
    }
}).observe({ type: 'longtask', buffered: true });

// User Timing API: measure your own code
performance.mark('start-render');
// ... expensive operation ...
performance.mark('end-render');
performance.measure('render-time', 'start-render', 'end-render');
const measures = performance.getEntriesByName('render-time');
console.log(measures[0].duration);
```

### Reducing JavaScript Bundle Size
```
Tree shaking: only include exported code that's actually imported
  Works with ES modules (import/export), not CommonJS (require)
  Bundler (webpack/Rollup/esbuild) eliminates dead code

Code splitting: load code on demand
  Route-based splitting: each page loads own bundle
  Dynamic import: load when feature is needed

Bundle analysis:
  webpack-bundle-analyzer: visual treemap of what's in your bundle
  rollup-plugin-visualizer: similar for Rollup
  source-map-explorer: analyze any bundle with source map
  bundlephobia.com: check cost before adding npm package

npm package best practices:
  lodash → lodash-es (tree-shakeable) or individual methods
  moment.js (300KB!) → date-fns (only import what you use)
  Check size with: npx bundlephobia package-name
```

### Code Splitting with React
```javascript
import React, { lazy, Suspense } from 'react';

// Route-based code splitting
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ReportPage = lazy(() => import('./pages/ReportPage'));

function App() {
    return (
        <Router>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/admin" element={<AdminPage />} />
                    <Route path="/reports" element={<ReportPage />} />
                </Routes>
            </Suspense>
        </Router>
    );
}

// Component-level splitting (heavy components)
const HeavyChart = lazy(() => import('./HeavyChart'));

function Dashboard() {
    const [showChart, setShowChart] = useState(false);
    return (
        <>
            <button onClick={() => setShowChart(true)}>Show Chart</button>
            {showChart && (
                <Suspense fallback={<ChartSkeleton />}>
                    <HeavyChart />
                </Suspense>
            )}
        </>
    );
}

// Preload: start loading before user clicks
const preloadChart = () => import('./HeavyChart');
<button onMouseEnter={preloadChart} onClick={() => setShowChart(true)}>
    Show Chart
</button>
```

### Web Workers for CPU-Intensive Work
```javascript
// Main thread: offload heavy computation to worker
const worker = new Worker(new URL('./worker.js', import.meta.url));

worker.postMessage({ data: largeArray, operation: 'sort' });

worker.onmessage = (event) => {
    console.log('Worker result:', event.data.result);
};

// worker.js
self.onmessage = (event) => {
    const { data, operation } = event.data;
    let result;

    if (operation === 'sort') {
        result = data.slice().sort((a, b) => a - b);
    }

    // Transfer ownership of ArrayBuffer (zero-copy)
    // self.postMessage({ result }, [result.buffer]);
    self.postMessage({ result });
};

// Comlink: easier Worker communication (like RPC)
// import * as Comlink from 'comlink';
// const worker = Comlink.wrap(new Worker('./worker.js'));
// const result = await worker.processData(data);
```

---

## Caching Strategies

### HTTP Caching
```
Cache-Control header (most important):
  max-age=31536000, immutable    → Cache for 1 year, never revalidate
                                   (use content-hash in filename!)
  no-cache                       → Revalidate with server before using cache
                                   (NOT "don't cache" — cache but always check!)
  no-store                       → Never cache (sensitive data)
  private                        → Only browser cache, no CDN
  public                         → CDN can cache
  stale-while-revalidate=86400   → Serve stale while fetching fresh in background
  stale-if-error=86400           → Serve stale if origin is down

ETag / Last-Modified (conditional requests):
  Server: ETag: "abc123"
  Client: If-None-Match: "abc123"
  Server: 304 Not Modified (no body if unchanged)

Versioning strategies:
  Content hash: main.a1b2c3d4.js   → Cache forever (hash changes when content changes)
  Version query: main.js?v=1.2.3   → Cache-Control: no-cache (forces revalidation)
  Version path: /v1.2.3/main.js    → Cache forever

Practical config (nginx):
  # Static assets with content hash: cache forever
  location /assets/ {
      add_header Cache-Control "public, max-age=31536000, immutable";
  }
  # HTML: always revalidate
  location / {
      add_header Cache-Control "no-cache";
  }
```

### Service Workers and Cache API
```javascript
// service-worker.js
const CACHE_NAME = 'v1';
const PRECACHE = ['/', '/index.html', '/main.js', '/styles.css'];

// Install: precache critical resources
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
    );
    self.skipWaiting();  // Activate immediately
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then(names =>
            Promise.all(names
                .filter(name => name !== CACHE_NAME)
                .map(name => caches.delete(name))
            )
        )
    );
    self.clients.claim();
});

// Fetch: cache strategies
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Network-first: API calls (fresh data preferred)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Cache-first: static assets (fast, use content hash for freshness)
    event.respondWith(
        caches.match(event.request).then(cached =>
            cached || fetch(event.request).then(response => {
                caches.open(CACHE_NAME).then(c => c.put(event.request, response.clone()));
                return response;
            })
        )
    );
});

// Register service worker in app
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
}
```

---

## Network Performance

### HTTP/2 and HTTP/3
```
HTTP/2 optimizations (vs HTTP/1.1):
  Multiplexing: parallel requests on single connection
    → No more domain sharding (was needed for HTTP/1.1)
    → No more concatenating JS/CSS files (reduces cache efficiency)
  Header compression (HPACK): reduces repetitive headers
  Server Push: proactively send resources (use sparingly!)
  Binary protocol: more efficient parsing

HTTP/3 / QUIC:
  UDP-based: no TCP head-of-line blocking
  Built-in TLS 1.3: 0-1 RTT handshake
  Connection migration: keep connection when changing networks
  Always encrypted (no QUIC without TLS)

Check HTTP/2 support:
  curl -I --http2 https://example.com | grep "HTTP/"
  Chrome DevTools → Network → Protocol column
```

### CDN Strategy
```
CDN (Content Delivery Network): serve from servers near users

What to put on CDN:
  ✓ Static assets (JS, CSS, images, fonts)
  ✓ Static HTML (if pre-rendered)
  ✓ Media files (video, audio)
  ✗ Personalized content (usually)
  ✗ Frequently changing API responses (TTL tradeoffs)

CDN edge caching:
  Cache-Control: public, max-age=3600    → CDN caches for 1 hour
  CDN respects Cache-Control by default
  Purge/invalidate: clear cache when content changes

Multi-CDN strategy:
  Different CDN performs better in different regions
  Failover: if CDN1 down, route to CDN2

Image CDNs (Cloudinary, imgix, Fastly IO):
  On-the-fly image transformation (resize, format, quality)
  URL-based API: image.cdn.com/w_400,f_webp/path/to/image.jpg
  Responsive images without pre-generating sizes
  Intelligent format selection (serve AVIF to supporting browsers)
```

---

## Rendering Performance

### CSS Performance
```css
/* Promote to own layer (GPU composite) for animations */
/* Use: opacity, transform (these don't trigger layout) */
.animated {
    will-change: transform;  /* Hint to browser, create layer early */
    transform: translateZ(0); /* Force GPU layer (legacy trick) */
}

/* Avoid: animating properties that trigger layout */
/* BAD: top, left, width, height, margin, padding */
/* GOOD: transform: translate(x, y), opacity */

/* contain: limit browser's area of concern for repaint/layout */
.card {
    contain: layout style;     /* Changes here don't affect outside */
    contain: strict;           /* Everything (paint, size, layout) */
}

/* content-visibility: skip rendering off-screen content */
.article {
    content-visibility: auto;    /* Skip paint if off-screen */
    contain-intrinsic-size: 0 500px;  /* Estimate height to avoid scroll jump */
}

/* Avoid CSS selectors that cause excessive reflows */
/* * selector = global recalculation */
/* Deep descendant selectors = slow matching */
```

### Virtual DOM and DOM Operations
```javascript
// DOM manipulation is expensive — minimize reflows

// BAD: multiple writes that trigger layout
for (const item of items) {
    element.style.width = '100px';    // Write
    const height = element.offsetHeight;  // Read (forces layout!)
    element.style.height = height * 2 + 'px';  // Write
}

// GOOD: batch reads then writes
const measurements = items.map(el => el.offsetHeight);  // All reads
items.forEach((el, i) => {
    el.style.height = measurements[i] * 2 + 'px';       // All writes
});

// DocumentFragment: batch DOM insertions
const fragment = document.createDocumentFragment();
items.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item.name;
    fragment.appendChild(li);
});
list.appendChild(fragment);  // Single DOM operation

// IntersectionObserver: lazy load, virtual scroll
const observer = new IntersectionObserver(
    (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                loadContent(entry.target);
                observer.unobserve(entry.target);
            }
        });
    },
    { rootMargin: '200px' }  // Start loading 200px before visible
);

document.querySelectorAll('.lazy').forEach(el => observer.observe(el));
```

---

## Fonts

```html
<!-- Font loading optimization -->

<!-- 1. Preconnect to font provider -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

<!-- 2. Preload critical font -->
<link rel="preload" href="/fonts/myfont.woff2" as="font" type="font/woff2" crossorigin>

<!-- 3. font-display: swap (show fallback, swap when ready) -->
@font-face {
    font-family: 'MyFont';
    src: url('/fonts/myfont.woff2') format('woff2');
    font-display: swap;  /* FOUT but no invisible text */
    /* optional: FOUT avoided if font already cached */
    /* block: 3s invisible (avoid) */
}

<!-- 4. Size-adjust: match fallback font to web font metrics -->
@font-face {
    font-family: 'FallbackAdjusted';
    src: local('Arial');
    size-adjust: 98%;
    ascent-override: 105%;
    /* Reduces CLS when web font loads */
}
```

---

## Performance Monitoring

```javascript
// Navigation Timing API
const [nav] = performance.getEntriesByType('navigation');
console.log({
    dns: nav.domainLookupEnd - nav.domainLookupStart,
    tcp: nav.connectEnd - nav.connectStart,
    tls: nav.secureConnectionStart > 0 ? nav.connectEnd - nav.secureConnectionStart : 0,
    ttfb: nav.responseStart - nav.requestStart,  // Time to First Byte
    download: nav.responseEnd - nav.responseStart,
    domInteractive: nav.domInteractive,
    domComplete: nav.domComplete,
    load: nav.loadEventEnd - nav.startTime,
});

// Resource Timing
performance.getEntriesByType('resource').forEach(r => {
    if (r.duration > 1000) {
        console.log(`Slow resource: ${r.name} took ${r.duration}ms`);
    }
});

// Web Vitals measurement (web-vitals library)
import { onLCP, onINP, onCLS, onFCP, onTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
    fetch('/analytics', {
        method: 'POST',
        body: JSON.stringify(metric),
        keepalive: true,  // Survives page unload
    });
}

onLCP(sendToAnalytics);
onINP(sendToAnalytics);
onCLS(sendToAnalytics);
onFCP(sendToAnalytics);
onTTFB(sendToAnalytics);

// PerformanceObserver: real-time monitoring
new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
        if (entry.entryType === 'largest-contentful-paint') {
            console.log('LCP:', entry.startTime, entry.element);
        }
    });
}).observe({ type: 'largest-contentful-paint', buffered: true });
```

### Performance Checklist
```
Server:
  ✓ Enable gzip/brotli compression (saves 60-80% on text)
  ✓ Use HTTP/2 or HTTP/3
  ✓ Set proper Cache-Control headers
  ✓ Use CDN for static assets
  ✓ Minimize TTFB (< 200ms ideal)

Images:
  ✓ Use WebP/AVIF format
  ✓ Responsive images with srcset
  ✓ Specify width and height (prevents CLS)
  ✓ Lazy load below-the-fold images
  ✓ fetchpriority="high" on LCP image

JavaScript:
  ✓ Minimize and tree-shake bundles
  ✓ Code split by route
  ✓ defer/async non-critical scripts
  ✓ Preload critical JS
  ✓ Avoid long tasks (break up with setTimeout or scheduler.postTask)

CSS:
  ✓ Critical CSS inline
  ✓ Non-critical CSS async load
  ✓ No unused CSS (PurgeCSS)
  ✓ Avoid render-blocking imports

Fonts:
  ✓ font-display: swap
  ✓ Preload critical fonts
  ✓ Use system font stack when possible

Monitoring:
  ✓ Lighthouse in CI pipeline
  ✓ Real User Monitoring (RUM) for Core Web Vitals
  ✓ Alert on performance regressions
```

---

*Performance is never done — it's a continuous process of measuring, finding the bottleneck, fixing it, and repeating. The biggest gains are usually: image size, JS bundle size, and server response time. Start there.*
