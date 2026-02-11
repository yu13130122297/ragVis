"use client"

import { create } from "zustand"
import type { RAGSession, SemanticLens, ViewType, DocumentChunk, GeneratedSentence, AttentionWeight, StreamLayer, UncertaintyGlyph, HypotheticalPath, ClusterInfo } from "@/lib/types/rag-weaver"
import { generateMockRAGSession, generateRAGResponseForQuery } from "@/lib/mock-data/rag-session"

/**
 * Generate stream layers based on retrieved chunks
 */
function generateStreamLayers(chunks: DocumentChunk[], session: RAGSession): StreamLayer[] {
  const colors = ["#4ecdc4", "#ff6b9d", "#95e679", "#ffd166", "#a78bfa"]

  return chunks.slice(0, 5).map((chunk, i) => {
    // Generate values across turns (current turn + history)
    const historyLength = session.conversationHistory.length
    const currentTurnValues = [chunk.relevanceScore]

    // Add simulated previous turn values based on category
    for (let j = 0; j < historyLength; j++) {
      const variance = (Math.random() - 0.5) * 0.3
      const prevValue = Math.max(0.1, Math.min(1, chunk.relevanceScore + variance))
      currentTurnValues.unshift(prevValue)
    }

    return {
      chunkId: chunk.id,
      values: currentTurnValues,
      color: colors[i % colors.length],
      label: chunk.metadata.semanticTopic,
    }
  })
}

/**
 * Generate uncertainty glyphs based on retrieved chunks
 */
function generateUncertaintyGlyphs(chunks: DocumentChunk[]): UncertaintyGlyph[] {
  const metrics = ["entropy", "variance", "conflict", "authority", "recency"]

  return chunks.slice(0, 6).map((chunk, i) => {
    const baseColor = chunk.metadata.sourceAuthority > 0.7
      ? "#4ecdc4"
      : chunk.metadata.sourceAuthority > 0.5
        ? "#ffd166"
        : "#ff6b9d"

    return {
      chunkId: chunk.id,
      position: { x: 0, y: 0 }, // Will be calculated by the component
      spikes: metrics.map((metric, j) => ({
        angle: (j / metrics.length) * Math.PI * 2,
        length: 0.3 + (chunk.relevanceScore * 0.5) + (Math.random() * 0.2),
        metric,
      })),
      baseColor,
      conflictLevel: 1 - chunk.relevanceScore + Math.random() * 0.2,
      authorityLevel: chunk.metadata.sourceAuthority,
    }
  })
}

/**
 * Generate hypothetical paths based on retrieved chunks and query
 */
