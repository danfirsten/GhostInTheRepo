import type { ComponentType } from "react";
import type { IconProps } from "@phosphor-icons/react";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { DomainProgressBar } from "@/components/ui/DomainProgressBar/DomainProgressBar";
import styles from "./TopicCard.module.css";

interface TopicCardSmProps {
  title: string;
  subtopicCount: number;
  icon: ComponentType<IconProps>;
  href: string;
  domainSlug?: string;
}

export function TopicCardSm({ title, subtopicCount, icon: Icon, href, domainSlug }: TopicCardSmProps) {
  return (
    <a href={href} className={styles.small}>
      <span className={styles.iconWrap}>
        <Icon weight="duotone" />
      </span>
      <span className={styles.title}>{title}</span>
      <span className={styles.count}>{subtopicCount} subtopics</span>
      {domainSlug && <DomainProgressBar domainSlug={domainSlug} />}
      <span className={styles.arrow}><ArrowRight weight="bold" /></span>
    </a>
  );
}

interface TopicCardMdProps {
  title: string;
  subtopicCount: number;
  icon: ComponentType<IconProps>;
  href: string;
  subtopics?: string[];
  maxPreview?: number;
  domainSlug?: string;
}

export function TopicCardMd({
  title,
  subtopicCount,
  icon: Icon,
  href,
  subtopics = [],
  maxPreview = 3,
  domainSlug,
}: TopicCardMdProps) {
  const visible = subtopics.slice(0, maxPreview);
  const remaining = subtopicCount - visible.length;

  return (
    <a href={href} className={styles.medium}>
      <div className={styles.mediumTop}>
        <span className={styles.iconWrap}>
          <Icon weight="duotone" />
        </span>
        <div className={styles.mediumMeta}>
          <div className={styles.title}>{title}</div>
          <div className={styles.count}>{subtopicCount} subtopics</div>
        </div>
        <span className={styles.arrow}><ArrowRight weight="bold" /></span>
      </div>

      {domainSlug && <DomainProgressBar domainSlug={domainSlug} />}

      {visible.length > 0 && (
        <>
          <div className={styles.mediumDivider} />
          <div className={styles.mediumSubtopics}>
            {visible.map((s) => (
              <div key={s} className={styles.subtopicItem}>{s}</div>
            ))}
            {remaining > 0 && (
              <div className={styles.subtopicMore}>+{remaining} more</div>
            )}
          </div>
        </>
      )}
    </a>
  );
}

interface TopicCardLgProps {
  title: string;
  description: string;
  subtopicCount: number;
  icon: ComponentType<IconProps>;
  href: string;
  subtopics?: string[];
  domainSlug?: string;
}

export function TopicCardLg({
  title,
  description,
  subtopicCount,
  icon: Icon,
  href,
  subtopics = [],
  domainSlug,
}: TopicCardLgProps) {
  return (
    <a href={href} className={styles.large}>
      <span className={styles.iconWrap}>
        <Icon weight="duotone" />
      </span>
      <span className={styles.titleLarge}>{title}</span>
      <p className={styles.descriptionText}>{description}</p>
      <span className={styles.count}>{subtopicCount} subtopics</span>

      {domainSlug && <DomainProgressBar domainSlug={domainSlug} />}

      {subtopics.length > 0 && (
        <div className={styles.mediumSubtopics}>
          {subtopics.map((s) => (
            <div key={s} className={styles.subtopicItem}>{s}</div>
          ))}
        </div>
      )}
      <span className={styles.arrow}><ArrowRight weight="bold" /></span>
    </a>
  );
}
