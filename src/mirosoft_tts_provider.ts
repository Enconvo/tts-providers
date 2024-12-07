import { _SSMLTemplate } from "./ssml.ts";
import { TTSItem, TTSOptions, TTSProvider } from "./tts_provider.ts";
import { SpeechConfig, AudioConfig, SpeechSynthesizer, ResultReason, SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";
export default function main(ttsOptions: TTSOptions) {

    return new MicrosoftTTSProvider({ ttsOptions })

}


export class MicrosoftTTSProvider extends TTSProvider {

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
            const speechConfig = SpeechConfig.fromSubscription(this.options.resource_key, this.options.region.value);
            const audioConfig = AudioConfig.fromAudioFileOutput(audioFilePath);
            // mp3
            speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

            // The language of the voice that speaks.
            speechConfig.speechSynthesisVoiceName = this.options.voice.value;

            // Create the speech synthesizer.
            var synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

            const ssml = _SSMLTemplate(text, this.options.voice.value, { rate: this.options.speed?.value })

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

