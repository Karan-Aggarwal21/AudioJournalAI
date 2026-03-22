/**
 * Text-to-Speech wrapper (Phase 7 / Optional).
 * Reads insights aloud using RunAnywhere TTS.
 */

import { initTTSModel } from "./runanywhere";

/**
 * Synthesize text to audio and play it.
 */
export async function speak(text: string): Promise<void> {
  try {
    await initTTSModel();
    const { TTS } = await import("@runanywhere/web-onnx");
    const result = await TTS.synthesize(text);

    // Play audio using Web Audio API
    const audioCtx = new AudioContext({ sampleRate: result.sampleRate });
    const buffer = audioCtx.createBuffer(1, result.audioData.length, result.sampleRate);
    buffer.copyToChannel(new Float32Array(result.audioData), 0);

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start();

    return new Promise((resolve) => {
      source.onended = () => {
        audioCtx.close();
        resolve();
      };
    });
  } catch (err) {
    console.error("[TTS] Synthesis failed:", err);
  }
}
