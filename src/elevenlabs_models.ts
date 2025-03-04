import { DropdownListCache } from "@enconvo/api"



/**
 * Fetches models from the API and transforms them into ModelOutput format
 * @param url - API endpoint URL
 * @param api_key - API authentication key
 * @returns Promise<ModelOutput[]> - Array of processed model data
 */
async function fetchModels(url: string, api_key: string, type: string): Promise<DropdownListCache.ModelOutput[]> {
    // Initialize empty array to store models
    let models: DropdownListCache.ModelOutput[] = []

    try {
        // Make API request to ElevenLabs API
        const resp = await fetch('https://api.elevenlabs.io/v1/models', {
            headers: {
                // Use ElevenLabs specific header format
                'xi-api-key': `${api_key}`,
                'Content-Type': 'application/json'
            }
        })

        // Check if response is not successful
        if (!resp.ok) {
            throw new Error(`API request failed with status ${resp.status}`)
        }

        // Parse JSON response
        const data = await resp.json()

        // Map the ElevenLabs model format to our required format
        models = data.map((model: any) => {
            return {
                // Format title as model name
                title: `${model['name']}`,
                // Use model_id as the value
                value: model['model_id'],
            }
        })

        // Return the processed models
        return models

    } catch (error) {
        // Log any errors that occur during fetching
        console.error('Error fetching ElevenLabs models:', error)
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
    options.api_key = options.apiKey

    const modelCache = new DropdownListCache(fetchModels)

    const models = await modelCache.getModelsCache(options)
    const data = JSON.stringify(models)
    console.log(data)
    return data
}
