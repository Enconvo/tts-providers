
import { TTSProvider } from "@enconvo/api";
import axios from "axios";
import { writeFile } from "fs";
import { promisify } from "util";

export default function main(options: TTSProvider.TTSOptions) {
    return new HailuoTTSProvider({ options })
}

export class HailuoTTSProvider extends TTSProvider {

    protected async _toFile({ text, audioFilePath, speed, voice }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {
        // Initialize file writing utility
        const writeFileAsync = promisify(writeFile);
        const options = this.options;
        const credentials = options.credentials

        // Prepare request payload according to Minimax API specs
        const data = {
            model: this.options.modelName.value, // Default model for Minimax TTS
            text: text,
            stream: false,
            voice_setting: {
                voice_id: voice || options.voice.value,
                speed: speed || options.speed?.value || "1.2",
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

        // Construct API URL with group ID
        const ttsUrl = `${credentials.baseUrl}/t2a_v2?GroupId=${credentials.groupId}`;

        // Make API request
        const response = await axios.post(ttsUrl, data, {
            headers: {
                'Authorization': `Bearer ${credentials.apiKey}`,
                'Content-Type': 'application/json'
            }
        });

        // Convert hex audio data to buffer
        const audioHex = response.data.data?.audio;
        if (!audioHex) {
            console.log("response", JSON.stringify(response.data, null, 2))
            throw new Error("No audio data found in response");
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