function generateHypotheticalPaths(chunks: DocumentChunk[], query: string, response: string): HypotheticalPath[] {
  // Extract response sentences for path generation
  const sentences = response
    .split(/(?<=[.!?])\s+/)
    .filter((s: string) => s.length > 20)
    .slice(0, 6)

  // Path 0: The actual taken path (highest relevance chunks)
  const path0 = {
    id: "path-0",
    probability: 0.45,
    isTaken: true,
    isPruned: false,
    nodes: [
      { id: "p0-n0", turnIndex: 0, chunkIds: chunks.slice(0, 2).map(c => c.id), responsePreview: query.substring(0, 25) + "...", branchPoint: false },
      { id: "p0-n1", turnIndex: 1, chunkIds: chunks.slice(0, 2).map(c => c.id), responsePreview: sentences[0]?.substring(0, 25) + "..." || "Analyzing...", branchPoint: true },
      { id: "p0-n2", turnIndex: 2, chunkIds: chunks.slice(0, 2).map(c => c.id), responsePreview: sentences[1]?.substring(0, 25) + "..." || "Processing...", branchPoint: true },
      { id: "p0-n3", turnIndex: 3, chunkIds: chunks.slice(0, 2).map(c => c.id), responsePreview: sentences[2]?.substring(0, 25) + "..." || "Conclusion...", branchPoint: false },
    ],
  }

  // Path 1: Alternative using different chunks
  const path1 = {
    id: "path-1",
    probability: 0.25,
    isTaken: false,
    isPruned: false,
    nodes: [
      { id: "p1-n0", turnIndex: 0, chunkIds: chunks.slice(1, 3).map(c => c.id), responsePreview: query.substring(0, 25) + "...", branchPoint: false },
      { id: "p1-n1", turnIndex: 1, chunkIds: chunks.slice(1, 3).map(c => c.id), responsePreview: sentences[0]?.substring(0, 25) + "..." || "Alternative view...", branchPoint: true },
      { id: "p1-n2", turnIndex: 2, chunkIds: chunks.slice(1, 3).map(c => c.id), responsePreview: sentences[1]?.substring(0, 25) + "..." || "Considering options...", branchPoint: true },
      { id: "p1-n3", turnIndex: 3, chunkIds: chunks.slice(1, 3).map(c => c.id), responsePreview: sentences[3]?.substring(0, 25) + "..." || "Different conclusion...", branchPoint: false },
    ],
  }

  // Path 2: More cautious approach
  const path2 = {
    id: "path-2",
    probability: 0.15,
    isTaken: false,
    isPruned: false,
    nodes: [
      { id: "p2-n0", turnIndex: 0, chunkIds: chunks.slice(2, 4).map(c => c.id), responsePreview: query.substring(0, 25) + "...", branchPoint: false },
      { id: "p2-n1", turnIndex: 1, chunkIds: chunks.slice(2, 4).map(c => c.id), responsePreview: sentences[0]?.substring(0, 25) + "..." || "Cautious approach...", branchPoint: true },
      { id: "p2-n2", turnIndex: 2, chunkIds: chunks.slice(2, 4).map(c => c.id), responsePreview: sentences[1]?.substring(0, 25) + "..." || "Monitoring risks...", branchPoint: false },
      { id: "p2-n3", turnIndex: 3, chunkIds: chunks.slice(2, 4).map(c => c.id), responsePreview: sentences[4]?.substring(0, 25) + "..." || "Recommend with caution...", branchPoint: false },
    ],
  }

  // Path 3: Conservative approach (lower probability)
  const path3 = {
    id: "path-3",
    probability: 0.10,
    isTaken: false,
    isPruned: false,
    nodes: [
      { id: "p3-n0", turnIndex: 0, chunkIds: chunks.slice(3, 5).map(c => c.id), responsePreview: query.substring(0, 25) + "...", branchPoint: false },
      { id: "p3-n1", turnIndex: 1, chunkIds: chunks.slice(3, 5).map(c => c.id), responsePreview: sentences[0]?.substring(0, 25) + "..." || "Minimal intervention...", branchPoint: true },
      { id: "p3-n2", turnIndex: 2, chunkIds: chunks.slice(3, 5).map(c => c.id), responsePreview: sentences[1]?.substring(0, 25) + "..." || "Observation first...", branchPoint: true },
      { id: "p3-n3", turnIndex: 3, chunkIds: chunks.slice(3, 5).map(c => c.id), responsePreview: "No immediate action recommended...", branchPoint: false },
    ],
  }

  // Path 4: Pruned (low probability, high risk)
  const path4 = {
    id: "path-4",
    probability: 0.05,
    isTaken: false,
    isPruned: true,
    nodes: [
      { id: "p4-n0", turnIndex: 0, chunkIds: chunks.slice(4, 6).map(c => c.id), responsePreview: query.substring(0, 25) + "...", branchPoint: false },
      { id: "p4-n1", turnIndex: 1, chunkIds: chunks.slice(4, 6).map(c => c.id), responsePreview: sentences[0]?.substring(0, 25) + "..." || "Risk assessment...", branchPoint: true },
      { id: "p4-n2", turnIndex: 2, chunkIds: chunks.slice(4, 6).map(c => c.id), responsePreview: sentences[1]?.substring(0, 25) + "..." || "Safety concerns...", branchPoint: false },
      { id: "p4-n3", turnIndex: 3, chunkIds: chunks.slice(4, 6).map(c => c.id), responsePreview: "Not recommended due to risk...", branchPoint: false },
    ],
  }

  return [path0, path1, path2, path3, path4]
}

/**
 * Convert API response to RAGSession format
 */
