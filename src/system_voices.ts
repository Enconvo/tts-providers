import { exec } from 'child_process'
import { promisify } from 'util'

interface ModelOutput {
    title: string           // Display name of the model
    value: string          // Model ID
}

async function fetchVoices(): Promise<ModelOutput[]> {
    try {
        const execAsync = promisify(exec)
        const { stdout } = await execAsync('say --voice="?"')

        const voices = stdout.split('\n')
            .filter(line => line.trim().length > 0)
            .map(line => {
                // Match name (including those with parentheses) and language code
                const match = line.match(/^(.+?)\s+([a-z]{2}_[A-Z]{2})\s+#/)
                if (!match) return null

                const [_, name, langCode] = match
                const trimmedName = name.trim()

                return {
                    title: `${trimmedName} (${langCode})`,
                    value: trimmedName
                }
            })
            .filter((voice): voice is ModelOutput => voice !== null)

        voices.unshift({
            title: 'Default',
            value: 'default'
        })
        return voices
    } catch (error) {
        console.error('Error fetching system voices:', error)
        return [{
            title: 'Default',
            value: 'default'
        }]
    }
}

/**
 * Main handler function for the API endpoint
 * @param req - Request object containing options
 * @returns Promise<string> - JSON string of model data
 */
export default async function main(req: Request): Promise<string> {
    const models = await fetchVoices()
    return JSON.stringify(models)
}
