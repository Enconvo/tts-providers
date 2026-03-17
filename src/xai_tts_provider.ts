import { TTSProvider } from "@enconvo/api";
import axios from "axios";
import { writeFile } from "fs";
import { promisify } from "util";

export default function main(options: TTSProvider.TTSOptions) {
  return new XAITTSProvider({ options });
}

export class XAITTSProvider extends TTSProvider {
  protected async _toFile({
    text,
    audioFilePath,
    speed,
    voice,
  }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {
    const writeFileAsync = promisify(writeFile);

    const options = this.options;
    const credentials = options.credentials;
    const apiKey = credentials.apiKey;

    const voiceId = voice || options.voice.value || "eve";
    const language = options.language?.value || "auto";

    const data: Record<string, any> = {
      text: text,
      voice_id: voiceId,
      language: language,
      output_format: {
        codec: "mp3",
        sample_rate: 24000,
        bit_rate: 128000,
      },
    };

    const ttsUrl = `${credentials.baseUrl}/tts`;

    const response = await axios.post(ttsUrl, data, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data);
    await writeFileAsync(audioFilePath, buffer);

    return {
      path: audioFilePath,
      text: text,
    };
  }
}
