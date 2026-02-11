/**
 * Local Vector Database Service for Server-Side RAG
 * Uses TF-IDF + Cosine Similarity for semantic retrieval (no external dependencies)
 */

import { chunkDocuments, DEMO_DOCUMENTS } from "@/lib/data/demo-documents"

// Types for our vector database
export interface DocumentChunk {
  id: string
  text: string
  metadata: {
    title: string
    source: string
    category: string
    chunkIndex: number
    totalChunks: number
  }
  embedding?: number[]
}

export interface RetrievalResult {
  id: string
  text: string
  metadata: DocumentChunk["metadata"]
  score: number
  distance: number
}

export interface RAGResponse {
  query: string
  retrievedChunks: RetrievalResult[]
  generatedResponse: string
  sources: string[]
}

/**
 * Simple text preprocessing
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2)
}

/**
 * Build vocabulary from all documents
 */
function buildVocabulary(chunks: DocumentChunk[]): Map<string, number> {
  const vocab = new Map<string, number>()
  let index = 0

  for (const chunk of chunks) {
    const tokens = tokenize(chunk.text)
    for (const token of tokens) {
      if (!vocab.has(token)) {
        vocab.set(token, index++)
      }
    }
  }

  return vocab
}

/**
 * Compute TF-IDF vector for a document
 */
function computeTFIDF(
  text: string,
  vocab: Map<string, number>,
  docFreq: Map<string, number>,
  totalDocs: number
): Float32Array {
  const tokens = tokenize(text)
  const tf = new Map<string, number>()

  // Compute term frequency
  for (const token of tokens) {
    tf.set(token, (tf.get(token) || 0) + 1)
  }

  // Compute TF-IDF vector
  const vector = new Float32Array(vocab.size)

  for (const [token, count] of tf.entries()) {
    const termIndex = vocab.get(token)
    if (termIndex !== undefined) {
      const df = docFreq.get(token) || 1
      const idf = Math.log(totalDocs / df)
      vector[termIndex] = count * idf
    }
  }

  // Normalize
  const norm = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  if (norm > 0) {
    for (let i = 0; i < vector.length; i++) {
      vector[i] /= norm
    }
  }

  return vector
}

/**
 * In-memory vector database using TF-IDF
 */
class InMemoryVectorDB {
  private chunks: Map<string, { text: string; metadata: DocumentChunk["metadata"]; vector: Float32Array }> = new Map()
  private vocab: Map<string, number> = new Map()
  private docFreq: Map<string, number> = new Map()
  private initialized = false

  constructor() {}

  async initialize() {
    if (this.initialized) return

    console.log("Initializing in-memory vector database...")

    const documents = DEMO_DOCUMENTS
    const chunks = chunkDocuments(documents)
    const chunkArray = Array.from(chunks)

    // Build vocabulary and document frequency
    this.vocab = buildVocabulary(chunkArray)
    this.docFreq = new Map<string, number>()

    // Count document frequency
    for (const chunk of chunkArray) {
      const tokens = new Set(tokenize(chunk.text))
      for (const token of tokens) {
        this.docFreq.set(token, (this.docFreq.get(token) || 0) + 1)
      }
    }

    // Compute vectors for all chunks
    for (const chunk of chunkArray) {
      const vector = computeTFIDF(chunk.text, this.vocab, this.docFreq, chunkArray.length)
      this.chunks.set(chunk.id, {
        text: chunk.text,
        metadata: chunk.metadata,
        vector,
      })
    }

    this.initialized = true
    console.log(`Initialized with ${this.chunks.size} chunks and ${this.vocab.size} unique terms`)
  }

  search(query: string, topK: number = 8): RetrievalResult[] {
    if (!this.initialized) {
      console.warn("Vector database not initialized, returning empty results")
      return []
    }

    const chunkArray = Array.from(this.chunks.entries())

    // Compute query vector
    const queryVector = computeTFIDF(query, this.vocab, this.docFreq, chunkArray.length)

    // Calculate cosine similarity for all chunks
    const results: Array<{
      id: string
      text: string
      metadata: DocumentChunk["metadata"]
      score: number
      distance: number
    }> = []

    for (const [id, chunk] of chunkArray) {
      const similarity = cosineSimilarity(queryVector, chunk.vector)
      const distance = 1 - similarity

      results.push({
        id,
        text: chunk.text,
        metadata: chunk.metadata,
        score: similarity,
        distance,
      })
    }

    // Sort by score (descending) and return top K
    results.sort((a, b) => b.score - a.score)
    return results.slice(0, topK)
  }

