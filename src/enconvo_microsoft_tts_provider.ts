import { env } from "process";

import { SpeechConfig, AudioConfig, SpeechSynthesizer, ResultReason, SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";
export default function main(options: TTSProvider.TTSOptions) {

    return new EnconvoMicrosoftTTSProvider({ options })

}

import { cache } from "./util/cache.ts";
import { _SSMLTemplate } from "./ssml.ts";
import { TTSProvider } from "@enconvo/api";

export class EnconvoMicrosoftTTSProvider extends TTSProvider {



    protected async _toFile({ text, audioFilePath, speed }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {

        await this.ttsToFile(text, audioFilePath, speed)
        return {
            path: audioFilePath,
            text: text
        }
    }


    ttsToFile(text: string, audioFilePath: string, speed?: number) {
        return new Promise(async (resolve, reject) => {

            try {
                const { token, region } = await this.getToken()

                const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
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

            } catch (e) {
                console.error(e)
                reject(e)
            }
        })
    }


    async getToken(): Promise<{ token: string, region: string }> {
        // 本地缓存中寻找
        const token = await cache.get("azureSpeechToken", "") as string
        if (token && token.length > 0) {
            console.log("get token from cache")
            const region = await cache.get("azureSpeechRegion", "") as string
            return { token, region }
        }

        // 本地缓存中没有，请求服务器获取
        const resp = await fetch("https://api.enconvo.com/azure/generateToken", {
            "method": "POST",
            "headers": {
                "Content-Type": "application/json",
                "accessToken": env['accessToken'] || ""
            }
        })

        if (resp.status !== 200) {
            throw new Error("Failed to get token")
        }

        const json = await resp.json()
        const data = json.data
        console.log("get token from server")

        // 缓存到本地,10分钟
        await cache.set("azureSpeechToken", data.token, 10 * 59)
        await cache.set("azureSpeechRegion", data.region, 10 * 60)

        return { token: data.token, region: data.region }
    }

}

