import { environment } from "@enconvo/api";
import fs from 'fs'

import { voices } from './util/edge_voices_list.ts'

async function fetch_model() {

    let models: any[] = []
    try {
        models = voices.map((item) => {

            const reg = /\(([^)]*)\)/
            const match = reg.exec(item.voiceURI)
            if (match && match.length > 1) {
                const tmpValue = match[1]
                const value = tmpValue.split(",").map((item) => item.trim()).join("-")
                return {
                    "title": `${item.name.replaceAll('Microsoft ', '')}`,
                    "value": `${value}`
                }
            } else {
                return {
                    "title": `${item.name.replaceAll('Microsoft ', '')}`,
                    "value": `${item.voiceURI}`
                }
            }
        })
        models.sort((a, b) => {
            return a.title.localeCompare(b.title)
        })
    } catch (err) {
        console.log(err)
    }

    return models
}

export default async function main(req: Request) {
    const { options: { text } } = await req.json()

    const modelCacheDir = environment.assetsPath + `/models`
    if (!fs.existsSync(modelCacheDir)) {
        fs.mkdirSync(modelCacheDir, { recursive: true })
    }
    const modelCachePath = `${modelCacheDir}/${environment.commandName}.json`

    console.log('text', text, modelCachePath)
    fs.existsSync(modelCachePath) || fs.writeFileSync(modelCachePath, '[]')

    const modelContent = fs.readFileSync(modelCachePath, 'utf8')
    let models = JSON.parse(modelContent)

    try {
        if (text === 'refresh' || models.length === 0) {
            models = await fetch_model()
            fs.writeFileSync(modelCachePath, JSON.stringify(models))
        }
    } catch (err) {
        console.log(err)
    }

    return JSON.stringify(models)
}



