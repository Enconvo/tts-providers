import { TTSProvider } from "@enconvo/api";
import { _SSMLTemplate } from "./ssml.ts";

import { SpeechConfig, AudioConfig, SpeechSynthesizer, ResultReason, SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";
export default function main(options: TTSProvider.TTSOptions) {

    return new MicrosoftTTSProvider({ options })

}


export class MicrosoftTTSProvider extends TTSProvider {

    protected async _toFile({ text, audioFilePath, speed }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {

        await this.ttsToFile(text, audioFilePath, speed)
        return {
            path: audioFilePath,
            text: text
        }
    }


    ttsToFile(text: string, audioFilePath: string, speed?: number) {
        return new Promise((resolve, reject) => {
            // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
            const credentials = this.options.credentials
            const speechConfig = SpeechConfig.fromSubscription(credentials.resource_key, credentials.region.value);
            const audioConfig = AudioConfig.fromAudioFileOutput(audioFilePath);
            // mp3
            speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

            // The language of the voice that speaks.
            speechConfig.speechSynthesisVoiceName = this.options.voice.value;

            // Create the speech synthesizer.
            var synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

            const ssml = _SSMLTemplate(text, this.options.voice.value, { rate: speed || this.options.speed?.value })

            synthesizer.speakSsmlAsync(ssml,
                function (result: any) {
                    if (result.reason === ResultReason.SynthesizingAudioCompleted) {
                        synthesizer.close();
                        resolve(null)
                    } else {
                        synthesizer.close();
                        console.error("Speech synthesis canceled, " + result.errorDetails +
                            "\nDid you set the speech resource key and region values?");
                        reject(result.errorDetails)
                    }
                },
                function (err) {
                    console.trace("err - " + err);
                    synthesizer.close();
                    reject(err)
                });
        })
    }
}

