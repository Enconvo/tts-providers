import { TTSItem, TTSOptions, TTSProviderBase } from "./tts_provider.ts";
import { SpeechConfig, AudioConfig, SpeechSynthesizer, ResultReason, SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";
export default function main(ttsOptions: TTSOptions) {

    return new MicrosoftTTSProvider({ ttsOptions })

}


export class MicrosoftTTSProvider extends TTSProviderBase {

    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string }): Promise<TTSItem> {

        await this.ttsSpeak(text, audioFilePath)
        return {
            path: audioFilePath,
            text: text
        }
    }


    ttsSpeak(text: string, audioFilePath: string) {
        return new Promise((resolve, reject) => {
            // This example requires environment variables named "SPEECH_KEY" and "SPEECH_REGION"
            console.log("ttsOptions", this.ttsOptions)
            const speechConfig = SpeechConfig.fromSubscription(this.ttsOptions.resource_key, this.ttsOptions.region.value);
            const audioConfig = AudioConfig.fromAudioFileOutput(audioFilePath);
            // mp3
            speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

            // The language of the voice that speaks.
            speechConfig.speechSynthesisVoiceName = this.ttsOptions.voice.value;

            // Create the speech synthesizer.
            var synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

            synthesizer.speakTextAsync(text,
                function (result: any) {
                    if (result.reason === ResultReason.SynthesizingAudioCompleted) {
                        synthesizer.close();
                        synthesizer = null;
                        resolve(null)
                    } else {
                        synthesizer.close();
                        synthesizer = null;
                        console.error("Speech synthesis canceled, " + result.errorDetails +
                            "\nDid you set the speech resource key and region values?");
                        reject(result.errorDetails)
                    }
                },
                function (err) {
                    console.trace("err - " + err);
                    synthesizer.close();
                    synthesizer = null;
                    reject(err)
                });


        })
    }
}

