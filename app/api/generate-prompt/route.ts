// OpenAI Integration with Sanity Check
// This route handles prompt generation using OpenAI GPT-4o with status updates

import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

interface GenerationRequest {
  userInput: string;
  facelessMode: boolean;
  aesthetic?: {
    id: string;
    name: string;
    keywords: string[];
  };
  shotType?: {
    id: string;
    name?: string;
    keywords: string[];
  };
  wardrobe?: {
    id: string;
    name?: string;
    keywords: string[];
  };
  wizardData?: any;
  model?: 'midjourney' | 'stable-diffusion' | 'dalle';
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    const { userInput, facelessMode, aesthetic, shotType, wardrobe, wizardData, model = 'midjourney' } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("⚠️ OPENAI_API_KEY not configured - using fallback mock response");
      // Fallback to mock if API key not set
      return NextResponse.json({
        prompt: `${userInput}${facelessMode ? ", woman seen from behind" : ""}`,
        hooks: [
          "POV: You finally stopped trading time for money...",
          "When you realize 9-5 wasn't the vibe...",
          "Plot twist: You built this in your spare time...",
        ],
        audio: "Just a Girl - No Doubt",
        sanityCheck: {
          passed: true,
          issues: [],
          suggestions: [],
        },
      });
    }

    console.log("✅ OpenAI API key found, making API call...");

    // Build comprehensive prompt with all user selections
    let promptText = userInput;
    
    // Add faceless mode rules
    if (facelessMode) {
      promptText += ", woman seen from behind, back of head, cropped face, focus on hands, motion blur, no direct gaze, no visible eyes, no face visible";
    }
    
    // Add aesthetic keywords
    if (aesthetic) {
      promptText += `, ${aesthetic.keywords.join(", ")}`;
    }
    
    // Add shot type
    if (shotType) {
      promptText += `, ${shotType.keywords.join(", ")}`;
    }
    
    // Add wardrobe
    if (wardrobe) {
      promptText += `, ${wardrobe.keywords.join(", ")}`;
    }

    // Add all wizard data fields
    if (wizardData) {
      if (wizardData.lighting) {
        promptText += `, ${wizardData.lighting} lighting`;
      }
      if (wizardData.scene) {
        promptText += `, ${wizardData.scene}`;
      }
      if (wizardData.cameraAngle) {
        promptText += `, ${wizardData.cameraAngle} camera angle`;
      }
      if (wizardData.mood) {
        promptText += `, ${wizardData.mood} mood`;
      }
      if (wizardData.materials && Array.isArray(wizardData.materials)) {
        promptText += `, ${wizardData.materials.join(", ")} materials`;
      }
      if (wizardData.accessories && Array.isArray(wizardData.accessories)) {
        promptText += `, ${wizardData.accessories.join(", ")}`;
      }
      if (wizardData.quality) {
        promptText += `, ${wizardData.quality} quality`;
      }
      if (wizardData.timeOfDay) {
        promptText += `, ${wizardData.timeOfDay}`;
      }
      if (wizardData.negativePrompts && Array.isArray(wizardData.negativePrompts) && wizardData.negativePrompts.length > 0) {
        promptText += `, negative prompts: ${wizardData.negativePrompts.join(", ")}`;
      }
    }

    // Comprehensive system prompt for "Viral Instagram Curator"
    const systemPrompt = `You are a viral Instagram content curator specializing in faceless luxury lifestyle content. Your job is to:
1. Refine and optimize image generation prompts for maximum viral potential
2. Ensure prompts are specific, detailed, and capture the "Old Money/Rich Mom" aesthetic
3. Incorporate ALL user selections: aesthetic style, shot type, wardrobe, lighting, scene, camera angle, mood, materials, accessories, quality settings
4. Add technical details that improve image quality (lighting, composition, materials, camera settings)
5. Ensure the prompt is optimized for the target model (${model})
6. Generate 3 viral caption hooks that would work with this image
7. Suggest 1 trending audio/song that matches the vibe
8. Perform a sanity check to ensure no logical conflicts or aesthetic inconsistencies

User Selections:
- Aesthetic: ${aesthetic?.name || aesthetic?.id || 'Not specified'}
- Shot Type: ${shotType?.name || shotType?.id || 'Not specified'}
- Wardrobe: ${wardrobe?.name || wardrobe?.id || 'Not specified'}
- Model: ${model}
- Faceless Mode: ${facelessMode ? 'Enabled' : 'Disabled'}
- Advanced Options: ${wizardData ? JSON.stringify(wizardData) : 'None'}

Return a JSON object with:
- "refinedPrompt": The optimized, sanitized prompt (detailed and specific, ready for ${model})
- "hooks": Array of 3 viral caption hooks (each should be engaging and conversion-focused)
- "audio": One trending audio suggestion (song name or audio trend)
- "sanityCheck": Object with "passed" (boolean), "issues" (array of {type, severity, message}), "suggestions" (array of strings)

The refined prompt should:
- Be optimized for ${model} syntax and parameters
- Include all user-specified elements naturally
- Be specific enough for high-quality image generation
- Maintain the luxury aesthetic throughout
- Be ready to use directly in the image generation tool

Focus on luxury, aspirational content that converts.`;

    // Call OpenAI API
    console.log("📞 Calling OpenAI API...");
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
          { role: "user", content: `Create an optimized, sanitized prompt from this input: "${promptText}"\n\nInclude all the user selections and ensure it's ready for ${model} image generation.` },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        response_format: { type: "json_object" },
      }),
    });

    console.log(`📊 OpenAI API response status: ${response.status}`);

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ OpenAI API error:", error);
      throw new Error(`OpenAI API error: ${error}`);
    }

    console.log("✅ OpenAI API call successful");

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    // Run sanity check on the generated prompt
    const sanityCheck = await runSanityCheck(content.refinedPrompt, {
      facelessMode,
      aesthetic: aesthetic?.id,
      shotType: shotType?.id,
      wardrobe: wardrobe?.id,
    });

    return NextResponse.json({
      prompt: content.refinedPrompt || promptText,
      hooks: content.hooks || [
        "POV: You finally stopped trading time for money...",
        "When you realize 9-5 wasn't the vibe...",
        "Plot twist: You built this in your spare time...",
      ],
      audio: content.audio || "Just a Girl - No Doubt",
      sanityCheck,
    });
  } catch (error) {
    console.error("Error generating prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate prompt" },
      { status: 500 }
    );
  }
}

