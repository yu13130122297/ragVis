"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import * as d3 from "d3"
import { useRAGStore } from "@/lib/hooks/use-rag-store"

export function RetrievalStream() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 150, height: 280 })

  const { session, hoveredIds, selectedIds, setHoveredIds, setSelectedIds, toggleChunkLock } = useRAGStore()

  const margin = { top: 15, right: 8, bottom: 25, left: 25 }
  const innerWidth = dimensions.width - margin.left - margin.right
  const innerHeight = dimensions.height - margin.top - margin.bottom

  // Prepare stacked data for streamgraph
  const streamData = useMemo(() => {
    if (!session) return null

    const layers = session.streamLayers
    const turns = layers[0]?.values.length || 0

    const data = Array.from({ length: turns }, (_, i) => {
      const point: Record<string, number> = { turn: i }
      layers.forEach((layer) => {
        point[layer.chunkId] = layer.values[i] || 0
      })
      return point
    })

    const stack = d3
      .stack<(typeof data)[0]>()
      .keys(layers.map((l) => l.chunkId))
      .offset(d3.stackOffsetWiggle)
      .order(d3.stackOrderInsideOut)

    return { stacked: stack(data), layers, turns }
  }, [session])

  useEffect(() => {
    if (!svgRef.current || !streamData || !session || innerWidth <= 0 || innerHeight <= 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    const yScale = d3
      .scaleLinear()
      .domain([0, streamData.turns - 1])
      .range([0, innerHeight])

    const xExtent = [
      d3.min(streamData.stacked, (layer) => d3.min(layer, (d) => d[0])) || 0,
      d3.max(streamData.stacked, (layer) => d3.max(layer, (d) => d[1])) || 0,
    ]

    const xScale = d3.scaleLinear().domain(xExtent).range([0, innerWidth])

    const colorScale = d3
      .scaleOrdinal<string>()
      .domain(streamData.layers.map((l) => l.chunkId))
      .range(streamData.layers.map((l) => l.color))

    const area = d3
      .area<d3.SeriesPoint<Record<string, number>>>()
      .x0((d) => xScale(d[0]))
      .x1((d) => xScale(d[1]))
      .y((_, i) => yScale(i))
      .curve(d3.curveCatmullRom.alpha(0.5))

    // Draw streams
    g.append("g")
      .attr("class", "streams")
      .selectAll("path")
      .data(streamData.stacked)
      .join("path")
      .attr("d", area)
      .attr("fill", (d) => colorScale(d.key))
      .attr("fill-opacity", (d) => {
        const isHovered = hoveredIds.includes(d.key)
        const isSelected = selectedIds.includes(d.key)
        const isLocked = session.lockedChunks.includes(d.key)
        if (isSelected) return 0.9
        if (isLocked) return 0.85
        if (isHovered) return 0.8
        return 0.55
      })
      .attr("stroke", (d) => {
        const isSelected = selectedIds.includes(d.key)
        const isLocked = session.lockedChunks.includes(d.key)
        if (isSelected) return "#fff"
        if (isLocked) return colorScale(d.key)
        return "transparent"
      })
      .attr("stroke-width", (d) => (selectedIds.includes(d.key) ? 1.5 : 1))
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => {
        setHoveredIds([d.key], "stream")
      })
      .on("mouseleave", () => setHoveredIds([], "stream"))
      .on("click", (_, d) => setSelectedIds([d.key], "stream"))
      .on("dblclick", (_, d) => toggleChunkLock(d.key))

    // Turn labels
    g.append("g")
      .selectAll("text")
      .data(d3.range(streamData.turns))
      .join("text")
      .attr("x", -5)
      .attr("y", (d) => yScale(d))
      .attr("text-anchor", "end")
      .attr("dominant-baseline", "middle")
      .attr("font-size", "8px")
      .attr("fill", "rgba(255, 255, 255, 0.4)")
      .text((d) => `T${d + 1}`)
  }, [
    streamData,
    session,
    hoveredIds,
    selectedIds,
    innerWidth,
    innerHeight,
    margin,
    setHoveredIds,
    setSelectedIds,
    toggleChunkLock,
  ])

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
      <div className="absolute bottom-1 left-1 right-1 flex flex-wrap gap-1 text-[9px]">
        {session?.streamLayers.slice(0, 4).map((layer) => (
          <div
            key={layer.chunkId}
            className="flex items-center gap-0.5 cursor-pointer hover:opacity-80"
            onClick={() => setSelectedIds([layer.chunkId], "stream")}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: layer.color }} />
          </div>
        ))}
      </div>
    </div>
  )
}
