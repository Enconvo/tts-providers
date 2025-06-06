# TTS Providers

![Version](https://img.shields.io/badge/version-0.0.17-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Category](https://img.shields.io/badge/category-Provider-orange)

## What is this?

This is an Enconvo Extension that provides multiple Text-to-Speech (TTS) services, allowing you to convert text to natural-sounding speech using various providers.

## Features

- **Edge TTS**: Microsoft Edge's online text-to-speech service
- **Enconvo Cloud Plan (Microsoft TTS)**: Microsoft Azure's TTS service through Enconvo Cloud
- **OpenAI TTS**: OpenAI's text-to-speech service
- **Google Voices**: Access to Google's voice library

## Installation

Visit our store to install: https://store.enconvo.com/plugins/tts

## Usage

### Edge TTS
- Customizable voice selection (default: en-US-EmmaMultilingualNeural)
- Adjustable speech speed (default: 1.2)

### Microsoft TTS (Enconvo Cloud Plan)
- Access to Microsoft Azure's professional TTS voices
- High-quality speech synthesis

### OpenAI TTS
- Integration with OpenAI's latest TTS technology
- Natural and expressive voice options

### Google Voices
- Comprehensive list of Google voice options
- Multiple language support

## Author

Created and maintained by EnconvoAI

## License

This project is licensed under the MIT License - see the LICENSE file for details.




    ```json
    {
      "name": "google_tts_provider",
      "title": "Google TTS",
      "description": "Google TTS Provider that allows you to use [Google's online text-to-speech](https://cloud.google.com/text-to-speech/) service",
      "icon": "google.png",
      "commandType": "provider",
      "preferences": [
        {
          "name": "apiKey",
          "description": "Google api key",
          "type": "password",
          "required": false,
          "title": "Google Api Key",
          "default": "",
          "defaultProxy": "credentials|google",
          "placeholder": "AI*****"
        },
        {
          "name": "voice",
          "description": "The voice to TTS.",
          "type": "dropdown",
          "required": false,
          "title": "Voice",
          "default": "en-US-Journey-D",
          "dataProxy": "tts_providers|google_voices"
        },
        {
          "name": "speed",
          "title": "Speech Speed",
          "description": "The speed to TTS.",
          "type": "dropdown",
          "required": false,
          "dataProxy": "tts_providers|voice_speed_list",
          "default": "1.2"
        }
      ]
    }
    ```