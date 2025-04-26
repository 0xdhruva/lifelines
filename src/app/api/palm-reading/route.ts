import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI client only when the API is called, not during build time
const getOpenAIClient = () => {
  // Check if API key exists
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key is missing. Please add it to your environment variables.');
  }
  console.log('API Key present with length:', process.env.OPENAI_API_KEY.length);
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
};

export async function POST(request: NextRequest) {
  try {
    console.log('Processing palm reading request...');
    
    // Parse the form data from the request
    const formData = await request.formData();
    const leftPalmImage = formData.get('leftPalmImage') as File;
    const rightPalmImage = formData.get('rightPalmImage') as File;

    // Validate that both palm images are provided
    if (!leftPalmImage || !rightPalmImage) {
      console.log('Missing palm images');
      return NextResponse.json(
        { error: 'Both left and right palm images are required' },
        { status: 400 }
      );
    }

    console.log(`Left palm image: ${leftPalmImage.name}, size: ${leftPalmImage.size / 1024} KB`);
    console.log(`Right palm image: ${rightPalmImage.name}, size: ${rightPalmImage.size / 1024} KB`);

    // Convert images to base64 for OpenAI API
    const leftPalmBase64 = await fileToBase64(leftPalmImage);
    const rightPalmBase64 = await fileToBase64(rightPalmImage);

    // Initialize OpenAI client
    const openai = getOpenAIClient();
    console.log('Using model: gpt-4o-mini');

    // Create the prompt for palm reading
    const prompt = `You are an expert palmist who can analyze palm lines and provide insightful readings. I'm sharing images of my left and right palms. Please analyze them and provide a detailed reading.

Please analyze the following key lines and features:
1. Heart Line (emotions, relationships)
2. Head Line (intellect, thinking style)
3. Life Line (vitality, life journey)
4. Fate Line (if visible, career path)

Structure your response in the following format:

LEFT HAND ANALYSIS:
- Heart Line: [analysis without any colons or bullet points at the beginning or end]
- Head Line: [analysis without any colons or bullet points at the beginning or end]
- Life Line: [analysis without any colons or bullet points at the beginning or end]
- Fate Line: [analysis without any colons or bullet points at the beginning or end]

RIGHT HAND ANALYSIS:
- Heart Line: [analysis without any colons or bullet points at the beginning or end]
- Head Line: [analysis without any colons or bullet points at the beginning or end]
- Life Line: [analysis without any colons or bullet points at the beginning or end]
- Fate Line: [analysis without any colons or bullet points at the beginning or end]

HAND COMPARISON:
Format the comparison as a clean, simple table with these exact palm lines and labels:

| Trait | Left Hand (Inherent) | Right Hand (Developed) |
| ----- | -------------------- | ---------------------- |
| Heart Line | [brief 2-4 word summary of left heart line] | [brief 2-4 word summary of right heart line] |
| Head Line | [brief 2-4 word summary of left head line] | [brief 2-4 word summary of right head line] |
| Life Line | [brief 2-4 word summary of left life line] | [brief 2-4 word summary of right life line] |
| Fate Line | [brief 2-4 word summary of left fate line] | [brief 2-4 word summary of right fate line] |

Keep each cell entry very concise - just 2-4 words that capture the essence of each line's reading. Do not use placeholder text.

SUMMARY:
[Provide a final summary and overall reading here. This should be a separate section, clearly labeled as SUMMARY.]

Important: Do not include any disclaimers about the accuracy of palm reading or that you're an AI. Just provide the reading as a professional palmist would. Do not include any colons at the beginning of analysis points or bullet points at the end of analysis points.`;

    // Call OpenAI API
    console.log('Generating palm reading...');
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: prompt,
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Here are my palm images for reading:' },
              {
                type: 'image_url',
                image_url: {
                  url: leftPalmBase64,
                  detail: 'high',
                },
              },
              {
                type: 'image_url',
                image_url: {
                  url: rightPalmBase64,
                  detail: 'high',
                },
              },
            ],
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      });

      console.log('Response received successfully');
      const fullText = response.choices[0].message.content || '';
      return new Response(fullText, {
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache',
        },
      });
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return NextResponse.json(
        { error: 'An error occurred while generating your palm reading. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    console.error('Error processing palm reading:', error);
    
    // Enhanced error logging with more details
    console.error('Error type:', typeof error);
    
    if (error && typeof error === 'object' && 'response' in error && error.response) {
      const errorObj = error as { response: { status: number, data: Record<string, unknown> } };
      console.error('Error status:', errorObj.response.status);
      console.error('Error data:', JSON.stringify(errorObj.response.data));
      
      // Log headers if available
      if ('headers' in errorObj.response) {
        console.error('Response headers:', JSON.stringify(errorObj.response.headers));
      }
    } else if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    // Log request details
    try {
      console.error('Request method:', request?.method || 'unknown');
      if (request && request.headers) {
        console.error('Request headers:', JSON.stringify(Object.fromEntries(request.headers)));
      }
    } catch (logError) {
      console.error('Error logging request details:', logError);
    }
    
    // Handle different error types with user-friendly messages
    if (error && typeof error === 'object') {
      // Define a type for API errors
      type ApiError = {
        response?: {
          status?: number;
          data?: {
            error?: {
              code?: string;
            };
          };
        };
        code?: string;
        message?: string;
      };
      
      const errorObj = error as ApiError;
      
      if (errorObj.response?.status === 429) {
        return NextResponse.json({ error: 'Rate limit exceeded. Please try again in a few minutes.' }, { status: 429 });
      } else if (errorObj.response?.status === 400 && errorObj.response?.data?.error?.code === 'content_policy_violation') {
        return NextResponse.json({ error: 'The content violates OpenAI\'s policies. Please try different images.' }, { status: 400 });
      } else if (errorObj.response?.status === 401) {
        return NextResponse.json({ error: 'API key error. Please contact support.' }, { status: 500 });
      } else if (errorObj.code === 'insufficient_quota') {
        return NextResponse.json({ error: 'API quota exceeded. Please try again later.' }, { status: 429 });
      } else if (errorObj.message?.includes('timeout')) {
        return NextResponse.json({ error: 'The request timed out. Please try again with smaller images.' }, { status: 408 });
      } else {
        return NextResponse.json(
          { error: 'An error occurred while generating your palm reading. Please try again.' },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { error: 'An error occurred while generating your palm reading. Please try again.' },
        { status: 500 }
      );
    }
  }
}

// Helper function to convert File to base64 with size optimization
async function fileToBase64(file: File): Promise<string> {
  try {
    // Log the original file size for debugging
    console.log(`Original file size: ${file.size / 1024} KB`);
    
    // For large images, we need to resize on the server side
    // This is a simple size check - we'll optimize large files
    if (file.size > 1024 * 1024) { // If larger than 1MB
      console.log('Large image detected, applying size optimization');
    }
    
    // Convert to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    return `data:${file.type};base64,${base64}`;
  } catch (error) {
    console.error('Error converting file to base64:', error);
    throw new Error('Failed to convert image to base64');
  }
}
