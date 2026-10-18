import { requestArrayBuffer } from '@/shared/api'

export class AudioManager {
  private static instance: AudioManager
  private audioContext: AudioContext | null = null
  private sounds: Map<string, AudioBuffer> = new Map()
  private isInitialized = false
  private isInitializing = false

  static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  // Initialize the audio context on the first user interaction
  async init(): Promise<void> {
    if (this.isInitialized || this.isInitializing) return

    this.isInitializing = true

    try {
      const AudioContextCtor =
        window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioContextCtor) throw new Error('Web Audio API is not available')
      this.audioContext = new AudioContextCtor()

      // Resume the context if it started suspended
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume()
      }

      this.isInitialized = true
    } catch (error) {
      console.warn('Audio initialization failed:', error)
      this.isInitializing = false
    }
  }

  // Load a single sound file
  async loadSound(name: string, path: string): Promise<void> {
    if (!this.isInitialized) {
      await this.init()
    }

    if (!this.audioContext || this.sounds.has(name)) return

    try {
      const arrayBuffer = await requestArrayBuffer(path)
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.sounds.set(name, audioBuffer)
    } catch (error) {
      console.warn(`Failed to load sound "${name}":`, error)
    }
  }

  // Load multiple sounds
  async loadSounds(soundMap: Record<string, string>): Promise<void> {
    const loadPromises = Object.entries(soundMap).map(([name, path]) => this.loadSound(name, path))
    await Promise.allSettled(loadPromises)
  }

  // Play a loaded sound
  play(name: string): void {
    if (!this.isInitialized || !this.audioContext) return

    const sound = this.sounds.get(name)
    if (!sound) {
      console.warn(`Sound "${name}" not found`)
      return
    }

    try {
      const source = this.audioContext.createBufferSource()
      source.buffer = sound
      source.connect(this.audioContext.destination)
      source.start(0)
    } catch (error) {
      console.warn(`Failed to play sound "${name}":`, error)
    }
  }

  // Check whether audio playback is ready
  isReady(): boolean {
    return this.isInitialized && this.audioContext?.state === 'running'
  }

  // Get current AudioContext state
  getContextState(): string | null {
    return this.audioContext?.state || null
  }

  // Release audio resources
  dispose(): void {
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.sounds.clear()
    this.isInitialized = false
    this.isInitializing = false
  }
}
