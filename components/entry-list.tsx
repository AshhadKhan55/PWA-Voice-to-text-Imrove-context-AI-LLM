"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Mic, Type, Trash2, MoreVertical, Search, Play } from "lucide-react"
import type { Entry } from "@/lib/storage"
import { formatDistanceToNow } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { en } from "zod/v4/locales"

interface EntryListProps {
  entries: Entry[]
  onDelete: (id: string) => void
}

export function EntryList({ entries, onDelete }: EntryListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "voice" | "text">("all")
  const { toast } = useToast()
  console.log("Entries in EntryList:", entries)
  const filteredEntries = entries.filter((entry: any) => {
    if(entry?.content?.text)
      entry.content = entry?.content.text
    else if(!entry?.content)
      entry.content = ""
    const matchesSearch =
      entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((tag: any) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesType = filterType === "all" || entry.type === filterType
    return matchesSearch && matchesType
  })

  const playAudio = (audioUrl: string, entryId: string) => {
    if (audioUrl.startsWith("blob:")) {
      toast({
        title: "Cannot play recording",
        description:
          "This recording is from an old session and can no longer be played. Please delete it and create a new one.",
        variant: "destructive",
      })
      return
    }

    try {
      const audio = new Audio(audioUrl)
      audio.onerror = () => {
        toast({
          title: "Playback error",
          description: "Unable to play this recording. It may be corrupted.",
          variant: "destructive",
        })
      }
      audio.play().catch((error) => {
        console.error("[v0] Audio playback failed:", error)
        toast({
          title: "Playback error",
          description: "Unable to play this recording.",
          variant: "destructive",
        })
      })
    } catch (error) {
      console.error("[v0] Audio playback error:", error)
      toast({
        title: "Playback error",
        description: "Unable to play this recording.",
        variant: "destructive",
      })
    }
  }

  if (entries.length === 0) {
    return (
      <Card className="p-12">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No entries yet</p>
          <p className="text-sm text-muted-foreground">Create your first entry using voice or text</p>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              {filterType === "all" ? "All" : filterType === "voice" ? "Voice" : "Text"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterType("all")}>All Entries</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("voice")}>Voice Only</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterType("text")}>Text Only</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-3">
        {filteredEntries.map((entry) => (
          <Card key={entry.id} className="p-4">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  {entry.type === "voice" ? (
                    <Mic className="h-4 w-4 text-primary" />
                  ) : (
                    <Type className="h-4 w-4 text-primary" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(entry.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDelete(entry.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm leading-relaxed">{entry.content}</p>

              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {entry.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              {entry.type === "voice" && entry.audioUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => playAudio(entry.audioUrl!, entry.id)}
                  disabled={entry.audioUrl.startsWith("blob:")}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {entry.audioUrl.startsWith("blob:") ? "Recording Unavailable" : "Play Recording"}
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredEntries.length === 0 && searchQuery && (
        <Card className="p-8">
          <p className="text-center text-muted-foreground">No entries match your search</p>
        </Card>
      )}
    </div>
  )
}
