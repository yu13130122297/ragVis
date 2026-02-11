"use client"

import { useState, KeyboardEvent } from "react"
import { useRAGStore } from "@/lib/hooks/use-rag-store"
import { useTranslation } from "@/lib/hooks/use-language"

export function QueryPanel() {
  const {
    session,
    currentQuery,
    setCurrentQuery,
    submitQuery,
    isLoading,
    isRetrieving,
    isGenerating
  } = useRAGStore()
  const { t } = useTranslation()

  const exampleQueries = t.query.examples

  const handleSubmit = () => {
    if (currentQuery.trim() && !isLoading) {
      submitQuery()
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="h-full flex flex-col bg-card/50 rounded border border-border overflow-hidden">
      {/* Header */}
      <div className="px-2 py-1 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded bg-primary/20 flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[10px] font-medium text-foreground">{t.query.title}</span>
        </div>
        {isLoading && (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
            {isRetrieving ? t.query.retrieving : isGenerating ? t.query.generating : "..."}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex-1 p-1.5 flex flex-col gap-1">
        <textarea
          value={currentQuery}
          onChange={(e) => setCurrentQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t.query.placeholder}
          className="flex-1 w-full bg-background border border-border rounded px-2 py-1 text-[11px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none scrollbar-none"
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          {/* Quick Stats */}
          {session && (
            <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
              <span><span className="text-primary font-medium">{session.retrievedChunks.length}</span> {t.query.chunks}</span>
              <span><span className="text-[#95e679] font-medium">{session.lockedChunks.length}</span> {t.query.locked}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading || !currentQuery.trim()}
            className="px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-medium rounded hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
          >
            {isLoading ? (
              <div className="w-2.5 h-2.5 border border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            )}
            {isLoading ? "..." : t.query.go}
          </button>
        </div>

        {/* Example Queries */}
        {!currentQuery && !isLoading && (
          <div className="mt-1">
            <span className="text-[9px] text-muted-foreground block mb-1">{t.query.try}</span>
            <div className="flex flex-wrap gap-0.5">
              {exampleQueries.map((query, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQuery(query)}
                  className="px-1.5 py-0.5 bg-muted/50 hover:bg-muted text-[9px] text-foreground/80 hover:text-foreground rounded transition-colors truncate max-w-[150px]"
                  title={query}
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
