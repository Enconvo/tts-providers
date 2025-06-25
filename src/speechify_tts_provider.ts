import { TTSProvider } from "@enconvo/api";
import { SpeechifyClient } from "@speechify/api";
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
    // Default voice ID to use for speech synthesis
    private readonly DEFAULT_VOICE_ID = "george";


    /**
     * Converts text to speech and saves it to a file
     * @param params - Parameters including text to convert, output file path, and speech speed
     * @returns Promise resolving to a TTSItem with path and text information
     */
    protected async _toFile({ text, audioFilePath, speed, voice }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {
        const credentials = this.options.credentials
        if (!credentials.apiKey) {
            throw new Error("SPEECHIFY_API_KEY is not set");
        }

        let formattedText = text;
        if (speed !== undefined && speed !== 1) {
            // Convert the speed number to a percentage format for prosody rate
            // Speed is typically a multiplier where 1.0 is normal speed
            // Convert speed to percentage format with + or - prefix
            // Valid range for prosody rate is between -50% and +9900%
            const speedPercentage = speed > 1 ? `+${Math.round((speed - 1) * 100)}` : `${Math.round((speed - 1) * 100)}`;
            const ratePercentage = `${speedPercentage}`;
            // Wrap the text in prosody tag with the calculated rate
            formattedText = `<speak><prosody rate="${ratePercentage}%">${text}</prosody></speak>`;
        }

        const client = new SpeechifyClient({ token: credentials.apiKey });
        const response = await client.tts.audio.speech({
            audioFormat: 'mp3',
            input: formattedText,
            model: this.options.modelName?.value,
            voiceId: voice || this.options.voice?.value || this.DEFAULT_VOICE_ID,
        });

        console.log("response", response)

        const audioData = Buffer.from(response.audioData, "base64");

        // Save the audio data to the specified file path
        await fs.writeFile(audioFilePath, audioData);

        // Return the result with file path and original text
        return {
            path: audioFilePath,
            text: text
        };
    }
}