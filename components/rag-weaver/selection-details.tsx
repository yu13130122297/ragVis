"use client"

import { useRAGStore } from "@/lib/hooks/use-rag-store"
import { useTranslation } from "@/lib/hooks/use-language"

export function SelectionDetails() {
  const { session, selectedIds, activeView } = useRAGStore()
  const { t } = useTranslation()

  if (!session || selectedIds.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-3">
        <p className="text-xs text-muted-foreground text-center">{t.selectionDetails.selectElement}</p>
      </div>
    )
  }

  // Find the selected item
  const selectedChunk = session.retrievedChunks.find((c) => selectedIds.includes(c.id))
  const selectedSentence = session.generatedSentences.find((s) => selectedIds.includes(s.id))
  const selectedEmbedding = session.knowledgeBase.embeddings.find((e) => selectedIds.includes(e.id))

  return (
    <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-compact p-2 text-xs">
      <div className="text-[10px] text-muted-foreground mb-2">
        {t.selectionDetails.from} <span className="text-primary capitalize">{activeView}</span>
      </div>

      {selectedChunk && (
        <div className="space-y-2">
          <div>
            <h4 className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
              {t.selectionDetails.chunk}
              {selectedChunk.isLocked && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-primary/20 text-primary">{t.selectionDetails.locked}</span>
              )}
            </h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">{selectedChunk.text}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div className="min-w-0 truncate">
              <span className="text-muted-foreground">{t.selectionDetails.source}:</span>
              <span className="ml-1 text-foreground">{selectedChunk.metadata.source}</span>
            </div>
            <div className="min-w-0 truncate">
              <span className="text-muted-foreground">{t.selectionDetails.auth}:</span>
              <span className="ml-1 text-foreground">{Math.round(selectedChunk.metadata.sourceAuthority * 100)}%</span>
            </div>
            <div className="min-w-0 truncate">
              <span className="text-muted-foreground">{t.selectionDetails.relevance}:</span>
              <span className="ml-1 text-foreground">{Math.round(selectedChunk.relevanceScore * 100)}%</span>
            </div>
            <div className="min-w-0 truncate">
              <span className="text-muted-foreground">{t.selectionDetails.topic}:</span>
              <span className="ml-1 text-foreground">{selectedChunk.metadata.semanticTopic}</span>
            </div>
          </div>
        </div>
      )}

      {selectedSentence && (
        <div className="space-y-2">
          <div>
            <h4 className="text-xs font-medium text-foreground mb-1">{t.selectionDetails.generatedSentence}</h4>
            <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">{selectedSentence.text}</p>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div className="min-w-0 truncate">
              <span className="text-muted-foreground">{t.selectionDetails.confidence}:</span>
              <span className="ml-1 text-foreground">{Math.round(selectedSentence.confidence * 100)}%</span>
            </div>
            <div className="min-w-0 truncate">
              <span className="text-muted-foreground">{t.selectionDetails.tokens}:</span>
              <span className="ml-1 text-foreground">{selectedSentence.tokenCount}</span>
            </div>
            <div className="min-w-0 truncate">
              <span className="text-muted-foreground">{t.selectionDetails.hallucinationRisk}:</span>
              <span
                className={`ml-1 ${
                  selectedSentence.uncertaintyMetrics.hallucinationRisk > 0.2 ? "text-destructive" : "text-foreground"
                }`}
              >
                {Math.round(selectedSentence.uncertaintyMetrics.hallucinationRisk * 100)}%
              </span>
            </div>
            <div className="min-w-0 truncate">
              <span className="text-muted-foreground">{t.selectionDetails.entropy}:</span>
              <span className="ml-1 text-foreground">{selectedSentence.uncertaintyMetrics.entropy.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {selectedEmbedding && !selectedChunk && (
        <div className="space-y-2">
          <div>
            <h4 className="text-xs font-medium text-foreground mb-1">{t.selectionDetails.embeddingPoint}</h4>
            <p className="text-[10px] text-muted-foreground">
              {t.selectionDetails.cluster}: <span className="text-primary">{selectedEmbedding.cluster}</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px]">
            <div className="min-w-0 truncate">
              <span className="text-muted-foreground">{t.selectionDetails.pos}:</span>
              <span className="ml-1 text-foreground">
                ({selectedEmbedding.x.toFixed(0)}, {selectedEmbedding.y.toFixed(0)})
              </span>
            </div>
            <div className="min-w-0 truncate">
              <span className="text-muted-foreground">{t.selectionDetails.density}:</span>
              <span className="ml-1 text-foreground">{((selectedEmbedding.density || 0) * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Show related items */}
      {selectedIds.length > 1 && (
        <div className="mt-2 pt-2 border-t border-border">
          <span className="text-[10px] text-muted-foreground">
            {t.selectionDetails.relatedItems.replace('{count}', String(selectedIds.length - 1))}
          </span>
        </div>
      )}
    </div>
  )
}
