/**
 * Voice Activity Detection with buffered STT pipeline.
 * Audio Stream → VAD → Segment Buffer → STT
 *
 * Accumulates audio segments, flushes complete speech to STT on speech-end.
 */

import { initVADModel } from "./runanywhere";
import { transcribe } from "./stt";

type OnTranscriptionCallback = (text: string) => void;
type OnStateChangeCallback = (state: "idle" | "listening" | "processing") => void;

let audioContext: AudioContext | null = null;
let mediaStream: MediaStream | null = null;
let processorNode: ScriptProcessorNode | null = null;
let audioBuffer: Float32Array[] = [];
let onTranscription: OnTranscriptionCallback | null = null;
let onStateChange: OnStateChangeCallback | null = null;
let isActive = false;
let isPaused = false;

/**
 * Start the VAD→STT pipeline.
 * Captures microphone audio, detects speech, buffers segments, then transcribes.
 */
export async function startListening(
  callbacks: {
    onTranscription: OnTranscriptionCallback;
    onStateChange?: OnStateChangeCallback;
  }
): Promise<void> {
  if (isActive) return;

  onTranscription = callbacks.onTranscription;
  onStateChange = callbacks.onStateChange || null;

  try {
    await initVADModel();

    // Set up VAD speech activity callback
    const { VAD } = await import("@runanywhere/web-onnx");
    const { SpeechActivity } = await import("@runanywhere/web");

    VAD.onSpeechActivity(async (activity) => {
      if (activity === SpeechActivity.Started) {
        audioBuffer = [];
        onStateChange?.("listening");
      }

      if (activity === SpeechActivity.Ended) {
        onStateChange?.("processing");

        // Flush buffered audio to STT
        const segment = VAD.popSpeechSegment();
        if (segment && segment.samples && segment.samples.length > 0) {
          const text = await transcribe(segment.samples);
          if (text) {
            onTranscription?.(text);
          }
        } else if (audioBuffer.length > 0) {
          // Fallback: use manually buffered audio
          const totalLength = audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0);
          const combined = new Float32Array(totalLength);
          let offset = 0;
          for (const chunk of audioBuffer) {
            combined.set(chunk, offset);
            offset += chunk.length;
          }
          const text = await transcribe(combined);
          if (text) {
            onTranscription?.(text);
          }
        }

        audioBuffer = [];
        onStateChange?.("listening");
      }
    });

    // Capture microphone audio
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true,
      },
    });

    audioContext = new AudioContext({ sampleRate: 16000 });
    const source = audioContext.createMediaStreamSource(mediaStream);

    // Process audio chunks
    processorNode = audioContext.createScriptProcessor(4096, 1, 1);
    processorNode.onaudioprocess = (event) => {
      if (isPaused) return;

      const inputData = event.inputBuffer.getChannelData(0);
      const samples = new Float32Array(inputData);

      // Feed to VAD for speech detection
      VAD.processSamples(samples);

      // Also buffer for fallback transcription
      audioBuffer.push(samples);
    };

    source.connect(processorNode);
    processorNode.connect(audioContext.destination);

    isActive = true;
    onStateChange?.("listening");
  } catch (err) {
    console.error("[VAD] Failed to start listening:", err);
    onStateChange?.("idle");
    throw err;
  }
}

/**
 * Stop the VAD→STT pipeline and release resources.
 */
export async function stopListening(): Promise<void> {
  if (!isActive) return;

  // Process any remaining buffered audio
  if (audioBuffer.length > 0) {
    onStateChange?.("processing");
    const totalLength = audioBuffer.reduce((sum, chunk) => sum + chunk.length, 0);

    if (totalLength > 1600) {
      // At least 0.1s of audio at 16kHz
      const combined = new Float32Array(totalLength);
      let offset = 0;
      for (const chunk of audioBuffer) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }
      const text = await transcribe(combined);
      if (text) {
        onTranscription?.(text);
      }
    }
  }

  // Cleanup
  processorNode?.disconnect();
  processorNode = null;

  if (audioContext) {
    await audioContext.close();
    audioContext = null;
  }

  if (mediaStream) {
    mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
  }

  audioBuffer = [];
  isActive = false;
  onStateChange?.("idle");
}

/**
 * Check if the VAD pipeline is currently active.
 */
export function isListeningActive(): boolean {
  return isActive;
}

export function isListeningPaused(): boolean {
  return isPaused;
}

export function pauseListening(): void {
  isPaused = true;
  onStateChange?.("idle");
}

export function resumeListening(): void {
  isPaused = false;
  onStateChange?.("listening");
}
