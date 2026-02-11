import type {
  RAGSession,
  EmbeddingPoint,
  DocumentChunk,
  GeneratedSentence,
  AttentionWeight,
  ConversationTurn,
  StreamLayer,
  UncertaintyGlyph,
  HypotheticalPath,
  ContourLevel,
  VoronoiCell,
  ClusterInfo,
} from "@/lib/types/rag-weaver"

// Seeded random for reproducibility
const seededRandom = (seed: number) => {
  const x = Math.sin(seed++) * 10000
  return x - Math.floor(x)
}

// Generate clustered embedding points
function generateEmbeddings(count: number): EmbeddingPoint[] {
  const clusters = [
    { cx: 150, cy: 120, label: "Medical Diagnosis" },
    { cx: 350, cy: 150, label: "Treatment Protocols" },
    { cx: 250, cy: 300, label: "Drug Interactions" },
    { cx: 450, cy: 280, label: "Patient History" },
    { cx: 100, cy: 350, label: "Clinical Trials" },
  ]

  const points: EmbeddingPoint[] = []

  for (let i = 0; i < count; i++) {
    const cluster = clusters[i % clusters.length]
    const spread = 60
    const seed = i * 31

    points.push({
      id: `emb-${i}`,
      x: cluster.cx + (seededRandom(seed) - 0.5) * spread * 2,
      y: cluster.cy + (seededRandom(seed + 1) - 0.5) * spread * 2,
      originalDim: Array.from({ length: 768 }, (_, j) => seededRandom(seed + j)),
      cluster: cluster.label,
      density: 0.3 + seededRandom(seed + 2) * 0.7,
    })
  }

  return points
}

// Generate document chunks
function generateChunks(embeddings: EmbeddingPoint[]): DocumentChunk[] {
  const sources = ["PubMed", "UpToDate", "Cochrane", "NEJM", "Internal DB"]
  const topics = ["Cardiovascular", "Oncology", "Neurology", "Immunology", "General"]

  return embeddings.slice(0, 12).map((emb, i) => ({
    id: `chunk-${i}`,
    documentId: `doc-${Math.floor(i / 3)}`,
    text: getChunkText(i),
    embedding: emb,
    metadata: {
      source: sources[i % sources.length],
      sourceAuthority: 0.5 + seededRandom(i * 17) * 0.5,
      timestamp: new Date(Date.now() - seededRandom(i * 23) * 365 * 24 * 60 * 60 * 1000),
      section: `Section ${Math.floor(i / 2) + 1}`,
      pageNumber: Math.floor(seededRandom(i * 29) * 100) + 1,
      semanticTopic: topics[i % topics.length],
    },
    relevanceScore: 0.4 + seededRandom(i * 37) * 0.6,
    retrievalRank: i + 1,
    isLocked: i < 2,
  }))
}

function getChunkText(index: number): string {
  const texts = [
    "Beta-blockers reduce mortality in heart failure patients by 30-40% according to CIBIS-II trial data...",
    "ACE inhibitors should be titrated to target doses as tolerated, monitoring for hyperkalemia...",
    "Combination therapy with statins and ezetimibe provides additional LDL reduction of 15-20%...",
    "Drug-drug interactions between warfarin and amiodarone require INR monitoring every 2-3 days...",
    "Clinical trials show SGLT2 inhibitors reduce hospitalization for heart failure by 35%...",
    "Patient adherence to medication regimens drops significantly after 6 months of treatment...",
    "Checkpoint inhibitors have revolutionized oncology treatment with durable responses in 20-40%...",
    "Neurological side effects of immunotherapy require early recognition and prompt management...",
    "Genetic testing can identify patients likely to respond to targeted therapies...",
    "Real-world evidence suggests effectiveness may differ from controlled trial results...",
    "Biomarker-driven treatment selection improves outcomes in precision medicine approaches...",
    "Long-term follow-up data shows sustained benefit of early aggressive treatment...",
  ]
  return texts[index % texts.length]
}