// Sanity check function
async function runSanityCheck(
  prompt: string,
  context: {
    facelessMode: boolean;
    aesthetic?: string;
    shotType?: string;
    wardrobe?: string;
  }
): Promise<{
  passed: boolean;
  issues: Array<{ type: string; severity: string; message: string }>;
  suggestions: string[];
}> {
  const issues: Array<{ type: string; severity: string; message: string }> = [];
  const suggestions: string[] = [];

  // Check for logical conflicts
  if (context.facelessMode && prompt.toLowerCase().includes("face")) {
    issues.push({
      type: "logical",
      severity: "warning",
      message: "Prompt mentions 'face' but faceless mode is enabled",
    });
  }

  // Check aesthetic consistency
  if (context.aesthetic === "old-money" && prompt.toLowerCase().includes("synthetic")) {
    issues.push({
      type: "aesthetic",
      severity: "warning",
      message: "Old Money aesthetic typically uses natural materials",
    });
  }

  // Check for missing elements
  if (!prompt.toLowerCase().includes("lighting") && !prompt.toLowerCase().includes("light")) {
    suggestions.push("Consider adding lighting details for better mood");
  }

  if (!prompt.toLowerCase().includes("shot") && !prompt.toLowerCase().includes("angle")) {
    suggestions.push("Adding camera angle details can improve composition");
  }

  const passed = issues.filter((i) => i.severity === "error").length === 0;

  return {
    passed,
    issues,
    suggestions,
  };
}
