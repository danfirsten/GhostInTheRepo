import {
  Circuitry,
  Cpu,
  TerminalWindow,
  Network,
  Gear,
  Database,
  Globe,
  Blueprint,
  Cloud,
  ShieldCheck,
  Brain,
  DeviceMobile,
  CodeBlock,
  Bug,
  Rocket,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

export const domainIcons: Record<string, Icon> = {
  fundamentals: Circuitry,
  "operating-systems": Cpu,
  "terminal-and-tools": TerminalWindow,
  networking: Network,
  "systems-programming": Gear,
  databases: Database,
  "web-development": Globe,
  "software-engineering": Blueprint,
  "cloud-devops": Cloud,
  cybersecurity: ShieldCheck,
  "ai-ml": Brain,
  "mobile-dev": DeviceMobile,
  languages: CodeBlock,
  "hacker-mindset": Bug,
  startups: Rocket,
};

export function getDomainIcon(slug: string): Icon {
  return domainIcons[slug] ?? Circuitry;
}