// Generate sentences with attention
function generateSentences(): GeneratedSentence[] {
  return [
    {
      id: "sent-0",
      text: "Based on the retrieved evidence, beta-blockers are recommended as first-line therapy.",
      tokenCount: 15,
      confidence: 0.92,
      uncertaintyMetrics: { entropy: 0.15, variance: 0.08, conflictScore: 0.12, hallucinationRisk: 0.05 },
      sourceContribution: { "chunk-0": 0.45, "chunk-1": 0.35, "chunk-2": 0.2 },
    },
    {
      id: "sent-1",
      text: "The patient should be monitored for potential drug interactions with current medications.",
      tokenCount: 13,
      confidence: 0.85,
      uncertaintyMetrics: { entropy: 0.25, variance: 0.15, conflictScore: 0.22, hallucinationRisk: 0.12 },
      sourceContribution: { "chunk-3": 0.5, "chunk-4": 0.3, "chunk-5": 0.2 },
    },
    {
      id: "sent-2",
      text: "Clinical trials support the efficacy of this treatment approach in similar patient populations.",
      tokenCount: 14,
      confidence: 0.88,
      uncertaintyMetrics: { entropy: 0.18, variance: 0.1, conflictScore: 0.15, hallucinationRisk: 0.08 },
      sourceContribution: { "chunk-4": 0.4, "chunk-6": 0.35, "chunk-7": 0.25 },
    },
    {
      id: "sent-3",
      text: "Long-term outcomes depend on patient adherence and regular follow-up appointments.",
      tokenCount: 11,
      confidence: 0.78,
      uncertaintyMetrics: { entropy: 0.32, variance: 0.2, conflictScore: 0.28, hallucinationRisk: 0.18 },
      sourceContribution: { "chunk-5": 0.55, "chunk-8": 0.25, "chunk-9": 0.2 },
    },
    {
      id: "sent-4",
      text: "Alternative therapies may be considered if initial treatment is not well tolerated.",
      tokenCount: 12,
      confidence: 0.72,
      uncertaintyMetrics: { entropy: 0.38, variance: 0.25, conflictScore: 0.35, hallucinationRisk: 0.22 },
      sourceContribution: { "chunk-2": 0.3, "chunk-7": 0.4, "chunk-10": 0.3 },
    },
  ]
}

// Generate attention weights
function generateAttentionWeights(chunks: DocumentChunk[], sentences: GeneratedSentence[]): AttentionWeight[] {
  const weights: AttentionWeight[] = []

  sentences.forEach((sent) => {
    Object.entries(sent.sourceContribution).forEach(([chunkId, contribution]) => {
      weights.push({
        sourceChunkId: chunkId,
        targetSentenceId: sent.id,
        selfAttention: 0.3 + seededRandom(Number.parseInt(chunkId.split("-")[1]) * 41) * 0.5,
        crossAttention: contribution,
        combinedWeight: contribution * 0.7 + 0.3 * seededRandom(Number.parseInt(sent.id.split("-")[1]) * 47),
      })
    })
  })

  return weights
}

// Generate stream layers for View B
function generateStreamLayers(chunks: DocumentChunk[]): StreamLayer[] {
  const colors = ["#4ecdc4", "#ff6b9d", "#95e679", "#ffd166", "#a78bfa"]

  return chunks.slice(0, 5).map((chunk, i) => ({
    chunkId: chunk.id,
    values: Array.from({ length: 6 }, (_, j) =>
      Math.max(0.1, chunk.relevanceScore * (0.5 + seededRandom((i + 1) * (j + 1) * 53) * 0.8)),
    ),
    color: colors[i],
    label: chunk.metadata.semanticTopic,
  }))
}

