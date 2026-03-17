---
name: tts_providers
description: >
  TTS provider integrations for OpenAI, Microsoft Azure, ElevenLabs, MiniMax, Speechify, Straico, Google Cloud, xAI, macOS system TTS, and Edge TTS, with voice listing and speed configuration APIs.
metadata:
  author: EnconvoAI
  version: "0.0.230"
---

## API Reference

Just use the `local_api` tool to request these APIs.

To view full parameter details for a specific endpoint, run: `node skills/scripts/api_detail.cjs <endpoint-path>`

| Endpoint | Description |
|----------|-------------|
| `tts_providers/tts/xai_tts` | xAI TTS Specialized API - Expressive speech synthesis with speech tags Provides access to xAI's TTS with expressive controls: - Inline tags: [pause], [long-pause], [laugh], [cry], [sigh], [cough], [throat-clear], [breathe-in], [breathe-out] - Wrapping tags: <loud>, <soft>, <whisper>, <fast>, <slow>, <deep>, <high>, <sing> - 5 voices: eve, ara, rex, sal, leo - 20+ auto-detected languages - Multiple audio formats: mp3, wav, pcm, mulaw, alaw - Sample rates: 8000, 16000, 22050, 24000, 44100, 48000 |

## References

- **xAI TTS API**: See [references/xai_tts_reference.md](references/xai_tts_reference.md) for complete xAI TTS documentation including speech tags, voices, languages, output formats, WebSocket streaming, error handling, and Enconvo integration details.
