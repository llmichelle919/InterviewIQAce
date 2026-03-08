import { useState, useRef, useEffect } from 'react'

export default function VoiceRecorder({ onTranscript }) {
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [interimText, setInterimText] = useState('')
  const [supported, setSupported] = useState(true)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = (event) => {
      let final = ''
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          final += result[0].transcript + ' '
        } else {
          interim += result[0].transcript
        }
      }
      if (final) {
        setTranscript((prev) => prev + final)
      }
      setInterimText(interim)
    }

    recognition.onerror = (event) => {
      if (event.error !== 'no-speech') {
        setError(`Microphone error: ${event.error}`)
        setIsRecording(false)
      }
    }

    recognition.onend = () => {
      setIsRecording(false)
      setInterimText('')
    }

    recognitionRef.current = recognition
    return () => recognition.stop()
  }, [])

  function startRecording() {
    setError('')
    setTranscript('')
    setInterimText('')
    try {
      recognitionRef.current.start()
      setIsRecording(true)
    } catch (e) {
      setError('Could not start microphone. Please allow microphone access.')
    }
  }

  function stopRecording() {
    recognitionRef.current?.stop()
    setIsRecording(false)
    setInterimText('')
  }

  function handleUse() {
    const full = transcript.trim()
    if (full) {
      onTranscript(full)
      setTranscript('')
    }
  }

  if (!supported) {
    return (
      <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded-lg p-4 text-sm">
        <p className="font-medium">Voice recording not supported</p>
        <p className="mt-1 text-xs">Your browser doesn't support the Web Speech API. Use Chrome for voice features. Type your answer manually below.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Controls */}
      <div className="flex items-center gap-3">
        {!isRecording ? (
          <button
            onClick={startRecording}
            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <span className="w-3 h-3 rounded-full bg-white/80" />
            Start Recording
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-800 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <span className="w-3 h-3 rounded-sm bg-white/80" />
            Stop Recording
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 text-red-500 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse-dot" />
            Recording...
          </div>
        )}
      </div>

      {/* Live transcript area */}
      <div
        className={`min-h-[120px] rounded-lg border p-3 text-sm leading-relaxed ${
          isRecording ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        {transcript || interimText ? (
          <span>
            <span className="text-slate-800">{transcript}</span>
            {interimText && <span className="text-slate-400 italic">{interimText}</span>}
          </span>
        ) : (
          <span className="text-slate-400">
            {isRecording ? 'Speak now — transcription appears here in real time...' : 'Transcript will appear here.'}
          </span>
        )}
      </div>

      {/* Editable transcript */}
      {transcript && !isRecording && (
        <div className="space-y-2">
          <label className="label text-xs">Edit transcript before sending:</label>
          <textarea
            className="input min-h-[100px] resize-y text-sm"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <button onClick={handleUse} className="btn-primary text-sm">
            ✓ Use This Transcript
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      <p className="text-xs text-slate-400">
        🎙️ Uses your browser's built-in speech recognition. Works best in Chrome. Speak clearly.
      </p>
    </div>
  )
}
