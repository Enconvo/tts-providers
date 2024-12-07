import { ProsodyOptions } from "msedge-tts"

export const VOICE_LANG_REGEX = /\w{2}-\w{2}/

export const _SSMLTemplate = (input: string, voice: string, options: ProsodyOptions = {}): string => {
    // in case future updates to the edge API block these elements, we'll be concatenating strings.
    options = { ...new ProsodyOptions(), ...options }

    const voiceLangMatch = VOICE_LANG_REGEX.exec(voice)
    if (!voiceLangMatch) throw new Error("Could not infer voiceLocale from voiceName, and no voiceLocale was specified!")
    const voiceLocale = voiceLangMatch[0]

    console.log("options", options)
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${voiceLocale}">
            <voice name="${voice}">
                <prosody pitch="${options.pitch}" rate="${options.rate}" volume="${options.volume}">
                    ${input}
                </prosody> 
            </voice>
        </speak>`
}