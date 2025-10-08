# VirtuFit

AI-powered virtual try-on for e-commerce — generate realistic previews of clothing on a user's photo using OpenAI (DALL·E 3), Google Gemini, Leonardo AI or Seedream 4.0.

## 🚀 Features

- Photo upload & validation (front-facing photos recommended)
- Drag & drop virtual try‑on from a catalog or cart
- Color and style adjustments with AI-aware rendering (drapes, shadows, textures)
- Support for multiple AI providers: OpenAI (DALL·E 3), Google Gemini, Leonardo AI, Seedream (via Replicate)
- Instant preview, download and share options
- Internationalization: English (en) & French (fr)
- Client-side settings UI to choose provider and supply API key (not stored server-side by default)

## 🛠 Tech Stack

- Framework: Next.js (App Router)
- Language: TypeScript
- Styling: Tailwind CSS with Shadcn/ui components
- AI integrations: Genkit flow + provider SDKs (openai, @google/genai, replicate) or REST
- Utilities: fetch / axios as needed
- Tooling: ESLint, Prettier, Husky (optional)

## ⚙️ Getting Started

### Prerequisites

- Node.js >= 20
- npm

### Local setup

1. Clone repository

   ```bash
   git clone <your-repo-url>
   cd virtufit.next
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create environment file

   ```bash
   cp .env.example .env.local
   ```

   Add provider API keys as needed (example variables):

   - OPENAI_API_KEY
   - GOOGLE_GENAI_API_KEY
   - SEEDREAM_4.0_API_KEY
   - LEONARDO_API_KEY

4. Run development server
   ```bash
   npm run dev
   ```

### Usage notes

- The settings dialog lets users pick a provider and provide an API key; keys are stored locally in the browser by design for this demo.
- For production, route provider calls through a secure server endpoint and avoid sending unmanaged API keys from the client.

## 🐳 Docker (optional)

Quick steps:

1. Build and run:
   ```bash
   docker build -t virtufit .
   docker run -p 3000:3000 --env-file .env.local virtufit
   ```
2. Or use docker-compose if provided.

## 📁 Project Layout

High-level structure:

- src/
  - ai/ — Genkit flows and AI adapters
  - components/ — UI & VirtuFit client components
  - hooks/ — custom hooks (useAISettings, etc.)
  - lib/ — utilities, translations
  - pages / app — Next.js routes and API endpoints

## 🔒 Security & Privacy

- Do not store user photos or API keys on public servers without user consent.
- Use server-side proxy endpoints for provider API calls in production.
- Follow GDPR and local privacy laws for image processing.
