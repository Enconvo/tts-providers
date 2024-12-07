import { writeFileSync } from "node:fs";
import { TTSProvider, TTSItem, TTSOptions } from "./tts_provider.ts";
import axios from "axios";
import { MD5Util, res } from "@enconvo/api";



export default function main(ttsOptions: TTSOptions) {
    return new GoogleTTSProvider({ ttsOptions })
}

export class GoogleTTSProvider extends TTSProvider {

    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string; }): Promise<TTSItem> {

        const response = await axios({
            method: 'post',
            url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
            headers: {
                'Content-Type': 'application/json',
                'X-goog-api-key': this.options.apiKey
            },
            data: {
                input: {
                    text: text
                },
                voice: {
                    name: 'en-US-Casual-K',
                    languageCode: 'en-US'
                },
                audioConfig: {
                    audioEncoding: 'MP3'
                }
            }
        });

        // The response contains audio content as a base64 encoded string
        const audioContent = Buffer.from(response.data.audioContent, 'base64');
        writeFileSync(audioFilePath, audioContent);

        return {
            path: audioFilePath,
            text: text
        };
    }
}



