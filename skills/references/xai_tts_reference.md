# xAI TTS API Reference

Comprehensive reference for the xAI Text-to-Speech API integration, covering expressive speech tags, voices, languages, output formats, and best practices.

## API Endpoint

```
POST https://api.x.ai/v1/tts
Authorization: Bearer $XAI_API_KEY
Content-Type: application/json
```

Response: raw audio bytes (binary). Save directly to file.

## Request Body

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `text` | string | Yes | - | Max 15,000 characters. Supports speech tags. |
| `language` | string | Yes | - | BCP-47 code or `auto`. Case-insensitive. |
| `voice_id` | string | No | `eve` | Case-insensitive. See Voices. |
| `output_format` | object | No | MP3 24kHz/128kbps | See Output Formats. |

## Voices

| ID | Tone | Best for |
|----|------|----------|
| `eve` | Energetic, upbeat | Demos, announcements, upbeat content |
| `ara` | Warm, friendly | Conversational interfaces, customer support |
| `rex` | Confident, clear | Business presentations, corporate comms, tutorials |
| `sal` | Smooth, balanced | Versatile - wide range of content types |
| `leo` | Authoritative, strong | Instructions, educational content, narration |

Voice IDs are case-insensitive. List voices programmatically: `GET /v1/tts/voices`

## Supported Languages (20)

| Language | Code | Language | Code |
|----------|------|----------|------|
| Auto-detect | `auto` | Italian | `it` |
| English | `en` | Japanese | `ja` |
| Arabic (Egypt) | `ar-EG` | Korean | `ko` |
| Arabic (Saudi Arabia) | `ar-SA` | Portuguese (Brazil) | `pt-BR` |
| Arabic (UAE) | `ar-AE` | Portuguese (Portugal) | `pt-PT` |
| Bengali | `bn` | Russian | `ru` |
| Chinese (Simplified) | `zh` | Spanish (Mexico) | `es-MX` |
| French | `fr` | Spanish (Spain) | `es-ES` |
| German | `de` | Turkish | `tr` |
| Hindi | `hi` | Vietnamese | `vi` |
| Indonesian | `id` | | |

Language codes are case-insensitive.

## Speech Tags

### Inline Tags

Insert at a specific point to produce a vocal expression.

| Category | Tags |
|----------|------|
| Pauses | `[pause]`, `[long-pause]` |
| Laughter & crying | `[laugh]`, `[cry]` |
| Mouth sounds | `[sigh]`, `[cough]`, `[throat-clear]` |
| Breathing | `[breathe-in]`, `[breathe-out]` |

**Example:**
```
So I walked in and [pause] there it was. [laugh] I honestly could not believe it!
```

### Wrapping Tags

Wrap a section of text to change delivery style.

| Category | Tags |
|----------|------|
| Volume & intensity | `<loud>`, `<soft>`, `<whisper>` |
| Pitch & speed | `<fast>`, `<slow>`, `<deep>`, `<high>` |
| Vocal style | `<sing>` |

**Example:**
```
I need to tell you something. <whisper>It is a secret.</whisper> Pretty cool, right?
```

### Combining Tags

Tags can be combined and nested for richer expression:
```
<slow><soft>Goodnight, sleep well.</soft></slow>
```

### Tips

- Place inline tags where the expression would naturally occur
- Combine with punctuation for natural results: `"Really? [laugh] That's incredible!"`
- Use `[pause]` or `[long-pause]` for dramatic timing
- Wrapping tags work best around complete phrases, not individual words
- Combine styles: `<slow><soft>text</soft></slow>`

## Output Formats

### `output_format` Object

| Field | Type | Required | Default | Values |
|-------|------|----------|---------|--------|
| `codec` | string | No | `mp3` | `mp3`, `wav`, `pcm`, `mulaw`, `alaw` |
| `sample_rate` | integer | No | `24000` | `8000`, `16000`, `22050`, `24000`, `44100`, `48000` |
| `bit_rate` | integer | No | `128000` | `32000`, `64000`, `96000`, `128000`, `192000` (MP3 only) |

