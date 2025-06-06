import { DropdownListCache } from "@enconvo/api"



/**
 * Fetches models from the API and transforms them into ModelOutput format
 * @param url - API endpoint URL
 * @param api_key - API authentication key
 * @returns Promise<ModelOutput[]> - Array of processed model data
 */
async function fetchModels(url?: string, api_key?: string, type?: string): Promise<DropdownListCache.ModelOutput[]> {
    // Initialize empty array to store models
    let models: DropdownListCache.ModelOutput[] = []

    try {
        // Determine which API endpoint to use based on the type
        const endpoint = `${url}/get_voice`

        // Make API request to ElevenLabs API
        const resp = await fetch(endpoint, {
            method: 'POST',
            headers: {
                // Use ElevenLabs specific header format
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "voice_type": "all"
            })
        })

        // Check if response is not successful
        if (!resp.ok) {
            throw new Error(`API request failed with status ${resp.status}`)
        }

        // Parse JSON response
        const data = await resp.json()

        // Process different response formats based on the endpoint type
        // Map the ElevenLabs voices format to our required format
        const system_voices = data.system_voice.map((model: any) => {
            // Create a detailed title with voice characteristics
            return {
                title: `${model.voice_name} (${model.voice_id})`,
                value: model['voice_id']
            }
        })

        const voice_cloning = data.voice_cloning.map((model: any) => {
            // Create a detailed title with voice characteristics
            return {
                title: `${model.voice_name} (${model.voice_id})`,
                value: model['voice_id']
            }
        })

        const models = [...system_voices, ...voice_cloning]
        models.push({
            title: "Multilingual_MaturePartner",
            value: "English_MaturePartner"
        })
        // sort by title
        models.sort((a: any, b: any) => a.title.localeCompare(b.title))
        return models
    } catch (error) {
        // Log any errors that occur during fetching
        console.error('Error fetching ElevenLabs data:', error)
        // Return empty array if there's an error
        return []
    }
}

/**
 * Main handler function for the API endpoint
 * @param req - Request object containing options
 * @returns Promise<string> - JSON string of model data
 */
export default async function main(req: Request): Promise<string> {
    const options = await req.json()
    const credentials = options.credentials
    options.api_key = credentials.apiKey
    options.url = credentials.baseUrl

    const modelCache = new DropdownListCache(fetchModels)

    const models = await modelCache.getModelsCache(options)
    return JSON.stringify(models)
}
