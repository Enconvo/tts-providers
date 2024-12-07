import path from "path";
import fs from "fs"
import { homedir } from "os";
import { MD5Util } from "./util/md5.ts";
import { RATE } from "msedge-tts";

export interface TTSItem {
    text: string;
    path?: string;
}

export type TTSOptions = {
    voice: {
        value: string;
    };
    speed?: {
        value: RATE | string | number;
    };
    format?: string;
    [key: string]: any;
};


export abstract class TTSProvider {
    protected options: TTSOptions;

    constructor(fields: { ttsOptions: TTSOptions }) {
        this.options = fields.ttsOptions
    }

    protected abstract _speak({ text, audioFilePath }: { text: string; audioFilePath: string; }): Promise<TTSItem>;

    async speak(text: string): Promise<TTSItem> {
        const textMD5 = MD5Util.getMd5(text)
        // import at the top of the file

        const commandName = this.options.commandName || this.options.originCommandName
        const extensionName = "tts"

        const cachePath = fs.existsSync(path.join(homedir(), `Library/Caches/com.frostyeve.enconvo/cache/${extensionName}/${commandName}/`)) ? path.join(homedir(), `Library/Caches/com.frostyeve.enconvo/cache/${extensionName}/${commandName}/`) : (fs.mkdirSync(path.join(homedir(), `Library/Caches/com.frostyeve.enconvo/cache/${extensionName}/${commandName}/`), { recursive: true }) ? path.join(homedir(), `Library/Caches/com.frostyeve.enconvo/cache/${extensionName}/${commandName}/`) : "")
        const optionName = MD5Util.getMd5(JSON.stringify(this.options))
        let outputDir = `${cachePath}/tts/${commandName}/${optionName}/`

        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        const audioFilePath = path.join(outputDir, `${textMD5}.${this.options.format || "mp3"}`);

        if (fs.existsSync(audioFilePath)) {
            // get absolute path
            return {
                path: audioFilePath,
                text: text
            }
        }

        async function executeSpeak(provider: TTSProvider, text: string, audioFilePath: string, retry: number) {
            try {
                const result = await provider._speak({ text, audioFilePath });
                return result;
            } catch (error) {
                console.log("error", error)
                await new Promise(resolve => setTimeout(resolve, 1000));
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

