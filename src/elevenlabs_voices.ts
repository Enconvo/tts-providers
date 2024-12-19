import { environment } from "@enconvo/api";
import fs from 'fs'


async function fetch_model(apiKey: string) {

    let models: any[] = []
    try {
        const resp = await fetch('https://api.elevenlabs.io/v1/voices', {
            headers: {
                'xi-api-key': `${apiKey}`,
                'Content-Type': 'application/json'
            }
        })
        let json = await resp.json()
        return json['voices'].map((model: any) => {
            return {
                title: `${model['name']} - ${model.labels.gender} - ${model.labels.accent} - ${model.labels.description}- ${model.labels.age}- ${model.labels['use case']}`,
                value: model['voice_id']
            }
        })

    } catch (err) {
        console.log(err)
    }

    return models
}

export default async function main(req: Request) {
    const options = await req.json()
    const { text, api_key } = options

    const modelCacheDir = environment.assetsPath + `/models`
    if (!fs.existsSync(modelCacheDir)) {
        fs.mkdirSync(modelCacheDir, { recursive: true })
    }
    const modelCachePath = `${modelCacheDir}/${environment.commandName}.json`

    fs.existsSync(modelCachePath) || fs.writeFileSync(modelCachePath, '[]')

    const modelContent = fs.readFileSync(modelCachePath, 'utf8')
    let models = JSON.parse(modelContent)

    try {
        if (text === 'refresh' || models.length === 0) {
            models = await fetch_model(api_key)
            fs.writeFileSync(modelCachePath, JSON.stringify(models))
        }
    } catch (err) {
        console.log(err)
    }

    return JSON.stringify(models)
}



