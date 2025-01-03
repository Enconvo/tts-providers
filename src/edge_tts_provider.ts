import { TTSProvider } from "@enconvo/api";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
export default function main(options: TTSProvider.TTSOptions) {

    console.log("init")
    return new EdgeTTSProvider({ options })

}

export class EdgeTTSProvider extends TTSProvider {

    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string }): Promise<TTSProvider.TTSItem> {

        try {

            const tts = new MsEdgeTTS();
            await tts.setMetadata(this.options.voice.value, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
            await tts.toFile(audioFilePath, text, { rate: this.options.speed?.value });

            return {
                path: audioFilePath,
                text: text
            }
        } catch (error) {
            return {
                path: "",
                text: text
            }
        }
    }
}