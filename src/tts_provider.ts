import path from "path";
import fs from "fs"
import { homedir } from "os";
import { MD5Util } from "./util/md5.ts";

export interface TTSItem {
    text: string;
    path?: string;
}

export type TTSOptions = {
    voice: string;
    [key: string]: any;
};


export abstract class TTSProviderBase {
    protected ttsOptions: TTSOptions;

    constructor(fields: { ttsOptions: TTSOptions }) {
        this.ttsOptions = fields.ttsOptions
    }

    protected abstract _speak({ text, audioFilePath }: { text: string; audioFilePath: string; }): Promise<TTSItem>;

    async speak(text: string, format: 'mp3' | string = 'mp3', customVoicePath?: string): Promise<TTSItem> {
        const textMD5 = MD5Util.getMd5(text)
        // import at the top of the file

        const commandName = this.ttsOptions.commandName || this.ttsOptions.originCommandName
        const extensionName = "tts"

        const cachePath = fs.existsSync(path.join(homedir(), `Library/Caches/com.frostyeve.enconvo/cache/${extensionName}/${commandName}/`)) ? path.join(homedir(), `Library/Caches/com.frostyeve.enconvo/cache/${extensionName}/${commandName}/`) : (fs.mkdirSync(path.join(homedir(), `Library/Caches/com.frostyeve.enconvo/cache/${extensionName}/${commandName}/`), { recursive: true }) ? path.join(homedir(), `Library/Caches/com.frostyeve.enconvo/cache/${extensionName}/${commandName}/`) : "")
        let outputDir = `${cachePath}/tts/${commandName}/${customVoicePath ? customVoicePath : this.ttsOptions.voice}_${this.ttsOptions.modelName ? this.ttsOptions.modelName : "default"}_${this.ttsOptions.style ? this.ttsOptions.style : "default"}/`

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const audioFilePath = path.join(outputDir, `${textMD5}.${format}`);

        if (fs.existsSync(audioFilePath)) {
            // get absolute path
            return {
                path: audioFilePath,
                text: text
            }
        }

        async function executeSpeak(provider: TTSProviderBase, text: string, audioFilePath: string, retry: number) {
            try {
                const result = await provider._speak({ text, audioFilePath });
                return result;
            } catch (error) {
                console.log("error", error)
                if (retry < 3) {
                    return await executeSpeak(provider, text, audioFilePath, retry + 1)
                }
                return {
                    path: "",
                    text: text
                }
            }
        }

        return await executeSpeak(this, text, audioFilePath, 0)

    }
}

