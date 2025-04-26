import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    // System information
    const nodeVersion = process.version;
    const environment = process.env.NODE_ENV || 'unknown';
    const debug = process.env.DEBUG || 'false';
    
    // Check if OpenAI API key is configured
    const hasOpenAIKey = !!process.env.OPENAI_API_KEY;
    const openAIKeyLength = process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0;
    
    // Check OpenAI client initialization
    let openAIClientStatus = 'unknown';
    try {
      if (hasOpenAIKey) {
        const openai = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        openAIClientStatus = 'initialized';
      } else {
        openAIClientStatus = 'missing API key';
      }
    } catch (error) {
      openAIClientStatus = `error: ${error instanceof Error ? error.message : String(error)}`;
    }
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: {
        nodeVersion,
        environment,
        debug,
      },
      openai: {
        hasKey: hasOpenAIKey,
        keyLength: openAIKeyLength,
        clientStatus: openAIClientStatus,
      },
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