  getStats() {
    const categories = new Map<string, number>()
    for (const chunk of this.chunks.values()) {
      const count = categories.get(chunk.metadata.category) || 0
      categories.set(chunk.metadata.category, count + 1)
    }

    return {
      totalChunks: this.chunks.size,
      vocabSize: this.vocab.size,
      categories: Object.fromEntries(categories),
    }
  }
}

/**
 * Cosine similarity calculation
 */
function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dotProduct = 0
  let normA = 0
  let normB = 0

  const len = Math.min(a.length, b.length)
  for (let i = 0; i < len; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) return 0

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Singleton instance
const vectorDB = new InMemoryVectorDB()

/**
 * Initialize the vector database
 */
export async function initializeVectorDB() {
  await vectorDB.initialize()
  return vectorDB.getStats()
}

/**
 * Search for relevant documents
 */
export function searchDocuments(query: string, topK: number = 8): RetrievalResult[] {
  return vectorDB.search(query, topK)
}

/**
 * Generate a RAG response using retrieved context
 */
export function generateRAGResponse(query: string): RAGResponse {
  // Initialize if needed
  if (!vectorDB.getStats().totalChunks) {
    vectorDB.initialize()
  }

  // Search for relevant documents
  const retrievedChunks = searchDocuments(query, 10)

  // Generate a response based on the retrieved chunks
  const response = generateResponseFromChunks(query, retrievedChunks.slice(0, 5))

  // Extract unique sources
  const sources = Array.from(new Set(retrievedChunks.map((r) => r.metadata.title)))

  return {
    query,
    retrievedChunks,
    generatedResponse: response,
    sources,
  }
}

/**
 * Generate a response from retrieved chunks
 * This simulates LLM generation for the free version
 */
function generateResponseFromChunks(query: string, chunks: RetrievalResult[]): string {
  // Extract relevant content from chunks
  const relevantContent = chunks.map((c) => c.text).join("\n\n")

  // Generate a contextual response based on the query
  const queryLower = query.toLowerCase()

  // Simple rule-based response generation
  let response = ""

  // Identify the main topic from chunks
  const categories = chunks.map((c) => c.metadata.category)
  const primaryCategory = categories[0] || "General"

  if (queryLower.includes("treatment") || queryLower.includes("therapy")) {
    response = generateTreatmentResponse(query, chunks, primaryCategory)
  } else if (
    queryLower.includes("interaction") ||
    queryLower.includes("drug") ||
    queryLower.includes("contraindication")
  ) {
    response = generateInteractionResponse(query, chunks, primaryCategory)
  } else if (queryLower.includes("side effect") || queryLower.includes("adverse") || queryLower.includes("risk")) {
    response = generateSafetyResponse(query, chunks, primaryCategory)
  } else if (queryLower.includes("diagnosis") || queryLower.includes("symptom")) {
    response = generateDiagnosisResponse(query, chunks, primaryCategory)
  } else {
    response = generateGeneralResponse(query, chunks, primaryCategory)
  }

  // Add sources reference
  const uniqueSources = Array.from(new Set(chunks.map((c) => c.metadata.title)))
  if (uniqueSources.length > 0) {
    response += `\n\n**Sources:** ${uniqueSources.join("; ")}`
  }

  return response
}

function generateTreatmentResponse(query: string, chunks: RetrievalResult[], category: string): string {
  const treatments: string[] = []
  const guidelines: string[] = []

  for (const chunk of chunks) {
    // Extract treatment-related sentences
    const sentences = chunk.text.split(/(?<=[.!?])\s+/)
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase()
      if (
        lower.includes("recommend") ||
        lower.includes("should") ||
        lower.includes("first-line") ||
        lower.includes("treatment") ||
        lower.includes("therapy") ||
        lower.includes("mg") ||
        lower.includes("dose")
      ) {
        treatments.push(sentence.trim())
      }
      if (lower.includes("guideline") || lower.includes("standard")) {
        guidelines.push(sentence.trim())
      }
    }
  }

  let response = `Based on ${category} clinical guidelines, here's the treatment information:\n\n`

  if (treatments.length > 0) {
    response += "**Recommended Treatment Options:**\n"
    treatments.slice(0, 3).forEach((t) => {
      response += `- ${t}\n`
    })
  }

  if (guidelines.length > 0) {
    response += "\n**Clinical Guidelines:**\n"
    guidelines.slice(0, 2).forEach((g) => {
      response += `- ${g}\n`
    })
  }

  response += `\n\nPlease note that treatment decisions should be individualized based on patient-specific factors including age, comorbidities, contraindications, and patient preferences. Always consult current clinical guidelines and consider specialist referral for complex cases.`

  return response
}