### Codec Reference

| Codec | Content-Type | Best for |
|-------|-------------|----------|
| `mp3` | `audio/mpeg` | General use, wide compatibility |
| `wav` | `audio/wav` | Lossless, editing, post-production |
| `pcm` | `audio/pcm` | Raw audio, real-time processing |
| `mulaw` | `audio/basic` | Telephony (G.711 u-law) |
| `alaw` | `audio/alaw` | Telephony (G.711 A-law) |

### Sample Rate Guide

| Rate | Use case |
|------|----------|
| `8000` | Narrowband telephony |
| `16000` | Wideband speech recognition |
| `22050` | Standard balanced quality |
| `24000` | High quality (default, recommended) |
| `44100` | CD quality media production |
| `48000` | Professional studio-grade |

## Error Handling

| Status | Meaning | Action |
|--------|---------|--------|
| `200` | Success | Audio bytes in response body |
| `400` | Bad request | Check text non-empty, under 15K chars; valid codec/sample_rate |
| `401` | Unauthorized | Invalid or missing API key |
| `429` | Rate limited | Retry with exponential backoff |
| `500` | Server error | Retry with exponential backoff |
| `503` | Unavailable | Retry |

## Limits

| Property | Unary POST | WebSocket |
|----------|-----------|-----------|
| Max text length | 15,000 chars/request | No limit (15K per delta) |
| Request timeout | 15 minutes | No timeout |
| Concurrent sessions | - | 50 per team |

## WebSocket Streaming

For real-time audio, connect via WebSocket:

```
wss://api.x.ai/v1/tts?language=en&voice=eve&codec=mp3&sample_rate=24000
Authorization: Bearer $XAI_API_KEY
```

### Client -> Server

```json
{"type": "text.delta", "delta": "Hello from streaming."}
{"type": "text.done"}
```

### Server -> Client

```json
{"type": "audio.delta", "delta": "<base64 audio>"}
{"type": "audio.done", "trace_id": "uuid"}
{"type": "error", "message": "description"}
```

Multi-utterance: connection stays open after `audio.done`. Send more `text.delta` -> `text.done` for additional turns without reconnecting.

## Enconvo Integration

### Direct Provider (`xai_tts_provider`)
- Uses `credentials|x_ai` (apiKey + baseUrl)
- Endpoint: `${baseUrl}/tts`
- Preferences: voice, language

### Cloud Provider (`enconvo_xai_tts_provider`)
- Routes through `https://api.enconvo.com/v1/xai_tts`
- No user credentials needed
- Uses Enconvo env headers (accessToken, client_id, commandKey, commandTitle)
- Points: ~4.2 per 1K characters

### Specialized API (`tts_providers/tts/xai_tts`)
- Full control over codec, sample_rate, bit_rate
- Returns base64 audio + content_type in JSON
- Exposes all xAI TTS features including speech tags

## Quick Examples

### Basic
```json
{
  "text": "Hello! Welcome to xAI TTS.",
  "voice_id": "eve",
  "language": "en"
}
```

### Expressive with speech tags
```json
{
  "text": "So I walked in and [pause] there it was. [laugh] I honestly could not believe it! <whisper>It was amazing.</whisper>",
  "voice_id": "ara",
  "language": "en"
}
```

### High-fidelity output
```json
{
  "text": "Crystal clear audio at maximum quality.",
  "voice_id": "rex",
  "language": "en",
  "output_format": {
    "codec": "mp3",
    "sample_rate": 44100,
    "bit_rate": 192000
  }
}
```

### Telephony
```json
{
  "text": "Hello, thank you for calling. How can I help?",
  "voice_id": "ara",
  "language": "en",
  "output_format": {
    "codec": "mulaw",
    "sample_rate": 8000
  }
}
```

### Multilingual
```json
{
  "text": "Bonjour! Bienvenue a notre service.",
  "voice_id": "sal",
  "language": "fr"
}
```
