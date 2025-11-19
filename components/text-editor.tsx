"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, FileText, Maximize2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface TextEditorProps {
  onSave: (content: string, tags: string[]) => void
  initialContent?: string
}

export function TextEditor({ onSave, initialContent = "" }: TextEditorProps) {
  const [content, setContent] = useState(initialContent)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleEnhance = async (action: "improve" | "summarize" | "expand") => {
    if (!content.trim()) return

    setIsEnhancing(true)
    try {
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, action }),
      })

      const data = await response.json()
      if (data.result) {
        setContent(data.result)
      }
    } catch (error) {
      console.error("[v0] Enhancement failed:", error)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleSave = async () => {
    if (!content.trim()) return

    setIsSaving(true)
    try {
      // Generate tags using AI
      const response = await fetch("/api/enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, action: "tags" }),
      })

      const data = await response.json()
      const tags = data.result ? data.result.split(",").map((tag: string) => tag.trim()) : []

      onSave(content, tags)
      setContent("")
    } catch (error) {
      console.error("[v0] Save failed:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg">Text Entry</h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={!content.trim() || isEnhancing}>
                {isEnhancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span className="ml-2">Enhance</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEnhance("improve")}>
                <FileText className="h-4 w-4 mr-2" />
                Improve
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEnhance("summarize")}>
                <FileText className="h-4 w-4 mr-2" />
                Summarize
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleEnhance("expand")}>
                <Maximize2 className="h-4 w-4 mr-2" />
                Expand
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Textarea
          placeholder="Start typing your thoughts..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] resize-none"
          disabled={isEnhancing}
        />

        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">{content.length} characters</p>
          <Button onClick={handleSave} disabled={!content.trim() || isSaving || isEnhancing}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              "Save Entry"
            )}
          </Button>
        </div>
      </div>
    </Card>
  )
}