// Generate uncertainty glyphs for View D
function generateGlyphs(chunks: DocumentChunk[]): UncertaintyGlyph[] {
  const metrics = ["entropy", "variance", "conflict", "authority", "recency"]

  return chunks.slice(0, 8).map((chunk, i) => ({
    chunkId: chunk.id,
    position: { x: 80 + (i % 4) * 120, y: 60 + Math.floor(i / 4) * 100 },
    spikes: metrics.map((metric, j) => ({
      angle: (j / metrics.length) * Math.PI * 2,
      length: 0.3 + seededRandom((i + 1) * (j + 1) * 59) * 0.7,
      metric,
    })),
    baseColor:
      chunk.metadata.sourceAuthority > 0.7 ? "#4ecdc4" : chunk.metadata.sourceAuthority > 0.5 ? "#ffd166" : "#ff6b9d",
    conflictLevel: 0.2 + seededRandom(i * 61) * 0.6,
    authorityLevel: chunk.metadata.sourceAuthority,
  }))
}

// Generate hypothetical paths for View E
// 路径设计：5条路径、4个Turn，形成清晰的多级分支树结构
// 节点识别规则：前20字符相同 = 同一节点（分支点）
function generatePaths(): HypotheticalPath[] {
  // ===== Turn 0: 所有路径共享起点 =====
  const T0_shared = "Initial assessment of patient symptoms and medical history review..."

  // ===== Turn 1: 第一次分叉（2个分支）=====
  const T1_branchA = "Drug therapy recomme..."  // Path 0,1,2 共享 - 药物治疗方向
  const T1_branchB = "Non-drug interventio..."  // Path 3,4 共享 - 非药物方向

  // ===== Turn 2: 第二次分叉（更细分）=====
  const T2_drugSafe = "Standard dosage with..."   // Path 0,1 - 标准用药
  const T2_drugRisk = "Adjusted dose due to..."   // Path 2 - 调整剂量
  const T2_lifestyle = "Lifestyle modificati..."  // Path 3,4 - 生活方式

  // ===== Turn 3: 最终输出 =====
  const T3_approve = "可以服用，注意出血风险，每周监测INR值..."
  const T3_consult = "需咨询专科医生，存在药物相互作用风险..."
  const T3_reject = "禁止服用，肝肾功能不足，风险过高..."
  const T3_alternative = "建议先尝试生活方式干预，3个月后复评..."
  const T3_monitor = "可尝试低剂量，密切监测肝功能指标..."

  return [
    // ===== Path 0: 实际采纳路径 - 标准用药批准 =====
    {
      id: "path-0",
      probability: 0.45,
      isTaken: true,
      isPruned: false,
      nodes: [
        { id: "p0-n0", turnIndex: 0, chunkIds: ["chunk-0", "chunk-1"], responsePreview: T0_shared, branchPoint: false },
        { id: "p0-n1", turnIndex: 1, chunkIds: ["chunk-2", "chunk-3"], responsePreview: T1_branchA + "nded based on guidelines and patient profile...", branchPoint: true },
        { id: "p0-n2", turnIndex: 2, chunkIds: ["chunk-4", "chunk-5"], responsePreview: T2_drugSafe + " monitoring schedule recommended...", branchPoint: true },
        { id: "p0-n3", turnIndex: 3, chunkIds: ["chunk-6", "chunk-7"], responsePreview: T3_approve, branchPoint: false },
      ],
    },
    // ===== Path 1: 替代路径 - 需要专科会诊 =====
    {
      id: "path-1",
      probability: 0.22,
      isTaken: false,
      isPruned: false,
      nodes: [
        { id: "p1-n0", turnIndex: 0, chunkIds: ["chunk-0", "chunk-2"], responsePreview: T0_shared, branchPoint: false },
        { id: "p1-n1", turnIndex: 1, chunkIds: ["chunk-3", "chunk-8"], responsePreview: T1_branchA + "nded based on guidelines and patient profile...", branchPoint: true },
        { id: "p1-n2", turnIndex: 2, chunkIds: ["chunk-4", "chunk-9"], responsePreview: T2_drugSafe + " monitoring schedule recommended...", branchPoint: true },
        { id: "p1-n3", turnIndex: 3, chunkIds: ["chunk-10", "chunk-11"], responsePreview: T3_consult, branchPoint: false },
      ],
    },
    // ===== Path 2: 高风险路径 - 调整剂量后监测 =====
    {
      id: "path-2",
      probability: 0.15,
      isTaken: false,
      isPruned: false,
      nodes: [
        { id: "p2-n0", turnIndex: 0, chunkIds: ["chunk-1", "chunk-3"], responsePreview: T0_shared, branchPoint: false },
        { id: "p2-n1", turnIndex: 1, chunkIds: ["chunk-5", "chunk-7"], responsePreview: T1_branchA + "nded based on guidelines and patient profile...", branchPoint: true },
        { id: "p2-n2", turnIndex: 2, chunkIds: ["chunk-8", "chunk-9"], responsePreview: T2_drugRisk + " renal impairment concerns...", branchPoint: false },
        { id: "p2-n3", turnIndex: 3, chunkIds: ["chunk-10", "chunk-11"], responsePreview: T3_monitor, branchPoint: false },
      ],
    },
    // ===== Path 3: 保守路径 - 非药物优先 =====
    {
      id: "path-3",
      probability: 0.12,
      isTaken: false,
      isPruned: false,
      nodes: [
        { id: "p3-n0", turnIndex: 0, chunkIds: ["chunk-0", "chunk-4"], responsePreview: T0_shared, branchPoint: false },
        { id: "p3-n1", turnIndex: 1, chunkIds: ["chunk-6", "chunk-9"], responsePreview: T1_branchB + "ns preferred for mild cases...", branchPoint: true },
        { id: "p3-n2", turnIndex: 2, chunkIds: ["chunk-7", "chunk-10"], responsePreview: T2_lifestyle + "ons and dietary changes first...", branchPoint: true },
        { id: "p3-n3", turnIndex: 3, chunkIds: ["chunk-8", "chunk-11"], responsePreview: T3_alternative, branchPoint: false },
      ],
    },
    // ===== Path 4: 已剪枝路径 - 风险过高被排除 =====
    {
      id: "path-4",
      probability: 0.06,
      isTaken: false,
      isPruned: true,
      nodes: [
        { id: "p4-n0", turnIndex: 0, chunkIds: ["chunk-2", "chunk-5"], responsePreview: T0_shared, branchPoint: false },
        { id: "p4-n1", turnIndex: 1, chunkIds: ["chunk-8", "chunk-11"], responsePreview: T1_branchB + "ns preferred for mild cases...", branchPoint: true },
        { id: "p4-n2", turnIndex: 2, chunkIds: ["chunk-9", "chunk-10"], responsePreview: T2_lifestyle + "ons and dietary changes first...", branchPoint: true },
        { id: "p4-n3", turnIndex: 3, chunkIds: ["chunk-3", "chunk-6"], responsePreview: T3_reject, branchPoint: false },
      ],
    },
  ]
}

