// Client-side storage utilities for entries
export interface Entry {
  id: string
  type: "voice" | "text"
  content: string
  transcript?: string
  audioUrl?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export const storage = {
  getEntries(): Entry[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem("content-entries")
    return data ? JSON.parse(data) : []
  },

  cleanupInvalidBlobUrls(): number {
    const entries = this.getEntries()
    const validEntries = entries.filter((entry) => {
      // Remove entries with blob URLs (they're no longer valid)
      if (entry.audioUrl && entry.audioUrl.startsWith("blob:")) {
        return false
      }
      return true
    })

    const removedCount = entries.length - validEntries.length
    if (removedCount > 0) {
      localStorage.setItem("content-entries", JSON.stringify(validEntries))
    }
    return removedCount
  },

  saveEntry(entry: Omit<Entry, "id" | "createdAt" | "updatedAt">): Entry {
    const entries = this.getEntries()
    const newEntry: Entry = {
      ...entry,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    entries.unshift(newEntry)
    localStorage.setItem("content-entries", JSON.stringify(entries))
    return newEntry
  },

  updateEntry(id: string, updates: Partial<Entry>): Entry | null {
    const entries = this.getEntries()
    const index = entries.findIndex((e) => e.id === id)
    if (index === -1) return null

    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem("content-entries", JSON.stringify(entries))
    return entries[index]
  },

  deleteEntry(id: string): boolean {
    const entries = this.getEntries()
    const filtered = entries.filter((e) => e.id !== id)
    if (filtered.length === entries.length) return false
    localStorage.setItem("content-entries", JSON.stringify(filtered))
    return true
  },
}
