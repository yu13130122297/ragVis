"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { useRAGStore } from "@/lib/hooks/use-rag-store"

export function UncertaintyGlyphs() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 350, height: 200 })

  const { session, hoveredIds, selectedIds, setHoveredIds, setSelectedIds } = useRAGStore()

  const margin = { top: 15, right: 10, bottom: 28, left: 10 }

  useEffect(() => {
    if (!svgRef.current || !session) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    const innerWidth = dimensions.width - margin.left - margin.right
    const innerHeight = dimensions.height - margin.top - margin.bottom

    // Recalculate glyph positions to fit in the available space
    const glyphs = session.uncertaintyGlyphs.slice(0, 6)
    const cols = 3
    const rows = Math.ceil(glyphs.length / cols)
    const cellWidth = innerWidth / cols
    const cellHeight = innerHeight / rows

    const positionedGlyphs = glyphs.map((glyph, i) => ({
      ...glyph,
      position: {
        x: (i % cols) * cellWidth + cellWidth / 2,
        y: Math.floor(i / cols) * cellHeight + cellHeight / 2,
      },
    }))

    // Glyph generator function
    const generateGlyphPath = (spikes: (typeof glyphs)[0]["spikes"], baseRadius: number) => {
      const points: [number, number][] = []
      const numSpikes = spikes.length

      spikes.forEach((spike, i) => {
        const angle = spike.angle - Math.PI / 2
        const outerRadius = baseRadius + spike.length * 15
        const innerRadius = baseRadius * 0.4

        points.push([Math.cos(angle) * outerRadius, Math.sin(angle) * outerRadius])
        const innerAngle = angle + Math.PI / numSpikes
        points.push([Math.cos(innerAngle) * innerRadius, Math.sin(innerAngle) * innerRadius])
      })

      return (
        d3
          .line<[number, number]>()
          .x((d) => d[0])
          .y((d) => d[1])
          .curve(d3.curveCardinalClosed.tension(0.5))(points) || ""
      )
    }

    // Draw glyphs
    const glyphGroups = g
      .append("g")
      .attr("class", "glyphs")
      .selectAll("g")
      .data(positionedGlyphs)
      .join("g")
      .attr("transform", (d) => `translate(${d.position.x}, ${d.position.y})`)

    // Background circle
    glyphGroups
      .append("circle")
      .attr("r", 22)
      .attr("fill", "rgba(255, 255, 255, 0.02)")
      .attr("stroke", "rgba(255, 255, 255, 0.08)")
      .attr("stroke-width", 1)

    // Glyph shape
    glyphGroups
      .append("path")
      .attr("d", (d) => generateGlyphPath(d.spikes, 10))
      .attr("fill", (d) => {
        const isHovered = hoveredIds.includes(d.chunkId)
        const isSelected = selectedIds.includes(d.chunkId)
        const alpha = isSelected ? 0.8 : isHovered ? 0.7 : 0.5
        return d3.color(d.baseColor)?.copy({ opacity: alpha })?.toString() || d.baseColor
      })
      .attr("stroke", (d) => (selectedIds.includes(d.chunkId) ? "#fff" : d.baseColor))
      .attr("stroke-width", (d) => (selectedIds.includes(d.chunkId) ? 1.5 : 0.5))
      .style("cursor", "pointer")
      .on("mouseenter", function (_, d) {
        setHoveredIds([d.chunkId], "glyph")
        d3.select(this).transition().duration(150).attr("transform", "scale(1.15)")
      })
      .on("mouseleave", function () {
        setHoveredIds([], "glyph")
        d3.select(this).transition().duration(150).attr("transform", "scale(1)")
      })
      .on("click", (_, d) => setSelectedIds([d.chunkId], "glyph"))

    // Conflict indicator ring
    glyphGroups
      .append("circle")
      .attr("r", (d) => 5 + d.conflictLevel * 5)
      .attr("fill", "none")
      .attr("stroke", (d) => (d.conflictLevel > 0.6 ? "#ff6b9d" : d.conflictLevel > 0.3 ? "#ffd166" : "#4ecdc4"))
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", (d) => (d.conflictLevel > 0.5 ? "2,1" : "none"))
      .attr("opacity", 0.8)

    // Authority badge
    glyphGroups
      .append("circle")
      .attr("cx", 16)
      .attr("cy", -16)
      .attr("r", 6)
      .attr("fill", (d) => (d.authorityLevel > 0.7 ? "#4ecdc4" : d.authorityLevel > 0.5 ? "#ffd166" : "#ff6b9d"))

    glyphGroups
      .append("text")
      .attr("x", 16)
      .attr("y", -14)
      .attr("text-anchor", "middle")
      .attr("font-size", "6px")
      .attr("font-weight", "600")
      .attr("fill", "#0a0a0f")
      .text((d) => Math.round(d.authorityLevel * 100))

    // Chunk ID label
    glyphGroups
      .append("text")
      .attr("y", 32)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("fill", "rgba(255, 255, 255, 0.5)")
      .text((d) => d.chunkId.replace("chunk-", "C"))
  }, [session, hoveredIds, selectedIds, dimensions, margin, setHoveredIds, setSelectedIds])

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
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />

      {/* Compact legend */}
      <div className="absolute bottom-0.5 left-1 flex gap-2 text-[9px] bg-card/80 backdrop-blur-sm rounded px-1.5 py-0.5 border border-border z-10">
        <span className="text-muted-foreground">Uncertainty:</span>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#4ecdc4]" />
          <span className="text-muted-foreground">Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ff6b9d]" />
          <span className="text-muted-foreground">High</span>
        </div>
      </div>
    </div>
  )
}