// Generate contour levels for topographic visualization
function generateContours(embeddings: EmbeddingPoint[]): ContourLevel[] {
  const levels: ContourLevel[] = []
  const thresholds = [0.2, 0.4, 0.6, 0.8]

  // Simplified contour generation (in production, use d3-contour)
  thresholds.forEach((threshold) => {
    levels.push({
      threshold,
      coordinates: [], // Will be computed by D3 contour generator
      density: threshold,
    })
  })

  return levels
}

// Generate Voronoi cells
function generateVoronoiCells(embeddings: EmbeddingPoint[]): VoronoiCell[] {
  const clusters = new Map<string, EmbeddingPoint[]>()

  embeddings.forEach((emb) => {
    if (emb.cluster) {
      if (!clusters.has(emb.cluster)) {
        clusters.set(emb.cluster, [])
      }
      clusters.get(emb.cluster)!.push(emb)
    }
  })

  const cells: VoronoiCell[] = []
  let cellIndex = 0

  clusters.forEach((points, topic) => {
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length

    cells.push({
      id: `cell-${cellIndex++}`,
      centroid: { x: cx, y: cy },
      polygon: [], // Will be computed by D3 Voronoi
      documentCount: points.length,
      dominantTopic: topic,
    })
  })

  return cells
}

// Generate cluster info
function generateClusters(embeddings: EmbeddingPoint[]): ClusterInfo[] {
  const clusterMap = new Map<string, EmbeddingPoint[]>()

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
  let i = 0

  clusterMap.forEach((points, label) => {
    const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length
    const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length

    clusters.push({
      id: `cluster-${i}`,
      label,
      centroid: { x: cx, y: cy },
      documentCount: points.length,
      topics: [label],
      color: colors[i % colors.length],
    })
    i++
  })

  return clusters
}

