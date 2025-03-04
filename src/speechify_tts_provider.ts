import { TTSProvider } from "@enconvo/api";
// Using the promise-based fs API for better async handling
import fs from "node:fs/promises";
// import fetch from "node-fetch"; // uncomment if using Node older than v21.x

/**
 * Main function that creates and returns a new SpeechifyTTSProvider instance
 * @param options - The TTS options for configuration
 * @returns A configured SpeechifyTTSProvider instance
 */
export default function main(options: TTSProvider.TTSOptions) {
    return new SpeechifyTTSProvider({ options });
}

/**
 * SpeechifyTTSProvider class that handles text-to-speech conversion using Speechify API
 */
export class SpeechifyTTSProvider extends TTSProvider {
    // Base URL for the Speechify API
    private readonly API_BASE_URL = "https://api.sws.speechify.com";
    // Default voice ID to use for speech synthesis
    private readonly DEFAULT_VOICE_ID = "george";


    /**
     * Converts text to speech and saves it to a file
     * @param params - Parameters including text to convert, output file path, and speech speed
     * @returns Promise resolving to a TTSItem with path and text information
     */
    protected async _toFile({ text, audioFilePath, speed }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {
        // Get the audio data from Speechify API
        const audioData = await this.getAudio(text, speed);

        // Save the audio data to the specified file path
        await fs.writeFile(audioFilePath, audioData);

        // Return the result with file path and original text
        return {
            path: audioFilePath,
            text: text
        };
    }

    /**
     * Fetches audio data from the Speechify API
     * @param text - The text to convert to speech
     * @returns Promise resolving to a Buffer containing the audio data
     */
    private async getAudio(text: string, speed: number | undefined): Promise<Buffer> {
        // Convert speed parameter to prosody rate format if provided
        let formattedText = text;
        if (speed !== undefined && speed !== 1) {
            // Convert the speed number to a percentage format for prosody rate
            // Speed is typically a multiplier where 1.0 is normal speed
            // Convert speed to percentage format with + or - prefix
            // Valid range for prosody rate is between -50% and +9900%
            const speedPercentage = speed > 1 ? `+${Math.round((speed - 1) * 100)}` : `${Math.round((speed - 1) * 100)}`;
            const ratePercentage = `${speedPercentage}`;
            // Wrap the text in prosody tag with the calculated rate
            formattedText = `<prosody rate="${ratePercentage}%">${text}</prosody>`;
        }
        console.log("formattedText", formattedText)

        // Make a POST request to the Speechify API
        const res = await fetch(`${this.API_BASE_URL}/v1/audio/speech`, {
            method: "POST",
            body: JSON.stringify({
                input: `<speak>${formattedText}</speak>`,
                voice_id: this.options.voice.value || this.DEFAULT_VOICE_ID,
                audio_format: "mp3",
            }),
            headers: {
                Authorization: `Bearer ${this.options.apiKey}`,
                "content-type": "application/json",
            },
        });

        // Check if the request was successful
        if (!res.ok) {
            throw new Error(`${res.status} ${res.statusText}\n${await res.text()}`);
        }

        // Parse the response and extract the audio data
        const responseData = await res.json();

        // Decode the base64-encoded audio data
        return Buffer.from(responseData.audio_data, "base64");
    }
}