function convertAPIResponseToSession(apiData: any, existingSession: RAGSession): RAGSession {
  const { query, retrievedChunks, response } = apiData

  // Convert retrieved chunks to DocumentChunk format
  const documentChunks: DocumentChunk[] = retrievedChunks.map((chunk: any, index: number) => ({
    id: chunk.id || `chunk-${index}`,
    documentId: chunk.metadata?.title || `doc-${index}`,
    text: chunk.text || "",
    embedding: {
      id: chunk.id || `emb-${index}`,
      x: 100 + Math.random() * 400,
      y: 50 + Math.random() * 300,
      originalDim: Array.from({ length: 768 }, () => Math.random()),
      cluster: chunk.metadata?.category || "General",
      density: chunk.score || 0.5,
    },
    metadata: {
      source: chunk.metadata?.source || "RAG API",
      sourceAuthority: chunk.score || 0.7,
      timestamp: new Date(),
      section: `Section ${(index % 3) + 1}`,
      semanticTopic: chunk.metadata?.category || "General",
    },
    relevanceScore: chunk.score || 0.8,
    retrievalRank: chunk.rank || index + 1,
    isLocked: false,
  }))

  // Parse response into sentences for visualization
  const sentences: GeneratedSentence[] = response
    .split(/(?<=[.!?])\s+/)
    .filter((s: string) => s.length > 10)
    .slice(0, 5)
    .map((text: string, index: number) => ({
      id: `sent-${index}`,
      text: text.trim(),
      tokenCount: text.split(" ").length,
      confidence: 0.7 + Math.random() * 0.25,
      uncertaintyMetrics: {
        entropy: 0.1 + Math.random() * 0.2,
        variance: 0.05 + Math.random() * 0.15,
        conflictScore: 0.1 + Math.random() * 0.15,
        hallucinationRisk: 0.05 + Math.random() * 0.1,
      },
      sourceContribution: retrievedChunks.reduce((acc: Record<string, number>, chunk: any, i: number) => {
        if (i < 3) {
          acc[chunk.id || `chunk-${i}`] = Math.random() * 0.4
        }
        return acc
      }, {}),
    }))

  // Generate attention weights between chunks and sentences
  const attentionWeights: AttentionWeight[] = []
  documentChunks.forEach((chunk) => {
    sentences.forEach((sentence) => {
      if (Math.random() > 0.5) {
        attentionWeights.push({
          sourceChunkId: chunk.id,
          targetSentenceId: sentence.id,
          selfAttention: 0.3 + Math.random() * 0.4,
          crossAttention: Math.random() * 0.5,
          combinedWeight: Math.random() * 0.7,
        })
      }
    })
  })

  // Generate dynamic stream layers
  const streamLayers = generateStreamLayers(documentChunks, existingSession)

  // Generate dynamic uncertainty glyphs
  const uncertaintyGlyphs = generateUncertaintyGlyphs(documentChunks)

  // Generate dynamic hypothetical paths
  const hypotheticalPaths = generateHypotheticalPaths(documentChunks, query, response)

  // Calculate query embedding position based on query content
  const queryLower = query.toLowerCase()
  let queryX = 300,
    queryY = 225
  if (queryLower.includes("treatment") || queryLower.includes("therapy")) {
    queryX = 330 + Math.random() * 40
    queryY = 160 + Math.random() * 40
  } else if (queryLower.includes("drug") || queryLower.includes("interaction")) {
    queryX = 240 + Math.random() * 40
    queryY = 280 + Math.random() * 40
  } else if (queryLower.includes("diagnosis") || queryLower.includes("symptom")) {
    queryX = 140 + Math.random() * 40
    queryY = 110 + Math.random() * 40
  }

  // Generate embeddings for the knowledge base (for visualization)
  const embeddings = documentChunks.map((chunk, i) => ({
    id: `emb-${i}`,
    x: 100 + (chunk.relevanceScore * 400),
    y: 50 + (Math.random() * 300),
    originalDim: Array.from({ length: 768 }, () => Math.random()),
    cluster: chunk.metadata.semanticTopic,
    density: chunk.relevanceScore,
  }))

  // Generate clusters from embeddings
  const clusterMap = new Map<string, typeof embeddings[0]>()
  embeddings.forEach((emb) => {
    if (emb.cluster) {
      if (!clusterMap.has(emb.cluster)) {
        clusterMap.set(emb.cluster, [])
      }
      clusterMap.get(emb.cluster)!.push(emb)
    }
  })

  const colors = ["#4ecdc4", "#ff6b9d", "#95e679", "#ffd166", "#a78bfa"]
  const clusters: ClusterInfo[] = []
  let clusterIndex = 0
  clusterMap.forEach((points, label) => {
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length
    clusters.push({
      id: `cluster-${clusterIndex}`,
      label,
      centroid: { x: cx, y: cy },
      documentCount: points.length,
      topics: [label],
      color: colors[clusterIndex % colors.length],
    })
    clusterIndex++
  })

  return {
    ...existingSession,
    id: `session-${Date.now()}`,
    query,
    queryEmbedding: { x: queryX, y: queryY },
    timestamp: new Date(),
    knowledgeBase: {
      embeddings,
      contours: [], // Will be computed by D3
      voronoiCells: [], // Will be computed by D3
      clusters,
    },
    conversationHistory: [
      ...existingSession.conversationHistory,
      {
        id: `turn-${existingSession.conversationHistory.length}`,
        turnIndex: existingSession.conversationHistory.length,
        query,
        retrievedChunks: documentChunks.slice(0, 4),
        generatedResponse: sentences,
        timestamp: new Date(),
      },
    ],
    retrievedChunks: documentChunks,
    generatedSentences: sentences,
    attentionWeights,
    streamLayers,
    uncertaintyGlyphs,
    hypotheticalPaths,
    lockedChunks: [],
    selectedPath: "path-0",
  }
}

