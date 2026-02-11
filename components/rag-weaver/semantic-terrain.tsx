"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import * as d3 from "d3"
import { contourDensity } from "d3-contour"
import { Delaunay } from "d3-delaunay"
import { useRAGStore } from "@/lib/hooks/use-rag-store"
import { Move, Lock, Unlock } from "lucide-react"

export function SemanticTerrain() {
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 400, height: 280 })
  const [lensEnabled, setLensEnabled] = useState(false) // 控制透镜是否启用

  const { session, lens, updateLens, hoveredIds, selectedIds, setHoveredIds, setSelectedIds, getDistortedEmbeddings } =
    useRAGStore()

  const margin = { top: 10, right: 10, bottom: 20, left: 20 }
  const innerWidth = dimensions.width - margin.left - margin.right
  const innerHeight = dimensions.height - margin.top - margin.bottom

  // Color scales
  const contourColorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, 1])
  const clusterColorScale = d3
    .scaleOrdinal<string>()
    .domain(["Medical Diagnosis", "Treatment Protocols", "Drug Interactions", "Patient History", "Clinical Trials"])
    .range(["#4ecdc4", "#ff6b9d", "#95e679", "#ffd166", "#a78bfa"])

  // Initialize lens
  const initializeLens = useCallback(() => {
    if (!lens) {
      updateLens({
        id: "main-lens",
        position: { x: innerWidth / 2, y: innerHeight / 2 },
        radius: 50,
        distortionStrength: 0.5,
        topicWeights: {},
        active: false,
      })
    }
  }, [lens, updateLens, innerWidth, innerHeight])

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current || !session || innerWidth <= 0 || innerHeight <= 0) return

    initializeLens()

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    // Add gradient definitions
    const defs = svg.append("defs")

    // Radial gradient for lens
    const lensGradient = defs
      .append("radialGradient")
      .attr("id", "lens-gradient")
      .attr("cx", "50%")
      .attr("cy", "50%")
      .attr("r", "50%")

    lensGradient.append("stop").attr("offset", "0%").attr("stop-color", "#4ecdc4").attr("stop-opacity", 0.3)
    lensGradient.append("stop").attr("offset", "70%").attr("stop-color", "#4ecdc4").attr("stop-opacity", 0.1)
    lensGradient.append("stop").attr("offset", "100%").attr("stop-color", "#4ecdc4").attr("stop-opacity", 0)

    // Glow filter
    const glowFilter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%")

    glowFilter.append("feGaussianBlur").attr("stdDeviation", "2").attr("result", "coloredBlur")
    const feMerge = glowFilter.append("feMerge")
    feMerge.append("feMergeNode").attr("in", "coloredBlur")
    feMerge.append("feMergeNode").attr("in", "SourceGraphic")

    // Get embeddings (raw, without distortion - we'll apply it in pixel space)
    const rawEmbeddings = session.knowledgeBase.embeddings
    if (rawEmbeddings.length === 0) return

    // Create scales
    const xExtent = d3.extent(rawEmbeddings, (d) => d.x) as [number, number]
    const yExtent = d3.extent(rawEmbeddings, (d) => d.y) as [number, number]

    const xScale = d3
      .scaleLinear()
      .domain([xExtent[0] - 30, xExtent[1] + 30])
      .range([0, innerWidth])

    const yScale = d3
      .scaleLinear()
      .domain([yExtent[0] - 30, yExtent[1] + 30])
      .range([innerHeight, 0])

    // Apply fisheye distortion in pixel space
    const applyFisheye = (px: number, py: number) => {
      if (!lens || !lensEnabled) return { x: px, y: py }
      
      const dx = px - lens.position.x
      const dy = py - lens.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > lens.radius * 2) return { x: px, y: py }
      
      // Fisheye distortion formula
      const distortionFactor = lens.distortionStrength
      const normalizedDist = distance / (lens.radius * 2)
      const distortion = Math.pow(normalizedDist, distortionFactor)
      
      const newDistance = distance * (1 + (1 - distortion) * 0.5)
      const angle = Math.atan2(dy, dx)
      
      return {
        x: lens.position.x + Math.cos(angle) * newDistance,
        y: lens.position.y + Math.sin(angle) * newDistance,
      }
    }

    // Create embeddings with pixel coordinates and fisheye applied
    const embeddings = rawEmbeddings.map((d) => {
      const px = xScale(d.x)
      const py = yScale(d.y)
      const distorted = applyFisheye(px, py)
      return { ...d, px: distorted.x, py: distorted.y }
    })

    // Generate contour density
    const contourGenerator = contourDensity<(typeof embeddings)[0]>()
      .x((d) => xScale(d.x))
      .y((d) => yScale(d.y))
      .size([innerWidth, innerHeight])
      .bandwidth(25)
      .thresholds(10)

    const contours = contourGenerator(embeddings)

    // Draw contours
    g.append("g")
      .attr("class", "contours")
      .selectAll("path")
      .data(contours)
      .join("path")
      .attr("d", d3.geoPath())
      .attr("fill", (d, i) => {
        const opacity = 0.08 + (i / contours.length) * 0.25
        const color = d3.color(contourColorScale(i / contours.length))
        return color ? color.copy({ opacity }).toString() : "transparent"
      })
      .attr("stroke", (d, i) => contourColorScale(i / contours.length))
      .attr("stroke-width", 0.3)
      .attr("stroke-opacity", 0.4)

    // Generate Voronoi diagram
    const delaunay = Delaunay.from(
      embeddings,
      (d) => xScale(d.x),
      (d) => yScale(d.y),
    )
    const voronoi = delaunay.voronoi([0, 0, innerWidth, innerHeight])

    // Draw Voronoi cells
    g.append("g")
      .attr("class", "voronoi")
      .selectAll("path")
      .data(embeddings)
      .join("path")
      .attr("d", (_, i) => voronoi.renderCell(i))
      .attr("fill", "transparent")
      .attr("stroke", "rgba(255,255,255,0.05)")
      .attr("stroke-width", 0.5)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        setHoveredIds([d.id], "terrain")
        d3.select(this).attr("fill", "rgba(78, 205, 196, 0.1)")
      })
      .on("mouseleave", function () {
        setHoveredIds([], "terrain")
        d3.select(this).attr("fill", "transparent")
      })
      .on("click", (_, d) => {
        setSelectedIds([d.id], "terrain")
      })

    // Draw embedding points (using fisheye-distorted coordinates)
    g.append("g")
      .attr("class", "points")
      .selectAll("circle")
      .data(embeddings)
      .join("circle")
      .attr("cx", (d) => d.px)
      .attr("cy", (d) => d.py)
      .attr("r", (d) => {
        const isHovered = hoveredIds.includes(d.id)
        const isSelected = selectedIds.includes(d.id)
        return isSelected ? 5 : isHovered ? 4 : 2.5
      })
      .attr("fill", (d) => clusterColorScale(d.cluster || "unknown"))
      .attr("fill-opacity", (d) => {
        const isHovered = hoveredIds.includes(d.id)
        const isSelected = selectedIds.includes(d.id)
        return isSelected ? 1 : isHovered ? 0.9 : 0.6
      })
      .attr("stroke", (d) => (selectedIds.includes(d.id) ? "#fff" : "none"))
      .attr("stroke-width", 1.5)
      .attr("filter", (d) => (selectedIds.includes(d.id) ? "url(#glow)" : "none"))
      .style("cursor", "pointer")
      .on("mouseenter", (_, d) => setHoveredIds([d.id], "terrain"))
      .on("mouseleave", () => setHoveredIds([], "terrain"))
      .on("click", (_, d) => {
        const newSelection = selectedIds.includes(d.id)
          ? selectedIds.filter((id) => id !== d.id)
          : [...selectedIds, d.id]
        setSelectedIds(newSelection, "terrain")
      })

    // Draw cluster labels (smaller)
    const clusters = session.knowledgeBase.clusters
    g.append("g")
      .attr("class", "labels")
      .selectAll("text")
      .data(clusters)
      .join("text")
      .attr("x", (d) => xScale(d.centroid.x))
      .attr("y", (d) => yScale(d.centroid.y) - 12)
      .attr("text-anchor", "middle")
      .attr("font-size", "8px")
      .attr("font-weight", "500")
      .attr("fill", (d) => clusterColorScale(d.label))
      .attr("opacity", 0.7)
      .text((d) => d.label.slice(0, 10))

    // Get retrieved chunk IDs for highlighting
    const retrievedChunkIds = new Set(session.retrievedChunks.map(chunk => chunk.embedding.id))

    // Draw retrieved chunks highlight rings (blue rings around retrieved documents)
    const retrievedEmbeddings = embeddings.filter(d => retrievedChunkIds.has(d.id))
    g.append("g")
      .attr("class", "retrieved-highlights")
      .selectAll("circle")
      .data(retrievedEmbeddings)
      .join("circle")
      .attr("cx", (d) => d.px)
      .attr("cy", (d) => d.py)
      .attr("r", 8)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6") // Blue color for retrieved docs
      .attr("stroke-width", 2)
      .attr("stroke-opacity", 0.8)
      .attr("filter", "url(#glow)")

    // Draw user query position (RED point) - most important visual element
    if (session.queryEmbedding) {
      const queryPx = xScale(session.queryEmbedding.x)
      const queryPy = yScale(session.queryEmbedding.y)
      const distortedQuery = applyFisheye(queryPx, queryPy)

      // Query glow effect
      const queryGlow = defs
        .append("radialGradient")
        .attr("id", "query-glow")
        .attr("cx", "50%")
        .attr("cy", "50%")
        .attr("r", "50%")
      queryGlow.append("stop").attr("offset", "0%").attr("stop-color", "#ef4444").attr("stop-opacity", 0.6)
      queryGlow.append("stop").attr("offset", "100%").attr("stop-color", "#ef4444").attr("stop-opacity", 0)

      const queryGroup = g.append("g").attr("class", "query-point")

      // Outer pulse ring (animated)
      queryGroup
        .append("circle")
        .attr("cx", distortedQuery.x)
        .attr("cy", distortedQuery.y)
        .attr("r", 15)
        .attr("fill", "url(#query-glow)")
        .attr("opacity", 0.5)

      // Query point outer ring
      queryGroup
        .append("circle")
        .attr("cx", distortedQuery.x)
        .attr("cy", distortedQuery.y)
        .attr("r", 8)
        .attr("fill", "none")
        .attr("stroke", "#ef4444")
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.8)

      // Query point inner dot (RED)
      queryGroup
        .append("circle")
        .attr("cx", distortedQuery.x)
        .attr("cy", distortedQuery.y)
        .attr("r", 5)
        .attr("fill", "#ef4444")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("filter", "url(#glow)")

      // Query label
      queryGroup
        .append("text")
        .attr("x", distortedQuery.x + 12)
        .attr("y", distortedQuery.y + 4)
        .attr("font-size", "9px")
        .attr("font-weight", "600")
        .attr("fill", "#ef4444")
        .text("Query")
    }

    // Draw interactive lens with improved drag - only when enabled
    if (lens && lensEnabled) {
      const lensGroup = g.append("g").attr("class", "lens")

      // Outer glow ring (for visual feedback during drag)
      lensGroup
        .append("circle")
        .attr("class", "lens-glow")
        .attr("cx", lens.position.x)
        .attr("cy", lens.position.y)
        .attr("r", lens.radius + 5)
        .attr("fill", "none")
        .attr("stroke", lensEnabled ? "#4ecdc4" : "rgba(255,255,255,0.2)")
        .attr("stroke-width", lens.active ? 3 : (lensEnabled ? 1 : 0))
        .attr("stroke-opacity", 0.3)
        .attr("filter", lensEnabled ? "url(#glow)" : "none")
        .style("transition", "stroke-width 0.15s ease")

      // Main lens circle
      const mainLens = lensGroup
        .append("circle")
        .attr("class", "lens-main")
        .attr("cx", lens.position.x)
        .attr("cy", lens.position.y)
        .attr("r", lens.radius)
        .attr("fill", lensEnabled ? "url(#lens-gradient)" : "rgba(255,255,255,0.02)")
        .attr("stroke", lensEnabled 
          ? (lens.active ? "#4ecdc4" : "rgba(78, 205, 196, 0.6)") 
          : "rgba(255,255,255,0.15)")
        .attr("stroke-width", lensEnabled ? (lens.active ? 2.5 : 1.5) : 1)
        .attr("stroke-dasharray", lensEnabled ? (lens.active ? "none" : "4,3") : "2,4")
        .attr("filter", (lensEnabled && lens.active) ? "url(#glow)" : "none")
        .style("cursor", lensEnabled ? "grab" : "not-allowed")
        .style("pointer-events", lensEnabled ? "auto" : "none")

      // Center handle - only show when enabled
      if (lensEnabled) {
        lensGroup
          .append("circle")
          .attr("class", "lens-handle")
          .attr("cx", lens.position.x)
          .attr("cy", lens.position.y)
          .attr("r", 5)
          .attr("fill", lens.active ? "#4ecdc4" : "rgba(78, 205, 196, 0.7)")
          .attr("stroke", "#fff")
          .attr("stroke-width", 1.5)
          .style("cursor", "grab")

        // Crosshair indicators
        const crosshairSize = 8
        lensGroup
          .append("line")
          .attr("x1", lens.position.x - crosshairSize)
          .attr("y1", lens.position.y)
          .attr("x2", lens.position.x + crosshairSize)
          .attr("y2", lens.position.y)
          .attr("stroke", "rgba(255,255,255,0.4)")
          .attr("stroke-width", 1)

        lensGroup
          .append("line")
          .attr("x1", lens.position.x)
          .attr("y1", lens.position.y - crosshairSize)
          .attr("x2", lens.position.x)
          .attr("y2", lens.position.y + crosshairSize)
          .attr("stroke", "rgba(255,255,255,0.4)")
          .attr("stroke-width", 1)

        // Resize handle (white star at edge)
        const resizeAngle = Math.PI / 4 // 45 degrees
        // Store current radius in a mutable object for resize drag
        const radiusState = { radius: lens.radius }
        
        // Star path generator
        const createStarPath = (size: number) => {
          const outerR = size
          const innerR = size * 0.4
          const points = 5
          let path = ""
          for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? outerR : innerR
            const angle = (Math.PI / points) * i - Math.PI / 2
            const x = Math.cos(angle) * r
            const y = Math.sin(angle) * r
            path += (i === 0 ? "M" : "L") + x.toFixed(2) + "," + y.toFixed(2)
          }
          return path + "Z"
        }
        
        const resizeX = lens.position.x + Math.cos(resizeAngle) * lens.radius
        const resizeY = lens.position.y - Math.sin(resizeAngle) * lens.radius
        
        lensGroup
          .append("path")
          .attr("class", "lens-resize")
          .attr("d", createStarPath(5))
          .attr("transform", `translate(${resizeX}, ${resizeY})`)
          .attr("fill", "#ffffff")
          .attr("stroke", "rgba(0,0,0,0.4)")
          .attr("stroke-width", 0.5)
          .style("cursor", "nwse-resize")
          .call(
            d3.drag<SVGCircleElement, unknown>()
              .container(svg.node() as SVGGElement)
              .on("start", function(event) {
                event.sourceEvent.stopPropagation()
                d3.select(this).attr("transform", `translate(${resizeX}, ${resizeY}) scale(1.3)`)
                // Initialize radius state from current lens
                const currentLens = useRAGStore.getState().lens
                if (currentLens) {
                  radiusState.radius = currentLens.radius
                }
                // Visual feedback for active resize state
                lensGroup.select(".lens-main")
                  .attr("stroke", "#ffffff")
                  .attr("stroke-width", 2.5)
                  .attr("stroke-dasharray", "none")
                  .attr("filter", "url(#glow)")
                lensGroup.select(".lens-glow")
                  .attr("stroke", "#ffffff")
                  .attr("stroke-width", 3)
              })
              .on("drag", function(event) {
                const currentLens = useRAGStore.getState().lens
                if (!currentLens) return
                
                // Calculate new radius based on distance from center
                const dx = event.x - currentLens.position.x
                const dy = event.y - currentLens.position.y
                radiusState.radius = Math.max(25, Math.min(100, Math.sqrt(dx * dx + dy * dy)))
                
                // Update DOM directly without React state update
                lensGroup.select(".lens-main")
                  .attr("r", radiusState.radius)
                lensGroup.select(".lens-glow")
                  .attr("r", radiusState.radius + 5)
                
                // Update resize handle position
                const newResizeX = currentLens.position.x + Math.cos(resizeAngle) * radiusState.radius
                const newResizeY = currentLens.position.y - Math.sin(resizeAngle) * radiusState.radius
                d3.select(this)
                  .attr("transform", `translate(${newResizeX}, ${newResizeY}) scale(1.3)`)

                // Real-time fisheye update for data points during resize
                const applyFisheyeResize = (px: number, py: number) => {
                  const fdx = px - currentLens.position.x
                  const fdy = py - currentLens.position.y
                  const distance = Math.sqrt(fdx * fdx + fdy * fdy)
                  
                  if (distance > radiusState.radius * 2) return { x: px, y: py }
                  
                  const distortionFactor = currentLens.distortionStrength
                  const normalizedDist = distance / (radiusState.radius * 2)
                  const distortion = Math.pow(normalizedDist, distortionFactor)
                  
                  const newDistance = distance * (1 + (1 - distortion) * 0.5)
                  const angle = Math.atan2(fdy, fdx)
                  
                  return {
                    x: currentLens.position.x + Math.cos(angle) * newDistance,
                    y: currentLens.position.y + Math.sin(angle) * newDistance,
                  }
                }

                // Update all points with fisheye effect
                g.select(".points").selectAll("circle")
                  .attr("cx", (d: any) => {
                    const px = xScale(d.x)
                    const py = yScale(d.y)
                    return applyFisheyeResize(px, py).x
                  })
                  .attr("cy", (d: any) => {
                    const px = xScale(d.x)
                    const py = yScale(d.y)
                    return applyFisheyeResize(px, py).y
                  })
              })
              .on("end", function() {
                const endLens = useRAGStore.getState().lens
                if (endLens) {
                  const finalResizeX = endLens.position.x + Math.cos(resizeAngle) * radiusState.radius
                  const finalResizeY = endLens.position.y - Math.sin(resizeAngle) * radiusState.radius
                  d3.select(this).attr("transform", `translate(${finalResizeX}, ${finalResizeY})`)
                }
                // Reset visual state
                lensGroup.select(".lens-main")
                  .attr("stroke", "rgba(78, 205, 196, 0.6)")
                  .attr("stroke-width", 1.5)
                  .attr("stroke-dasharray", "4,3")
                  .attr("filter", "none")
                lensGroup.select(".lens-glow")
                  .attr("stroke", "#4ecdc4")
                  .attr("stroke-width", 1)
                
                // Only update React state at the end of resize
                if (endLens) {
                  updateLens({
                    ...endLens,
                    radius: radiusState.radius,
                    active: false,
                  })
                }
              }) as any
          )

        // Store current position in a mutable object for drag
        const dragState = { x: lens.position.x, y: lens.position.y }

        // Improved drag behavior - update DOM directly during drag, sync state only at end
        const drag = d3
          .drag<SVGCircleElement, unknown>()
          .container(svg.node() as SVGGElement)
          .on("start", function(event) {
            event.sourceEvent.stopPropagation()
            d3.select(this).style("cursor", "grabbing")
            // Initialize drag state from current lens
            const currentLens = useRAGStore.getState().lens
            if (currentLens) {
              dragState.x = currentLens.position.x
              dragState.y = currentLens.position.y
            }
            // Update visual state without triggering re-render
            lensGroup.select(".lens-main")
              .attr("stroke", "#4ecdc4")
              .attr("stroke-width", 2.5)
              .attr("stroke-dasharray", "none")
              .attr("filter", "url(#glow)")
            lensGroup.select(".lens-glow")
              .attr("stroke-width", 3)
            lensGroup.select(".lens-handle")
              .attr("fill", "#4ecdc4")
          })
          .on("drag", function(event) {
            const currentLens = useRAGStore.getState().lens
            if (!currentLens) return

            // Calculate new position using increments
            dragState.x = Math.max(
              currentLens.radius,
              Math.min(innerWidth - currentLens.radius, dragState.x + event.dx)
            )
            dragState.y = Math.max(
              currentLens.radius,
              Math.min(innerHeight - currentLens.radius, dragState.y + event.dy)
            )

            // Update DOM directly without React state update
            lensGroup.select(".lens-main")
              .attr("cx", dragState.x)
              .attr("cy", dragState.y)
            lensGroup.select(".lens-glow")
              .attr("cx", dragState.x)
              .attr("cy", dragState.y)
            lensGroup.select(".lens-handle")
              .attr("cx", dragState.x)
              .attr("cy", dragState.y)
            
            // Update crosshairs
            const crosshairSize = 8
            lensGroup.selectAll("line")
              .each(function(_, i) {
                const line = d3.select(this)
                if (i === 0) { // horizontal
                  line.attr("x1", dragState.x - crosshairSize)
                      .attr("x2", dragState.x + crosshairSize)
                      .attr("y1", dragState.y)
                      .attr("y2", dragState.y)
                } else { // vertical
                  line.attr("x1", dragState.x)
                      .attr("x2", dragState.x)
                      .attr("y1", dragState.y - crosshairSize)
                      .attr("y2", dragState.y + crosshairSize)
                }
              })

            // Update resize handle (star)
            const resizeAngle = Math.PI / 4
            const starX = dragState.x + Math.cos(resizeAngle) * currentLens.radius
            const starY = dragState.y - Math.sin(resizeAngle) * currentLens.radius
            lensGroup.select(".lens-resize")
              .attr("transform", `translate(${starX}, ${starY})`)

            // Real-time fisheye update for data points
            const applyFisheyeRealtime = (px: number, py: number) => {
              const dx = px - dragState.x
              const dy = py - dragState.y
              const distance = Math.sqrt(dx * dx + dy * dy)
              
              if (distance > currentLens.radius * 2) return { x: px, y: py }
              
              const distortionFactor = currentLens.distortionStrength
              const normalizedDist = distance / (currentLens.radius * 2)
              const distortion = Math.pow(normalizedDist, distortionFactor)
              
              const newDistance = distance * (1 + (1 - distortion) * 0.5)
              const angle = Math.atan2(dy, dx)
              
              return {
                x: dragState.x + Math.cos(angle) * newDistance,
                y: dragState.y + Math.sin(angle) * newDistance,
              }
            }

            // Update all points with fisheye effect
            g.select(".points").selectAll("circle")
              .attr("cx", (d: any) => {
                const px = xScale(d.x)
                const py = yScale(d.y)
                return applyFisheyeRealtime(px, py).x
              })
              .attr("cy", (d: any) => {
                const px = xScale(d.x)
                const py = yScale(d.y)
                return applyFisheyeRealtime(px, py).y
              })
          })
          .on("end", function() {
            d3.select(this).style("cursor", "grab")
            // Reset visual state
            lensGroup.select(".lens-main")
              .attr("stroke", "rgba(78, 205, 196, 0.6)")
              .attr("stroke-width", 1.5)
              .attr("stroke-dasharray", "4,3")
              .attr("filter", "none")
            lensGroup.select(".lens-glow")
              .attr("stroke-width", 1)
            lensGroup.select(".lens-handle")
              .attr("fill", "rgba(78, 205, 196, 0.7)")
            
            // Only update React state at the end of drag
            const currentLens = useRAGStore.getState().lens
            if (currentLens) {
              updateLens({
                ...currentLens,
                position: { x: dragState.x, y: dragState.y },
                active: false,
              })
            }
          })

        // Apply drag to the main lens and handle
        mainLens.call(drag as any)
        lensGroup.select(".lens-handle").call(drag as any)
      } else {
        // Show disabled indicator in center when not enabled
        lensGroup
          .append("text")
          .attr("x", lens.position.x)
          .attr("y", lens.position.y)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "middle")
          .attr("font-size", "10px")
          .attr("fill", "rgba(255,255,255,0.3)")
          .text("??")
      }
    }
  }, [
    session,
    lens,
    lensEnabled,
    hoveredIds,
    selectedIds,
    innerWidth,
    innerHeight,
    margin,
    initializeLens,
    updateLens,
    setHoveredIds,
    setSelectedIds,
    getDistortedEmbeddings,
    contourColorScale,
    clusterColorScale,
  ])

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect
        if (w > 0 && h > 0) {
          setDimensions({ width: w, height: h })
        }
      }
    })

    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="w-full h-full" />

      {/* Compact Legend */}
      <div className="absolute bottom-1 left-1 flex gap-2 text-[10px]">
        {/* Query point indicator */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
          <span className="text-muted-foreground">Query</span>
        </div>
        {/* Retrieved docs indicator */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full border-2" style={{ borderColor: "#3b82f6", background: "transparent" }} />
          <span className="text-muted-foreground">Retrieved</span>
        </div>
      </div>

      {/* Lens Control Panel */}
      <div className="absolute top-1 right-1 flex items-center gap-1.5">
        {lens?.active && lensEnabled && (
          <div className="bg-primary/20 backdrop-blur-sm border border-primary/40 rounded px-2 py-1 text-[10px] text-primary font-medium animate-pulse">
            ● Dragging
          </div>
        )}

        {/* Enable/Disable Lens Toggle Button */}
        <button
          onClick={() => setLensEnabled(!lensEnabled)}
          className={`flex items-center gap-1.5 backdrop-blur-sm border rounded px-2 py-1 text-[10px] font-medium transition-all ${
            lensEnabled 
              ? "bg-primary/20 border-primary/50 text-primary hover:bg-primary/30" 
              : "bg-card/90 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
          }`}
          title={lensEnabled ? "Click to disable lens dragging" : "Click to enable lens dragging"}
        >
          {lensEnabled ? (
            <>
              <Unlock className="w-3 h-3" />
              <span>Lens On</span>
            </>
          ) : (
            <>
              <Lock className="w-3 h-3" />
              <span>Lens Off</span>
            </>
          )}
        </button>
        
        {lens && lensEnabled && (
          <button
            onClick={() => {
              updateLens({
                id: "main-lens",
                position: { x: innerWidth / 2, y: innerHeight / 2 },
                radius: 50,
                distortionStrength: 0.5,
                topicWeights: {},
                active: false,
              })
            }}
            className="bg-card/90 backdrop-blur-sm border border-border hover:border-primary/50 rounded px-2 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
            title="Reset lens to center"
          >
            Reset
          </button>
        )}
      </div>

      {/* Usage Hints - only show when lens is enabled */}
      {lensEnabled && (
        <div className="absolute bottom-1 right-1 text-[9px] text-muted-foreground/70 bg-card/60 backdrop-blur-sm rounded px-1.5 py-0.5">
          <span className="text-primary/80">Drag</span> lens • <span className="text-[#ff6b9d]/80">Corner</span> resize
        </div>
      )}
    </div>
  )
}
