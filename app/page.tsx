"use client"

import { useState, useEffect } from "react"
import { VoiceRecorder } from "@/components/voice-recorder"
import { TextEditor } from "@/components/text-editor"
import { EntryList } from "@/components/entry-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mic, Type, List } from "lucide-react"
import { storage, type Entry } from "@/lib/storage"
import { useToast } from "@/hooks/use-toast"

export default function Home() {
  const [activeTab, setActiveTab] = useState("voice")
  const [entries, setEntries] = useState<Entry[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const removedCount = storage.cleanupInvalidBlobUrls()
    if (removedCount > 0) {
      toast({
        title: "Cleaned up old recordings",
        description: `Removed ${removedCount} old recording(s) that could no longer be played.`,
      })
    }
    setEntries(storage.getEntries())
  }, [toast])

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  const handleTranscript = async (transcript: string, audioBlob: Blob) => {
    const audioUrl = await blobToBase64(audioBlob)
    const entry = storage.saveEntry({
      type: "voice",
      content: transcript,
      transcript,
      audioUrl,
      tags: [],
    })

    setEntries(storage.getEntries())
    toast({
      title: "Voice entry saved",
      description: "Your recording has been transcribed and saved.",
    })

    setActiveTab("browse")
  }

  const handleTextSave = (content: string, tags: string[]) => {
    storage.saveEntry({
      type: "text",
      content,
      tags,
    })

    setEntries(storage.getEntries())
    toast({
      title: "Text entry saved",
      description: "Your entry has been saved successfully.",
    })

    setActiveTab("browse")
  }

  const handleDelete = (id: string) => {
    storage.deleteEntry(id)
    setEntries(storage.getEntries())
    toast({
      title: "Entry deleted",
      description: "Your entry has been removed.",
    })
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Content Capture</h1>
          <p className="text-muted-foreground">Create and organize your ideas with AI</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="voice" className="gap-2">
              <Mic className="h-4 w-4" />
              Voice
            </TabsTrigger>
            <TabsTrigger value="text" className="gap-2">
              <Type className="h-4 w-4" />
              Text
            </TabsTrigger>
            <TabsTrigger value="browse" className="gap-2">
              <List className="h-4 w-4" />
              Browse
            </TabsTrigger>
          </TabsList>

          <TabsContent value="voice" className="space-y-4">
            <VoiceRecorder onTranscript={handleTranscript} />
          </TabsContent>

          <TabsContent value="text" className="space-y-4">
            <TextEditor onSave={handleTextSave} />
          </TabsContent>

          <TabsContent value="browse" className="space-y-4">
            <EntryList entries={entries} onDelete={handleDelete} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
