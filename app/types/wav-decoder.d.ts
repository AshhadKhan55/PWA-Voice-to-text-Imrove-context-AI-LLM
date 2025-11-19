// src/types/wav-decoder.d.ts
declare module "wav-decoder" {
  // AudioData interface to represent the decoded audio data.
  export interface AudioData {
    sampleRate: number;   // Sample rate of the audio (e.g., 44100)
    channelData: Float32Array[]; // Array of Float32Array for each channel's data.
  }

  // Function to decode the WAV buffer.
  export function decode(buffer: ArrayBuffer): Promise<AudioData>;

  // Function to decode a WAV file from a URL or file path.
  export function decodeFile(filePath: string): Promise<AudioData>;
}
