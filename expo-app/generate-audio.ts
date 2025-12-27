#!/usr/bin/env bun
/**
 * Generate audio files that match the Web Audio API tones from src/actors/audio.ts
 * Uses the same envelope shaping: linear attack, exponential decay
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SAMPLE_RATE = 44_100;
const AUDIO_DIR = join(import.meta.dir, "assets/audio");

// Ensure directory exists
mkdirSync(AUDIO_DIR, { recursive: true });

/**
 * Generate a tone with the same envelope as Web Audio API:
 * - Linear ramp to volume over attackTime
 * - Exponential decay to 0.001 over remaining duration
 */
function generateTone(
  freq: number,
  duration: number,
  volume: number,
  attackTime = 0.01
): Float32Array {
  const numSamples = Math.ceil((duration + 0.1) * SAMPLE_RATE);
  const samples = new Float32Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;

    // Sine wave
    const wave = Math.sin(2 * Math.PI * freq * t);

    // Envelope matching Web Audio behavior
    let envelope: number;
    if (t < attackTime) {
      // Linear ramp up
      envelope = (t / attackTime) * volume;
    } else if (t < duration) {
      // Exponential decay from volume to 0.001
      const decayProgress = (t - attackTime) / (duration - attackTime);
      // Exponential interpolation: volume * (0.001/volume)^progress
      envelope = volume * (0.001 / volume) ** decayProgress;
    } else {
      envelope = 0;
    }

    samples[i] = wave * envelope;
  }

  return samples;
}

/**
 * Mix multiple sample arrays together (additive mixing)
 */
function mixSamples(...arrays: Float32Array[]): Float32Array {
  const maxLength = Math.max(...arrays.map((a) => a.length));
  const result = new Float32Array(maxLength);

  for (const arr of arrays) {
    for (let i = 0; i < arr.length; i++) {
      result[i] += arr[i];
    }
  }

  return result;
}

/**
 * Delay samples by a number of seconds (prepend silence)
 */
function delaySamples(
  samples: Float32Array,
  delaySeconds: number
): Float32Array {
  const delayCount = Math.ceil(delaySeconds * SAMPLE_RATE);
  const result = new Float32Array(samples.length + delayCount);
  result.set(samples, delayCount);
  return result;
}

/**
 * Convert Float32Array samples to 16-bit PCM WAV file buffer
 */
function samplesToWav(samples: Float32Array): Buffer {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = SAMPLE_RATE * numChannels * (bitsPerSample / 8);
  const blockAlign = numChannels * (bitsPerSample / 8);
  const dataSize = samples.length * (bitsPerSample / 8);
  const fileSize = 44 + dataSize;

  const buffer = Buffer.alloc(fileSize);
  let offset = 0;

  // RIFF header
  buffer.write("RIFF", offset);
  offset += 4;
  buffer.writeUInt32LE(fileSize - 8, offset);
  offset += 4;
  buffer.write("WAVE", offset);
  offset += 4;

  // fmt chunk
  buffer.write("fmt ", offset);
  offset += 4;
  buffer.writeUInt32LE(16, offset);
  offset += 4; // chunk size
  buffer.writeUInt16LE(1, offset);
  offset += 2; // PCM format
  buffer.writeUInt16LE(numChannels, offset);
  offset += 2;
  buffer.writeUInt32LE(SAMPLE_RATE, offset);
  offset += 4;
  buffer.writeUInt32LE(byteRate, offset);
  offset += 4;
  buffer.writeUInt16LE(blockAlign, offset);
  offset += 2;
  buffer.writeUInt16LE(bitsPerSample, offset);
  offset += 2;

  // data chunk
  buffer.write("data", offset);
  offset += 4;
  buffer.writeUInt32LE(dataSize, offset);
  offset += 4;

  // Write samples as 16-bit PCM
  for (const [i, sample] of samples.entries()) {
    // Clamp to [-1, 1] and convert to 16-bit
    const clamped = Math.max(-1, Math.min(1, sample));
    const int16 = Math.round(clamped * 32_767);
    buffer.writeInt16LE(int16, offset + i * 2);
  }

  return buffer;
}

function saveWav(filename: string, samples: Float32Array) {
  const path = join(AUDIO_DIR, filename);
  writeFileSync(path, samplesToWav(samples));
  console.log(`✓ ${filename}`);
}

// ============ Generate all audio files ============

console.log("Generating audio files with Web Audio-matching envelopes...\n");

// PLAY_DOWN - A4 - short tick (440Hz, 0.06s)
saveWav("down.wav", generateTone(440, 0.06, 0.4));

// PLAY_UP - Sharper click (800Hz, 0.05s)
saveWav("up.wav", generateTone(800, 0.05, 0.3));

// PLAY_LAST_DOWN - Octave power chord (220Hz + 440Hz + 659.25Hz, 0.25s)
saveWav(
  "last_down.wav",
  mixSamples(
    generateTone(220, 0.25, 0.25), // A3 - low root
    generateTone(440, 0.25, 0.25), // A4 - octave
    generateTone(659.25, 0.25, 0.2) // E5 - fifth
  )
);

// PLAY_LAST_UP - Octave power chord (220Hz + 440Hz + 659.25Hz, 0.4s)
saveWav(
  "last_up.wav",
  mixSamples(
    generateTone(220, 0.4, 0.3), // A3 - low root
    generateTone(440, 0.4, 0.3), // A4 - octave
    generateTone(659.25, 0.4, 0.25) // E5 - fifth
  )
);

// PLAY_GO - Bright start (880Hz, 0.2s)
saveWav("go.wav", generateTone(880, 0.2, 0.45));

// PLAY_REST - "duh doom" (440Hz then 329.63Hz, delayed by 120ms)
saveWav(
  "rest.wav",
  mixSamples(
    generateTone(440, 0.15, 0.3), // A4 - "duh"
    delaySamples(generateTone(329.63, 0.3, 0.4), 0.12) // E4 - "doom" after 120ms
  )
);

// PLAY_FINISH - Fanfare arpeggio (440, 554.37, 659.25, 880Hz with 100ms delays)
const finishFreqs = [440, 554.37, 659.25, 880];
saveWav(
  "finish.wav",
  mixSamples(
    ...finishFreqs.map((freq, i) =>
      delaySamples(generateTone(freq, 0.5, 0.25), i * 0.1)
    )
  )
);

// PLAY_COUNTDOWN_BEEP - A5 (880Hz, 0.05s)
saveWav("countdown_beep.wav", generateTone(880, 0.05, 0.3));

console.log(`\n✓ All audio files generated in ${AUDIO_DIR}/`);
