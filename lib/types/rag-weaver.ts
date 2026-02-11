/**
 * RAG-Weaver Data Types
 * TypeScript interfaces for the Visual Analytics System
 * Supporting complex visualizations for RAG pipeline analysis
 */

// ============================================
// Core Embedding & Vector Types
// ============================================

export interface Vector2D {
  x: number
  y: number
}

export interface EmbeddingPoint extends Vector2D {
  id: string
  originalDim: number[] // High-dimensional embedding
  cluster?: string
  density?: number
}

// ============================================
// Document & Chunk Types
// ============================================

export interface DocumentChunk {
  id: string
  documentId: string
  text: string
  embedding: EmbeddingPoint
  metadata: ChunkMetadata
  relevanceScore: number
  retrievalRank: number
  isLocked: boolean // User can lock chunks for forced retrieval
}

export interface ChunkMetadata {
  source: string
  sourceAuthority: number // 0-1 authority score
  timestamp: Date
  section?: string
  pageNumber?: number
  semanticTopic: string
}

// ============================================
// Attention & Generation Types
// ============================================

export interface AttentionWeight {
  sourceChunkId: string
  targetSentenceId: string
  selfAttention: number
  crossAttention: number
  combinedWeight: number
}

export interface GeneratedSentence {
  id: string
  text: string
  tokenCount: number
  confidence: number
  uncertaintyMetrics: UncertaintyMetrics
  sourceContribution: Record<string, number> // chunkId -> contribution
}

export interface UncertaintyMetrics {
  entropy: number
  variance: number
  conflictScore: number // Semantic drift indicator
  hallucinationRisk: number
}

// ============================================
// Stream & Flow Types (View B)
// ============================================

export interface ConversationTurn {
  id: string
  turnIndex: number
  query: string
  retrievedChunks: DocumentChunk[]
  generatedResponse: GeneratedSentence[]
  timestamp: Date
}

export interface StreamLayer {
  chunkId: string
  values: number[] // Relevance scores across turns
  color: string
  label: string
}

// ============================================
// Glyph Types (View D)
// ============================================

export interface UncertaintyGlyph {
  chunkId: string
  position: Vector2D
  spikes: GlyphSpike[]
  baseColor: string
  conflictLevel: number
  authorityLevel: number
}

export interface GlyphSpike {
  angle: number // Radians
  length: number // Normalized 0-1
  metric: string // Which metric this spike represents
}

// ============================================
// Hypothetical Path Types (View E)
// ============================================

export interface HypotheticalPath {
  id: string
  probability: number
  nodes: PathNode[]
  isTaken: boolean
  isPruned: boolean
}

export interface PathNode {
  id: string
  turnIndex: number
  chunkIds: string[]
  responsePreview: string
  branchPoint: boolean
}

// ============================================
// Lens Interaction Types (View A)
// ============================================

export interface SemanticLens {
  id: string
  position: Vector2D
  radius: number
  distortionStrength: number
  topicWeights: Record<string, number> // Topic -> weight adjustment
  active: boolean
}

export interface ContourLevel {
  threshold: number
  coordinates: Vector2D[][]
  density: number
}

export interface VoronoiCell {
  id: string
  centroid: Vector2D
  polygon: Vector2D[]
  documentCount: number
  dominantTopic: string
}

// ============================================
// Complete RAG Session Data
// ============================================

export interface RAGSession {
  id: string
  query: string
  queryEmbedding: Vector2D // User query position in embedding space
  timestamp: Date

  // Knowledge Base (View A)
  knowledgeBase: {
    embeddings: EmbeddingPoint[]
    contours: ContourLevel[]
    voronoiCells: VoronoiCell[]
    clusters: ClusterInfo[]
  }

  // Retrieval Process (View B)
  conversationHistory: ConversationTurn[]
  streamLayers: StreamLayer[]

  // Attention Analysis (View C)
  retrievedChunks: DocumentChunk[]
  generatedSentences: GeneratedSentence[]
  attentionWeights: AttentionWeight[]

  // Uncertainty Analysis (View D)
  uncertaintyGlyphs: UncertaintyGlyph[]

  // What-If Analysis (View E)
  hypotheticalPaths: HypotheticalPath[]

  // Global State
  activeLens: SemanticLens | null
  lockedChunks: string[]
  selectedPath: string | null
}

export interface ClusterInfo {
  id: string
  label: string
  centroid: Vector2D
  documentCount: number
  topics: string[]
  color: string
}

// ============================================
// Interaction Events (Brushing & Linking)
// ============================================

export type ViewType = "terrain" | "stream" | "loom" | "glyph" | "playground"

export interface SelectionEvent {
  sourceView: ViewType
  type: "hover" | "select" | "brush"
  ids: string[]
  timestamp: number
}

export interface LensUpdateEvent {
  lens: SemanticLens
  affectedChunks: string[]
  reweightedScores: Record<string, number>
}

export interface ChunkLockEvent {
  chunkId: string
  locked: boolean
  sourceView: ViewType
}

export interface PathPruneEvent {
  pathId: string
  pruned: boolean
  newPrediction?: string
}

// ============================================
// Visualization Configuration
// ============================================

export interface ViewConfig {
  width: number
  height: number
  margin: { top: number; right: number; bottom: number; left: number }
  transitionDuration: number
  colorScale: string[]
}

export interface TerrainConfig extends ViewConfig {
  contourLevels: number
  voronoiEnabled: boolean
  lensRadius: number
  distortionIntensity: number
}

export interface LoomConfig extends ViewConfig {
  bundleStrength: number
  curveIntensity: number
  minOpacity: number
  maxStrokeWidth: number
}
