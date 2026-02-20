import { GhostLogo } from "@/components/ui/GhostLogo";
import { Button, ButtonIcon } from "@/components/ui/Button";
import { Tag, DifficultyBadge } from "@/components/ui/Tag";
import { Tooltip } from "@/components/ui/Tooltip";
import { Callout } from "@/components/ui/Callout";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { CheatsheetSection } from "@/components/ui/Cheatsheet";
import { TopicCardSm, TopicCardMd, TopicCardLg } from "@/components/ui/TopicCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { Circuitry, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import styles from "./dev.module.css";

export const metadata = { title: "Component QA" };

const sampleCheatsheet = {
  title: "Git Essentials",
  entries: [
    { command: "git log --oneline", description: "Compact commit history" },
    { command: "git stash pop", description: "Apply and drop stashed changes" },
    { command: "git rebase -i HEAD~3", description: "Interactive rebase last 3 commits" },
  ],
};

const sampleCode = `function haunt(repo: string): Ghost {
  const ghost = new Ghost(repo);
  ghost.possess();
  return ghost;
}`;

export default function DevPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Component QA — Phase 2</h1>
      <p className={styles.subtitle}>
        Visual inspection of every atomic component.
      </p>

      {/* Ghost Logo */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>GhostLogo</h2>
        <div className={styles.row}>
          <GhostLogo size={32} />
          <GhostLogo size={48} />
          <GhostLogo size={72} />
          <GhostLogo size={96} />
        </div>
      </section>

      {/* Buttons */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Buttons</h2>
        <div className={styles.row}>
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button href="#">Primary Link</Button>
          <Button variant="secondary" href="#">Secondary Link</Button>
          <ButtonIcon label="Search">
            <MagnifyingGlass size={20} />
          </ButtonIcon>
        </div>
      </section>

      {/* Tags & Badges */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tags &amp; Badges</h2>
        <div className={styles.row}>
          <Tag>Networking</Tag>
          <Tag>Systems Programming</Tag>
          <DifficultyBadge level="beginner" />
          <DifficultyBadge level="intermediate" />
          <DifficultyBadge level="advanced" />
          <DifficultyBadge level="arcane" />
        </div>
      </section>

      {/* Tooltip */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Tooltip</h2>
        <div className={styles.row}>
          <Tooltip content="This is a tooltip. Hover to reveal.">
            <span className={styles.tooltipTarget}>Hover me</span>
          </Tooltip>
        </div>
      </section>

      {/* Callouts */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Callout Blocks</h2>
        <div className={styles.stack}>
          <Callout variant="key-insight">
            TCP uses a three-way handshake (SYN → SYN-ACK → ACK) to establish a reliable connection.
          </Callout>
          <Callout variant="gotcha">
            Forgetting to close file descriptors leads to resource leaks that only manifest under load.
          </Callout>
          <Callout variant="mental-model">
            Think of a mutex like a bathroom key — only one thread can hold it at a time.
          </Callout>
          <Callout variant="deep-dive">
            The Linux kernel uses a slab allocator to efficiently manage small, frequently allocated objects.
          </Callout>
        </div>
      </section>

      {/* Code Block */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Code Block</h2>
        <CodeBlock code={sampleCode} lang="typescript" />
      </section>

      {/* Cheatsheet */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Cheatsheet Section</h2>
        <CheatsheetSection section={sampleCheatsheet} />
      </section>

      {/* Topic Cards */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Topic Cards — Small</h2>
        <div className={styles.row}>
          <TopicCardSm
            title="Fundamentals"
            subtopicCount={12}
            icon={Circuitry}
            href="#"
          />
          <TopicCardSm
            title="Networking"
            subtopicCount={8}
            icon={Circuitry}
            href="#"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Topic Cards — Medium</h2>
        <div className={styles.row}>
          <TopicCardMd
            title="Fundamentals"
            subtopicCount={12}
            icon={Circuitry}
            href="#"
            subtopics={["Binary & Hex", "Memory Layout", "Stack vs Heap", "Pointers", "CPU Architecture"]}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Topic Cards — Large</h2>
        <TopicCardLg
          title="Fundamentals"
          description="The bedrock of all computing — how hardware thinks, how data is stored, and why everything is ultimately just electricity and math."
          subtopicCount={12}
          icon={Circuitry}
          href="#"
          subtopics={["Binary & Hex", "Memory Layout", "Stack vs Heap"]}
        />
      </section>

      {/* Empty State */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Empty State</h2>
        <EmptyState message="No results found. The ghost searched everywhere.">
          <Button variant="secondary">Clear filters</Button>
        </EmptyState>
      </section>
    </main>
  );
}