function generateInteractionResponse(query: string, chunks: RetrievalResult[], category: string): string {
  const interactions: string[] = []
  const warnings: string[] = []

  for (const chunk of chunks) {
    const sentences = chunk.text.split(/(?<=[.!?])\s+/)
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase()
      if (lower.includes("interact") || lower.includes("combination") || lower.includes("with")) {
        interactions.push(sentence.trim())
      }
      if (lower.includes("risk") || lower.includes("warning") || lower.includes("caution") || lower.includes("avoid")) {
        warnings.push(sentence.trim())
      }
    }
  }

  let response = `Based on pharmacological data, here are the relevant drug interaction considerations:\n\n`

  if (interactions.length > 0) {
    response += "**Known Interactions:**\n"
    interactions.slice(0, 4).forEach((i) => {
      response += `- ${i}\n`
    })
  }

  if (warnings.length > 0) {
    response += "\n**Important Warnings:**\n"
    warnings.slice(0, 3).forEach((w) => {
      response += `- ${w}\n`
    })
  }

  response += `\n\n**Monitoring Recommendations:** When these medications are co-administered, increased monitoring frequency is recommended. Check for laboratory value changes and clinical signs of adverse effects. Consider dose adjustments or alternative therapies based on clinical response.`

  return response
}

function generateSafetyResponse(query: string, chunks: RetrievalResult[], category: string): string {
  const effects: string[] = []
  const monitoring: string[] = []

  for (const chunk of chunks) {
    const sentences = chunk.text.split(/(?<=[.!?])\s+/)
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase()
      if (
        lower.includes("effect") ||
        lower.includes("adverse") ||
        lower.includes("toxicity") ||
        lower.includes("complication")
      ) {
        effects.push(sentence.trim())
      }
      if (lower.includes("monitor") || lower.includes("check") || lower.includes("assess")) {
        monitoring.push(sentence.trim())
      }
    }
  }

  let response = `Based on safety data in ${category}, here's the relevant information:\n\n`

  if (effects.length > 0) {
    response += "**Adverse Effects:**\n"
    effects.slice(0, 3).forEach((e) => {
      response += `- ${e}\n`
    })
  }

  if (monitoring.length > 0) {
    response += "\n**Monitoring Requirements:**\n"
    monitoring.slice(0, 3).forEach((m) => {
      response += `- ${m}\n`
    })
  }

  response += `\n\nPatients should be educated about potential adverse effects and instructed to seek medical attention if they experience concerning symptoms. The risk-benefit ratio should be reassessed periodically during treatment.`

  return response
}

function generateDiagnosisResponse(query: string, chunks: RetrievalResult[], category: string): string {
  const diagnosticCriteria: string[] = []
  const symptoms: string[] = []

  for (const chunk of chunks) {
    const sentences = chunk.text.split(/(?<=[.!?])\s+/)
    for (const sentence of sentences) {
      const lower = sentence.toLowerCase()
      if (lower.includes("diagnos") || lower.includes("criteria") || lower.includes("classification")) {
        diagnosticCriteria.push(sentence.trim())
      }
      if (lower.includes("symptom") || lower.includes("present") || lower.includes("clinical feature")) {
        symptoms.push(sentence.trim())
      }
    }
  }

  let response = `Based on clinical practice guidelines in ${category}, here's the relevant diagnostic information:\n\n`

  if (symptoms.length > 0) {
    response += "**Clinical Presentation:**\n"
    symptoms.slice(0, 3).forEach((s) => {
      response += `- ${s}\n`
    })
  }

  if (diagnosticCriteria.length > 0) {
    response += "\n**Diagnostic Considerations:**\n"
    diagnosticCriteria.slice(0, 3).forEach((d) => {
      response += `- ${d}\n`
    })
  }

  response += `\n\nDifferential diagnosis should consider related conditions with similar presentations. Appropriate diagnostic testing should be guided by clinical suspicion and may include laboratory tests, imaging studies, or specialist consultation.`

  return response
}

function generateGeneralResponse(query: string, chunks: RetrievalResult[], category: string): string {
  const relevantPoints: string[] = []

  for (const chunk of chunks) {
    const sentences = chunk.text.split(/(?<=[.!?])\s+/)
    for (const sentence of sentences) {
      relevantPoints.push(sentence.trim())
    }
  }

  let response = `Based on available information in ${category}, here are the relevant points:\n\n`
  relevantPoints.slice(0, 5).forEach((p) => {
    response += `- ${p}\n`
  })

  response += `\n\nThis information is intended for educational purposes. Clinical decisions should be based on comprehensive assessment including patient history, physical examination, and current clinical guidelines. Consider consulting appropriate specialists for complex cases.`

  return response
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
  return vectorDB.getStats()
}
