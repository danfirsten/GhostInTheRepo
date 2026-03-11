import type { Metadata } from "next";
import { getAllProjects, getAllDomains } from "@/lib/data";
import { ProjectsClient } from "./ProjectsClient";
import styles from "./projects.module.css";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Hands-on projects across 14 knowledge domains — build real things and solidify your understanding.",
};

export default function ProjectsPage() {
  const projects = getAllProjects();
  const domains = getAllDomains();

  return (
    <main className={styles.page}>
      <ProjectsClient projects={projects} domains={domains} />
    </main>
  );
}
