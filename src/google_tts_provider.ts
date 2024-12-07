import { writeFileSync } from "node:fs";
import { TTSProvider, TTSItem, TTSOptions } from "./tts_provider.ts";
import axios from "axios";
import { environment, MD5Util, res } from "@enconvo/api";
import textToSpeech from '@google-cloud/text-to-speech';
import { writeFile } from "node:fs/promises";


// (async () => {
//     console.log("test")
//     const client = new textToSpeech.TextToSpeechClient({
//         apiKey: "AIzaSyBxI0zVV2Cv8USOJfCLx31LjmHSxMEqSUA"
//     });
//     const request = {
//         input: { text: 'Who are you ? ' },
//         voice: { name: 'en-US-Casual-K', languageCode: 'en-US' },
//         audioConfig: { audioEncoding: 'MP3' },
//     };
//     const [response] = await client.synthesizeSpeech(request);
//     const audioContent = response.audioContent;
//     const audioFilePath = 'output.mp3';
//     await writeFile(audioFilePath, audioContent, 'binary');
// })()

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
                    name: this.options.voice.value,
                    //@ts-ignore
                    languageCode: this.options.voice.languageCode
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



