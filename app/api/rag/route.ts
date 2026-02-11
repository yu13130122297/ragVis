/**
 * RAG API Endpoint
 * Provides real RAG functionality using local vector database
 */

import { NextRequest, NextResponse } from "next/server"
import { generateRAGResponse, initializeVectorDB, getDatabaseStats } from "@/lib/services/vector-db"

// Initialize database on first request
let initialized = false

export async function GET() {
  return NextResponse.json({
    status: "RAG API is ready",
    stats: getDatabaseStats(),
    initialized,
  })
}

export async function POST(request: NextRequest) {
  try {
    // Initialize on first request
    if (!initialized) {
      await initializeVectorDB()
      initialized = true
    }

    const body = await request.json()
    const { query } = body

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Invalid request: 'query' string is required" },
        { status: 400 }
      )
    }

    const startTime = Date.now()
    const result = generateRAGResponse(query)
    const duration = Date.now() - startTime

    return NextResponse.json({
      success: true,
      duration,
      data: {
        query: result.query,
        response: result.generatedResponse,
        retrievedChunks: result.retrievedChunks.map((chunk, index) => ({
          id: chunk.id,
          text: chunk.text.substring(0, 300) + (chunk.text.length > 300 ? "..." : ""),
          score: chunk.score,
          metadata: chunk.metadata,
          rank: index + 1,
        })),
        sources: result.sources,
      },
    })
  } catch (error) {
    console.error("RAG API error:", error)
    return NextResponse.json(
      {
        error: "Failed to process RAG request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
