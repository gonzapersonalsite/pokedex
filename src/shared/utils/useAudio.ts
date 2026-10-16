import { useCallback, useEffect, useState } from 'react';
import { AudioManager } from '@/shared/utils/audioManager';

export function useAudio() {
  const [isReady, setIsReady] = useState(false);
  const audioManager = AudioManager.getInstance();

  // Inicializar audio en la primera interacción si no está listo
  const ensureInitialized = useCallback(async () => {
    if (!audioManager.isReady()) {
      await audioManager.init();
      setIsReady(audioManager.isReady());
    }
  }, [audioManager]);

  // Reproducir sonido (asegurando inicialización)
  const playSound = useCallback(async (soundName: string) => {
    await ensureInitialized();
    audioManager.play(soundName);
  }, [audioManager, ensureInitialized]);

  // Cargar sonidos
  const loadSounds = useCallback(async (soundMap: Record<string, string>) => {
    await ensureInitialized();
    await audioManager.loadSounds(soundMap);
  }, [audioManager, ensureInitialized]);

  // Cargar un sonido específico
  const loadSound = useCallback(async (name: string, path: string) => {
    await ensureInitialized();
    await audioManager.loadSound(name, path);
  }, [audioManager, ensureInitialized]);

  // Verificar estado
  const checkReady = useCallback(() => {
    setIsReady(audioManager.isReady());
    return audioManager.isReady();
  }, [audioManager]);

  // Monitorear estado del audio
  useEffect(() => {
    const interval = setInterval(() => {
      const currentState = audioManager.isReady();
      if (currentState !== isReady) {
        setIsReady(currentState);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [audioManager, isReady]);

  return {
    playSound,
    loadSounds,
    loadSound,
    isReady,
    checkReady,
    audioManager
  };
}