// Generate conversation turns
function generateConversationTurns(chunks: DocumentChunk[], sentences: GeneratedSentence[]): ConversationTurn[] {
  return [
    {
      id: "turn-0",
      turnIndex: 0,
      query: "What is the recommended treatment for heart failure?",
      retrievedChunks: chunks.slice(0, 4),
      generatedResponse: sentences.slice(0, 2),
      timestamp: new Date(Date.now() - 300000),
    },
    {
      id: "turn-1",
      turnIndex: 1,
      query: "Are there any drug interactions I should be aware of?",
      retrievedChunks: chunks.slice(3, 7),
      generatedResponse: sentences.slice(2, 4),
      timestamp: new Date(Date.now() - 180000),
    },
    {
      id: "turn-2",
      turnIndex: 2,
      query: "What does the clinical evidence show?",
      retrievedChunks: chunks.slice(4, 8),
      generatedResponse: sentences.slice(3, 5),
      timestamp: new Date(),
    },
  ]
}

// Generate response for a new query (simulates RAG pipeline)
export function generateRAGResponseForQuery(query: string, existingSession: RAGSession): RAGSession {
  const seed = query.length * 17 + Date.now() % 1000
  
  // Reuse knowledge base but generate new retrieval results
  const embeddings = existingSession.knowledgeBase.embeddings
  
  // Shuffle and select different chunks based on query
  const shuffledIndices = Array.from({ length: 12 }, (_, i) => i)
    .sort(() => seededRandom(seed + Math.random() * 100) - 0.5)
  
  const newChunks = shuffledIndices.slice(0, 8).map((origIndex, i) => {
    const baseChunk = existingSession.retrievedChunks[origIndex % existingSession.retrievedChunks.length]
    return {
      ...baseChunk,
      id: `chunk-${i}`,
      relevanceScore: 0.5 + seededRandom(seed + i * 31) * 0.5,
      retrievalRank: i + 1,
      isLocked: false,
    }
  })

  // Generate new sentences based on query keywords
  const newSentences = generateSentencesForQuery(query, seed)
  const newAttentionWeights = generateAttentionWeights(newChunks, newSentences)

  // Create new conversation turn
  const newTurn: ConversationTurn = {
    id: `turn-${existingSession.conversationHistory.length}`,
    turnIndex: existingSession.conversationHistory.length,
    query,
    retrievedChunks: newChunks.slice(0, 4),
    generatedResponse: newSentences,
    timestamp: new Date(),
  }

  // Generate new query embedding position based on query content
  const queryLower = query.toLowerCase()
  let queryX = 300, queryY = 225 // Default position
  if (queryLower.includes("treatment") || queryLower.includes("therapy")) {
    queryX = 330 + seededRandom(seed) * 40
    queryY = 160 + seededRandom(seed + 1) * 40
  } else if (queryLower.includes("drug") || queryLower.includes("interaction")) {
    queryX = 240 + seededRandom(seed) * 40
    queryY = 280 + seededRandom(seed + 1) * 40
  } else if (queryLower.includes("diagnosis") || queryLower.includes("symptom")) {
    queryX = 140 + seededRandom(seed) * 40
    queryY = 110 + seededRandom(seed + 1) * 40
  }

  return {
    ...existingSession,
    id: `session-${Date.now()}`,
    query,
    queryEmbedding: { x: queryX, y: queryY },
    timestamp: new Date(),
    conversationHistory: [...existingSession.conversationHistory, newTurn],
    retrievedChunks: newChunks,
    generatedSentences: newSentences,
    attentionWeights: newAttentionWeights,
    uncertaintyGlyphs: generateGlyphs(newChunks),
    hypotheticalPaths: generatePaths(),
    lockedChunks: [],
    selectedPath: "path-0",
  }
}

