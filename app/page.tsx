"use client"

import { useEffect } from "react"
import { useRAGStore } from "@/lib/hooks/use-rag-store"
import { SemanticTerrain } from "@/components/rag-weaver/semantic-terrain"
import { AttentionLoom } from "@/components/rag-weaver/attention-loom"
import { RetrievalStream } from "@/components/rag-weaver/retrieval-stream"
import { UncertaintyGlyphs } from "@/components/rag-weaver/uncertainty-glyphs"
import { HypotheticalPlayground } from "@/components/rag-weaver/hypothetical-playground"
import { ViewPanel } from "@/components/rag-weaver/view-panel"
import { SelectionDetails } from "@/components/rag-weaver/selection-details"
import { QueryPanel } from "@/components/rag-weaver/query-panel"
import { RetrievalResults } from "@/components/rag-weaver/retrieval-results"
import { GeneratedResponse } from "@/components/rag-weaver/generated-response"
import { LanguageSwitcherButton } from "@/components/rag-weaver/language-switcher"
import { useTranslation } from "@/lib/hooks/use-language"

export default function RAGWeaverDashboard() {
  const { initializeSession, session } = useRAGStore()
  const { t } = useTranslation()

  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  if (!session) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">{t.loading.session}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background flex flex-col">
      {/* Compact Header */}
      <header className="h-10 shrink-0 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <svg
              className="w-4 h-4 text-primary-foreground"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="text-sm font-semibold text-foreground">{t.header.title}</h1>
          <span className="text-xs text-muted-foreground hidden sm:inline">{t.header.subtitle}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-muted-foreground hidden sm:inline">{t.header.active}</span>
          </div>
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">{t.header.ieee}</span>
          <LanguageSwitcherButton />
        </div>
      </header>

      {/* Main Dashboard - fills remaining height */}
      <main className="flex-1 p-2 overflow-hidden">
        <div className="h-full grid grid-cols-12 grid-rows-8 gap-2">
          {/* Left Sidebar: Query & Retrieval (3 cols, full height) */}
          <div className="col-span-3 row-span-8 flex flex-col gap-1">
            {/* Query Input */}
            <div className="h-[140px] shrink-0">
              <QueryPanel />
            </div>
            
            {/* Retrieved Chunks */}
            <div className="flex-1 min-h-0">
              <RetrievalResults />
            </div>
            
            {/* Generated Response */}
            <div className="h-[160px] shrink-0">
              <GeneratedResponse />
            </div>
          </div>

          {/* Main Visualization Area (9 cols) */}
          {/* Row 1-4: Top section */}
          {/* View A: Semantic Terrain - 4 cols, 4 rows */}
          <div className="col-span-4 row-span-4">
            <ViewPanel title={t.views.semanticTerrain.title} subtitle={t.views.semanticTerrain.subtitle} badge={t.views.semanticTerrain.badge} className="h-full">
              <SemanticTerrain />
            </ViewPanel>
          </div>

          {/* View B: Retrieval Stream - 2 cols, 4 rows (narrow) */}
          <div className="col-span-2 row-span-4">
            <ViewPanel title={t.views.stream.title} subtitle={t.views.stream.subtitle} badge={t.views.stream.badge} className="h-full">
              <RetrievalStream key={session?.id} />
            </ViewPanel>
          </div>

          {/* View C: Attention Loom - 3 cols, 4 rows (wider) */}
          <div className="col-span-3 row-span-4">
            <ViewPanel title={t.views.attentionLoom.title} subtitle={t.views.attentionLoom.subtitle} badge={t.views.attentionLoom.badge} className="h-full">
              <AttentionLoom key={session?.id} />
            </ViewPanel>
          </div>

          {/* Row 5-8: Bottom section */}
          {/* View D: Uncertainty Glyphs - 3 cols, 4 rows */}
          <div className="col-span-3 row-span-4">
            <ViewPanel title={t.views.uncertaintyGlyphs.title} subtitle={t.views.uncertaintyGlyphs.subtitle} className="h-full">
              <UncertaintyGlyphs key={session?.id} />
            </ViewPanel>
          </div>

          {/* View E: Hypothetical Playground - 4 cols, 4 rows */}
          <div className="col-span-4 row-span-4">
            <ViewPanel
              title={t.views.hypotheticalPlayground.title}
              subtitle={t.views.hypotheticalPlayground.subtitle}
              badge={t.views.hypotheticalPlayground.badge}
              className="h-full"
            >
              <HypotheticalPlayground key={session?.id} />
            </ViewPanel>
          </div>

          {/* Selection Details - 2 cols, 4 rows */}
          <div className="col-span-2 row-span-4">
            <ViewPanel title={t.views.selection.title} subtitle={t.views.selection.subtitle} className="h-full">
              <SelectionDetails key={session?.id} />
            </ViewPanel>
          </div>
        </div>
      </main>
    </div>
  )
}
