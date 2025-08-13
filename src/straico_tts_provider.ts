import { TTSProvider } from "@enconvo/api";
import axios from "axios";
import { writeFile } from "fs";
import { promisify } from "util";

export default function main(options: TTSProvider.TTSOptions) {
  return new StraicoTTSProvider({ options });
}

export class StraicoTTSProvider extends TTSProvider {
  protected async _toFile({
    text,
    audioFilePath,
    speed,
    voice,
  }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {
    const writeFileAsync = promisify(writeFile);

    const options = this.options;
    const credentials = options.credentials;
    const STRAICO_API_KEY = credentials.apiKey;
    console.log("STRAICO_API_KEY", STRAICO_API_KEY);

    if (!STRAICO_API_KEY) {
      throw new Error("STRAICO_API_KEY is not set");
    }

    const modelName = options.modelName.value;
    const selectedVoice = voice || options[`${modelName}-voice`].value;

    const formData = new URLSearchParams();
    formData.append("model", modelName);
    formData.append("text", text);
    formData.append("voice_id", selectedVoice);

    const ttsUrl = "https://api.straico.com/v1/tts/create";

    const response = await axios.post(ttsUrl, formData, {
      headers: {
        Authorization: `Bearer ${STRAICO_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });

    if (!response.data.success) {
      throw new Error(
        `Straico TTS API error: ${JSON.stringify(response.data)}`
      );
    }

    const audioUrl = response.data.data.audio;

    const audioResponse = await axios.get(audioUrl, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(audioResponse.data);

    await writeFileAsync(audioFilePath, buffer);
    return {
      path: audioFilePath,
      text: text,
    };
  }
}
