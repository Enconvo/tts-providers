import { TTSProvider, TTSItem, TTSOptions } from "./tts_provider.ts";
import axios from "axios";
import fs from "fs";

export class GoogleTTSProvider extends TTSProvider {
    private apiKey: string;

    constructor(fields: { ttsOptions: TTSOptions; apiKey: string }) {
        super(fields);
        this.apiKey = fields.apiKey;
    }

    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string; }): Promise<TTSItem> {
        try {
            const response = await axios({
                method: 'post',
                url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': this.apiKey
                },
                data: {
                    input: {
                        text: text
                    },
                    voice: {
                        name: this.options.voice,
                        languageCode: 'en-US' // This could be made configurable through ttsOptions
                    },
                    audioConfig: {
                        audioEncoding: 'MP3'
                    }
                }
            });

            // The response contains audio content as a base64 encoded string
            const audioContent = Buffer.from(response.data.audioContent, 'base64');
            fs.writeFileSync(audioFilePath, audioContent);

            return {
                path: audioFilePath,
                text: text
            };
        } catch (error) {
            console.error('Error in Google TTS:', error);
            throw error;
        }
    }
}
