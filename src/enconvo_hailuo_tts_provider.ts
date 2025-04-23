
import { TTSProvider } from "@enconvo/api";
import axios from "axios";
import { writeFile } from "fs";
import { env } from "process";
import { promisify } from "util";

export default function main(options: TTSProvider.TTSOptions) {
    return new HailuoTTSProvider({ options })
}


export class HailuoTTSProvider extends TTSProvider {

    protected async _toFile({ text, audioFilePath, speed }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {
        // Initialize file writing utility
        const options = this.options;

        const writeFileAsync = promisify(writeFile);

        // Prepare request payload according to Minimax API specs
        const data = {
            model: this.options.modelName.value, // Default model for Minimax TTS
            text: text,
            stream: false,
            voice_setting: {
                voice_id: options.voice.value,
                speed: speed || options.speed?.value || 1.0,
                vol: 1,
                pitch: 0
            },
            audio_setting: {
                sample_rate: 32000,
                bitrate: 128000,
                format: "mp3",
                channel: 1
            }
        };

        // const baseUrl = "http://127.0.0.1:8181";
        const baseUrl = "https://api.enconvo.com";
        // Construct API URL with group ID
        const ttsUrl = `${baseUrl}/v1/t2a_v2`;

        // Make API request
        const response = await axios.post(ttsUrl, data, {
            headers: {
                'Authorization': `Bearer ${options.apiKey}`,
                'Content-Type': 'application/json',
                "accessToken": `${env['accessToken']}`,
                "client_id": `${env['client_id']}`,
                "commandKey": `${env['commandKey']}`,
                "commandTitle": `${env['commandTitle']}`
            }
        });

        // Convert hex audio data to buffer
        const audioHex = response.data.data?.audio;
        // console.log("text", text)
        if (!audioHex) {
            console.log("response", JSON.stringify(response.data, null, 2))
            throw new Error("No audio data found in response: " + text);
        }
        const buffer = Buffer.from(audioHex, 'hex');

        // Write audio file and return result
        await writeFileAsync(audioFilePath, buffer);
        return {
            path: audioFilePath,
            text: text
        }
    }
}