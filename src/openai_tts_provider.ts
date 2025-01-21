
import { TTSProvider } from "@enconvo/api";
import axios from "axios";
import { writeFile } from "fs";
import { promisify } from "util";

export default function main(options: TTSProvider.TTSOptions) {

    return new OpenAITTSProvider({ options })
}

export class OpenAITTSProvider extends TTSProvider {

    protected async _toFile({ text, audioFilePath, speed }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {

        const writeFileAsync = promisify(writeFile);

        const options = this.options

        const OPENAI_API_KEY = options.openAIApiKey; // Replace with your actual API key

        const data = {
            model: options.modelName.value,
            input: text,
            voice: options.voice.value,
            speed: speed || options.speed?.value || 1.2
        };

        const ttsUrl = `${options.baseUrl}/audio/speech`

        const response = await axios.post(ttsUrl, data, {
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
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