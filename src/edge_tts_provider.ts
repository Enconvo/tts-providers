import { EdgeTTS } from "node-edge-tts";
import { TTSItem, TTSOptions, TTSProviderBase } from "./tts_provider.ts";

export default function main(ttsOptions: TTSOptions) {

    console.log("init")
    return new EdgeTTSProvider({ ttsOptions })

}

export class EdgeTTSProvider extends TTSProviderBase {

    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string }): Promise<TTSItem> {

        const tts = new EdgeTTS()
        await tts.ttsPromise(text, audioFilePath)
        return {
            path: audioFilePath,
            text: text
        }
    }
}