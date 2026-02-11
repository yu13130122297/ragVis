"use client"

import { useRAGStore } from "@/lib/hooks/use-rag-store"
import { useTranslation } from "@/lib/hooks/use-language"

export function RetrievalResults() {
  const { session, hoveredIds, selectedIds, setHoveredIds, setSelectedIds, toggleChunkLock } = useRAGStore()
  const { t } = useTranslation()

  if (!session) return null

  return (
    <div className="h-full flex flex-col bg-card/50 rounded border border-border overflow-hidden">
      {/* Header */}
      <div className="px-2 py-1 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-accent/20 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <span className="text-[10px] font-medium text-foreground">{t.retrieval.title}</span>
          <span className="text-[10px] text-muted-foreground">({session.retrievedChunks.length})</span>
        </div>
      </div>

      {/* Chunks List */}
      <div className="flex-1 overflow-y-auto scrollbar-compact p-1.5 space-y-1">
        {session.retrievedChunks.slice(0, 8).map((chunk, index) => {
          const isHovered = hoveredIds.includes(chunk.id)
          const isSelected = selectedIds.includes(chunk.id)
          const isLocked = session.lockedChunks.includes(chunk.id)

          return (
            <div
              key={chunk.id}
              className={`p-1.5 rounded border transition-all cursor-pointer ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : isHovered
                  ? "border-primary/50 bg-primary/5"
                  : "border-border bg-background/50 hover:border-border/80"
              }`}
              onMouseEnter={() => setHoveredIds([chunk.id], "terrain")}
              onMouseLeave={() => setHoveredIds([], "terrain")}
              onClick={() => setSelectedIds([chunk.id], "terrain")}
            >
              {/* Chunk Header */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-muted-foreground">#{index + 1}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-muted text-muted-foreground">
                    {chunk.metadata.source}
                  </span>
                  <div className="flex items-center gap-0.5" title={`${t.retrieval.relevance}: ${(chunk.relevanceScore * 100).toFixed(0)}%`}>
                    <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${chunk.relevanceScore * 100}%` }} />
                    </div>
                    <span className="text-[9px] text-muted-foreground">{(chunk.relevanceScore * 100).toFixed(0)}%</span>
                  </div>
                </div>
                
                {/* Lock Button */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleChunkLock(chunk.id) }}
                  className={`p-0.5 rounded transition-colors ${isLocked ? "text-[#95e679] bg-[#95e679]/10" : "text-muted-foreground hover:text-foreground"}`}
                  title={isLocked ? t.retrieval.unlock : t.retrieval.lock}
                >
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {isLocked ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    )}
                  </svg>
                </button>
              </div>

              {/* Chunk Text */}
              <p className="text-[10px] text-foreground/80 line-clamp-2 leading-relaxed">{chunk.text}</p>

              {/* Metadata */}
              <div className="mt-1 flex items-center gap-1.5 text-[9px] text-muted-foreground">
                <span className="px-1 py-0.5 rounded bg-muted/50">{chunk.metadata.semanticTopic}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}