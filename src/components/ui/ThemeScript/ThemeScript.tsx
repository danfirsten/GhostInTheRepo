/**
 * Inline script injected into <head> to set the theme before first paint.
 * Prevents flash of wrong theme (FOUC) on page load.
 * Must run synchronously before React hydrates.
 */
export function ThemeScript() {
  const script = `
    (function() {
      try {
        var stored = localStorage.getItem('ghost-theme');
        var theme = stored || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
      } catch (e) {}
    })();
  `;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: script }}
      suppressHydrationWarning
    />
  );
}
