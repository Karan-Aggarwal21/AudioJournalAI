/**
 * Speech-to-Text wrapper.
 * Uses RunAnywhere ONNX backend with Whisper Tiny model.
 * Must be initialized via runanywhere.ts first.
 */

import { initSTTModel } from "./runanywhere";

/**
 * Transcribe a Float32Array audio segment to text.
 * Audio should be 16kHz mono PCM.
 */
export async function transcribe(audioData: Float32Array): Promise<string> {
  await initSTTModel();

  try {
    const { STT } = await import("@runanywhere/web-onnx");
    const result = await STT.transcribe(audioData);
    return result.text?.trim() || "";
  } catch (err) {
    console.error("[STT] Transcription failed:", err);
    return "";
  }
}
