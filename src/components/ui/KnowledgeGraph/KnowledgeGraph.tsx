"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { ArrowRight } from "@phosphor-icons/react";
import type { LearningPath, Domain } from "@/types/content";
import { getDomainIcon } from "@/lib/domain-icons";
import styles from "./KnowledgeGraph.module.css";

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  slug: string;
}

interface GraphEdge extends d3.SimulationLinkDatum<GraphNode> {
  type: "prerequisite" | "related";
}

interface KnowledgeGraphProps {
  domains: Domain[];
  paths: LearningPath[];
}

export function KnowledgeGraph({ domains, paths }: KnowledgeGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const handleDeselect = useCallback(() => setSelectedNode(null), []);

  useEffect(() => {
    const svg = svgRef.current;
    const container = containerRef.current;
    if (!svg || !container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Build nodes
    const nodes: GraphNode[] = domains.map((d) => ({
      id: d.slug,
      label: d.label,
      slug: d.slug,
    }));

    // Build unique edges from all paths
    const edgeSet = new Set<string>();
    const edges: GraphEdge[] = [];
    for (const path of paths) {
      for (const edge of path.edges) {
        const key = `${edge.from}-${edge.to}`;
        if (!edgeSet.has(key)) {
          edgeSet.add(key);
          edges.push({
            source: edge.from,
            target: edge.to,
            type: edge.type,
          });
        }
      }
    }

    // D3 setup
    const svgSel = d3.select(svg);
    svgSel.selectAll("*").remove();

    const g = svgSel.append("g");

    // Zoom
    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svgSel.call(zoom);
    svgSel.on("click", () => setSelectedNode(null));

    // Simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        "link",
        d3
          .forceLink<GraphNode, GraphEdge>(edges)
          .id((d) => d.id)
          .distance(120),
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide(40));

    // Edges
    const link = g
      .selectAll<SVGLineElement, GraphEdge>("line")
      .data(edges)
      .join("line")
      .attr("stroke", "var(--glow-violet)")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", (d) =>
        d.type === "related" ? "6 4" : "none",
      );

    // Node groups
    const nodeG = g
      .selectAll<SVGGElement, GraphNode>("g.node")
      .data(nodes)
      .join("g")
      .attr("class", "node")
      .style("cursor", "pointer");

    // Background circle
    nodeG
      .append("circle")
      .attr("r", 24)
      .attr("fill", "var(--surface-raised)")
      .attr("stroke", "var(--spectral-1)")
      .attr("stroke-width", 1.5);

    // Label
    nodeG
      .append("text")
      .text((d) => d.label)
      .attr("text-anchor", "middle")
      .attr("dy", 42)
      .attr("fill", "var(--text-secondary)")
      .style("font-family", "var(--font-ui)")
      .style("font-size", "11px")
      .style("font-weight", "500")
      .style("pointer-events", "none");

    // Icon text (first letter as fallback)
    nodeG
      .append("text")
      .text((d) => d.label.charAt(0))
      .attr("text-anchor", "middle")
      .attr("dy", 5)
      .attr("fill", "var(--spectral-1)")
      .style("font-family", "var(--font-ui)")
      .style("font-size", "14px")
      .style("font-weight", "700")
      .style("pointer-events", "none");

    // Interactions
    nodeG
      .on("mouseover", function () {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", 28)
          .attr("stroke-width", 2.5)
          .attr("filter", "drop-shadow(0 0 8px rgba(167, 139, 250, 0.4))");
      })
      .on("mouseout", function () {
        d3.select(this)
          .select("circle")
          .transition()
          .duration(200)
          .attr("r", 24)
          .attr("stroke-width", 1.5)
          .attr("filter", "none");
      })
      .on("click", function (event, d) {
        event.stopPropagation();
        const rect = container.getBoundingClientRect();
        const transform = d3.zoomTransform(svg);
        const x = transform.applyX(d.x ?? 0) + 40;
        const y = transform.applyY(d.y ?? 0) - 20;
        setHoverPos({ x: Math.min(x, rect.width - 270), y: Math.max(y, 10) });
        setSelectedNode(d);
      })
      .on("dblclick", (_event, d) => {
        window.location.href = `/topics/${d.slug}`;
      });

    // Drag
    const drag = d3
      .drag<SVGGElement, GraphNode>()
      .on("start", (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      })
      .on("drag", (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
      })
      .on("end", (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      });

    nodeG.call(drag);

    // Tick
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
        .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
        .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
        .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

      nodeG.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
    });

    // Stop after settling
    const stopTimer = setTimeout(() => simulation.stop(), 2000);

    return () => {
      clearTimeout(stopTimer);
      simulation.stop();
    };
  }, [domains, paths]);

  // Info for hover card
  const selectedDomain = selectedNode
    ? domains.find((d) => d.slug === selectedNode.slug)
    : null;
  const selectedPaths = selectedNode
    ? paths.filter((p) =>
        p.nodes.some((n) => n.domainSlug === selectedNode.slug),
      )
    : [];

  return (
    <div ref={containerRef} className={styles.container}>
      <svg ref={svgRef} />

      {selectedNode && selectedDomain && (
        <div
          className={styles.hoverCard}
          style={{ left: hoverPos.x, top: hoverPos.y }}
        >
          <div className={styles.hoverCardHeader}>
            <span className={styles.hoverCardIcon}>
              {(() => {
                const Icon = getDomainIcon(selectedNode.slug);
                return <Icon size={20} weight="duotone" />;
              })()}
            </span>
            <span className={styles.hoverCardTitle}>
              {selectedDomain.label}
            </span>
          </div>
          <div className={styles.hoverCardMeta}>
            {selectedDomain.description}
          </div>
          {selectedPaths.length > 0 && (
            <div className={styles.hoverCardPaths}>
              Paths: {selectedPaths.map((p) => p.name).join(", ")}
            </div>
          )}
          <a
            href={`/topics/${selectedNode.slug}`}
            className={styles.hoverCardLink}
            onClick={handleDeselect}
          >
            Open Topic <ArrowRight size={14} weight="bold" />
          </a>
        </div>
      )}
    </div>
  );
}
