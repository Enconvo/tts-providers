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
        console.log("llll", options)

        const ELEVENLABS_API_KEY = options.apiKey; // Replace with your actual API key

        const client = new ElevenLabsClient({ apiKey: ELEVENLABS_API_KEY });
        const response = await client.textToSpeech.convert(options.voice.value, {
            output_format: "mp3_44100_128",
            text: text,
            model_id: options.modelName.value
        });

        await this.saveStreamToFile(response, audioFilePath);

        // Create a buffer to store the audio data from the stream
        // const chunks: Buffer[] = [];

        // // Process the stream by collecting all chunks of data
        // response.on('data', (chunk: Buffer) => {
        //     chunks.push(chunk);
        // });

        // // Wait for the stream to finish and combine all chunks
        // await new Promise<void>((resolve, reject) => {
        //     response.on('end', () => resolve());
        //     response.on('error', (err) => reject(err));
        // });

        // // Combine all chunks into a single buffer
        // const buffer = Buffer.concat(chunks);

        // // Write the buffer to the specified audio file path
        // await writeFileAsync(audioFilePath, buffer);

        // // Log success message
        // console.log(`Audio file successfully saved to: ${audioFilePath}`);

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