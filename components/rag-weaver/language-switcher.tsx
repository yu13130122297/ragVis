"use client"

import { useTranslation, Language } from "@/lib/hooks/use-language"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useTranslation()

  const handleLanguageChange = (value: Language) => {
    setLanguage(value)
  }

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[100px] h-7 text-[10px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="en">{t.language.en}</SelectItem>
        <SelectItem value="zh">{t.language.zh}</SelectItem>
      </SelectContent>
    </Select>
  )
}

// Compact button version for header
export function LanguageSwitcherButton() {
  const { language, toggleLanguage } = useTranslation()

  return (
    <button
      onClick={toggleLanguage}
      className="px-2 py-0.5 rounded bg-muted hover:bg-muted/80 text-[10px] font-medium text-foreground transition-colors"
      title={language === 'en' ? 'Switch to Chinese' : '切换到英文'}
    >
      {language === 'en' ? 'EN' : '中'}
    </button>
  )
}
