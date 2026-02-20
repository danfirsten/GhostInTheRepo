export default function Home() {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        gap: "var(--space-4)",
      }}
    >
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--text-display-lg)",
          fontWeight: 700,
          color: "var(--ghost-white)",
        }}
      >
        Ghost in the Repo
      </h1>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "var(--text-body-lg)",
          color: "var(--text-secondary)",
        }}
      >
        Know the machine. Haunt it.
      </p>
    </main>
  );
}
