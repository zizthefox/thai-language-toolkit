# Thai Language Toolkit

Practice Thai conversation with AI-powered scenarios. Get real-time corrections, hear native pronunciation, and build confidence speaking Thai.

## Features

- **Conversation Practice**: Practice real-world scenarios (restaurant, market, taxi, cafe)
- **Thai + Romanization + English**: Every response shows all three formats
- **Text-to-Speech**: Hear natural Thai pronunciation with native Thai voices (Edge TTS - free!)
- **Real-time Corrections**: Get gentle feedback on your Thai mistakes
- **Suggested Responses**: Learn what to say next (with romanization!)

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your API key to .env.local
```

### Environment Variables

```env
OPENAI_API_KEY=sk-your-openai-api-key
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to start practicing!

### Production Build

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push to GitHub
2. Import to Vercel
3. Add `OPENAI_API_KEY` environment variable in Vercel dashboard
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Tech Stack

- **Next.js 16** - React framework
- **Tailwind CSS** - Styling
- **OpenAI GPT-4o-mini** - Conversation AI
- **Edge TTS** - Native Thai voices (Premwadee, Achara, Niwat) - free!
- **Vercel AI SDK** - Streaming responses

## License

MIT
