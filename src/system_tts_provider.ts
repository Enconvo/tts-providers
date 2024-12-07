import { exec } from "child_process";
import { TTSItem, TTSOptions, TTSProvider } from "./tts_provider.ts";
import { promisify } from "util";

export default function main(ttsOptions: TTSOptions) {
    return new SystemTTSProvider({ ttsOptions })

}

export class SystemTTSProvider extends TTSProvider {

    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string }): Promise<TTSItem> {

        console.log("speak", audioFilePath)

        const execSync = promisify(exec)
        const voice = this.options.voice.value === 'default' ? '' : `-v ${this.options.voice.value}`

        await execSync(`say '${text}' ${voice} -r ${(this.options.speed?.value || 1.2) * 100} -o ${audioFilePath}`);

        return {
            path: audioFilePath,
            text: text
        }
    }
}