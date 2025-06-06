import { TTSProvider } from "@enconvo/api";
import { ElevenLabsClient } from "elevenlabs";
import { Readable } from "stream";
import fs from "fs";

export default function main(options: TTSProvider.TTSOptions) {

    return new ElevenLabsTTSProvider({ options })
}

export class ElevenLabsTTSProvider extends TTSProvider {

    protected async _toFile({ text, audioFilePath, speed }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {
        const options = this.options

        const credentials = options.credentials
        const ELEVENLABS_API_KEY = credentials.apiKey; // Replace with your actual API key
        if (!ELEVENLABS_API_KEY) {
            throw new Error("ELEVENLABS_API_KEY is not set");
        }

        const client = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });
        const response = await client.textToSpeech.convert(options.voice.value, {
            output_format: "mp3_44100_128",
            text: text,
            model_id: options.modelName.value
        });

        await this.saveStreamToFile(response, audioFilePath);

        return {
            path: audioFilePath,
            text: text
        }
    }

    async saveStreamToFile(readableStream: Readable, outputPath: string) {
        return new Promise((resolve, reject) => {
            // Create a writable stream to the file
            const fileStream = fs.createWriteStream(outputPath);

            // Pipe the readable stream to the file
            readableStream.pipe(fileStream);

            // Handle events
            fileStream.on('finish', () => {
                resolve(outputPath);
            });

            fileStream.on('error', (error) => {
                reject(error);
            });

            readableStream.on('error', (error) => {
                fileStream.end();
                reject(error);
            });
        });
    }
}