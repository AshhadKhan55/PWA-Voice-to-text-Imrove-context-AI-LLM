import fs from "fs/promises";
import path from "path";
import os from "os";
import ffmpeg from "fluent-ffmpeg";
import { NextResponse } from "next/server";
import * as wav from "wav-decoder";
import { pipeline } from "@xenova/transformers";

export const runtime = "nodejs"; // ensures Node-compatible execution

export async function POST(req: Request) {
  try {
    // 1️⃣ Read form data from frontend
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "No audio file uploaded" }, { status: 400 });
    }

    // 2️⃣ Save the uploaded file temporarily
    const arrayBuffer = await audioFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const tmpDir = os.tmpdir();
    const inputPath = path.join(tmpDir, `input-${Date.now()}.webm`);
    const outputPath = path.join(tmpDir, `output-${Date.now()}.wav`);
    await fs.writeFile(inputPath, buffer);

    // 3️⃣ Convert WebM → WAV (mono, 16kHz)
    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .audioChannels(1)
        .audioFrequency(16000)
        .toFormat("wav")
        .on("end", () => resolve())
        .on("error", reject)
        .save(outputPath);
    });

    // 4️⃣ Read and decode the WAV file properly
    const wavBuffer = await fs.readFile(outputPath);
    const arrayBuf = wavBuffer.buffer.slice(
      wavBuffer.byteOffset,
      wavBuffer.byteOffset + wavBuffer.byteLength
    );
    const audioData = await wav.decode(arrayBuf);
    const float32Array = audioData.channelData[0]; // mono

    // 5️⃣ Run Whisper ASR
    const transcriber = await pipeline(
      "automatic-speech-recognition",
      "Xenova/whisper-tiny.en"
    );

    const result: any = await transcriber(float32Array);

    // 6️⃣ Cleanup
    await Promise.allSettled([fs.unlink(inputPath), fs.unlink(outputPath)]);

    console.log("Transcription result:", result.text);

    // 7️⃣ Respond with transcript
    return NextResponse.json({ transcript: result.text });
  } catch (err: any) {
    console.error("Transcription error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to transcribe audio" },
      { status: 500 }
    );
  }
}
