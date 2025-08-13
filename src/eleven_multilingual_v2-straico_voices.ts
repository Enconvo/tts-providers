import { ListCache, RequestOptions } from "@enconvo/api";


async function fetchModels(options: RequestOptions): Promise<ListCache.ListItem[]> {
  // Extract API key from credentials
  const apiKey = options.credentials?.apiKey;

  // Validate API key presence
  if (!apiKey) {
    console.error('API key is required for Straico API');
    return [];
  }

  try {
    // Make API request to Straico ElevenLabs voices endpoint
    const response = await fetch('https://api.straico.com/v1/tts/elevenlabslist', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    // Check if response is successful
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    // Parse JSON response
    const data = await response.json();

    // Transform the response data to match ListItem format with labels included in title
    const voices = data.data.voices.map((voice: any) => {
      // Extract voice name
      const name = voice.name || voice.display_name || voice.id;

      // Build title with labels information
      let title = name;

      // Add labels information to title if available
      if (voice.labels) {
        const labelParts = [];

        // Add gender if available
        if (voice.labels.gender) {
          labelParts.push(voice.labels.gender);
        }

        // Add age if available
        if (voice.labels.age) {
          labelParts.push(voice.labels.age);
        }

        // Add accent if available
        if (voice.labels.accent) {
          labelParts.push(voice.labels.accent);
        }

        // Add descriptive if available
        if (voice.labels.descriptive) {
          labelParts.push(voice.labels.descriptive);
        }

        // Add language if available
        if (voice.labels.language) {
          labelParts.push(voice.labels.language);
        }

        // Add use_case if available
        if (voice.labels.use_case) {
          labelParts.push(voice.labels.use_case.replace(/_/g, ' '));
        }

        // Combine name with labels
        if (labelParts.length > 0) {
          title = `${name} (${labelParts.join(', ')})`;
        }
      }

      return {
        title: title,
        value: voice.voice_id || voice.id
      };
    });

    return voices;

  } catch (error) {
    // Log error and return empty array
    console.error('Error fetching Straico ElevenLabs voices:', error);
    return [];
  }
}



export default async function main(req: Request): Promise<string> {
  const options = await req.json()

  const modelCache = new ListCache(fetchModels)

  const models = await modelCache.getList(options)
  return JSON.stringify(models)
}
