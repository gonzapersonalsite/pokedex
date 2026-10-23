import { useCallback } from 'react'
import { AudioManager } from '@/shared/utils/audioManager'

export function useAudio() {
  const audioManager = AudioManager.getInstance()

  // Initialize audio on the first interaction if not ready yet
  const ensureInitialized = useCallback(async () => {
    if (!audioManager.isReady()) {
      await audioManager.init()
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

  return {
    playSound,
    loadSounds,
    loadSound,
    audioManager,
  }
}
