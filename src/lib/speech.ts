// Síntesis de voz (Web Speech API) para el tablero de comunicación (UI-10).
// Las voces cargan de forma asíncrona en Chrome/Edge: se leen al importar y
// se refrescan con el evento 'voiceschanged'.

let voices: SpeechSynthesisVoice[] = []

function refreshVoices() {
  voices = window.speechSynthesis.getVoices()
}

export function isSpeechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

if (isSpeechAvailable()) {
  refreshVoices()
  window.speechSynthesis.addEventListener('voiceschanged', refreshVoices)
}

function pickSpanishVoice(): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) refreshVoices()
  const normalized = (lang: string) => lang.replace('_', '-').toLowerCase()
  return (
    voices.find((v) => normalized(v.lang) === 'es-mx') ??
    voices.find((v) => normalized(v.lang).startsWith('es'))
  )
}

// Pronuncia `text` en español, cancelando cualquier locución pendiente.
export function speak(text: string) {
  if (!isSpeechAvailable()) {
    console.warn('speechSynthesis no está disponible en este navegador')
    return
  }
  const trimmed = text.trim()
  if (!trimmed) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(trimmed)
  utterance.lang = 'es-MX'
  const voice = pickSpanishVoice()
  if (voice) utterance.voice = voice
  utterance.rate = 0.9 // ligeramente pausado para alumnos con trastorno de lenguaje
  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if (isSpeechAvailable()) window.speechSynthesis.cancel()
}