interface RAGStore {
  // Session data
  session: RAGSession | null

  // Query state
  currentQuery: string
  isLoading: boolean
  isRetrieving: boolean
  isGenerating: boolean

  // Selection state (Brushing & Linking)
  hoveredIds: string[]
  selectedIds: string[]
  activeView: ViewType | null

  // Lens state
  lens: SemanticLens | null

  // Actions
  initializeSession: () => void

  // Query actions
  setCurrentQuery: (query: string) => void
  submitQuery: () => Promise<void>

  // Selection actions
  setHoveredIds: (ids: string[], sourceView: ViewType) => void
  setSelectedIds: (ids: string[], sourceView: ViewType) => void
  clearSelection: () => void

  // Lens actions
  updateLens: (lens: SemanticLens | null) => void

  // Chunk locking
  toggleChunkLock: (chunkId: string) => void

  // Path pruning
  togglePathPrune: (pathId: string) => void

  getRelatedIds: (ids: string[]) => string[]

  // Computed distorted embeddings based on lens
  getDistortedEmbeddings: () => RAGSession["knowledgeBase"]["embeddings"]
}

export const useRAGStore = create<RAGStore>((set, get) => ({
  session: null,
  currentQuery: "",
  isLoading: false,
  isRetrieving: false,
  isGenerating: false,
  hoveredIds: [],
  selectedIds: [],
  activeView: null,
  lens: null,

  initializeSession: async () => {
    // First, initialize with mock data for immediate UI load
    const mockSession = generateMockRAGSession()
    set({ session: mockSession, currentQuery: mockSession.query })

    // Then try to initialize the real vector database in background
    try {
      await fetch("/api/rag", { method: "GET" })
      console.log("RAG API initialized successfully")
    } catch (error) {
      console.log("RAG API not available, using mock data")
    }
  },

  setCurrentQuery: (query: string) => {
    set({ currentQuery: query })
  },

  submitQuery: async () => {
    const { currentQuery, session } = get()
    if (!currentQuery.trim()) return

    // 开始加载
    set({ isLoading: true, isRetrieving: true })

    try {
      // Call real RAG API
      const response = await fetch("/api/rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: currentQuery }),
      })

      if (!response.ok) {
        throw new Error("API request failed")
      }

      set({ isRetrieving: false, isGenerating: true })

      const result = await response.json()

      // Convert API response to RAGSession format
      const newSession = convertAPIResponseToSession(
        result.data,
        session || generateMockRAGSession()
      )

      set({
        session: newSession,
        isLoading: false,
        isGenerating: false,
        hoveredIds: [],
        selectedIds: [],
        currentQuery: currentQuery,
      })
    } catch (error) {
      console.error("RAG API error, falling back to mock:", error)

      // Fallback to mock data if API fails
      set({ isRetrieving: false, isGenerating: true })

      await new Promise((resolve) => setTimeout(resolve, 800))

      const newSession = generateRAGResponseForQuery(currentQuery, session || generateMockRAGSession())

      set({
        session: newSession,
        isLoading: false,
        isGenerating: false,
        hoveredIds: [],
        selectedIds: [],
        currentQuery: currentQuery,
      })
    }
  },

  setHoveredIds: (ids, sourceView) => {
    const relatedIds = get().getRelatedIds(ids)
    set({ hoveredIds: [...new Set([...ids, ...relatedIds])], activeView: sourceView })
  },

  setSelectedIds: (ids, sourceView) => {
    const relatedIds = get().getRelatedIds(ids)
    set({ selectedIds: [...new Set([...ids, ...relatedIds])], activeView: sourceView })
  },

  clearSelection: () => {
    set({ hoveredIds: [], selectedIds: [], activeView: null })
  },

  updateLens: (lens) => {
    set({ lens })
  },

  toggleChunkLock: (chunkId) => {
    const { session } = get()
    if (!session) return

    const isLocked = session.lockedChunks.includes(chunkId)
    const newLockedChunks = isLocked
      ? session.lockedChunks.filter((id) => id !== chunkId)
      : [...session.lockedChunks, chunkId]

    set({
      session: {
        ...session,
        lockedChunks: newLockedChunks,
        retrievedChunks: session.retrievedChunks.map((chunk) =>
          chunk.id === chunkId ? { ...chunk, isLocked: !isLocked } : chunk,
        ),
      },
    })
  },

  togglePathPrune: (pathId) => {
    const { session } = get()
    if (!session) return

    set({
      session: {
        ...session,
        hypotheticalPaths: session.hypotheticalPaths.map((path) =>
          path.id === pathId ? { ...path, isPruned: !path.isPruned } : path,
        ),
      },
    })
  },

  getRelatedIds: (ids: string[]) => {
    const { session } = get()
    if (!session || ids.length === 0) return []

    const relatedIds: string[] = []

    ids.forEach((id) => {
      // If it's a chunk, find related sentences via attention weights
      if (id.startsWith("chunk-")) {
        const chunkIndex = Number.parseInt(id.split("-")[1])
        // Find embedding with same index
        if (session.knowledgeBase.embeddings[chunkIndex]) {
          relatedIds.push(session.knowledgeBase.embeddings[chunkIndex].id)
        }
        // Find sentences that use this chunk
        session.attentionWeights
          .filter((w) => w.sourceChunkId === id)
          .forEach((w) => relatedIds.push(w.targetSentenceId))
      }

      // If it's a sentence, find source chunks
      if (id.startsWith("sent-")) {
        session.attentionWeights
          .filter((w) => w.targetSentenceId === id)
          .forEach((w) => relatedIds.push(w.sourceChunkId))
      }

      // If it's an embedding, find related chunk
      if (id.startsWith("emb-")) {
        const embIndex = Number.parseInt(id.split("-")[1])
        if (embIndex < session.retrievedChunks.length) {
          relatedIds.push(`chunk-${embIndex}`)
        }
      }
    })

    return relatedIds
  },

  getDistortedEmbeddings: () => {
    const { session, lens } = get()
    if (!session) return []

    const embeddings = session.knowledgeBase.embeddings

    if (!lens) return embeddings

    // Apply fisheye distortion based on lens position
    return embeddings.map((point) => {
      const dx = point.x - lens.position.x
      const dy = point.y - lens.position.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance > lens.radius * 2) return point

      // Fisheye distortion formula
      const distortionFactor = lens.distortionStrength
      const normalizedDist = distance / (lens.radius * 2)
      const distortion = Math.pow(normalizedDist, distortionFactor)

      const newDistance = distance * (1 + (1 - distortion) * 0.5)
      const angle = Math.atan2(dy, dx)

      return {
        ...point,
        x: lens.position.x + Math.cos(angle) * newDistance,
        y: lens.position.y + Math.sin(angle) * newDistance,
      }
    })
  },
}))
