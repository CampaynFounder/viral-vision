// OpenAI Integration with Sanity Check
// This route handles prompt generation using OpenAI GPT-4o with status updates

import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge';

interface GenerationRequest {
  userInput: string;
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
    const { userInput, aesthetic, shotType, wardrobe, wizardData, model = 'midjourney' } = body;

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error("⚠️ OPENAI_API_KEY not configured - using fallback mock response");
      // Fallback to mock if API key not set
      return NextResponse.json({
        prompt: userInput,
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
      // Note: Negative prompts are handled separately in the system prompt
      // They will be incorporated into the negativePrompt field in the response
    }

    // New system prompt for "Black Luxury" and "High-End Lifestyle" niches
    const systemPrompt = `# Role & Objective

You are an Elite AI Visual Director and Social Media Strategist specializing in the "Black Luxury" and "High-End Lifestyle" niches. Your goal is to engineer the perfect inputs for generative AI models to create hyper-realistic, aspirational AI Influencers.

# Core Directive

You must translate vague or specific user inputs into a cohesive, viral-ready asset package. Your output must ALWAYS center on African American luxury aesthetics (skin texture, lighting on melanated skin, cultural styling nuances) unless explicitly instructed otherwise.

# Input Data

<user_selections>

Aesthetic: ${aesthetic?.name || aesthetic?.id || 'Not specified'}

Shot Type: ${shotType?.name || shotType?.id || 'Not specified'}

Wardrobe: ${wardrobe?.name || wardrobe?.id || 'Not specified'}

Format: ${wizardData?.format || 'image'}

Race: ${wizardData?.race || 'African American (default)'}

Skin Tone: ${wizardData?.skinTone || 'Not specified'}

Hair Color: ${wizardData?.hairColor || 'Not specified'}

Target Model: ${model}

Advanced Options: ${wizardData ? JSON.stringify(wizardData) : 'None'}

</user_selections>

# Step-by-Step Instructions

## 1. Analyze & Harmonize

Analyze the user selections for logical or aesthetic conflicts (e.g., "Shot Type: Macro Eye Close-up" vs. "Wardrobe: Full Body Gown").

- IF a conflict exists, prioritize **Shot Type** over Wardrobe, but attempt to imply the wardrobe through visible details (straps, collars, fabric texture).

- IF inputs are missing, infer them based on the "Black Luxury" core directive (e.g., if Aesthetic is missing, default to "Old Money" or "Streetwear High-Fashion").

## 2. Image Prompt Engineering

Construct a prompt optimized specifically for **${model}**.

- **Subject:** Define a hyper-realistic African American influencer. Focus on skin texture (pores, slight imperfections for realism), distinct facial features, and confidence.

- **Fashion:** Translate the "${wardrobe?.name || wardrobe?.id || 'Not specified'}" input into designer descriptions (e.g., mention fabric weights, specific stitching, brands like Balenciaga/Off-White vibes without trademark infringement if necessary).

- **Technical (Photography):** Define lighting that complements darker skin tones (e.g., "warm golden hour rim light," "rembrandt lighting," "softbox fill"). Specify camera gear (e.g., "Shot on Sony A7R IV, 85mm G Master lens, f/1.8").

- **Negative Prompt Recommendations:** Based on the user's selections, generate a comprehensive list of recommended negative prompt terms that:
  1. Include standard quality exclusions (blurry, low quality, distorted, ugly, bad anatomy, extra limbs, deformed, bad proportions, bad hands, mutation, duplicate, worst quality, jpeg artifacts, signature, watermark, text, username, artist name)
  2. Exclude elements that contradict the "Luxury" aesthetic (cheap fabrics, messy backgrounds, unprofessional settings, cluttered scenes, amateur photography)
  3. Add model-specific exclusions based on ${model} best practices
  4. Consider the aesthetic style (e.g., Old Money should exclude synthetic materials and streetwear elements; Y2K should exclude vintage/classic elements)
  5. Consider the shot type (e.g., close-ups should exclude full-body artifacts; wide shots should exclude close-up distortions)
  6. Consider the wardrobe selection (e.g., formal wear should exclude casual elements; athleisure should exclude formal elements)
  7. Return as an array of individual negative prompt terms (not a comma-separated string)

- **Negative Prompt:** Generate a comprehensive negative prompt string that:
  1. Incorporates all recommended negative prompt terms
  2. Incorporates any user-specified negative prompts from the input (if provided)
  3. Formats as a comma-separated list optimized for ${model}
  4. Ensures no elements that would detract from the aspirational Black Luxury vibe

- **Syntax Strategy:**

    - IF ${model} is "Midjourney": Use comma-separated phrases, weights (::), and parameters (--v 6.0, --style raw, --stylize).

    - IF ${model} is "DALL-E 3" or "Flux": Use rich, descriptive natural language sentences.

## 3. Viral Strategy (Hooks & Audio)

- **Hooks:** Write 3 text overlays/captions.

    1. *The Controversy:* A polarizing statement or question.

    2. *The POV:* Relatable aspirational POV.

    3. *The Value:* A tip or "gatekeeping" reveal.

- **Audio:** Suggest a specific audio vibe or trending track name that fits the visual mood (e.g., "Drake - Heavy beats," "Smooth R&B Lo-fi," "Trending TikTok Luxury Sound").

## 4. Final Sanity Check

Review your generated prompt against the original user inputs. Ensure no hallucinated objects appear that contradict the "Luxury" vibe (e.g., messy backgrounds, cheap fabrics).

# Output Format

Return valid JSON only. Do not include markdown code blocks (\`\`\`json).

{
  "refinedPrompt": "String: The fully optimized image generation prompt.",
  "negativePrompt": "String: The comprehensive negative prompt with user-specified exclusions and standard quality exclusions, formatted as comma-separated list.",
  "recommendedNegativePrompts": [
    "String: Individual negative prompt term 1",
    "String: Individual negative prompt term 2",
    "String: Individual negative prompt term 3",
    "..."
  ],
  "hooks": [
    "String: Hook 1",
    "String: Hook 2",
    "String: Hook 3"
  ],
  "audio": "String: Audio suggestion",
  "sanityCheck": {
    "passed": Boolean,
    "issues": [
      {
        "type": "String (Conflict|Missing|Quality)",
        "severity": "String (Low|Medium|High)",
        "message": "String: Description of the issue"
      }
    ],
    "suggestions": ["String: Tip for the user to improve the result"]
  }
}`;

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
      aesthetic: aesthetic?.id,
      shotType: shotType?.id,
      wardrobe: wardrobe?.id,
      race: wizardData?.race,
      skinTone: wizardData?.skinTone,
    });

    return NextResponse.json({
      prompt: content.refinedPrompt || promptText,
      negativePrompt: content.negativePrompt || "",
      recommendedNegativePrompts: content.recommendedNegativePrompts || [],
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
    aesthetic?: string;
    shotType?: string;
    wardrobe?: string;
    race?: string;
    skinTone?: string;
  }
): Promise<{
  passed: boolean;
  issues: Array<{ type: string; severity: string; message: string }>;
  suggestions: string[];
}> {
  const issues: Array<{ type: string; severity: string; message: string }> = [];
  const suggestions: string[] = [];

  // Check for logical conflicts between race/skin tone and prompt content
  if (context.race && context.skinTone) {
    // Validate that prompt reflects the specified race and skin tone
    const promptLower = prompt.toLowerCase();
    const hasRaceMention = promptLower.includes(context.race.toLowerCase()) || 
                          promptLower.includes("african american") ||
                          promptLower.includes("black");
    
    if (!hasRaceMention && context.race === "African American") {
      issues.push({
        type: "Missing",
        severity: "Medium",
        message: "Prompt should reflect African American aesthetics as specified",
      });
    }
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
