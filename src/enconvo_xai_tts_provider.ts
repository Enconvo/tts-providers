import { TTSProvider } from "@enconvo/api";
import axios from "axios";
import { writeFile } from "fs";
import { env } from "process";
import { promisify } from "util";

export default function main(options: TTSProvider.TTSOptions) {
  return new EnconvoXAITTSProvider({ options });
}

export class EnconvoXAITTSProvider extends TTSProvider {
  protected async _toFile({
    text,
    audioFilePath,
    speed,
    voice,
  }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {
    const options = this.options;
    const writeFileAsync = promisify(writeFile);

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

    const baseUrl = "https://api.enconvo.com";
    const ttsUrl = `${baseUrl}/v1/xai_tts`;

    const response = await axios.post(ttsUrl, data, {
      headers: {
        "Content-Type": "application/json",
        accessToken: `${env["accessToken"]}`,
        client_id: `${env["client_id"]}`,
        commandKey: `${env["commandKey"]}`,
        commandTitle: `${env["commandTitle"]}`,
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
