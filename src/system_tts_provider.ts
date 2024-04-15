import { exec } from "child_process";
import { TTSItem, TTSOptions, TTSProviderBase } from "./tts_provider.ts";
import { promisify } from "util";
export default function main(ttsOptions: TTSOptions) {

    console.log("init")
    return new SystemTTSProvider({ ttsOptions })

}

export class SystemTTSProvider extends TTSProviderBase {

    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string }): Promise<TTSItem> {

        try {

            console.log("speak", audioFilePath)

            const execSync = promisify(exec)
            await execSync(`say '${text}' -o ${audioFilePath}`);

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