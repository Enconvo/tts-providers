import { TTSProvider } from "@enconvo/api";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
export default function main(options: TTSProvider.TTSOptions) {
    return new EdgeTTSProvider({ options })

}

export class EdgeTTSProvider extends TTSProvider {

    protected async _toFile({ text, audioFilePath, speed, voice }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {

        try {
            const tts = new MsEdgeTTS();
            await tts.setMetadata(voice || this.options.voice.value, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
            await tts.toFile(audioFilePath, text, { rate: speed || this.options.speed?.value });

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