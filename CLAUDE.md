# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build & Development
- `npm run build` or `enconvo` - Build the extension
- `npm run dev` or `enconvo --dev` - Run in development mode with hot reload

### Code Quality
- `npm run lint` - Run ESLint on src directory
- `npm run lint:fix` - Fix ESLint issues automatically  
- `npm run format` - Format all TypeScript files with Prettier
- `npm run format:check` - Check if files are properly formatted

### TypeScript
- TypeScript compilation is configured with strict mode
- No explicit test commands - verify changes work with `npm run build`

## Architecture Overview

This is an Enconvo extension that provides multiple Text-to-Speech (TTS) provider integrations. The architecture follows a provider pattern where each TTS service is implemented as a separate provider class extending the base `TTSProvider` from `@enconvo/api`.

### Core Components

1. **Provider Classes** (`src/*_tts_provider.ts`)
   - Each TTS service has its own provider class that extends `TTSProvider`
   - Implements the `_toFile()` method to handle text-to-speech conversion
   - Handles API authentication via credentials management

2. **Voice Data** (`src/*_voices.ts`)
   - Static voice lists for each provider
   - Defines available voices with their names and identifiers

3. **Configuration** (`package.json`)
   - Each provider is registered as a command with `commandType: "provider"`
   - Preferences define configurable options like voice, speed, and model
   - Support functions (voices lists) are registered as `function_command` type

### Provider Types

- **Cloud-based providers**: OpenAI, Google, Microsoft Azure, ElevenLabs, Speechify, MiniMax
- **Free providers**: Edge TTS (Microsoft Edge), System TTS (macOS `say` command)
- **Enconvo Cloud**: Microsoft and MiniMax via Enconvo's cloud infrastructure

### Key Patterns

- All providers use the same interface pattern with `_toFile()` method
- Credentials are managed through the Enconvo credentials system
- Voice lists are fetched dynamically or defined statically
- SSML support for Microsoft-based providers (`src/ssml.ts`)
- Caching utilities for performance optimization (`src/util/cache.ts`)

### Monorepo Structure

This is part of a pnpm workspace monorepo. The `msedge-tts` package is referenced as a workspace dependency.