# My AI Chat App

A pet-project built with Expo and Supabase that combines chat, AI text generation, and image generation in a single mobile experience.

[!img](https://ibb.co/JRxzp7bH)

## Features

- Authentication with Supabase Auth
- Persisted chat sessions synced between local storage and Supabase
- AI-powered chat responses using a text model
- Image generation support for visual prompts
- Share generated images from the chat interface
- Dark mode support with theme toggling
- Custom JetBrains Mono font styling across the app

## Architecture

- **Expo / React Native** for the mobile app UI
- **Supabase** for user auth, chat conversation storage, and message persistence
- **AsyncStorage** for local cache and offline-first behavior
- **NativeWind** for Tailwind-style styling in React Native
- **Gemini API Key** for generating responses and images

## Project Structure

- `App.tsx` – app entry point and global font loading
- `AppNavigator.tsx` – navigation stack and drawer setup
- `pages/` – main screens including `ChatScreen`, `Home`, `LogIn`, and `Register`
- `components/` – reusable UI pieces like `ThemeToggle` and `ShareImageButton`
- `services/` – API and storage logic for AI and chat persistence
- `data/supabase.ts` – Supabase client configuration

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the Expo app:
   ```bash
   npm run start
   ```
3. Open in Expo Go or run on an emulator/device.

## Notes

- Make sure Supabase is configured with the correct URL and public key in `data/supabase.ts`
- Supabase tables include `conversations` and `messages` for chat syncing
- RLS policies should allow authenticated users to insert/select their own conversations and messages

## License

This is a personal pet-project. Feel free to modify and extend it for learning or experimentation.
