"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import * as d3 from "d3"
import { sankey, sankeyLinkHorizontal } from "d3-sankey"
import { useRAGStore } from "@/lib/hooks/use-rag-store"

// Path metrics for parallel coordinates
interface PathMetrics {
  pathId: string
  probability: number
  coherence: number
  relevance: number
  confidence: number
  hallucination: number
  isPruned: boolean
  isTaken: boolean
}

export function HypotheticalPlayground() {
  const svgRef = useRef<SVGSVGElement>(null)
  const pcSvgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 280 })
  const [hoveredPath, setHoveredPath] = useState<string | null>(null)
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 处理延迟隐藏 tooltip 的函数
  const handlePathHover = useCallback((pathId: string | null) => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }
    if (pathId) {
      setHoveredPath(pathId)
    }
  }, [])

  const handlePathLeave = useCallback(() => {
    hideTimeoutRef.current = setTimeout(() => {
      setHoveredPath(null)
    }, 150) // 150ms 延迟，给用户时间移动到 tooltip 上
  }, [])

  // 清理 timeout
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current)
      }
    }
  }, [])

  const { session, hoveredIds, selectedIds, setHoveredIds, togglePathPrune } = useRAGStore()

  const margin = { top: 20, right: 12, bottom: 8, left: 12 }
  const sankeyHeight = dimensions.height * 0.52
  const pcHeight = dimensions.height * 0.38
  const innerWidth = dimensions.width - margin.left - margin.right
  const innerSankeyHeight = sankeyHeight - margin.top - 15
  const innerPCHeight = pcHeight - 25

  const pathColors: Record<string, string> = {
    "path-0": "#4ecdc4",  // 青色 - 实际采纳路径
    "path-1": "#ff6b9d",  // 粉色 - 需会诊
    "path-2": "#a78bfa",  // 紫色 - 高风险调整
    "path-3": "#ffd166",  // 黄色 - 保守非药物
    "path-4": "#95e679",  // 绿色 - 已剪枝
  }

  // Generate path metrics for parallel coordinates
  const pathMetrics: PathMetrics[] = useMemo(() => {
    if (!session) return []
    return session.hypotheticalPaths.map((path, i) => ({
      pathId: path.id,
      probability: path.probability,
      coherence: 0.65 + Math.sin(i * 1.5) * 0.25,
      relevance: 0.7 + Math.cos(i * 2) * 0.2,
      confidence: 0.6 + (i === 0 ? 0.3 : i === 1 ? 0.15 : 0.05),
      hallucination: 0.1 + (i === 0 ? 0.05 : i === 1 ? 0.2 : 0.35),
      isPruned: path.isPruned,
      isTaken: path.isTaken,
    }))
  }, [session])

  // Parallel Coordinates dimensions
  const pcDimensions = ["probability", "coherence", "relevance", "confidence", "hallucination"]
  const pcLabels: Record<string, string> = {
    probability: "Prob",
    coherence: "Coher",
    relevance: "Relev",
    confidence: "Conf",
    hallucination: "Halluc",
  }

  // Prepare Sankey data with branch points
  const sankeyData = useMemo(() => {
    if (!session || innerWidth <= 0 || innerSankeyHeight <= 0) return null

    const paths = session.hypotheticalPaths
    const nodeMap = new Map<string, { id: string; name: string; pathIds: string[]; turnIndex: number; isBranch: boolean }>()
    const links: { source: string; target: string; value: number; pathId: string }[] = []

    // Identify shared nodes (branch points)
    paths.forEach((path) => {
      path.nodes.forEach((node, i) => {
        const key = `${node.turnIndex}-${node.responsePreview.slice(0, 20)}`
        if (nodeMap.has(key)) {
          nodeMap.get(key)!.pathIds.push(path.id)
        } else {
          nodeMap.set(key, {
            id: key,
            name: node.responsePreview.slice(0, 18) + "...",
            pathIds: [path.id],
            turnIndex: node.turnIndex,
            isBranch: false,
          })
        }

        if (i > 0) {
          const prevKey = `${path.nodes[i - 1].turnIndex}-${path.nodes[i - 1].responsePreview.slice(0, 20)}`
          links.push({
            source: prevKey,
            target: key,
            value: path.probability * 10,
            pathId: path.id,
          })
        }
      })
    })

    // Mark branch points (nodes with multiple paths)
    nodeMap.forEach((node) => {
      if (node.pathIds.length > 1) {
        node.isBranch = true
      }
    })

    const nodes = Array.from(nodeMap.values())
    const nodeIndex = new Map(nodes.map((n, i) => [n.id, i]))

    const indexedLinks = links.map((l) => ({
      source: nodeIndex.get(l.source) || 0,
      target: nodeIndex.get(l.target) || 0,
      value: l.value,
      pathId: l.pathId,
    }))

    return { nodes, links: indexedLinks, paths }
  }, [session, innerWidth, innerSankeyHeight])

  // Draw Sankey diagram
  useEffect(() => {
    if (!svgRef.current || !sankeyData || !session || innerSankeyHeight <= 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const defs = svg.append("defs")

    // Glow filter for branch points
    const glowFilter = defs.append("filter").attr("id", "branch-glow").attr("x", "-100%").attr("y", "-100%").attr("width", "300%").attr("height", "300%")
    glowFilter.append("feGaussianBlur").attr("stdDeviation", "3").attr("result", "glow")
    const feMerge = glowFilter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "glow")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    // Gradient for links
    sankeyData.links.forEach((link, i) => {
      const gradient = defs.append("linearGradient").attr("id", `sankey-gradient-${i}`).attr("gradientUnits", "userSpaceOnUse")
      const color = pathColors[link.pathId] || "#4ecdc4"
      gradient.append("stop").attr("offset", "0%").attr("stop-color", color).attr("stop-opacity", 0.8)
      gradient.append("stop").attr("offset", "100%").attr("stop-color", color).attr("stop-opacity", 0.4)
    })

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    const sankeyGenerator = sankey<(typeof sankeyData.nodes)[0], (typeof sankeyData.links)[0]>()
      .nodeWidth(12)
      .nodePadding(8)
      .extent([[0, 0], [innerWidth, innerSankeyHeight]])

    const { nodes, links } = sankeyGenerator({
      nodes: sankeyData.nodes.map((d) => ({ ...d })),
      links: sankeyData.links.map((d) => ({ ...d })),
    })

    // Draw links with hover effect
    const linksGroup = g.append("g").attr("class", "links")

    linksGroup
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("fill", "none")
      .attr("stroke", (d, i) => {
        const path = session.hypotheticalPaths.find((p) => p.id === (d as any).pathId)
        if (path?.isPruned) return "rgba(255, 255, 255, 0.08)"
        return `url(#sankey-gradient-${i})`
      })
      .attr("stroke-width", (d) => Math.max(2, d.width || 2))
      .attr("stroke-opacity", (d) => {
        const path = session.hypotheticalPaths.find((p) => p.id === (d as any).pathId)
        const isHovered = hoveredPath === (d as any).pathId
        if (path?.isPruned) return 0.15
        if (isHovered) return 1
        if (path?.isTaken) return 0.85
        return 0.45
      })
      .attr("stroke-dasharray", (d) => {
        const path = session.hypotheticalPaths.find((p) => p.id === (d as any).pathId)
        return path?.isPruned ? "4,4" : "none"
      })
      .style("cursor", "pointer")
      .style("transition", "stroke-opacity 0.2s")
      .on("mouseenter", (_, d) => handlePathHover((d as any).pathId))
      .on("mouseleave", () => handlePathLeave())
      .on("click", (_, d) => togglePathPrune((d as any).pathId))

    // Draw nodes
    const nodeGroups = g.append("g").attr("class", "nodes").selectAll("g").data(nodes).join("g").attr("transform", (d) => `translate(${d.x0},${d.y0})`)

    // Node rectangles
    nodeGroups
      .append("rect")
      .attr("width", (d) => (d.x1 || 0) - (d.x0 || 0))
      .attr("height", (d) => (d.y1 || 0) - (d.y0 || 0))
      .attr("fill", (d) => {
        const node = d as any
        if (node.isBranch) return "#ffd166"
        const mainPath = node.pathIds?.[0]
        const path = session.hypotheticalPaths.find((p) => p.id === mainPath)
        if (path?.isPruned) return "rgba(255, 255, 255, 0.1)"
        if (path?.isTaken) return pathColors[mainPath] || "#4ecdc4"
        return d3.color(pathColors[mainPath] || "#4ecdc4")?.copy({ opacity: 0.6 })?.toString() || "#4ecdc4"
      })
      .attr("rx", 3)
      .attr("stroke", (d) => {
        const node = d as any
        if (node.isBranch) return "#fff"
        const mainPath = node.pathIds?.[0]
        return hoveredPath === mainPath ? "#fff" : "transparent"
      })
      .attr("stroke-width", (d) => ((d as any).isBranch ? 2 : 1))
      .attr("filter", (d) => ((d as any).isBranch ? "url(#branch-glow)" : "none"))
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => {
        const mainPath = (d as any).pathIds?.[0]
        if (mainPath) handlePathHover(mainPath)
      })
      .on("mouseleave", () => handlePathLeave())

    // Branch point indicator (diamond)
    nodeGroups
      .filter((d) => (d as any).isBranch)
      .append("polygon")
      .attr("points", (d) => {
        const w = (d.x1 || 0) - (d.x0 || 0)
        const h = (d.y1 || 0) - (d.y0 || 0)
        const cx = w / 2, cy = h / 2, s = 5
        return `${cx},${cy - s} ${cx + s},${cy} ${cx},${cy + s} ${cx - s},${cy}`
      })
      .attr("fill", "#fff")
      .attr("opacity", 0.9)

    // Turn labels
    const turns = [...new Set(sankeyData.nodes.map((n) => n.turnIndex))].sort()
    g.selectAll(".turn-label")
      .data(turns)
      .join("text")
      .attr("class", "turn-label")
      .attr("x", (_, i) => (i / Math.max(1, turns.length - 1)) * innerWidth + 6)
      .attr("y", -6)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("font-weight", "500")
      .attr("fill", "rgba(255, 255, 255, 0.6)")
      .text((d) => `T${d + 1}`)
  }, [sankeyData, session, hoveredPath, innerWidth, innerSankeyHeight, margin, togglePathPrune, pathColors])

  // Draw Parallel Coordinates
  useEffect(() => {
    if (!pcSvgRef.current || pathMetrics.length === 0 || innerPCHeight <= 0) return

    const svg = d3.select(pcSvgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g").attr("transform", `translate(${margin.left + 15},15)`)
    const pcWidth = innerWidth - 30

    // Create scales for each dimension
    const yScales: Record<string, d3.ScaleLinear<number, number>> = {}
    const xScale = d3.scalePoint<string>().domain(pcDimensions).range([0, pcWidth]).padding(0.1)

    pcDimensions.forEach((dim) => {
      const extent = d3.extent(pathMetrics, (d) => d[dim as keyof PathMetrics] as number) as [number, number]
      yScales[dim] = d3.scaleLinear().domain([Math.max(0, extent[0] - 0.1), Math.min(1, extent[1] + 0.1)]).range([innerPCHeight, 0])
    })

    // Draw axes
    const axesGroup = g.append("g").attr("class", "axes")

    pcDimensions.forEach((dim) => {
      const x = xScale(dim) || 0
      const axisGroup = axesGroup.append("g").attr("transform", `translate(${x},0)`)

      // Axis line
      axisGroup.append("line").attr("y1", 0).attr("y2", innerPCHeight).attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-width", 1)

      // Axis label
      axisGroup
        .append("text")
        .attr("y", -6)
        .attr("text-anchor", "middle")
        .attr("font-size", "8px")
        .attr("fill", selectedMetric === dim ? "#4ecdc4" : "rgba(255,255,255,0.6)")
        .attr("font-weight", selectedMetric === dim ? "600" : "400")
        .style("cursor", "pointer")
        .text(pcLabels[dim])
        .on("click", () => setSelectedMetric(selectedMetric === dim ? null : dim))

      // Tick marks
      const ticks = [0, 0.5, 1]
      ticks.forEach((t) => {
        const y = yScales[dim](t)
        axisGroup.append("line").attr("x1", -3).attr("x2", 3).attr("y1", y).attr("y2", y).attr("stroke", "rgba(255,255,255,0.15)")
        if (t === 0 || t === 1) {
          axisGroup.append("text").attr("x", -6).attr("y", y).attr("text-anchor", "end").attr("dominant-baseline", "middle").attr("font-size", "7px").attr("fill", "rgba(255,255,255,0.4)").text(t.toFixed(1))
        }
      })
    })

    // Line generator
    const lineGenerator = d3.line<[number, number]>().x((d) => d[0]).y((d) => d[1]).curve(d3.curveMonotoneX)

    // Draw path lines
    const linesGroup = g.append("g").attr("class", "lines")

    pathMetrics.forEach((pm) => {
      const coords: [number, number][] = pcDimensions.map((dim) => [xScale(dim) || 0, yScales[dim](pm[dim as keyof PathMetrics] as number)])

      linesGroup
        .append("path")
        .datum(coords)
        .attr("d", lineGenerator)
        .attr("fill", "none")
        .attr("stroke", pm.isPruned ? "rgba(255,255,255,0.1)" : pathColors[pm.pathId])
        .attr("stroke-width", hoveredPath === pm.pathId ? 3 : pm.isTaken ? 2.5 : 1.5)
        .attr("stroke-opacity", pm.isPruned ? 0.2 : hoveredPath === pm.pathId ? 1 : pm.isTaken ? 0.9 : 0.5)
        .attr("stroke-dasharray", pm.isPruned ? "3,3" : "none")
        .style("cursor", "pointer")
        .style("transition", "stroke-width 0.2s, stroke-opacity 0.2s")
        .on("mouseenter", () => handlePathHover(pm.pathId))
        .on("mouseleave", () => handlePathLeave())
        .on("click", () => togglePathPrune(pm.pathId))

      // Draw dots at each dimension
      coords.forEach(([x, y], i) => {
        linesGroup
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", hoveredPath === pm.pathId ? 4 : 2.5)
          .attr("fill", pm.isPruned ? "rgba(255,255,255,0.2)" : pathColors[pm.pathId])
          .attr("stroke", hoveredPath === pm.pathId ? "#fff" : "none")
          .attr("stroke-width", 1)
          .attr("opacity", pm.isPruned ? 0.3 : 0.9)
          .style("transition", "r 0.2s")
      })
    })
  }, [pathMetrics, hoveredPath, innerWidth, innerPCHeight, margin, pcDimensions, pcLabels, selectedMetric, pathColors, togglePathPrune])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        if (w > 0 && h > 0) setDimensions({ width: w, height: h })
      }
    })
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full flex flex-col relative">
      {/* Sankey Diagram */}
      <div style={{ height: sankeyHeight }} className="relative flex-shrink-0">
        <svg ref={svgRef} width={dimensions.width} height={sankeyHeight} className="w-full" />
      </div>

      {/* Parallel Coordinates */}
      <div style={{ height: pcHeight }} className="border-t border-border/50 relative flex-1">
        <svg ref={pcSvgRef} width={dimensions.width} height={pcHeight} className="w-full" />
        
        {/* PC Label */}
        <div className="absolute -top-2.5 left-1 text-[8px] text-muted-foreground font-medium bg-card/90 px-1 rounded z-10">
          Path Metrics
        </div>
      </div>

      {/* Legend & Controls */}
      <div className="absolute bottom-1 left-1 flex gap-2 items-center text-[8px] bg-card/80 backdrop-blur-sm rounded px-1.5 py-0.5 border border-border">
        {/* Branch point legend */}
        <div className="flex items-center gap-1 pr-2 border-r border-border/50">
          <div className="w-2 h-2 bg-[#ffd166] rotate-45" />
          <span className="text-muted-foreground">Branch</span>
        </div>
        {session?.hypotheticalPaths.map((path) => (
          <div
            key={path.id}
            className={`flex items-center gap-1 cursor-pointer transition-opacity ${hoveredPath === path.id ? "opacity-100" : "opacity-70 hover:opacity-100"}`}
            onClick={() => togglePathPrune(path.id)}
            onMouseEnter={() => handlePathHover(path.id)}
            onMouseLeave={() => handlePathLeave()}
          >
            <div className="w-2 h-0.5 rounded" style={{ background: path.isPruned ? "rgba(255,255,255,0.2)" : pathColors[path.id] }} />
            <span className={path.isPruned ? "line-through text-muted-foreground" : "text-foreground"}>
              {path.isTaken ? "✓" : "○"}
            </span>
          </div>
        ))}
      </div>

      <div className="absolute bottom-1 right-1 text-[8px] text-muted-foreground">
        Click line to prune
      </div>
    </div>
  )
}
