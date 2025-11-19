# AI Content Capture App

A modern, mobile-first Progressive Web App (PWA) designed for capturing and organizing user-generated content on the go. This application combines voice recording capabilities with AI-powered text enhancement to create a seamless content creation experience.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-19-blue)

## Features

### Voice Recording & Transcription
- Record audio directly from your device's microphone
- Automatic transcription using Whisper (Xenova)'s for Whisper API
- Base64 encoding for local storage persistence
- Play back recordings directly in the browser

### Text Input with AI Enhancement
- Full-featured text editor with AI-powered options
- **Improve**: Enhance clarity and grammar
- **Summarize**: Condense long-form content
- **Expand**: Develop ideas into detailed text
- AI integration using Ollama with OpenAI-compatible API

### Smart Organization
- Automatic AI-generated tags for every entry
- Powerful search functionality
- Filter by type (voice or text)
- Browse and manage all content in one place

### Progressive Web App
- Install to home screen on iOS and Android
- Offline capabilities
- Custom app icons
- Full-screen native-like experience

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui
- **AI SDK**: Vercel AI SDK v5
- **AI Provider**: Ollama (local) + Whisper (Xenova) (transcription)
- **Storage**: Browser localStorage

## Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- Ollama installed ([Download here](https://ollama.ai))
- ngrok installed for mobile testing ([Download here](https://ngrok.com))

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/ai-content-app.git
cd ai-content-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Ollama

```bash
# Install Ollama from https://ollama.ai

# Pull a model (choose one)
ollama pull llama3.2      # 3B parameters, fast
ollama pull llama3.1      # 8B parameters, more capable
ollama pull mistral       # 7B parameters, good balance

# Ollama will automatically start and run on http://localhost:11434
```

### 4. Configure Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Ollama Configuration (required)
OLLAMA_BASE_URL=http://localhost:11434/v1
OLLAMA_MODEL=llama3.2

```

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Mobile Testing with ngrok

Since mobile Safari requires HTTPS for microphone access, use ngrok for local testing:

### 1. Install ngrok

```bash
npm install -g ngrok
```

### 2. Start Your Dev Server

```bash
npm run dev
```

### 3. Create HTTPS Tunnel

In a new terminal:

```bash
ngrok http 3000
```

### 4. Access on Mobile

ngrok will provide an HTTPS URL like `https://abc123.ngrok.io`. Use this URL on your mobile device to test the app with full microphone access.

## Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `OLLAMA_BASE_URL` (your production Ollama endpoint)
   - `OLLAMA_MODEL`
4. Deploy

**Note**: For production, you'll need to host Ollama on a server accessible from your Vercel deployment, or use a cloud-hosted LLM service.

## Usage

### Creating Voice Entries

1. Click the **Voice** tab
2. Tap the microphone button to start recording
3. Speak your content
4. Tap stop when finished
5. The audio is automatically transcribed and saved

### Creating Text Entries

1. Click the **Text** tab
2. Type your content in the editor
3. Use AI enhancement options:
   - **Improve**: Refine grammar and clarity
   - **Summarize**: Create a concise version
   - **Expand**: Develop ideas further
4. Click **Save Entry**

### Browsing & Managing

1. Click the **Browse** tab
2. Search entries using the search bar
3. Filter by type (All, Voice, Text)
4. Click on entries to view details
5. Play voice recordings or delete entries

### Installing as PWA

#### On iOS (Safari):
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add"

#### On Android (Chrome):
1. Open the app in Chrome
2. Tap the three-dot menu
3. Select "Add to Home Screen"
4. Tap "Add"

## API Endpoints

### POST `/api/enhance`

Enhances text using Ollama with OpenAI-compatible API.

**Request Body:**
```json
{
  "text": "Your text here",
  "action": "improve" | "summarize" | "expand" | "tags"
}
```

**Response:**
```json
{
  "result": "Enhanced text"
}
```

### POST `/api/transcribe`

Transcribes audio using Whisper (Xenova).

**Request Body:**
- FormData with audio file

**Response:**
```json
{
  "transcript": {
    "text": "Transcribed text"
  }
}
```

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── enhance/route.ts      # Text enhancement endpoint
│   │   └── transcribe/route.ts   # Voice transcription endpoint
│   ├── globals.css               # Global styles & theme
│   ├── layout.tsx                # Root layout with metadata
│   └── page.tsx                  # Main app page
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── voice-recorder.tsx        # Voice recording interface
│   ├── text-editor.tsx           # Text input with AI options
│   └── entry-list.tsx            # Browse and manage entries
├── lib/
│   └── storage.ts                # localStorage utilities
├── public/
│   ├── manifest.json             # PWA manifest
│   └── *.png                     # App icons
└── README.md
```

## Configuration Options

### Ollama Models

You can switch models by changing the `OLLAMA_MODEL` environment variable:

- `llama3.2` - Fast, 3B parameters (default)
- `llama3.1` - More capable, 8B parameters
- `mistral` - Balanced, 7B parameters
- `phi3` - Efficient, 3.8B parameters
- `codellama` - Code-focused
- `gemma` - Google's lightweight model

Pull any model with: `ollama pull <model-name>`

### Voice Transcription Alternatives

Current implementation uses Whisper (Xenova). For a fully local solution:

1. **whisper.cpp**: Run Whisper locally with a REST API wrapper
2. **Web Speech API**: Browser-based (less accurate, but free)
3. **Disable voice**: Remove voice recording and focus on text only

## Troubleshooting

### "Your browser doesn't support audio recording"

- Ensure you're using HTTPS (use ngrok for local testing)
- Check microphone permissions in browser settings
- Try a different browser (Chrome, Safari, Firefox)

### Ollama connection errors

- Verify Ollama is running: `ollama list`
- Check the base URL in `.env.local`
- Ensure the model is pulled: `ollama pull llama3.2`

### Icons not showing on mobile

- Clear browser cache and reinstall the PWA
- Check that all icon files exist in `/public`
- Verify manifest.json references correct files

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- AI powered by [Ollama](https://ollama.ai) and [Whisper (Xenova)](https://huggingface.co/Xenova/whisper-tiny.en)
- Icons generated with v0

## Support

For issues and questions, please open an issue on GitHub.
