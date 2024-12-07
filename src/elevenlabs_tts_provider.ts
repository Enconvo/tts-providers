import { TTSItem, TTSOptions, TTSProvider } from "./tts_provider.ts";
import axios from "axios";
import { writeFile } from "fs";
import { promisify } from "util";

/**
 * 
     {
      "name": "elevenlabs_tts_provider",
      "title": "ElevenLabs TTS",
      "description": "ElevenLabs TTS Provider that allows you to use OpenAI's online text-to-speech service",
      "icon": "elevenlabs.png",
      "mode": "llm",
      "preferences": [
        {
          "name": "api_key",
          "description": "Api Key",
          "type": "password",
          "required": false,
          "title": "Api Key",
          "default": "",
          "placeholder": "ElevenLabs Api Key"
        },
        {
          "name": "baseUrl",
          "description": "ElevenLabs api base url",
          "type": "textfield",
          "required": false,
          "title": "ElevenLabs Api Base Url",
          "default": "https://api.elevenlabs.io/v1",
          "placeholder": "ElevenLabs Api Base Url"
        },
        {
          "name": "modelName",
          "description": "The model to TTS.",
          "type": "dropdown",
          "required": false,
          "title": "Model Name",
          "default": "eleven_multilingual_v2",
          "data": [
            {
              "title": "Eleven Multilingual v2",
              "value": "eleven_multilingual_v2"
            }
          ],
          "dataProxy": "tts_providers|elevenlabs_models"
        },
        {
          "name": "voice",
          "description": "The voice to TTS.",
          "type": "dropdown",
          "required": false,
          "title": "Voice",
          "default": "21m00Tcm4TlvDq8ikWAM",
          "data": [
            {
              "title": "Rachel - female - american - calm- young- narration",
              "value": "21m00Tcm4TlvDq8ikWAM"
            }
          ],
          "dataProxy": "tts_providers|elevenlabs_voices"
        }
      ]
    },
 */
export default function main(ttsOptions: TTSOptions) {

    return new EventLabsTTSProvider({ ttsOptions })
}

export class EventLabsTTSProvider extends TTSProvider {

    protected async _speak({ text, audioFilePath }: { text: string; audioFilePath: string }): Promise<TTSItem> {

        const writeFileAsync = promisify(writeFile);

        const options = this.options

        const data = {
            "text": text,
            "model_id": options.modelName.value,
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }

        const ttsUrl = `${options.baseUrl}/text-to-speech/${options.voice.value}`

        const response = await axios.post(ttsUrl, data, {
            headers: {
                'xi-api-key': `${options.api_key}`,
                'Content-Type': 'application/json'
            },
            responseType: 'arraybuffer'
        });

        const buffer = Buffer.from(response.data);

        await writeFileAsync(audioFilePath, buffer);
        return {
            path: audioFilePath,
            text: text
        }
    }
}