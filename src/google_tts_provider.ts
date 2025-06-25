import { writeFileSync } from "node:fs";
import axios from "axios";
import { TTSProvider } from "@enconvo/api";


export default function main(options: TTSProvider.TTSOptions) {
    return new GoogleTTSProvider({ options })
}

export class GoogleTTSProvider extends TTSProvider {

    protected async _toFile({ text, audioFilePath, speed, voice }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {

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
                    name: voice || this.options.voice.value,
                    //@ts-ignore
                    languageCode: voice || this.options.voice.languageCode
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate: speed || this.options.speed?.value
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



