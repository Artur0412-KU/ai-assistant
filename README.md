# AI Assistant Mobile App

AI-powered mobile assistant built with React Native.  
The app supports intelligent conversations, image generation, authentication, and persistent chat history.

![img](<assets/Frame%201%20(1).png>)

## ✨ Features

- 🤖 AI chat assistant
- 🎨 AI image generation
- 🔐 User authentication
- 💬 Persistent chat history
- 📱 Modern mobile UI
- ⚡ Fast and responsive experience
- 🌙 Dark mode support
- 🔄 Real-time AI responses

---

## 📸 Screenshots

| Chat                                      | Image Generation                                    | History                                         |
| ----------------------------------------- | --------------------------------------------------- | ----------------------------------------------- |
| <img src="/assets/chat.png" width="80%" > | <img src="/assets/generate-image.png" width="65%" > | <img src="/assets/chats-list.png" width="70%" > |

---

## 🛠 Tech Stack

### Mobile

- React Native
- TypeScript
- Expo
- Nativewind

### Backend / Services

- Gemini API
- Firebase / Supabase (replace with your actual service)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Artur0412-KU/ai-assistant.git
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure enviroment variables

```bash
EXPO_PUBLIC_GEMINI_API_KEY = your_gemini_api_key
SUPABASE_URL = your_supabase_url
SUPABASE_PUBLISHABLE_KEY = your_supabase_publishable_key
```

### 4. Start the app

```bash
npx expo start
```

---

## 🧠 AI Features

### Chat Assistant

- Natural AI conversations
- Context-aware responses
- Multi-message conversations

### Image Generation

- Generate images from prompts
- Fast AI image rendering
- Mobile-friendly workflow

---

## 📂 Project Structure

```bash
src/
├── assets/           # Images, fonts, icons
├── components/       # Reusable UI components
│   └── Buttons/
├── contexts/         # React contexts
├── data/             # Static/local data
├── hooks/            # Custom React hooks
├── navigation/       # App navigation setup
├── pages/            # App screens/pages
├── services/
│   ├── ai/           # AI integrations
│   ├── chat/         # Chat logic/services
│   └── parse/        # Parsing utilities
├── utils/
│   └── auth/         # Authentication helpers
```

---

### 🔥 Future Improvements

- Voice assistant support
- AI memory
- Push notifications
- Profile settings
- Better prompt customization
- Multi-model support

### 👨‍💻 Author

Developed with ❤️ by Artur Prylutskiy

---

## License

This is a personal pet-project. Feel free to modify and extend it for learning or experimentation.
