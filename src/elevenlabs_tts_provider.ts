import { TTSItem, TTSOptions, TTSProviderBase } from "./tts_provider.ts";
import axios from "axios";
import { writeFile } from "fs";
import { promisify } from "util";

export default function main(ttsOptions: TTSOptions) {

    return new EventLabsTTSProvider({ ttsOptions })
}

export class EventLabsTTSProvider extends TTSProviderBase {

    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string }): Promise<TTSItem> {

        const writeFileAsync = promisify(writeFile);

        const options = this.ttsOptions

        const data = {
            "text": text,
            "model_id": options.modelName.value,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }

        const ttsUrl = `${options.baseUrl}/text-to-speech/${options.voice.value}`

        const response = await axios.post(ttsUrl, data, {
            headers: {
                'xi-api-key': `${options.api_key}`,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(response.data);

        await writeFileAsync(audioFilePath, buffer);
        return {
            path: audioFilePath,
            text: text
        }
    }
}