import { env } from "process";
import { TTSItem, TTSOptions, TTSProviderBase } from "./tts_provider.ts";
import { SpeechConfig, AudioConfig, SpeechSynthesizer, ResultReason, SpeechSynthesisOutputFormat } from "microsoft-cognitiveservices-speech-sdk";
export default function main(ttsOptions: TTSOptions) {

    return new EnconvoMicrosoftTTSProvider({ ttsOptions })

}
import Cache from "file-system-cache";
import { homedir } from "os";

const cache = Cache({
    basePath: `${homedir}/Library/Caches/com.frostyeve.enconvo/token`, // (optional) Path where cache files are stored (default).
    ns: "token-namespace",   // (optional) A grouping namespace for items.
    hash: "sha1"         // (optional) A hashing algorithm used within the cache key.
});

export class EnconvoMicrosoftTTSProvider extends TTSProviderBase {

    async getToken(): Promise<{ token: string, region: string }> {
        // 本地缓存中寻找
        const token = cache.getSync("azureSpeechToken", "") as string
        if (token && token.length > 0) {
            console.log("get token from cache")
            const region = cache.getSync("azureSpeechRegion", "") as string
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
        cache.setSync("azureSpeechToken", data.token, 10 * 59)
        cache.setSync("azureSpeechRegion", data.region, 10 * 60)

        return { token: data.token, region: data.region }
    }


    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string }): Promise<TTSItem> {

        await this.ttsSpeak(text, audioFilePath)
        return {
            path: audioFilePath,
            text: text
        }
    }


    ttsSpeak(text: string, audioFilePath: string) {
        return new Promise(async (resolve, reject) => {

            const { token, region } = await this.getToken()
            console.log("token", token, "region", region)

            const speechConfig = SpeechConfig.fromAuthorizationToken(token, region);
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
