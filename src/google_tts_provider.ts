import { TTSProvider, TTSItem, TTSOptions } from "./tts_provider.ts";
import axios from "axios";
import fs from "fs";

// Imports the Google Cloud client library
import textToSpeech from '@google-cloud/text-to-speech';

// Import other required libraries
import { writeFile } from 'node:fs/promises';

export default function main(ttsOptions: TTSOptions) {

    return new GoogleTTSProvider({ ttsOptions })
}

export class GoogleTTSProvider extends TTSProvider {


    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string; }): Promise<TTSItem> {
        try {

            // Creates a client
            const client = new textToSpeech.TextToSpeechClient();

            // Performs the text-to-speech request
            const [response] = await client.synthesizeSpeech({
                input: { text: text },
                // Select the language and SSML voice gender (optional)
                voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
                // select the type of audio encoding
                audioConfig: { audioEncoding: 'MP3' },
            });

            // Save the generated binary audio content to a local file
            if (response.audioContent) {
                await writeFile(audioFilePath, response.audioContent, 'binary');
                console.log(`Audio content written to file: ${audioFilePath}`);
            }

            return {
                path: audioFilePath,
                text: text
            };
        } catch (error) {
            console.error('Error in Google TTS:', error);
            throw error;
        }
    }

    // protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string; }): Promise<TTSItem> {
    //     try {
    //         const response = await axios({
    //             method: 'post',
    //             url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'X-goog-api-key': this.options.apiKey
    //             },
    //             data: {
    //                 input: {
    //                     text: text
    //                 },
    //                 voice: {
    //                     name: 'en-US-Casual-K',
    //                     languageCode: 'en-US'
    //                 },
    //                 audioConfig: {
    //                     audioEncoding: 'MP3'
    //                 }
    //             }
    //         });

    //         // The response contains audio content as a base64 encoded string
    //         const audioContent = Buffer.from(response.data.audioContent, 'base64');
    //         fs.writeFileSync(audioFilePath, audioContent);

    //         return {
    //             path: audioFilePath,
    //             text: text
    //         };
    //     } catch (error) {
    //         console.error('Error in Google TTS:', error);
    //         throw error;
    //     }
    // }
}
