import { env } from "process";
import { TTSItem, TTSOptions, TTSProvider } from "./tts_provider.ts";
import { SpeechConfig, AudioConfig, SpeechSynthesizer, ResultReason, SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";
export default function main(ttsOptions: TTSOptions) {

    return new EnconvoMicrosoftTTSProvider({ ttsOptions })

}
import { ProsodyOptions, MsEdgeTTS } from "msedge-tts";
import { cache } from "./util/cache.ts";
import { VOICE_LANG_REGEX } from "./ssml.ts";



export class EnconvoMicrosoftTTSProvider extends TTSProvider {



    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string }): Promise<TTSItem> {

        await this.ttsSpeak(text, audioFilePath)
        return {
            path: audioFilePath,
            text: text
        }
    }


    ttsSpeak(text: string, audioFilePath: string) {
        return new Promise(async (resolve, reject) => {

            try {

                const { token, region } = await this.getToken()
                console.log("token", token, "region", region)

                const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
                const audioConfig = AudioConfig.fromAudioFileOutput(audioFilePath);

                // mp3
                speechConfig.speechSynthesisOutputFormat = SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3

                // The language of the voice that speaks.
                speechConfig.speechSynthesisVoiceName = this.options.voice.value;

                // Create the speech synthesizer.
                var synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

                const ssml = this._SSMLTemplate(text, this.options.voice.value, { rate: this.options.speed?.value })


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





    _SSMLTemplate(input: string, voice: string, options: ProsodyOptions = {}): string {
        // in case future updates to the edge API block these elements, we'll be concatenating strings.
        options = { ...new ProsodyOptions(), ...options }

        const voiceLangMatch = VOICE_LANG_REGEX.exec(voice)
        if (!voiceLangMatch) throw new Error("Could not infer voiceLocale from voiceName, and no voiceLocale was specified!")
        const voiceLocale = voiceLangMatch[0]

        console.log("options", options)
        return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${voiceLocale}">
                <voice name="${voice}">
                    <prosody pitch="${options.pitch}" rate="${options.rate}" volume="${options.volume}">
                        ${input}
                    </prosody> 
                </voice>
            </speak>`
    }

}

