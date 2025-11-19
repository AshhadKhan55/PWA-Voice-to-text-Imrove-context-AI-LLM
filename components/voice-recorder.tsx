"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Mic, Square, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface VoiceRecorderProps {
  onTranscript: (transcript: string, audioBlob: Blob) => void
}

function getSupportedMimeType(): string {
  if (typeof MediaRecorder === "undefined") {
    console.log("[v0] MediaRecorder not available")
    return ""
  }

  const types = [
    "audio/webm",
    "audio/webm;codecs=opus",
    "audio/mp4",
    "audio/mp4;codecs=mp4a.40.2",
    "audio/mpeg",
    "audio/wav",
    "audio/ogg;codecs=opus",
  ]

  console.log("[v0] Checking supported MIME types...")
  for (const type of types) {
    const isSupported = MediaRecorder.isTypeSupported(type)
    console.log(`[v0] ${type}: ${isSupported}`)
    if (isSupported) {
      console.log("[v0] Using MIME type:", type)
      return type
    }
  }

  console.log("[v0] No supported MIME type found, using default")
  return ""
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const { toast } = useToast()

  const startRecording = async () => {
    try {
      console.log("[v0] Starting recording checks...")
      console.log("[v0] navigator.mediaDevices:", !!navigator.mediaDevices)
      console.log("[v0] getUserMedia:", !!navigator.mediaDevices?.getUserMedia)
      console.log("[v0] MediaRecorder:", typeof MediaRecorder !== "undefined")
      console.log("[v0] User Agent:", navigator.userAgent)
      console.log("[v0] Is Secure Context:", window.isSecureContext)
      console.log("[v0] Protocol:", window.location.protocol)
      console.log("[v0] Hostname:", window.location.hostname)

      if (!window.isSecureContext && window.location.hostname !== "localhost") {
        toast({
          title: "HTTPS Required",
          description: "Audio recording requires HTTPS on mobile devices. Please access via HTTPS or deploy to Vercel.",
          variant: "destructive",
        })
        return
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          title: "Not Supported",
          description: "Your browser doesn't support audio recording (getUserMedia not available).",
          variant: "destructive",
        })
        return
      }

      if (typeof MediaRecorder === "undefined") {
        toast({
          title: "Not Supported",
          description: "Your browser doesn't support audio recording (MediaRecorder not available).",
          variant: "destructive",
        })
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      console.log("[v0] Got media stream:", stream)

      const mimeType = getSupportedMimeType()
      console.log("[v0] Selected MIME type:", mimeType || "default")

      const options = mimeType ? { mimeType } : undefined

      const mediaRecorder = new MediaRecorder(stream, options)
      console.log("[v0] MediaRecorder created with mimeType:", mediaRecorder.mimeType)

      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const actualMimeType = mediaRecorder.mimeType || mimeType || "audio/webm"
        const audioBlob = new Blob(chunksRef.current, { type: actualMimeType })
        stream.getTracks().forEach((track) => track.stop())

        setIsProcessing(true)
        try {
          const formData = new FormData()
          const extension = actualMimeType.includes("mp4")
            ? "mp4"
            : actualMimeType.includes("mpeg")
              ? "mp3"
              : actualMimeType.includes("wav")
                ? "wav"
                : actualMimeType.includes("ogg")
                  ? "ogg"
                  : "webm"
          formData.append("audio", audioBlob, `recording.${extension}`)

          const response = await fetch("/api/transcribe", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) {
            throw new Error(`Transcription failed: ${response.statusText}`)
          }

          const data = await response.json()
          console.log("[v0] Transcription response:", data)
          const transcriptText = typeof data.transcript === "string" ? data.transcript : data.transcript?.text || ""

          if (transcriptText) {
            onTranscript(transcriptText, audioBlob)
            toast({
              title: "Success",
              description: "Audio transcribed successfully!",
            })
          } else {
            throw new Error("No transcript received")
          }
        } catch (error) {
          console.error("[v0] Transcription failed:", error)
          toast({
            title: "Transcription Failed",
            description: error instanceof Error ? error.message : "Failed to transcribe audio",
            variant: "destructive",
          })
        } finally {
          setIsProcessing(false)
        }
      }

      mediaRecorder.onerror = (event) => {
        console.error("[v0] MediaRecorder error:", event)
        toast({
          title: "Recording Error",
          description: "An error occurred during recording.",
          variant: "destructive",
        })
        setIsRecording(false)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      console.log("[v0] Recording started")
    } catch (error) {
      console.error("[v0] Failed to start recording:", error)
      toast({
        title: "Recording Failed",
        description:
          error instanceof Error && error.name === "NotAllowedError"
            ? "Microphone permission denied. Please allow microphone access."
            : "Failed to start recording. Please check your microphone.",
        variant: "destructive",
      })
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="text-center">
          <h3 className="font-semibold text-lg mb-2">Voice Recording</h3>
          <p className="text-sm text-muted-foreground">{isRecording ? "Recording..." : "Tap to start recording"}</p>
        </div>

        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className="h-20 w-20 rounded-full"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : isRecording ? (
            <Square className="h-8 w-8" />
          ) : (
            <Mic className="h-8 w-8" />
          )}
        </Button>

        {isProcessing && <p className="text-sm text-muted-foreground">Transcribing audio...</p>}
      </div>
    </Card>
  )
}
