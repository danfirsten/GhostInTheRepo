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
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react";

const domainIcons: Record<string, Icon> = {
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

export function getDomainIconClient(slug: string): Icon {
  return domainIcons[slug] ?? Circuitry;
}
