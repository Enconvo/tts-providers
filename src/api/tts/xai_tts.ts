interface XaiTTSParams {
  /** Text to synthesize, supports speech tags like [pause], <whisper>text</whisper> @required */
  text: string;
  /** BCP-47 language code or "auto" for auto-detection @required @default "auto" */
  language: string;
  /** Voice ID: eve, ara, rex, sal, leo @default "eve" */
  voice_id?: string;
  /** Audio codec: mp3, wav, pcm, mulaw, alaw @default "mp3" */
  codec?: string;
  /** Sample rate in Hz: 8000, 16000, 22050, 24000, 44100, 48000 @default 24000 */
  sample_rate?: number;
  /** Bit rate in bps (MP3 only): 32000, 64000, 96000, 128000, 192000 @default 128000 */
  bit_rate?: number;
}

/**
 * xAI TTS Specialized API - Expressive speech synthesis with speech tags
 *
 * Provides access to xAI's TTS with expressive controls:
 * - Inline tags: [pause], [long-pause], [laugh], [cry], [sigh], [cough], [throat-clear], [breathe-in], [breathe-out]
 * - Wrapping tags: <loud>, <soft>, <whisper>, <fast>, <slow>, <deep>, <high>, <sing>
 * - 5 voices: eve, ara, rex, sal, leo
 * - 20+ auto-detected languages
 * - Multiple audio formats: mp3, wav, pcm, mulaw, alaw
 * - Sample rates: 8000, 16000, 22050, 24000, 44100, 48000
 */
export default async function POST(request: Request): Promise<Response> {
  const params = (await request.json()) as XaiTTSParams;

  if (!params.text) {
    return Response.json({ error: "text is required" }, { status: 400 });
  }

  if (params.text.length > 15000) {
    return Response.json(
      { error: "text exceeds 15,000 character limit" },
      { status: 400 }
    );
  }

  const { Environment } = await import("@enconvo/api");
  const env = Environment.env();

  const apiKey = env["XAI_API_KEY"] || "";
  if (!apiKey) {
    return Response.json(
      { error: "XAI_API_KEY not configured" },
      { status: 500 }
    );
  }

  const voiceId = params.voice_id || "eve";
  const language = params.language || "auto";
  const codec = params.codec || "mp3";
  const sampleRate = params.sample_rate || 24000;
  const bitRate = params.bit_rate || 128000;

  const body = {
    text: params.text,
    voice_id: voiceId,
    language: language,
    output_format: {
      codec: codec,
      sample_rate: sampleRate,
      ...(codec === "mp3" ? { bit_rate: bitRate } : {}),
    },
  };

  const response = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    return Response.json(
      { error: `xAI TTS API error: ${error}` },
      { status: response.status }
    );
  }

  const contentTypeMap: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    pcm: "audio/pcm",
    mulaw: "audio/basic",
    alaw: "audio/alaw",
  };

  const arrayBuffer = await response.arrayBuffer();
  const base64Audio = Buffer.from(arrayBuffer).toString("base64");

  return Response.json({
    audio: base64Audio,
    content_type: contentTypeMap[codec] || "audio/mpeg",
  });
}
