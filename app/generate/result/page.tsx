"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReceiptCard from "@/components/ui/ReceiptCard";
import { generatePrompt, generateViralHooks, generateAudioSuggestion } from "@/lib/utils/prompt-engine";
import { PromptGenerationInput } from "@/lib/utils/prompt-engine";
import { Aesthetic, ShotType, Wardrobe } from "@/lib/constants/aesthetics";
import { FormattedPrompt } from "@/lib/types/prompt-wizard";

export default function ResultPage() {
  const router = useRouter();
  const [prompt, setPrompt] = useState("");
  const [hooks, setHooks] = useState<string[]>([]);
  const [audio, setAudio] = useState<string>("");
  const [formattedPrompt, setFormattedPrompt] = useState<FormattedPrompt | null>(null);

  useEffect(() => {
    // Get generation data
    const data = sessionStorage.getItem("generationData");
    if (!data) {
      router.push("/generate");
      return;
    }

    const parsed = JSON.parse(data);

    // Check if we have OpenAI-generated prompt
    if (parsed.openaiPrompt) {
      setPrompt(parsed.openaiPrompt);
      setHooks(parsed.openaiHooks || []);
      setAudio(parsed.openaiAudio || "");
    } else if (parsed.formattedPrompt) {
      // Check if we have enhanced formatted prompt from wizard
      setFormattedPrompt(parsed.formattedPrompt);
      setPrompt(parsed.formattedPrompt.fullPrompt || parsed.formattedPrompt.positive);
      
      // Generate hooks (using the prompt text)
      const promptText = parsed.formattedPrompt.fullPrompt || parsed.formattedPrompt.positive;
      const generatedHooks = generateViralHooks(promptText);
      setHooks(generatedHooks);

      // Generate audio suggestion
      const generatedAudio = generateAudioSuggestion(promptText);
      setAudio(generatedAudio);
    } else {
      // Fallback to legacy prompt generation
      const input: PromptGenerationInput = {
        userInput: parsed.input,
        facelessMode: parsed.facelessMode,
        aesthetic: parsed.aesthetic,
        shotType: parsed.shotType,
        wardrobe: parsed.wardrobe,
      };

      // Generate prompt
      const generatedPrompt = generatePrompt(input);
      setPrompt(generatedPrompt);
      
      // Generate hooks (using the prompt text)
      const generatedHooks = generateViralHooks(generatedPrompt);
      setHooks(generatedHooks);

      // Generate audio suggestion
      const generatedAudio = generateAudioSuggestion(generatedPrompt);
      setAudio(generatedAudio);
    }

    // Save to history (localStorage for now)
    const history = JSON.parse(localStorage.getItem("promptHistory") || "[]");
    history.unshift({
      prompt: parsed.openaiPrompt || formattedPrompt?.fullPrompt || prompt,
      hooks: parsed.openaiHooks || hooks,
      audio: parsed.openaiAudio || audio,
      timestamp: new Date().toISOString(),
      formattedPrompt: formattedPrompt || undefined,
    });
    localStorage.setItem("promptHistory", JSON.stringify(history.slice(0, 50))); // Keep last 50
  }, [router, prompt, formattedPrompt, hooks, audio]);

  return (
    <div className="min-h-screen bg-alabaster p-6 pb-24">
      <div className="max-w-2xl mx-auto">
        <ReceiptCard
          prompt={prompt}
          hooks={hooks}
          audio={audio}
          onCopyPrompt={() => {
            // Analytics placeholder
            if (typeof window !== "undefined" && (window as any).gtag) {
              (window as any).gtag("event", "copy_prompt", {
                event_category: "engagement",
              });
            }
          }}
        />

        {/* Action Buttons */}
        <div className="mt-6 space-y-3">
          <button
            onClick={() => router.push("/generate")}
            className="w-full py-3 border-2 border-champagne text-champagne-dark rounded-xl font-medium touch-target hover:bg-champagne/10 hover:border-champagne-dark transition-colors"
          >
            Generate Another
          </button>
          <button
            onClick={() => router.push("/portfolio")}
            className="w-full py-3 bg-stone-200 text-mocha-dark rounded-xl font-medium touch-target hover:bg-stone-300 transition-colors"
          >
            View Portfolio
          </button>
        </div>
      </div>
    </div>
  );
}

