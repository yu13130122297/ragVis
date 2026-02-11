"use client"

import { useRAGStore } from "@/lib/hooks/use-rag-store"
import { useTranslation } from "@/lib/hooks/use-language"

export function GeneratedResponse() {
  const { session, hoveredIds, selectedIds, setHoveredIds, setSelectedIds, isLoading, isGenerating } = useRAGStore()
  const { t } = useTranslation()

  if (!session) return null

  // 计算整体置信度
  const avgConfidence = session.generatedSentences.length > 0
    ? session.generatedSentences.reduce((sum, s) => sum + s.confidence, 0) / session.generatedSentences.length
    : 0

  // 计算整体幻觉风险
  const avgHallucinationRisk = session.generatedSentences.length > 0
    ? session.generatedSentences.reduce((sum, s) => sum + s.uncertaintyMetrics.hallucinationRisk, 0) / session.generatedSentences.length
    : 0

  return (
    <div className="h-full flex flex-col bg-card/50 rounded border border-border overflow-hidden">
      {/* Header */}
      <div className="px-2 py-1 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-[#95e679]/20 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-[#95e679]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <span className="text-[10px] font-medium text-foreground">{t.response.title}</span>
        </div>

        {/* Overall Metrics */}
        <div className="flex items-center gap-2 text-[9px]">
          <span className={`font-medium ${avgConfidence > 0.8 ? 'text-[#95e679]' : avgConfidence > 0.6 ? 'text-[#ffd166]' : 'text-[#ff6b9d]'}`}>
            {(avgConfidence * 100).toFixed(0)}% {t.response.conf}
          </span>
          <span className={`font-medium ${avgHallucinationRisk < 0.1 ? 'text-[#95e679]' : avgHallucinationRisk < 0.2 ? 'text-[#ffd166]' : 'text-[#ff6b9d]'}`}>
            {(avgHallucinationRisk * 100).toFixed(0)}% {t.response.risk}
          </span>
        </div>
      </div>

      {/* Response Content */}
      <div className="flex-1 overflow-y-auto scrollbar-compact p-1.5">
        {isLoading && isGenerating ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {session.generatedSentences.map((sentence) => {
              const isHovered = hoveredIds.includes(sentence.id)
              const isSelected = selectedIds.includes(sentence.id)
              const riskLevel = sentence.uncertaintyMetrics.hallucinationRisk

              return (
                <div
                  key={sentence.id}
                  className={`p-1.5 rounded border transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/10"
                      : isHovered
                      ? "border-primary/50 bg-primary/5"
                      : "border-transparent hover:border-border hover:bg-muted/30"
                  }`}
                  onMouseEnter={() => setHoveredIds([sentence.id], "loom")}
                  onMouseLeave={() => setHoveredIds([], "loom")}
                  onClick={() => setSelectedIds([sentence.id], "loom")}
                >
                  {/* Sentence Text */}
                  <p className="text-[10px] text-foreground leading-relaxed line-clamp-2">{sentence.text}</p>

                  {/* Sentence Metrics */}
                  <div className="mt-1 flex items-center gap-2 text-[9px] text-muted-foreground">
                    <div className="flex items-center gap-0.5">
                      <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${sentence.confidence > 0.85 ? 'bg-[#95e679]' : sentence.confidence > 0.7 ? 'bg-[#ffd166]' : 'bg-[#ff6b9d]'}`}
                          style={{ width: `${sentence.confidence * 100}%` }}
                        />
                      </div>
                      <span>{(sentence.confidence * 100).toFixed(0)}%</span>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full ${riskLevel < 0.1 ? 'bg-[#95e679]' : riskLevel < 0.2 ? 'bg-[#ffd166]' : 'bg-[#ff6b9d]'}`} />
                    <span className="text-primary">{Object.keys(sentence.sourceContribution).length}{t.response.src}</span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}