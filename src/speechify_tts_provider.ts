import { TTSProvider } from "@enconvo/api";
import { Speechify } from "@speechify/api-sdk";
import { Readable } from "stream";
import fs from "fs";
export default function main(options: TTSProvider.TTSOptions) {

    return new SpeechifyTTSProvider({ options })
}

export class SpeechifyTTSProvider extends TTSProvider {
    private speechify: Speechify
    constructor(options: any) {
        super(options);

        this.speechify = new Speechify({
            apiKey: options.apiKey,
        });
    }

    protected async _toFile({ text, audioFilePath, speed }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {
        const options = this.options
        console.log("llll", options)

        const response = await this.speechify.audioGenerate({
            input: text,
            voiceId: "george",
            audioFormat: "mp3",
        });

        const audio = response.audioData;

        await this.saveBlobToFile(audio, audioFilePath);

        return {
            path: audioFilePath,
            text: text
        }
    }

    /**
     * Saves a Blob object to a file at the specified path
     * @param blob - The Blob object to save
     * @param filePath - The path where the file should be saved
     * @returns A Promise that resolves when the file has been saved
     */
    private async saveBlobToFile(blob: Blob, filePath: string): Promise<void> {
        // Convert Blob to Buffer
        const arrayBuffer = await blob.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Write buffer to file
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, buffer, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

}