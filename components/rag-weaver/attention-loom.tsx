"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import * as d3 from "d3"
import { useRAGStore } from "@/lib/hooks/use-rag-store"

export function AttentionLoom() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [bundleStrength, setBundleStrength] = useState(0.65)

  const { session, hoveredIds, selectedIds, setHoveredIds, setSelectedIds, toggleChunkLock } = useRAGStore()

  // 使用固定基准尺寸，配合 viewBox 实现自适应缩放
  const baseWidth = 400
  const baseHeight = 280
  const margin = { top: 20, right: 30, bottom: 20, left: 30 }
  const innerWidth = baseWidth - margin.left - margin.right
  const innerHeight = baseHeight - margin.top - margin.bottom

  // Prepare data for bipartite graph
  const graphData = useMemo(() => {
    if (!session) return null

    const chunks = session.retrievedChunks.slice(0, 6)
    const sentences = session.generatedSentences
    const weights = session.attentionWeights

    const chunkY = d3
      .scalePoint<string>()
      .domain(chunks.map((c) => c.id))
      .range([20, innerHeight - 20])
      .padding(0.5)

    const sentenceY = d3
      .scalePoint<string>()
      .domain(sentences.map((s) => s.id))
      .range([30, innerHeight - 30])
      .padding(0.5)

    const chunkNodes = chunks.map((chunk) => ({
      id: chunk.id,
      type: "chunk" as const,
      x: 0,
      y: chunkY(chunk.id) || 0,
      data: chunk,
    }))

    const sentenceNodes = sentences.map((sent) => ({
      id: sent.id,
      type: "sentence" as const,
      x: innerWidth,
      y: sentenceY(sent.id) || 0,
      data: sent,
    }))

    const links = weights
      .filter((w) => chunks.some((c) => c.id === w.sourceChunkId))
      .map((weight) => ({
        source: weight.sourceChunkId,
        target: weight.targetSentenceId,
        weight: weight.combinedWeight,
      }))

    return { chunkNodes, sentenceNodes, links, chunkY, sentenceY }
  }, [session, innerHeight, innerWidth])

  useEffect(() => {
    if (!svgRef.current || !graphData || !session) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    const defs = svg.append("defs")

    // Create gradients for links
    graphData.links.forEach((link, i) => {
      const gradient = defs
        .append("linearGradient")
        .attr("id", `link-gradient-${i}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("x2", innerWidth)

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#4ecdc4")
        .attr("stop-opacity", link.weight * 0.8)
      gradient.append("stop").attr("offset", "50%").attr("stop-color", "#ff6b9d").attr("stop-opacity", link.weight)
      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", "#a78bfa")
        .attr("stop-opacity", link.weight * 0.8)
    })

    // Glow filter
    const glowFilter = defs
      .append("filter")
      .attr("id", "loom-glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")
    glowFilter.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "coloredBlur")
    const feMerge = glowFilter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "coloredBlur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    // Bundled path generator
    const generateBundledPath = (link: (typeof graphData.links)[0]) => {
      const sourceNode = graphData.chunkNodes.find((n) => n.id === link.source)
      const targetNode = graphData.sentenceNodes.find((n) => n.id === link.target)
      if (!sourceNode || !targetNode) return ""

      const x0 = sourceNode.x + 70
      const y0 = sourceNode.y
      const x1 = targetNode.x - 15
      const y1 = targetNode.y

      const midX = (x0 + x1) / 2
      const bundleY = innerHeight / 2
      const bundledY0 = y0 + (bundleY - y0) * bundleStrength * 0.3
      const bundledY1 = y1 + (bundleY - y1) * bundleStrength * 0.3

      return `M ${x0} ${y0} C ${x0 + 40} ${bundledY0}, ${midX} ${(bundledY0 + bundledY1) / 2}, ${midX} ${(bundledY0 + bundledY1) / 2} S ${x1 - 40} ${bundledY1}, ${x1} ${y1}`
    }

    // Draw links
    const linksGroup = g.append("g").attr("class", "links")

    linksGroup
      .selectAll("path")
      .data(graphData.links)
      .join("path")
      .attr("d", (d) => generateBundledPath(d))
      .attr("fill", "none")
      .attr("stroke", (_, i) => `url(#link-gradient-${i})`)
      .attr("stroke-width", (d) => Math.max(1, d.weight * 5))
      .attr("stroke-opacity", (d) => {
        const isHighlighted =
          hoveredIds.includes(d.source) ||
          hoveredIds.includes(d.target) ||
          selectedIds.includes(d.source) ||
          selectedIds.includes(d.target)
        return isHighlighted ? 0.9 : 0.3 + d.weight * 0.4
      })
      .attr("filter", (d) =>
        selectedIds.includes(d.source) || selectedIds.includes(d.target) ? "url(#loom-glow)" : "none",
      )
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => {
        setHoveredIds([d.source, d.target], "loom")
      })
      .on("mouseleave", () => setHoveredIds([], "loom"))

    // Draw chunk nodes
    const chunkGroups = g
      .append("g")
      .attr("class", "chunks")
      .selectAll("g")
      .data(graphData.chunkNodes)
      .join("g")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)

    chunkGroups
      .append("rect")
      .attr("x", 0)
      .attr("y", -14)
      .attr("width", 70)
      .attr("height", 28)
      .attr("rx", 4)
      .attr("fill", (d) => (d.data.isLocked ? "rgba(78, 205, 196, 0.2)" : "rgba(255, 255, 255, 0.05)"))
      .attr("stroke", (d) => {
        const isHovered = hoveredIds.includes(d.id)
        const isSelected = selectedIds.includes(d.id)
        if (isSelected) return "#ff6b9d"
        if (d.data.isLocked) return "#4ecdc4"
        if (isHovered) return "rgba(255, 255, 255, 0.5)"
        return "rgba(255, 255, 255, 0.15)"
      })
      .attr("stroke-width", (d) => (selectedIds.includes(d.id) ? 2 : 1))
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => {
        setHoveredIds([d.id], "loom")
      })
      .on("mouseleave", () => setHoveredIds([], "loom"))
      .on("click", (_, d) => setSelectedIds([d.id], "loom"))
      .on("dblclick", (_, d) => toggleChunkLock(d.id))

    // Lock indicator
    chunkGroups
      .filter((d) => d.data.isLocked)
      .append("circle")
      .attr("cx", 62)
      .attr("cy", -10)
      .attr("r", 5)
      .attr("fill", "#4ecdc4")

    // Chunk labels
    chunkGroups
      .append("text")
      .attr("x", 35)
      .attr("y", 0)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "8px")
      .attr("fill", "rgba(255, 255, 255, 0.8)")
      .text((d) => d.data.metadata.semanticTopic.slice(0, 10))

    // Relevance bar
    chunkGroups
      .append("rect")
      .attr("x", 3)
      .attr("y", 8)
      .attr("width", (d) => d.data.relevanceScore * 64)
      .attr("height", 2)
      .attr("rx", 1)
      .attr("fill", (d) =>
        d.data.relevanceScore > 0.7 ? "#4ecdc4" : d.data.relevanceScore > 0.5 ? "#ffd166" : "#ff6b9d",
      )
      .attr("opacity", 0.7)

    // Draw sentence nodes
    const sentenceGroups = g
      .append("g")
      .attr("class", "sentences")
      .selectAll("g")
      .data(graphData.sentenceNodes)
      .join("g")
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`)

    sentenceGroups
      .append("circle")
      .attr("r", (d) => 10 + d.data.confidence * 6)
      .attr("fill", (d) => {
        const risk = d.data.uncertaintyMetrics.hallucinationRisk
        if (risk < 0.1) return "rgba(149, 230, 121, 0.3)"
        if (risk < 0.2) return "rgba(255, 209, 102, 0.3)"
        return "rgba(255, 107, 157, 0.3)"
      })
      .attr("stroke", (d) => {
        const isHovered = hoveredIds.includes(d.id)
        const isSelected = selectedIds.includes(d.id)
        if (isSelected) return "#a78bfa"
        if (isHovered) return "rgba(255, 255, 255, 0.6)"
        return "rgba(255, 255, 255, 0.2)"
      })
      .attr("stroke-width", (d) => (selectedIds.includes(d.id) ? 2 : 1))
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => {
        setHoveredIds([d.id], "loom")
      })
      .on("mouseleave", () => setHoveredIds([], "loom"))
      .on("click", (_, d) => setSelectedIds([d.id], "loom"))

    sentenceGroups
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "8px")
      .attr("font-weight", "600")
      .attr("fill", "rgba(255, 255, 255, 0.9)")
      .text((d) => `${Math.round(d.data.confidence * 100)}%`)

    // Labels
    g.append("text")
      .attr("x", 35)
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .attr("font-size", "9px")
      .attr("fill", "rgba(255, 255, 255, 0.5)")
      .text("Chunks")
    g.append("text")
      .attr("x", innerWidth - 10)
      .attr("y", -8)
      .attr("text-anchor", "middle")
      .attr("font-size", "9px")
      .attr("fill", "rgba(255, 255, 255, 0.5)")
      .text("Sentences")
  }, [
    graphData,
    session,
    hoveredIds,
    selectedIds,
    bundleStrength,
    innerWidth,
    innerHeight,
    margin,
    setHoveredIds,
    setSelectedIds,
    toggleChunkLock,
  ])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${baseWidth} ${baseHeight}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      />

      {/* Compact bundle control */}
      <div className="absolute bottom-1 left-1 flex items-center gap-1.5 bg-card/80 backdrop-blur-sm rounded px-2 py-1 border border-border">
        <span className="text-[10px] text-muted-foreground">Bundle</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={bundleStrength}
          onChange={(e) => setBundleStrength(Number.parseFloat(e.target.value))}
          className="w-12 h-1 accent-primary"
        />
      </div>

      <div className="absolute bottom-1 right-1 text-[10px] text-muted-foreground bg-card/80 backdrop-blur-sm rounded px-2 py-1 border border-border">
        <span className="text-primary">2x click</span> to lock
      </div>
    </div>
  )
}