// Generate sentences based on query content
function generateSentencesForQuery(query: string, seed: number): GeneratedSentence[] {
  const queryLower = query.toLowerCase()
  
  // Determine response theme based on query keywords
  let responses: string[]
  if (queryLower.includes("treatment") || queryLower.includes("therapy")) {
    responses = [
      "Based on the current clinical guidelines, the recommended treatment approach involves a combination of pharmacological and lifestyle interventions.",
      "The evidence suggests that early intervention significantly improves patient outcomes in this condition.",
      "Regular monitoring and dose adjustments may be necessary to achieve optimal therapeutic effects.",
    ]
  } else if (queryLower.includes("risk") || queryLower.includes("side effect")) {
    responses = [
      "The primary risks associated with this treatment include potential adverse reactions that require monitoring.",
      "Clinical studies indicate that most side effects are manageable with appropriate dose adjustments.",
      "Patient education and regular follow-up can help minimize potential complications.",
    ]
  } else if (queryLower.includes("diagnosis") || queryLower.includes("symptom")) {
    responses = [
      "Diagnosis typically involves a combination of clinical assessment and laboratory testing.",
      "Key symptoms to monitor include the characteristic presentation patterns described in the literature.",
      "Differential diagnosis should consider related conditions with similar clinical features.",
    ]
  } else {
    responses = [
      "Based on the retrieved evidence, the current recommendations support a comprehensive approach.",
      "The available data suggests multiple factors should be considered in clinical decision-making.",
      "Further consultation with specialists may be beneficial for complex cases.",
    ]
  }

  return responses.map((text, i) => ({
    id: `sent-${i}`,
    text,
    tokenCount: text.split(" ").length,
    confidence: 0.7 + seededRandom(seed + i * 41) * 0.25,
    uncertaintyMetrics: {
      entropy: 0.1 + seededRandom(seed + i * 43) * 0.3,
      variance: 0.05 + seededRandom(seed + i * 47) * 0.2,
      conflictScore: 0.1 + seededRandom(seed + i * 53) * 0.25,
      hallucinationRisk: 0.05 + seededRandom(seed + i * 59) * 0.15,
    },
    sourceContribution: {
      [`chunk-${i}`]: 0.4 + seededRandom(seed + i * 61) * 0.2,
      [`chunk-${(i + 1) % 8}`]: 0.2 + seededRandom(seed + i * 67) * 0.2,
      [`chunk-${(i + 2) % 8}`]: 0.1 + seededRandom(seed + i * 71) * 0.15,
    },
  }))
}

// Main mock data generator
export function generateMockRAGSession(): RAGSession {
  const embeddings = generateEmbeddings(100)
  const chunks = generateChunks(embeddings)
  const sentences = generateSentences()
  const attentionWeights = generateAttentionWeights(chunks, sentences)

  return {
    id: "session-001",
    query: "What is the optimal treatment protocol for a 65-year-old patient with heart failure and diabetes?",
    // Query position falls between "Treatment Protocols" (350,150) and "Drug Interactions" (250,300)
    queryEmbedding: { x: 300, y: 225 },
    timestamp: new Date(),

    knowledgeBase: {
      embeddings,
      contours: generateContours(embeddings),
      voronoiCells: generateVoronoiCells(embeddings),
      clusters: generateClusters(embeddings),
    },

    conversationHistory: generateConversationTurns(chunks, sentences),
    streamLayers: generateStreamLayers(chunks),

    retrievedChunks: chunks,
    generatedSentences: sentences,
    attentionWeights,

    uncertaintyGlyphs: generateGlyphs(chunks),
    hypotheticalPaths: generatePaths(),

    activeLens: null,
    lockedChunks: ["chunk-0", "chunk-1"],
    selectedPath: "path-0",
  }
}
