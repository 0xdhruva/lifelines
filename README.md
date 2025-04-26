# Lifelines: AI Palm Reading App

## Overview

Lifelines is a web application that allows users to upload photos of their palms (left and right hands) and receive an AI-generated palm reading using the OpenAI Vision API. The app provides an entertaining and engaging palm reading experience without requiring the physical presence of a palm reader.

## Features

- Upload interface for left and right palm images
- Image preview before submission
- AI-powered palm reading generation
- Responsive design for mobile and desktop
- Beautiful, intuitive user interface

## Technology Stack

- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Backend**: Next.js API routes
- **AI Integration**: OpenAI GPT-4 Vision API
- **Image Handling**: react-dropzone

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- OpenAI API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file in the root directory and add your OpenAI API key:

```
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Deployment

### Deploy on Vercel

The easiest way to deploy this Next.js app is to use the [Vercel Platform](https://vercel.com/new).

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Add your OpenAI API key as an environment variable
4. Deploy

### Deploy on Netlify

You can also deploy on Netlify:

1. Push your code to a GitHub repository
2. Import the project in Netlify
3. Add your OpenAI API key as an environment variable
4. Deploy

## Usage

1. Visit the application in your browser
2. Upload images of your left and right palms
3. Click "Get My Palm Reading"
4. View your personalized AI-generated palm reading
5. Click "Get Another Reading" to start over

## Project Structure

- `src/app/page.tsx`: Main application UI
- `src/app/api/palm-reading/route.ts`: API endpoint for palm reading generation

## License

This project is licensed under the MIT License.
