import { TTSProvider } from "@enconvo/api";
import { exec } from "child_process";

import { promisify } from "util";

export default function main(options: TTSProvider.TTSOptions) {
    return new SystemTTSProvider({ options })

}

export class SystemTTSProvider extends TTSProvider {

    protected async _toFile({ text, audioFilePath, voice }: TTSProvider._ToFileTTSParams): Promise<TTSProvider.TTSItem> {

        console.log("speak", audioFilePath)

        const execSync = promisify(exec)
        const voice_param = voice || this.options.voice.value === 'default' ? '' : `-v ${voice || this.options.voice.value}`

        await execSync(`say '${text}' ${voice_param} -r ${(this.options.speed?.value || 1.2) * 100} -o ${audioFilePath}`);

        return {
            path: audioFilePath,
            text: text
        }
    }
}