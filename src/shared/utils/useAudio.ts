import { useCallback, useEffect, useState } from 'react'
import { AudioManager } from '@/shared/utils/audioManager'

export function useAudio() {
  const [isReady, setIsReady] = useState(false)
  const audioManager = AudioManager.getInstance()

  // Initialize audio on the first interaction if not ready yet
  const ensureInitialized = useCallback(async () => {
    if (!audioManager.isReady()) {
      await audioManager.init()
      setIsReady(audioManager.isReady())
    }
  }, [audioManager])

  // Play sound (ensuring initialization)
  const playSound = useCallback(
    async (soundName: string) => {
      await ensureInitialized()
      audioManager.play(soundName)
    },
    [audioManager, ensureInitialized],
  )

  // Load multiple sounds
  const loadSounds = useCallback(
    async (soundMap: Record<string, string>) => {
      await ensureInitialized()
      await audioManager.loadSounds(soundMap)
    },
    [audioManager, ensureInitialized],
  )

  // Load a single sound
  const loadSound = useCallback(
    async (name: string, path: string) => {
      await ensureInitialized()
      await audioManager.loadSound(name, path)
    },
    [audioManager, ensureInitialized],
  )

  // Check readiness state
  const checkReady = useCallback(() => {
    setIsReady(audioManager.isReady())
    return audioManager.isReady()
  }, [audioManager])

  // Monitor audio readiness state
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = audioManager.isReady()
      if (currentState !== isReady) {
        setIsReady(currentState)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [audioManager, isReady])

  return {
    playSound,
    loadSounds,
    loadSound,
    isReady,
    checkReady,
    audioManager,
  }
}
