import { exec } from "child_process";
import { TTSItem, TTSOptions, TTSProvider } from "./tts_provider.ts";
import { promisify } from "util";
export default function main(ttsOptions: TTSOptions) {

    console.log("init")
    return new SystemTTSProvider({ ttsOptions })

}

/**
 * 
{
    "name": "system_tts_provider",
    "title": "System TTS",
    "description": "System TTS Provider that allows you to use Microsoft Edge's online text-to-speech service",
    "icon": "system.png",
    "mode": "llm",
    "preferences": [
    {
        "name": "format",
        "title": "Speech Voice",
        "description": "The voice to TTS.",
        "type": "hidden",
        "required": false,
        "default": "m4a"
    }
    ]
},
 */

export class SystemTTSProvider extends TTSProvider {

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