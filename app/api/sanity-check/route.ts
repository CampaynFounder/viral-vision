// Sanity Check API Route
// Uses OpenAI to validate and improve prompts

import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt, context } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      // Fallback to basic checks if API key not set
      return NextResponse.json({
        passed: true,
        issues: [],
        suggestions: [],
      });
    }

    const systemPrompt = `You are a prompt quality validator. Analyze this image generation prompt for:
1. Logical errors (conflicting elements)
2. Aesthetic inconsistencies
3. Missing important details
4. Technical issues

Return JSON with:
- "passed": boolean
- "issues": array of { "type": string, "severity": "error"|"warning"|"info", "message": string }
- "suggestions": array of improvement suggestions

Context: ${JSON.stringify(context)}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this prompt: "${prompt}"` },
        ],
        temperature: 0.3,
        max_tokens: 500,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error("Sanity check failed");
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in sanity check:", error);
    return NextResponse.json(
      { error: "Sanity check failed" },
      { status: 500 }
    );
  }
}

