export function resampleBuffer(
  audioBuffer: AudioBuffer,
  targetSampleRate: number
): Promise<AudioBuffer> {
  if (audioBuffer.sampleRate === targetSampleRate) {
    return Promise.resolve(audioBuffer);
  }

  const duration = audioBuffer.duration;
  const offline = new OfflineAudioContext(
    audioBuffer.numberOfChannels,
    Math.ceil(duration * targetSampleRate),
    targetSampleRate
  );
  const source = offline.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(offline.destination);
  source.start();
  return offline.startRendering();
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}
